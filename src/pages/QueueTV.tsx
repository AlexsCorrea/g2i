import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  useUnitConfig, useUnitAds, formatPatientDisplay,
  getPatientNameForSpeech, ticketToSpeech, priorityToSpeech,
} from "@/hooks/useUnitConfig";
import { useInstitutionSettings } from "@/hooks/useTotem";
import {
  getSelectedTvPanelId, clearSelectedTvPanelId, useTvPanel,
} from "@/hooks/useTvPanels";
import { Volume2, MapPin, Clock } from "lucide-react";
import { priorityMeta } from "@/lib/queuePriority";

interface QueuedCall {
  id: string;
  ticket: any;
  timestamp: number;
}

export default function QueueTV() {
  const navigate = useNavigate();

  // Selected TV panel (per-device, localStorage)
  const [tvPanelId, setTvPanelId] = useState<string | null>(() => getSelectedTvPanelId());
  useEffect(() => {
    if (!tvPanelId) navigate("/painel-tv/select", { replace: true });
  }, [tvPanelId, navigate]);
  const { data: tvPanel, isLoading: tvLoading, isFetched: tvFetched } = useTvPanel(tvPanelId);

  // If panel was deleted or deactivated -> clear selection and go to /painel-tv/select
  useEffect(() => {
    if (!tvPanelId) return;
    if (!tvFetched) return;
    if (!tvPanel || tvPanel.is_active === false) {
      clearSelectedTvPanelId();
      setTvPanelId(null);
      navigate("/painel-tv/select", { replace: true });
    }
  }, [tvPanelId, tvPanel, tvFetched, navigate]);

  const { data: config } = useUnitConfig();
  const { data: ads } = useUnitAds();
  const { data: institution } = useInstitutionSettings();

  // Call queue: display one at a time — ONLY fed by realtime events
  const [callQueue, setCallQueue] = useState<QueuedCall[]>([]);
  const [activeCall, setActiveCall] = useState<QueuedCall | null>(null);
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // History of recent calls (visual sidebar)
  const [recentHistory, setRecentHistory] = useState<any[]>([]);

  // Ads playlist
  const [currentAdIdx, setCurrentAdIdx] = useState(0);
  const [idleMode, setIdleMode] = useState(true);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const adTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Locution queue
  const locutionQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  // Animation state
  const [flashCall, setFlashCall] = useState(false);
  const [pulseScale, setPulseScale] = useState(false);

  // Config values — TV panel overrides take precedence over unit config; institution stays brand
  const primaryColor = tvPanel?.primary_color || config?.primary_color || "#1e5a8a";
  const secondaryColor = tvPanel?.secondary_color || config?.secondary_color || "#0f3460";
  const institutionName = institution?.name || "OftalmoCenter";
  const tvName = tvPanel?.name || "";
  const brandLogo = tvPanel?.logo_url || institution?.logo_url || config?.logo_url || null;
  const footerLine = [institutionName, tvName, "Painel de Chamadas"].filter(Boolean).join(" • ");
  const privacyMode = config?.privacy_mode || "senha_iniciais";
  const callDisplaySec = config?.call_display_seconds || 15;
  const adsEnabledTv = tvPanel ? tvPanel.ads_enabled !== false : config?.ads_enabled !== false;
  const adsEnabled = adsEnabledTv && ads && ads.length > 0;
  const adsIdleSec = config?.ads_idle_seconds || 20;
  const showClock = tvPanel ? tvPanel.show_clock !== false : config?.show_clock !== false;
  const showHistory = tvPanel ? tvPanel.show_history !== false : config?.show_history !== false;
  const soundEnabled = tvPanel ? tvPanel.sound_enabled !== false : config?.sound_enabled !== false;
  const locutionEnabled = tvPanel ? tvPanel.locution_enabled !== false : config?.locution_enabled !== false;
  const showHistory = config?.show_history !== false;
  const soundEnabled = config?.sound_enabled !== false;
  const locutionEnabled = config?.locution_enabled !== false;
  const speakPriority = config?.locution_speak_priority !== false;
  const speakLocation = config?.locution_speak_location === true;
  const voiceRate = config?.voice_rate || 0.85;
  const voicePitch = config?.voice_pitch || 1.0;
  const voiceVolume = config?.voice_volume || 1.0;
  const preCallSound = config?.pre_call_sound || "triple_tone";

  // Clock
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  // Load voices early
  useEffect(() => { window.speechSynthesis?.getVoices(); }, []);

  // ---- REALTIME: only react to real operator events ----
  useEffect(() => {
    const channel = supabase
      .channel("tv-panel-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "queue_tickets" },
        (payload) => {
          const row = payload.new as any;
          // Only enqueue when status just became "chamada"
          if (row.status === "chamada" && row.called_at) {
            // Fetch full ticket with patient data
            supabase
              .from("queue_tickets")
              .select("*, patients(full_name, cpf, nome_social)")
              .eq("id", row.id)
              .single()
              .then(({ data }) => {
                if (!data) return;
                const key = `${data.id}_${data.called_at}`;
                setCallQueue((prev) => {
                  // Avoid duplicate
                  if (prev.some((c) => c.id === key)) return prev;
                  return [...prev, { id: key, ticket: data, timestamp: new Date(data.called_at || Date.now()).getTime() }];
                });
              });
          }
      // Track any called/completed/absent for history
          if (["chamada", "concluida", "ausente", "em_atendimento"].includes(row.status) && row.called_at) {
            supabase
              .from("queue_tickets")
              .select("*, patients(full_name, cpf, nome_social)")
              .eq("id", row.id)
              .single()
              .then(({ data }) => {
                if (!data || !data.called_at) return;
                setRecentHistory((prev) => {
                  const filtered = prev.filter(t => t.id !== data.id);
                  return [data, ...filtered].slice(0, 10);
                });
              });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Load initial history on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("queue_tickets")
      .select("*, patients(full_name, cpf, nome_social)")
      .in("status", ["chamada", "em_atendimento", "concluida", "ausente"])
      .gte("created_at", `${today}T00:00:00`)
      .not("called_at", "is", null)
      .order("called_at", { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setRecentHistory(data);
      });
  }, []);

  // ---- LOCUTION ENGINE (queued) ----
  const processLocutionQueue = useCallback(() => {
    if (isSpeakingRef.current || locutionQueueRef.current.length === 0) return;
    if (!locutionEnabled) { locutionQueueRef.current = []; return; }
    isSpeakingRef.current = true;
    const text = locutionQueueRef.current.shift()!;
    try {
      const synth = window.speechSynthesis;
      if (!synth) { isSpeakingRef.current = false; return; }
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "pt-BR";
      utter.rate = voiceRate;
      utter.pitch = voicePitch;
      utter.volume = voiceVolume;
      const voices = synth.getVoices();
      const ptVoice = voices.find(v => v.lang.startsWith("pt-BR")) || voices.find(v => v.lang.startsWith("pt"));
      if (ptVoice) utter.voice = ptVoice;
      utter.onend = () => { isSpeakingRef.current = false; setTimeout(() => processLocutionQueue(), 300); };
      utter.onerror = () => { isSpeakingRef.current = false; setTimeout(() => processLocutionQueue(), 300); };
      synth.speak(utter);
    } catch { isSpeakingRef.current = false; }
  }, [locutionEnabled, voiceRate, voicePitch, voiceVolume]);

  const enqueueLocution = useCallback((text: string) => {
    locutionQueueRef.current.push(text);
    processLocutionQueue();
  }, [processLocutionQueue]);

  const playTones = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      if (!soundEnabled || preCallSound === "none") { resolve(); return; }
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTone = (freq: number, delay: number, dur = 0.25) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = freq; osc.type = "sine";
          gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + dur);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + dur + 0.05);
        };
        if (preCallSound === "double_tone") {
          playTone(880, 0, 0.2); playTone(1100, 0.3, 0.2);
          setTimeout(resolve, 700);
        } else {
          playTone(880, 0, 0.2); playTone(1100, 0.3, 0.2); playTone(880, 0.6, 0.3);
          setTimeout(resolve, 1100);
        }
      } catch { resolve(); }
    });
  }, [soundEnabled, preCallSound]);

  const buildSpeechText = useCallback((ticket: any) => {
    const parts: string[] = [];
    parts.push(`Senha ${ticketToSpeech(ticket.ticket_number)}`);
    if (ticket.patient_id && ticket.patients?.full_name) {
      const namePart = getPatientNameForSpeech(
        ticket.patients.full_name,
        ticket.patients.nome_social || null,
        privacyMode
      );
      if (namePart) parts.push(namePart);
    }
    if (speakPriority) {
      parts.push(`prioridade ${priorityToSpeech(ticket.ticket_type)}`);
    }
    if (speakLocation && ticket.called_to) {
      parts.push(ticket.called_to);
    }
    return parts.join(", ") + ".";
  }, [privacyMode, speakPriority, speakLocation]);

  // ---- PROCESS CALL QUEUE: show one at a time ----
  useEffect(() => {
    if (activeCall) return;
    if (callQueue.length === 0) return;

    const next = callQueue[0];
    setCallQueue(prev => prev.slice(1));
    setActiveCall(next);
    // Add to recent history immediately when displayed
    setRecentHistory((prev) => {
      const filtered = prev.filter(t => t.id !== next.ticket.id);
      return [next.ticket, ...filtered].slice(0, 10);
    });
    setIdleMode(false);
    setFlashCall(true);
    setPulseScale(true);

    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
    if (adTimerRef.current) { clearTimeout(adTimerRef.current); adTimerRef.current = null; }

    playTones().then(() => { enqueueLocution(buildSpeechText(next.ticket)); });

    setTimeout(() => setFlashCall(false), 3000);
    setTimeout(() => setPulseScale(false), 1500);

    if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    activeTimerRef.current = setTimeout(() => { setActiveCall(null); }, callDisplaySec * 1000);
  }, [callQueue, activeCall, callDisplaySec, playTones, enqueueLocution, buildSpeechText]);

  // ---- IDLE MODE: start ads after no active call ----
  useEffect(() => {
    if (activeCall || callQueue.length > 0) {
      setIdleMode(false);
      if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null; }
      return;
    }
    idleTimerRef.current = setTimeout(() => {
      if (adsEnabled) { setIdleMode(true); setCurrentAdIdx(0); }
    }, adsIdleSec * 1000);
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, [activeCall, callQueue.length, adsEnabled, adsIdleSec]);

  // ---- AD PLAYLIST ROTATION ----
  useEffect(() => {
    if (!idleMode || !ads?.length) return;
    const ad = ads[currentAdIdx];
    if (!ad) return;
    // For videos, let onEnded handle advancement; for images/gifs use timer
    if (ad.media_type === "video") return;
    const dur = (ad.duration_seconds || 10) * 1000;
    adTimerRef.current = setTimeout(() => {
      setCurrentAdIdx(prev => (prev + 1) % ads.length);
    }, dur);
    return () => { if (adTimerRef.current) clearTimeout(adTimerRef.current); };
  }, [idleMode, currentAdIdx, ads]);

  // Interrupt ads when new call arrives
  useEffect(() => {
    if (idleMode && callQueue.length > 0) { setIdleMode(false); }
  }, [callQueue.length, idleMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (adTimerRef.current) clearTimeout(adTimerRef.current);
    };
  }, []);

  // ---- HELPERS ----
  const displayNameOnly = (ticket: any) => {
    if (!ticket.patient_id || !ticket.patients?.full_name) return null;
    if (privacyMode === "somente_senha") return null;
    return formatPatientDisplay(ticket.patients?.full_name, ticket.patients?.nome_social || null, privacyMode, "").replace(/^\s*—\s*/, "").trim();
  };

  // Type label kept for context (e.g., "Consulta", "Exames")
  const typeContextLabel = (type: string) => {
    const map: Record<string, string> = {
      retorno_pos_operatorio: "Retorno", consulta: "Consulta",
      exames: "Exames", financeiro: "Financeiro", triagem: "Triagem",
    };
    return map[type] || type;
  };

  // ---- RENDER: AD/IDLE MODE ----
  if (idleMode && ads && ads.length > 0) {
    const ad = ads[currentAdIdx];
    return (
      <div className="fixed inset-0 bg-black flex flex-col">
        {/* Top bar with branding */}
        <div className="h-16 flex items-center justify-between px-8" style={{ background: primaryColor }}>
          <div className="flex items-center gap-3">
            {brandLogo && <img src={brandLogo} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />}
            <div className="flex flex-col leading-tight">
              <span className="text-white text-xl font-bold">{institutionName}</span>
              {sectorName && <span className="text-white/70 text-xs">Setor: {sectorName}</span>}
            </div>
          </div>
          {showClock && <span className="text-white/80 text-lg font-mono">{timeStr}</span>}
        </div>

        {/* Ad content area */}
        <div className="flex-1 flex items-center justify-center bg-black overflow-hidden">
          {ad.media_type === "video" ? (
            <video key={ad.id} src={ad.media_url} autoPlay muted className="max-h-full max-w-full object-contain"
              onEnded={() => setCurrentAdIdx(prev => (prev + 1) % ads.length)} />
          ) : (
            <img src={ad.media_url} alt={ad.title} className="max-h-full max-w-full object-contain" />
          )}
        </div>

        {/* Persistent recent calls footer */}
        <div className="flex-shrink-0" style={{ background: secondaryColor }}>
          <div className="px-6 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">Últimas Chamadas</span>
            <span className="text-white/30 text-xs">{footerLine}</span>
          </div>
          <div className="px-4 py-2 flex gap-3 overflow-x-auto">
            {recentHistory.length === 0 ? (
              <span className="text-white/30 text-sm py-1">Nenhuma chamada recente</span>
            ) : (
              recentHistory.slice(0, 6).map((t) => (
                <div key={t.id} className="flex-shrink-0 bg-white/10 rounded-lg px-4 py-2 flex items-center gap-3 min-w-[180px]">
                  <span className="text-white font-black text-lg">{t.ticket_number}</span>
                  <div className="flex flex-col">
                    <span className="text-white/70 text-xs font-medium">{t.called_to || "—"}</span>
                    <span className="text-white/40 text-[10px]">
                      {t.called_at ? new Date(t.called_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- RENDER: CALL MODE / WAITING ----
  const ticket = activeCall?.ticket || null;

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
      {/* Top bar */}
      <div className="h-20 flex items-center justify-between px-10 bg-black/20">
        <div className="flex items-center gap-4">
          {brandLogo && <img src={brandLogo} alt="Logo" className="h-12 w-12 rounded-xl object-cover" />}
          <div className="flex flex-col leading-tight">
            <span className="text-white text-2xl font-bold">{institutionName}</span>
            {sectorName && <span className="text-white/60 text-sm">Setor: {sectorName}</span>}
          </div>
        </div>
        <div className="flex items-center gap-6">
          {callQueue.length > 0 && (
            <span className="text-white/60 text-sm bg-white/10 px-3 py-1 rounded-full">
              +{callQueue.length} na fila
            </span>
          )}
          {showClock && (
            <div className="flex items-center gap-3 text-white/80">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-mono">{timeStr}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center">
          {ticket ? (
            <div
              className="text-center space-y-6"
              style={{
                animation: pulseScale ? "tvCallZoom 0.8s ease-out forwards" : flashCall ? "tvCallPulse 1s ease-in-out 3" : "none",
              }}
            >
              <div className="flex items-center justify-center gap-3 text-white/70 text-xl">
                <Volume2 className="w-7 h-7 animate-pulse" />
                <span className="uppercase tracking-[0.3em] font-light">Chamada</span>
              </div>

              <p className="text-white leading-none font-black tracking-widest drop-shadow-[0_4px_30px_rgba(255,255,255,0.3)]" style={{ fontSize: "clamp(6rem, 14vw, 12rem)" }}>
                {ticket.ticket_number}
              </p>

              {displayNameOnly(ticket) && (
                <p className="text-white/90 text-4xl font-semibold tracking-wide">{displayNameOnly(ticket)}</p>
              )}

              <div className="flex items-center justify-center gap-4 flex-wrap">
                {(() => {
                  const meta = priorityMeta(ticket.priority_code);
                  return (
                    <>
                      <span
                        className="px-6 py-2.5 rounded-full text-white text-xl font-bold border border-white/20"
                        style={{ background: meta.hex }}
                      >
                        {meta.label}
                      </span>
                      {ticket.ticket_type && (
                        <span className="px-5 py-2 rounded-full text-white/90 text-lg font-medium border border-white/20 bg-white/10">
                          {typeContextLabel(ticket.ticket_type)}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>

              {ticket.called_to && (
                <div className="flex items-center justify-center gap-3 text-white text-3xl mt-2">
                  <MapPin className="w-8 h-8" />
                  <span className="font-bold">{ticket.called_to}</span>
                </div>
              )}

              {ticket.recall_count > 0 && (
                <p className="text-white/40 text-sm mt-2">Rechamada #{ticket.recall_count}</p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-6">
              {brandLogo && <img src={brandLogo} alt="Logo" className="h-24 w-24 rounded-2xl object-cover mx-auto opacity-40" />}
              <p className="text-white/30 text-5xl font-light">Aguardando chamada</p>
              <p className="text-white/30 text-2xl font-semibold">{institutionName}</p>
              {sectorName && <p className="text-white/15 text-lg">Setor: {sectorName}</p>}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {showHistory && (
          <div className="w-80 bg-black/30 flex flex-col border-l border-white/5">
            <div className="px-5 py-4 border-b border-white/10">
              <h3 className="text-white/70 text-sm font-semibold uppercase tracking-wider">Últimas chamadas</h3>
            </div>
            <div className="flex-1 overflow-auto">
              {recentHistory.length === 0 ? (
                <p className="text-white/20 text-center py-8 text-sm">Nenhuma chamada</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {recentHistory.map((t) => (
                    <div key={t.id} className="px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="text-white font-bold text-lg">{t.ticket_number}</p>
                        <p className="text-white/40 text-xs">{displayNameOnly(t) || ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white/50 text-sm">{t.called_to || "—"}</p>
                        <p className="text-white/30 text-xs">
                          {t.called_at ? new Date(t.called_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="h-10 bg-black/30 flex items-center justify-center">
        <p className="text-white/20 text-xs">{footerLine}</p>
      </div>

      <style>{`
        @keyframes tvCallPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); }
        }
        @keyframes tvCallZoom {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
