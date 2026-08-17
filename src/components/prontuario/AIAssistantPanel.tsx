import { useState, useCallback } from "react";
import {
  Brain, Mic, FileText, Lightbulb, ClipboardList,
  Sparkles, X, Loader2, Copy, Check, Save, Pencil, Minus, Maximize2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useClinicalAI } from "@/hooks/useClinicalAI";
import { useCreateEvolutionNote } from "@/hooks/useEvolutionNotes";
import { useAuth } from "@/contexts/AuthContext";
import { VoiceTranscription, TranscriptEntry } from "./VoiceTranscription";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

interface AIAssistantPanelProps {
  patientId: string;
  patientContext: string;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AIAssistantPanel({
  patientId,
  patientContext,
  patientName,
  isOpen,
  onClose,
}: AIAssistantPanelProps) {
  const { callAI, isLoading, streamingText } = useClinicalAI({ patientContext });
  const { profile } = useAuth();
  const createNote = useCreateEvolutionNote();
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [activeTab, setActiveTab] = useState("transcricao");
  const [results, setResults] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);


  const getTranscriptText = useCallback(() => {
    return transcript
      .map((e) => `${e.speaker === "medico" ? "Médico" : "Paciente"}: ${e.text}`)
      .join("\n");
  }, [transcript]);

  const handleAction = useCallback(
    async (action: string, label: string) => {
      const transcriptText = getTranscriptText();
      let userMessage = "";

      switch (action) {
        case "anamnesis":
          userMessage = "Estruture a anamnese a partir da transcrição da consulta.";
          break;
        case "insights":
          userMessage = "Analise os dados do paciente e a consulta. Forneça alertas, diagnósticos diferenciais sugeridos, exames recomendados e CID-10 sugerido.";
          break;
        case "evolution":
          userMessage = "Gere um rascunho de evolução clínica no formato SOAP com base na consulta.";
          break;
        default:
          userMessage = "Analise os dados do paciente.";
      }

      try {
        const result = await callAI({
          action,
          userMessage,
          transcript: transcriptText || undefined,
        });
        setResults((prev) => ({ ...prev, [action]: result }));
      } catch {}
    },
    [callAI, getTranscriptText]
  );

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const updateResult = (key: string, value: string) => {
    setResults((prev) => ({ ...prev, [key]: value }));
  };

  const registerInRecord = async (action: string, label: string) => {
    if (!profile) {
      toast.error("Usuário não autenticado");
      return;
    }
    const content = results[action]?.trim();
    if (!content) {
      toast.error("Nada para registrar");
      return;
    }
    const noteType = action === "anamnesis" || action === "evolution" ? "medica" : "medica";
    const header = action === "anamnesis"
      ? "ANAMNESE (assistida por IA)"
      : action === "evolution"
      ? "EVOLUÇÃO SOAP (assistida por IA)"
      : `${label.toUpperCase()} (assistida por IA)`;
    const transcriptText = getTranscriptText();
    const finalContent = [
      header,
      "",
      content,
      transcriptText ? "\n---\nTRANSCRIÇÃO DA CONSULTA:\n" + transcriptText : "",
    ].join("\n");

    try {
      await createNote.mutateAsync({
        patient_id: patientId,
        professional_id: profile.id,
        note_type: noteType,
        content: finalContent,
        subjective: null,
        objective: null,
        assessment: null,
        plan: null,
      });
      setEditing((prev) => ({ ...prev, [action]: false }));
    } catch {
      // toast handled in hook
    }
  };


  if (!isOpen) return null;

