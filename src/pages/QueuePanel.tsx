import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueueTickets, useCallNextTicket, useUpdateTicketStatus } from "@/hooks/useQueueTickets";
import { useUnitConfig } from "@/hooks/useUnitConfig";
import { priorityMeta, priorityWeight, PRIORITY_LIST } from "@/lib/queuePriority";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/components/queue/PriorityBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  PhoneCall,
  SkipForward,
  CheckCircle,
  XCircle,
  Users,
  Monitor,
  RotateCcw,
  Clock,
  History,
  Search,
  Tv,
  AlertTriangle,
  Shuffle,
  Keyboard,
  UserX,
  CheckCheck,
  Undo2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const STORAGE_KEY = "zurich_panel_prefs";

const stations = [
  "Guichê 1",
  "Guichê 2",
  "Recepção",
  "Triagem",
  "Consultório 1",
  "Consultório 2",
  "Consultório 3",
  "Exames",
  "Financeiro",
];

const ticketTypes = [
  { value: "normal", label: "Normal" },
  { value: "preferencial", label: "Preferencial" },
  { value: "preferencial_60", label: "60+" },
  { value: "preferencial_80", label: "80+" },
  { value: "consulta", label: "Consulta" },
  { value: "retorno_pos_operatorio", label: "Retorno" },
  { value: "exames", label: "Exames" },
  { value: "financeiro", label: "Financeiro" },
  { value: "triagem", label: "Triagem" },
];

const contextLabels: Record<string, string> = Object.fromEntries(ticketTypes.map((t) => [t.value, t.label]));
const typeLabel = (type: string) => contextLabels[type] || type;

const ABSENT_REASONS = [
  "Paciente não respondeu",
  "Chamado 3 vezes",
  "Paciente saiu da recepção",
  "Outro",
];

function loadPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function savePrefs(prefs: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}

