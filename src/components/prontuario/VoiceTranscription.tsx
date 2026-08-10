import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, RotateCcw, Clock, Loader2, AlertTriangle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface TranscriptEntry {
  id: string;
  speaker: "medico" | "paciente";
  text: string;
  timestamp: Date;
}

interface VoiceTranscriptionProps {
  onTranscriptUpdate: (entries: TranscriptEntry[]) => void;
  transcript: TranscriptEntry[];
  patientContext?: string;
}

const FN_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const CHUNK_SECONDS = 5;
const TARGET_RATE = 16000;

/** Downsample Float32 PCM to target sample rate and encode a 16-bit mono WAV file. */
function encodeWav(chunks: Float32Array[], inputRate: number): Blob {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.length;
  }

  const ratio = inputRate / TARGET_RATE;
  const outLength = ratio > 1 ? Math.floor(merged.length / ratio) : merged.length;
  const samples = new Float32Array(outLength);
  if (ratio > 1) {
    for (let i = 0; i < outLength; i++) samples[i] = merged[Math.floor(i * ratio)];
  } else {
    samples.set(merged.subarray(0, outLength));
  }
  const rate = ratio > 1 ? TARGET_RATE : inputRate;

  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (pos: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(pos + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, rate, true);
  view.setUint32(28, rate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let pos = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(pos, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    pos += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

/** Peak amplitude of a set of PCM chunks — used to skip silent uploads. */
function peakLevel(chunks: Float32Array[]): number {
  let peak = 0;
  for (const c of chunks) {
    for (let i = 0; i < c.length; i += 16) {
      const v = Math.abs(c[i]);
      if (v > peak) peak = v;
    }
  }
  return peak;
}

export function VoiceTranscription({ onTranscriptUpdate, transcript, patientContext }: VoiceTranscriptionProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isDiarizing, setIsDiarizing] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nodeRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const pcmRef = useRef<Float32Array[]>([]);
  const chunkTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rawTextRef = useRef<string[]>([]);
  const pendingRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef(transcript);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [transcript, liveText]);

  const getToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  }, []);

  /** Upload one WAV window and stream the recognized text into its ordered slot. */
  const transcribeBlob = useCallback(
    async (blob: Blob) => {
      const slot = rawTextRef.current.length;
      rawTextRef.current.push("");
      pendingRef.current += 1;
      setIsTranscribing(true);
      const render = () =>
        setLiveText(rawTextRef.current.filter(Boolean).join(" ").replace(/\s+/g, " ").trim());
      try {
        const token = await getToken();
        const fd = new FormData();
        fd.append("file", blob, "recording.wav");
        const resp = await fetch(`${FN_BASE}/voice-transcribe?stream=true`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({ error: "Falha na transcrição" }));
          setError(err.error || "Falha na transcrição");
          toast.error(err.error || "Falha ao transcrever o áudio");
          return;
        }

        const ct = resp.headers.get("Content-Type") || "";
        if (!ct.includes("text/event-stream") || !resp.body) {
          const { text } = await resp.json();
          rawTextRef.current[slot] = (text || "").trim();
          render();
          setError(null);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let idx: number;
          while ((idx = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const evt = JSON.parse(jsonStr);
              if (evt.type === "transcript.text.delta" && evt.delta) {
                rawTextRef.current[slot] += evt.delta;
                render();
              } else if (evt.type === "transcript.text.done" && evt.text) {
                rawTextRef.current[slot] = evt.text;
                render();
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
        rawTextRef.current[slot] = rawTextRef.current[slot].trim();
        render();
        setError(null);
      } catch (e) {
        console.error("transcribe error", e);
        setError("Erro de rede ao enviar o áudio");
      } finally {
        pendingRef.current -= 1;
        if (pendingRef.current <= 0) setIsTranscribing(false);
      }
    },
    [getToken]
  );

  /** Flush accumulated PCM as a complete WAV window. */
  const flushChunk = useCallback(() => {
    const chunks = pcmRef.current;
    pcmRef.current = [];
    if (chunks.length === 0) return;
    if (peakLevel(chunks) < 0.01) return; // silence — nothing to transcribe
    const blob = encodeWav(chunks, ctxRef.current?.sampleRate || 44100);
    if (blob.size < 4096) return;
    void transcribeBlob(blob);
  }, [transcribeBlob]);

  /** Send the full raw transcript to the AI for speaker identification. */
  const diarize = useCallback(
    async (rawTexts: string[]) => {
      if (rawTexts.length === 0) return;
      setIsDiarizing(true);
      const fallback = () => {
        const entries: TranscriptEntry[] = rawTexts.map((text) => ({
          id: crypto.randomUUID(),
          speaker: "medico" as const,
          text,
          timestamp: new Date(),
        }));
        onTranscriptUpdate([...transcriptRef.current, ...entries]);
      };

      try {
        const token = await getToken();
        const resp = await fetch(`${FN_BASE}/clinical-ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            action: "diarize",
            messages: [{ role: "user", content: rawTexts.join(" ") }],
            patientContext: patientContext || "",
          }),
        });

        if (!resp.ok || !resp.body) {
          fallback();
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        let textBuffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) fullText += content;
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        let cleaned = fullText.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
        }
        const diarized: { speaker: string; text: string }[] = JSON.parse(cleaned);
        if (!Array.isArray(diarized) || diarized.length === 0) throw new Error("empty");
        const entries: TranscriptEntry[] = diarized
          .filter((i) => i && typeof i.text === "string" && i.text.trim())
          .map((item) => ({
            id: crypto.randomUUID(),
            speaker: item.speaker === "paciente" ? "paciente" : "medico",
            text: item.text.trim(),
            timestamp: new Date(),
          }));
        onTranscriptUpdate([...transcriptRef.current, ...entries]);
        setLiveText("");
      } catch (e) {
        console.error("diarization error", e);
        fallback();
        setLiveText("");
      } finally {
        setIsDiarizing(false);
      }
    },
    [getToken, onTranscriptUpdate, patientContext]
  );

  const cleanupAudio = useCallback(() => {
    nodeRef.current?.disconnect();
    sourceRef.current?.disconnect();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    void ctxRef.current?.close().catch(() => {});
    nodeRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;
    ctxRef.current = null;
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
    } catch {
      setError("Permita o acesso ao microfone para gravar a consulta.");
      toast.error("Acesso ao microfone negado");
      return;
    }

    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const node = ctx.createScriptProcessor(4096, 1, 1);
    pcmRef.current = [];
    rawTextRef.current = [];
    setLiveText("");
    node.onaudioprocess = (e) => {
      pcmRef.current.push(new Float32Array(e.inputBuffer.getChannelData(0)));
    };
    source.connect(node);
    node.connect(ctx.destination);

    ctxRef.current = ctx;
    streamRef.current = stream;
    sourceRef.current = source;
    nodeRef.current = node;

    setIsRecording(true);
    setDuration(0);
    timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    chunkTimerRef.current = setInterval(flushChunk, CHUNK_SECONDS * 1000);
  }, [flushChunk]);

  const stopRecording = useCallback(async () => {
    if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    chunkTimerRef.current = null;
    timerRef.current = null;

    const chunks = pcmRef.current;
    pcmRef.current = [];
    const rate = ctxRef.current?.sampleRate || 44100;
    cleanupAudio();
    setIsRecording(false);

    if (chunks.length > 0 && peakLevel(chunks) >= 0.01) {
      const blob = encodeWav(chunks, rate);
      if (blob.size >= 4096) await transcribeBlob(blob);
    }

    // aguarda os trechos ainda em transcrição
    while (pendingRef.current > 0) {
      await new Promise((r) => setTimeout(r, 300));
    }

    const texts = rawTextRef.current.map((t) => t.trim()).filter(Boolean);
    rawTextRef.current = [];
    if (texts.length === 0) {
      setError("Nenhuma fala foi captada. Verifique o microfone e tente novamente.");
      return;
    }
    await diarize(texts);
  }, [cleanupAudio, transcribeBlob, diarize]);

  useEffect(() => {
    return () => {
      if (chunkTimerRef.current) clearInterval(chunkTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const formatDuration = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const clearTranscript = () => {
    onTranscriptUpdate([]);
    rawTextRef.current = [];
    setLiveText("");
    setDuration(0);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        {!isRecording ? (
          <Button onClick={startRecording} className="gap-2" disabled={isDiarizing || isTranscribing}>
            <Mic className="h-4 w-4" />
            Iniciar Gravação
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive" className="gap-2">
            <Square className="h-3.5 w-3.5" />
            Parar e transcrever
          </Button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="font-mono text-muted-foreground">{formatDuration(duration)}</span>
          </div>
        )}

        {isTranscribing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Transcrevendo áudio...</span>
          </div>
        )}

        {isDiarizing && (
          <div className="flex items-center gap-2 text-sm text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span>Identificando médico e paciente...</span>
          </div>
        )}

        {transcript.length > 0 && !isRecording && (
          <Button variant="ghost" size="sm" onClick={clearTranscript} className="gap-1 ml-auto">
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {(isRecording || liveText) && (
        <div className="bg-muted/50 rounded-lg p-3 border border-border">
          <p className="text-[10px] text-muted-foreground mb-1 flex items-center gap-1">
            <Mic className="h-3 w-3" />
            {isRecording
              ? "Transcrição em tempo real — o texto aparece conforme você fala"
              : "Texto bruto captado"}
          </p>
          <p className="text-sm text-foreground/70">
            {liveText || (isRecording ? "Aguardando o primeiro trecho de fala..." : "")}
          </p>
        </div>
      )}

      <div ref={scrollRef} className="max-h-64 overflow-y-auto space-y-2 pr-1">
        {transcript.length === 0 && !isRecording && !isDiarizing && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Clique em "Iniciar Gravação" para transcrever a consulta.
            <br />
            <span className="text-xs text-muted-foreground/70">
              O áudio é transcrito por IA e as falas do médico e do paciente são identificadas automaticamente.
            </span>
          </p>
        )}

        {transcript.map((entry) => (
          <div key={entry.id} className="flex gap-2">
            <Badge
              variant="outline"
              className={cn(
                "shrink-0 mt-0.5 text-[10px]",
                entry.speaker === "medico"
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
              )}
            >
              {entry.speaker === "medico" ? "Médico" : "Paciente"}
            </Badge>
            <p className="text-sm text-foreground leading-relaxed">{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