  return (
    <div
      className={
        minimized
          ? "fixed bottom-24 right-6 z-[100] w-[320px] bg-card border border-border rounded-xl shadow-2xl flex flex-col"
          : "fixed inset-y-0 right-0 z-[100] w-[480px] max-w-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
      }
    >
      {/* Header */}
      <div className="bg-primary/5 border-b border-border px-3 py-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="font-semibold text-sm truncate">Assistente IA Clínico</h2>
            <p className="text-[11px] text-muted-foreground truncate">{patientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMinimized((m) => !m)}
            className="h-8 w-8"
            aria-label={minimized ? "Expandir painel" : "Minimizar painel"}
            title={minimized ? "Expandir painel" : "Minimizar (mantém a gravação)"}
          >
            {minimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
            aria-label="Fechar assistente"
            title="Fechar assistente"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>


      {minimized && (
        <div className="px-4 py-3 text-[11px] text-muted-foreground">
          Assistente em segundo plano — a gravação e a transcrição continuam ativas.
        </div>
      )}

      {!minimized && (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">

        <TabsList className="grid grid-cols-4 mx-4 mt-3 shrink-0">
          <TabsTrigger value="transcricao" className="text-xs gap-1">
            <Mic className="h-3.5 w-3.5" />
            Transcrição
          </TabsTrigger>
          <TabsTrigger value="anamnese" className="text-xs gap-1">
            <FileText className="h-3.5 w-3.5" />
            Anamnese
          </TabsTrigger>
          <TabsTrigger value="insights" className="text-xs gap-1">
            <Lightbulb className="h-3.5 w-3.5" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="evolucao" className="text-xs gap-1">
            <ClipboardList className="h-3.5 w-3.5" />
            Evolução
          </TabsTrigger>
        </TabsList>

        {/* Transcription Tab */}
        <TabsContent value="transcricao" className="flex-1 px-4 pb-4 mt-3 overflow-auto">
          <VoiceTranscription
            transcript={transcript}
            onTranscriptUpdate={setTranscript}
            patientContext={patientContext}
          />
          {transcript.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                {transcript.length} falas registradas — Use as abas para processar com IA
              </p>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1"
                  onClick={() => { setActiveTab("anamnese"); handleAction("anamnesis", "Anamnese"); }}
                  disabled={isLoading}
                >
                  <FileText className="h-3 w-3" />
                  Gerar Anamnese
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1"
                  onClick={() => { setActiveTab("insights"); handleAction("insights", "Insights"); }}
                  disabled={isLoading}
                >
                  <Lightbulb className="h-3 w-3" />
                  Gerar Insights
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs gap-1"
                  onClick={() => { setActiveTab("evolucao"); handleAction("evolution", "Evolução"); }}
                  disabled={isLoading}
                >
                  <ClipboardList className="h-3 w-3" />
                  Gerar Evolução
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* AI Result Tabs */}
        {[
          { key: "anamnese", action: "anamnesis", label: "Anamnese Estruturada", icon: FileText },
          { key: "insights", action: "insights", label: "Insights Clínicos", icon: Lightbulb },
          { key: "evolucao", action: "evolution", label: "Rascunho de Evolução", icon: ClipboardList },
        ].map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="flex-1 px-4 pb-4 mt-3 overflow-auto">
            {!results[tab.action] && !isLoading && activeTab === tab.key && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <tab.icon className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-1">{tab.label}</p>
                <p className="text-xs text-muted-foreground/70 mb-4 max-w-[280px]">
                  {transcript.length > 0
                    ? "Clique abaixo para processar a transcrição com IA"
                    : "Grave uma consulta na aba Transcrição primeiro, ou gere com base nos dados do prontuário"}
                </p>
                <Button
                  onClick={() => handleAction(tab.action, tab.label)}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Gerar {tab.label}
                </Button>
              </div>
            )}

            {isLoading && activeTab === tab.key && !results[tab.action] && (
              <div className="space-y-3 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando com IA...
                </div>
                {streamingText && (
                  <div className="prose prose-sm max-w-none text-sm">
                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

            {results[tab.action] && (
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge variant="outline" className="text-[10px] gap-1 bg-primary/5">
                    <Sparkles className="h-3 w-3" />
                    Gerado por IA
                  </Badge>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => setEditing((p) => ({ ...p, [tab.action]: !p[tab.action] }))}
                    >
                      <Pencil className="h-3 w-3" />
                      {editing[tab.action] ? "Visualizar" : "Editar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => copyToClipboard(results[tab.action], tab.action)}
                    >
                      {copied === tab.action ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied === tab.action ? "Copiado" : "Copiar"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleAction(tab.action, tab.label)}
                      disabled={isLoading}
                    >
                      <Sparkles className="h-3 w-3" />
                      Regenerar
                    </Button>
                  </div>
                </div>

                {editing[tab.action] ? (
                  <Textarea
                    value={results[tab.action]}
                    onChange={(e) => updateResult(tab.action, e.target.value)}
                    className="min-h-[300px] text-sm font-mono"
                  />
                ) : (
                  <ScrollArea className="max-h-[calc(100vh-320px)]">
                    <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                      <ReactMarkdown>{results[tab.action]}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                )}

                {(tab.action === "anamnesis" || tab.action === "evolution" || tab.action === "insights") && (
                  <div className="pt-3 border-t border-border space-y-2">
                    <p className="text-[10px] text-muted-foreground">
                      ⚠️ Revise antes de registrar. O conteúdo será salvo como uma nova evolução no prontuário (imutável após registro).
                    </p>
                    <Button
                      onClick={() => registerInRecord(tab.action, tab.label)}
                      disabled={createNote.isPending}
                      className="w-full gap-2"
                      size="sm"
                    >
                      {createNote.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Registrar no Prontuário
                    </Button>
                  </div>
                )}
              </div>
            )}

          </TabsContent>
        ))}
      </Tabs>
      )}
    </div>

  );
}