function fmtElapsed(from: string | null | undefined, now: number): string {
  if (!from) return "—";
  const sec = Math.max(0, Math.floor((now - new Date(from).getTime()) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function waitClass(min: number) {
  if (min >= 20) return "text-destructive font-semibold";
  if (min >= 10) return "text-orange-600 font-semibold";
  return "text-muted-foreground";
}

export default function QueuePanel() {
  const navigate = useNavigate();
  const saved = loadPrefs();

  const [station, setStation] = useState<string>(saved?.station || "Guichê 1");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(saved?.selectedTypes || []);
  const [filterPriority, setFilterPriority] = useState<string>(saved?.filterPriority || "all");
  const [searchTicket, setSearchTicket] = useState<string>(saved?.searchTicket || "");
  const [now, setNow] = useState(Date.now());

  // Live ticker for elapsed times
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { data: config } = useUnitConfig();
  const { data: waiting } = useQueueTickets({ queue_name: "recepcao", status: "aguardando" });
  const { data: called } = useQueueTickets({ queue_name: "recepcao", status: "chamada" });
  const { data: inService } = useQueueTickets({ queue_name: "recepcao", status: "em_atendimento" });
  const callNext = useCallNextTicket();
  const updateStatus = useUpdateTicketStatus();

  const { data: recentDone } = useQueueTickets({ queue_name: "recepcao", status: "concluida" });
  const { data: recentAbsent } = useQueueTickets({ queue_name: "recepcao", status: "ausente" });

  const recentCalls = [...(recentDone || []), ...(recentAbsent || []), ...(called || [])]
    .filter((t) => t.called_at)
    .sort((a, b) => new Date(b.called_at!).getTime() - new Date(a.called_at!).getTime())
    .slice(0, 12);

  // Persist preferences
  useEffect(() => {
    savePrefs({ station, selectedTypes, filterPriority, searchTicket });
  }, [station, selectedTypes, filterPriority, searchTicket]);

  useEffect(() => {
    const channel = supabase
      .channel("queue-panel")
      .on("postgres_changes", { event: "*", schema: "public", table: "queue_tickets" }, () => {})
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Action helpers
  const handleCall = () => {
    callNext.mutate({ queue_name: "recepcao", called_to: station });
  };

  const handleCallSpecific = async (ticketId: string) => {
    const { error } = await supabase
      .from("queue_tickets")
      .update({
        status: "chamada",
        called_to: station,
        called_at: new Date().toISOString(),
        recall_count: 0,
      })
      .eq("id", ticketId);
    if (error) {
      toast.error("Erro ao chamar senha");
      return;
    }
    await supabase.from("queue_history").insert({
      ticket_id: ticketId,
      action: "ticket_called",
      old_status: "aguardando",
      new_status: "chamada",
      details: { called_to: station },
    });
    toast.success("Senha chamada!");
  };

  const handleRecall = async (ticket: any) => {
    const newCount = ((ticket as any).recall_count || 0) + 1;
    await supabase
      .from("queue_tickets")
      .update({
        called_at: new Date().toISOString(),
        called_to: station,
        recall_count: newCount,
      })
      .eq("id", ticket.id);
    await supabase.from("queue_history").insert({
      ticket_id: ticket.id,
      action: "ticket_recalled",
      details: { called_to: station, recall_count: newCount },
    });
    if (newCount >= 3) {
      toast.warning(`${ticket.ticket_number} — 3ª chamada. Considere marcar como ausente.`);
    } else {
      toast.info(`Rechamada ${newCount}/3 — ${ticket.ticket_number}`);
    }
  };

  // --- Modals state
  const [absentTarget, setAbsentTarget] = useState<any | null>(null);
  const [absentReason, setAbsentReason] = useState<string>(ABSENT_REASONS[0]);

  const [returnTarget, setReturnTarget] = useState<any | null>(null);
  const [returnPosition, setReturnPosition] = useState<"end" | "start">("end");
  const [returnKeepPriority, setReturnKeepPriority] = useState(true);

  const [reclassTarget, setReclassTarget] = useState<any | null>(null);
  const [reclassType, setReclassType] = useState<string>("");
  const [reclassPriority, setReclassPriority] = useState<string>("");

  const openAbsent = (t: any) => { setAbsentTarget(t); setAbsentReason(ABSENT_REASONS[0]); };
  const openReturn = (t: any) => { setReturnTarget(t); setReturnPosition("end"); setReturnKeepPriority(true); };
  const openReclass = (t: any) => {
    setReclassTarget(t);
    setReclassType(t.ticket_type);
    setReclassPriority((t as any).priority_code || "normal");
  };

  const confirmAbsent = async () => {
    if (!absentTarget) return;
    const t = absentTarget;
    await supabase
      .from("queue_tickets")
      .update({ status: "ausente" })
      .eq("id", t.id);
    await supabase.from("queue_history").insert({
      ticket_id: t.id,
      action: "marked_absent",
      old_status: t.status,
      new_status: "ausente",
      details: { reason: absentReason, called_to: station },
    });
    toast.success(`${t.ticket_number} marcada como ausente`);
    setAbsentTarget(null);
  };

  const confirmReturn = async () => {
    if (!returnTarget) return;
    const t = returnTarget;
    // Compute new created_at to push to start or end of queue
    let newCreatedAt = new Date().toISOString();
    if (returnPosition === "start" && waiting && waiting.length > 0) {
      const oldest = waiting
        .map((w) => new Date(w.created_at).getTime())
        .reduce((a, b) => Math.min(a, b), Date.now());
      newCreatedAt = new Date(oldest - 1000).toISOString();
    }
    const update: Record<string, any> = {
      status: "aguardando",
      created_at: newCreatedAt,
      called_at: null,
      called_to: null,
      recall_count: 0,
    };
    if (!returnKeepPriority) {
      update.priority = 0;
      update.priority_code = "normal";
    }
    await supabase.from("queue_tickets").update(update).eq("id", t.id);
    await supabase.from("queue_history").insert({
      ticket_id: t.id,
      action: "returned_to_queue",
      old_status: t.status,
      new_status: "aguardando",
      details: { position: returnPosition, keep_priority: returnKeepPriority, called_to: station },
    });
    toast.success(`${t.ticket_number} devolvida para ${returnPosition === "start" ? "o início" : "o fim"} da fila`);
    setReturnTarget(null);
  };

  const confirmReclass = async () => {
    if (!reclassTarget) return;
    const t = reclassTarget;
    const weight = priorityWeight(reclassPriority);
    await supabase
      .from("queue_tickets")
      .update({
        ticket_type: reclassType,
        priority_code: reclassPriority,
        priority: weight,
      })
      .eq("id", t.id);
    await supabase.from("queue_history").insert({
      ticket_id: t.id,
      action: "reclassified",
      details: {
        from_type: t.ticket_type,
        to_type: reclassType,
        from_priority: (t as any).priority_code,
        to_priority: reclassPriority,
        by_station: station,
      },
    });
    toast.success(`${t.ticket_number} reclassificada`);
    setReclassTarget(null);
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  // --- Filtered waiting (with extended search)
  const filteredWaiting = useMemo(() => {
    const q = searchTicket.trim().toLowerCase();
    return (waiting || []).filter((t) => {
      if (selectedTypes.length > 0 && !selectedTypes.includes(t.ticket_type)) return false;
      if (filterPriority === "high" && t.priority < 2) return false;
      if (filterPriority === "normal" && t.priority >= 2) return false;
      if (q) {
        const name = t.patients?.full_name?.toLowerCase() || "";
        const type = typeLabel(t.ticket_type).toLowerCase();
        const prio = priorityMeta((t as any).priority_code).label.toLowerCase();
        const num = t.ticket_number.toLowerCase();
        if (![num, name, type, prio].some((s) => s.includes(q))) return false;
      }
      return true;
    });
  }, [waiting, selectedTypes, filterPriority, searchTicket]);

  const unitName = config?.unit_name || "Zurich";

  const myStationCalls = (called || []).filter((t) => t.called_to === station);
  const otherStationCalls = (called || []).filter((t) => t.called_to !== station);

  // --- Keyboard shortcuts
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable) {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      if (absentTarget || returnTarget || reclassTarget) return;
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); return; }
      if (e.key.toLowerCase() === "c") { e.preventDefault(); handleCall(); return; }
      const first = myStationCalls[0];
      if (!first) return;
      if (e.key.toLowerCase() === "r") { e.preventDefault(); handleRecall(first); }
      else if (e.key.toLowerCase() === "a") { e.preventDefault(); updateStatus.mutate({ id: first.id, status: "em_atendimento" }); }
      else if (e.key.toLowerCase() === "x") { e.preventDefault(); openAbsent(first); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myStationCalls, absentTarget, returnTarget, reclassTarget, waiting]);

  const statusBadge = (status: string) => {
    if (status === "concluida") return { icon: <CheckCheck className="w-3 h-3" />, label: "Atendida", cls: "text-green-700 bg-green-100" };
    if (status === "ausente") return { icon: <UserX className="w-3 h-3" />, label: "Ausente", cls: "text-destructive bg-destructive/10" };
    if (status === "aguardando") return { icon: <Undo2 className="w-3 h-3" />, label: "Devolvida", cls: "text-blue-700 bg-blue-100" };
    return { icon: <PhoneCall className="w-3 h-3" />, label: "Chamada", cls: "text-orange-700 bg-orange-100" };
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Monitor className="w-8 h-8" /> Painel de Chamadas — {unitName}
            </h1>
            <p className="text-muted-foreground">Central operacional de atendimento</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={station} onValueChange={setStation}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stations.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="lg" onClick={handleCall} disabled={callNext.isPending || !waiting?.length} className="h-12 px-6">
              <PhoneCall className="w-5 h-5 mr-2" /> Chamar Próximo
            </Button>
            <Button variant="outline" onClick={() => navigate("/painel-tv")} className="h-12">
              <Tv className="w-5 h-5 mr-2" /> Painel TV
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12" aria-label="Atalhos">
                    <Keyboard className="w-5 h-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs space-y-1">
                  <p><kbd className="px-1 border rounded">C</kbd> Chamar próximo</p>
                  <p><kbd className="px-1 border rounded">/</kbd> Focar busca</p>
                  <p><kbd className="px-1 border rounded">R</kbd> Rechamar primeira</p>
                  <p><kbd className="px-1 border rounded">A</kbd> Atender primeira</p>
                  <p><kbd className="px-1 border rounded">X</kbd> Marcar ausente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-primary">{waiting?.length || 0}</p><p className="text-xs text-muted-foreground">Aguardando</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-orange-500">{called?.length || 0}</p><p className="text-xs text-muted-foreground">Chamados</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-blue-500">{inService?.length || 0}</p><p className="text-xs text-muted-foreground">Em Atendimento</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-green-500">{recentDone?.length || 0}</p><p className="text-xs text-muted-foreground">Concluídos</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-2xl font-black text-destructive">{recentAbsent?.length || 0}</p><p className="text-xs text-muted-foreground">Ausentes</p></CardContent></Card>
        </div>

        {/* My station calls */}
        {myStationCalls.length > 0 && (
          <Card className="border-2 border-primary bg-primary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-primary text-base flex items-center gap-2">
                🔔 Minhas Chamadas — {station} <Badge variant="secondary">{myStationCalls.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {myStationCalls.map((ticket) => {
                const rc = (ticket as any).recall_count || 0;
                const totalCalls = rc + 1;
                const elapsedMin = ticket.called_at
                  ? Math.floor((now - new Date(ticket.called_at).getTime()) / 60000)
                  : 0;
                return (
                  <div key={ticket.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-card rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-2xl font-black text-primary">{ticket.ticket_number}</span>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{ticket.patients?.full_name || "Não identificado"}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span>{ticket.called_to}</span>•<span>{typeLabel(ticket.ticket_type)}</span>•
                          <Clock className="w-3 h-3" />
                          <span>{fmtElapsed(ticket.called_at, now)}</span>
                        </p>
                      </div>
                      <PriorityBadge priorityCode={(ticket as any).priority_code} size="sm" />
                      <Badge variant="outline" className="text-xs">
                        {totalCalls}/3 {totalCalls === 1 ? "chamada" : "chamadas"}
                      </Badge>
                      {totalCalls >= 3 && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" /> 3x chamada
                        </Badge>
                      )}
                      {elapsedMin >= 2 && totalCalls < 3 && (
                        <Badge variant="outline" className="text-xs text-orange-600">aguardando resposta</Badge>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      <Button size="sm" onClick={() => handleRecall(ticket)} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-1" /> Rechamar
                      </Button>
                      <Button size="sm" variant="default" onClick={() => updateStatus.mutate({ id: ticket.id, status: "em_atendimento" })}>
                        <CheckCircle className="w-4 h-4 mr-1" /> Atender
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openAbsent(ticket)}>
                        <UserX className="w-4 h-4 mr-1" /> Ausente
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openReturn(ticket)}>
                        <SkipForward className="w-4 h-4 mr-1" /> Devolver
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openReclass(ticket)}>
                        <Shuffle className="w-4 h-4 mr-1" /> Reclassificar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Other station calls */}
        {otherStationCalls.length > 0 && (
          <Card className="border border-orange-200 bg-orange-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-orange-600 text-base">📢 Chamadas em outros guichês</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {otherStationCalls.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between bg-card rounded-lg p-2.5 shadow-sm">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-black text-orange-600">{ticket.ticket_number}</span>
                    <span className="text-sm text-muted-foreground">{ticket.called_to}</span>
                    <PriorityBadge priorityCode={(ticket as any).priority_code} size="sm" />
                    <Badge variant="outline" className="text-xs">{typeLabel(ticket.ticket_type)}</Badge>
                    {(ticket as any).recall_count > 0 && (
                      <span className="text-xs text-muted-foreground">{(ticket as any).recall_count}x</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {ticket.called_at ? new Date(ticket.called_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* In service */}
        {inService && inService.length > 0 && (
          <Card className="border-2 border-blue-300 bg-blue-50/50">
            <CardHeader className="pb-2"><CardTitle className="text-blue-700 text-base">👨‍⚕️ Em Atendimento</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {inService.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between bg-card rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-black text-blue-600">{ticket.ticket_number}</span>
                    <span className="text-sm">{ticket.patients?.full_name || "—"}</span>
                    <PriorityBadge priorityCode={(ticket as any).priority_code} size="sm" />
                    <Badge variant="outline" className="text-xs">{typeLabel(ticket.ticket_type)}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{fmtElapsed(ticket.attended_at || ticket.called_at, now)}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => updateStatus.mutate({ id: ticket.id, status: "concluida" })}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Finalizar
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Waiting queue */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" /> Fila de Espera
                    {waiting && <Badge variant="secondary">{waiting.length}</Badge>}
                  </CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                      <SelectTrigger className="w-32 h-8"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="high">Preferenciais</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Search className="w-3 h-3 absolute left-2 top-2.5 text-muted-foreground" />
                      <Input
                        ref={searchRef}
                        placeholder="Senha, nome, tipo..."
                        value={searchTicket}
                        onChange={(e) => setSearchTicket(e.target.value)}
                        className="h-8 w-48 pl-7 text-xs"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {ticketTypes.map((tt) => (
                    <label key={tt.value} className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
                      <Checkbox checked={selectedTypes.includes(tt.value)} onCheckedChange={() => toggleType(tt.value)} className="h-3.5 w-3.5" />
                      <span className={selectedTypes.includes(tt.value) ? "font-semibold text-foreground" : "text-muted-foreground"}>{tt.label}</span>
                    </label>
                  ))}
                  {selectedTypes.length > 0 && (
                    <Button variant="ghost" size="sm" className="h-5 text-xs px-2" onClick={() => setSelectedTypes([])}>Limpar</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!filteredWaiting?.length ? (
                  <p className="text-muted-foreground text-center py-8">Nenhum paciente na fila</p>
                ) : (
                  <div className="space-y-2 max-h-[50vh] overflow-auto">
                    {filteredWaiting.map((ticket, idx) => {
                      const waitMin = Math.floor((now - new Date(ticket.created_at).getTime()) / 60000);
                      return (
                        <div key={ticket.id} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                          <div className="flex items-center gap-3 flex-wrap min-w-0">
                            <span className="text-sm text-muted-foreground font-mono w-8">{idx + 1}º</span>
                            <span className="font-bold text-lg">{ticket.ticket_number}</span>
                            <PriorityBadge priorityCode={(ticket as any).priority_code} size="sm" />
                            <Badge variant="outline" className="text-xs">{typeLabel(ticket.ticket_type)}</Badge>
                            <span className="text-sm text-muted-foreground truncate max-w-[180px]">{ticket.patients?.full_name || "Não identificado"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs flex items-center gap-1 ${waitClass(waitMin)}`}>
                              <Clock className="w-3 h-3" />
                              {waitMin <= 0 ? "agora" : `${waitMin} min`}
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => handleCallSpecific(ticket.id)} title="Chamar esta senha">
                              <PhoneCall className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent calls */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-base"><History className="w-5 h-5" /> Últimas Chamadas</CardTitle></CardHeader>
            <CardContent>
              {!recentCalls.length ? (
                <p className="text-muted-foreground text-center py-4 text-sm">Nenhuma chamada ainda</p>
              ) : (
                <div className="space-y-2 max-h-[50vh] overflow-auto">
                  {recentCalls.map((ticket) => {
                    const s = statusBadge(ticket.status);
                    return (
                      <div key={ticket.id} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg p-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-bold">{ticket.ticket_number}</span>
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${s.cls}`}>
                            {s.icon}{s.label}
                          </span>
                          <PriorityBadge priorityCode={(ticket as any).priority_code} size="sm" />
                          <span className="text-xs text-muted-foreground truncate">{typeLabel(ticket.ticket_type)}</span>
                        </div>
                        <div className="text-right text-xs text-muted-foreground shrink-0">
                          <p className="truncate max-w-[100px]">{ticket.called_to || "—"}</p>
                          <p>{ticket.called_at ? new Date(ticket.called_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Absent modal */}
      <Dialog open={!!absentTarget} onOpenChange={(o) => !o && setAbsentTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar como ausente</DialogTitle>
            <DialogDescription>
              {absentTarget ? `Senha ${absentTarget.ticket_number} — selecione o motivo` : ""}
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={absentReason} onValueChange={setAbsentReason} className="space-y-2">
            {ABSENT_REASONS.map((r) => (
              <div key={r} className="flex items-center gap-2">
                <RadioGroupItem value={r} id={`absent-${r}`} />
                <Label htmlFor={`absent-${r}`} className="cursor-pointer">{r}</Label>
              </div>
            ))}
          </RadioGroup>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAbsentTarget(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmAbsent}>Confirmar ausência</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return modal */}
      <Dialog open={!!returnTarget} onOpenChange={(o) => !o && setReturnTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Devolver para a fila</DialogTitle>
            <DialogDescription>
              {returnTarget ? `Senha ${returnTarget.ticket_number}` : ""}
            </DialogDescription>
          </DialogHeader>
          <RadioGroup value={returnPosition} onValueChange={(v) => setReturnPosition(v as any)} className="space-y-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="end" id="ret-end" />
              <Label htmlFor="ret-end" className="cursor-pointer">Voltar para o fim da fila</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="start" id="ret-start" />
              <Label htmlFor="ret-start" className="cursor-pointer">Voltar para o início da fila</Label>
            </div>
          </RadioGroup>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={returnKeepPriority} onCheckedChange={(v) => setReturnKeepPriority(!!v)} />
            Manter prioridade original
          </label>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnTarget(null)}>Cancelar</Button>
            <Button onClick={confirmReturn}>Devolver</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reclassify modal */}
      <Dialog open={!!reclassTarget} onOpenChange={(o) => !o && setReclassTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reclassificar senha</DialogTitle>
            <DialogDescription>
              {reclassTarget ? `Senha ${reclassTarget.ticket_number} — altere o tipo e/ou a prioridade` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm">Tipo da senha</Label>
              <Select value={reclassType} onValueChange={setReclassType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ticketTypes.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Prioridade</Label>
              <Select value={reclassPriority} onValueChange={setReclassPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITY_LIST.map((p) => (
                    <SelectItem key={p.code} value={p.code}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReclassTarget(null)}>Cancelar</Button>
            <Button onClick={confirmReclass}>Salvar reclassificação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
