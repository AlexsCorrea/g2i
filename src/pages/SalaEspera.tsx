import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAppointments, useUpdateAppointment, type Appointment } from "@/hooks/useAppointments";
import { useScheduleAgendas } from "@/hooks/useScheduleAgendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DoorOpen, Search, User, CheckCircle, PlayCircle, FileText, Phone, Megaphone,
  ArrowLeft, Heart, RotateCcw, Ban, AlertCircle, Timer, Loader2, Volume2, VolumeX,
  RefreshCw, Stethoscope, MapPin, ShieldCheck, CalendarClock, Activity, UserX,
  ChevronRight, Hourglass, Users,
} from "lucide-react";
import { format, differenceInMinutes, differenceInSeconds } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatAgendaTime, parseAgendaDateTime } from "@/lib/agendaDateTime";
import { CallSourceChip, useCallSource } from "@/components/salas/CallSourceDialog";


/* HOMOLOGAÇÃO: todos os status refletem na sala de espera */
const WAITING_ROOM_STATUSES = [
  "agendado", "confirmado", "chegou", "em_espera", "em_andamento",
  "concluido", "cancelado", "nao_compareceu", "reagendado", "encaixe",
];

const ACTIVE_STATUSES = ["agendado", "confirmado", "chegou", "em_espera", "encaixe", "reagendado"];
const CLOSED_STATUSES = ["concluido", "cancelado", "nao_compareceu"];

const waitingStatusConfig: Record<string, { label: string; color: string; dot: string }> = {
  agendado: { label: "Agendado", color: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  chegou: { label: "Chegou", color: "bg-teal-100 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  confirmado: { label: "Confirmado", color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  em_espera: { label: "Aguardando", color: "bg-yellow-100 text-yellow-700 border-yellow-200", dot: "bg-yellow-500" },
  em_andamento: { label: "Em Atendimento", color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  concluido: { label: "Concluído", color: "bg-muted text-muted-foreground border-muted", dot: "bg-muted-foreground" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  nao_compareceu: { label: "Não Compareceu", color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  reagendado: { label: "Reagendado", color: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  encaixe: { label: "Encaixe", color: "bg-violet-100 text-violet-700 border-violet-200", dot: "bg-violet-500" },
};

const PREFS_KEY = "sala-espera-prefs-v1";
const CALLS_KEY = "sala-espera-calls-v1";
const MAX_CALLS = 3;

type CallRecord = { count: number; at: number };

const patientName = (a: Appointment) =>
  a.patients?.full_name || (a as any).provisional_name || a.title;

const initials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("");

export default function SalaEspera() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: appointments, isLoading, isFetching } = useAppointments({ date: today });
  const { data: agendas } = useScheduleAgendas();
  const updateAppointment = useUpdateAppointment();

  /* ---------- Preferências persistidas ---------- */
  const storedPrefs = (() => {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}"); } catch { return {}; }
  })();

  const [filterAgenda, setFilterAgenda] = useState<string>(storedPrefs.agenda ?? "all");
  const [filterStatus, setFilterStatus] = useState<string>(storedPrefs.status ?? "all");
  const [filterPriority, setFilterPriority] = useState<string>(storedPrefs.priority ?? "all");
  const [filterSearch, setFilterSearch] = useState("");
  const [tab, setTab] = useState<string>(storedPrefs.tab ?? "aguardando");
  const [voiceOn, setVoiceOn] = useState<boolean>(storedPrefs.voice ?? true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(storedPrefs.autoRefresh ?? true);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      agenda: filterAgenda, status: filterStatus, priority: filterPriority,
      tab, voice: voiceOn, autoRefresh,
    }));
  }, [filterAgenda, filterStatus, filterPriority, tab, voiceOn, autoRefresh]);

  /* ---------- Relógio / auto refresh ---------- */
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["appointments"] });
  }, [queryClient]);

  useEffect(() => {
    if (!autoRefresh) return;
    const t = setInterval(refresh, 30000);
    return () => clearInterval(t);
  }, [autoRefresh, refresh]);

  /* ---------- Registro de chamadas ---------- */
  const [calls, setCalls] = useState<Record<string, CallRecord>>(() => {
    try { return JSON.parse(localStorage.getItem(CALLS_KEY) || "{}"); } catch { return {}; }
  });
  useEffect(() => { localStorage.setItem(CALLS_KEY, JSON.stringify(calls)); }, [calls]);

  /* ---------- Filtros e ordenação ---------- */
  const dayList = useMemo(
    () => (appointments ?? []).filter(a => WAITING_ROOM_STATUSES.includes(a.status)),
    [appointments],
  );

  const priorityRank = (a: Appointment) => ((a as any).priority === "urgente" ? 0 : (a as any).priority === "prioritario" ? 1 : 2);

  const waitingList = useMemo(() => {
    return dayList
      .filter(a => {
        if (tab === "aguardando" && !ACTIVE_STATUSES.includes(a.status)) return false;
        if (tab === "atendimento" && a.status !== "em_andamento") return false;
        if (tab === "finalizados" && !CLOSED_STATUSES.includes(a.status)) return false;
        if (filterAgenda !== "all" && (a as any).agenda_id !== filterAgenda) return false;
        if (filterStatus !== "all" && a.status !== filterStatus) return false;
        if (filterPriority !== "all" && ((a as any).priority || "normal") !== filterPriority) return false;
        if (filterSearch) {
          const s = filterSearch.toLowerCase();
          const hay = `${patientName(a)} ${(a as any).specialty || ""} ${a.profiles?.full_name || ""}`.toLowerCase();
          if (!hay.includes(s)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const statusOrder: Record<string, number> = { em_andamento: 0, em_espera: 1, chegou: 2, confirmado: 3, encaixe: 4, agendado: 5, reagendado: 6, nao_compareceu: 7, concluido: 8, cancelado: 9 };
        const pr = priorityRank(a) - priorityRank(b);
        if (tab !== "finalizados" && pr !== 0) return pr;
        const so = (statusOrder[a.status] ?? 10) - (statusOrder[b.status] ?? 10);
        if (so !== 0) return so;
        return parseAgendaDateTime(a.scheduled_at).getTime() - parseAgendaDateTime(b.scheduled_at).getTime();
      });
  }, [dayList, tab, filterAgenda, filterStatus, filterPriority, filterSearch]);

  const waitMinutes = useCallback((a: Appointment) => {
    const mins = differenceInMinutes(now, parseAgendaDateTime(a.scheduled_at));
    return mins > 0 ? mins : 0;
  }, [now]);

  const stats = useMemo(() => {
    const active = dayList.filter(a => ACTIVE_STATUSES.includes(a.status));
    const inService = dayList.filter(a => a.status === "em_andamento");
    const done = dayList.filter(a => a.status === "concluido");
    const waits = active.map(waitMinutes);
    const avg = waits.length ? Math.round(waits.reduce((s, v) => s + v, 0) / waits.length) : 0;
    return {
      total: dayList.length,
      aguardando: active.length,
      emAtendimento: inService.length,
      concluidos: done.length,
      atrasados: waits.filter(m => m > 20).length,
      urgentes: active.filter(a => (a as any).priority === "urgente").length,
      tempoMedio: avg,
    };
  }, [dayList, waitMinutes]);

  const tabCounts = useMemo(() => ({
    aguardando: dayList.filter(a => ACTIVE_STATUSES.includes(a.status)).length,
    atendimento: dayList.filter(a => a.status === "em_andamento").length,
    finalizados: dayList.filter(a => CLOSED_STATUSES.includes(a.status)).length,
    todos: dayList.length,
  }), [dayList]);

  /* ---------- Ações ---------- */
  const { source: callSource, save: saveCallSource } = useCallSource();

  const quickAction = async (id: string, status: string) => {
    await updateAppointment.mutateAsync({ id, status: status as any });
  };


  const getProcedures = (a: Appointment): string[] => {
    const raw = [(a as any).description, (a as any).notes].filter(Boolean).join("\n");
    return raw.split(/\n|;|\||,/).map(s => s.trim()).filter(Boolean);
  };

  const callPatient = (a: Appointment) => {
    const name = patientName(a);
    const local = callSource.enabled && callSource.attendantPanel
      ? callSource.attendantPanel
      : ((a as any).room || a.location || "recepção");
    const next = (calls[a.id]?.count || 0) + 1;
    setCalls(prev => ({ ...prev, [a.id]: { count: next, at: Date.now() } }));

    if (voiceOn) {
      try {
        const utter = new SpeechSynthesisUtterance(`${name}, comparecer à ${local}.`);
        utter.lang = "pt-BR";
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch { /* locução indisponível */ }
    }

    if (["chegou", "confirmado", "agendado", "encaixe"].includes(a.status)) {
      updateAppointment.mutate({ id: a.id, status: "em_espera" as any });
    }

    const destino = callSource.enabled
      ? `Local: ${local} · ${callSource.panelIds.length} painel(is)`
      : `Local: ${local}`;

    if (next >= MAX_CALLS) {
      toast.warning(`${name} — ${next}ª chamada`, {
        description: "Sem comparecimento após 3 chamadas. Deseja marcar como ausente?",
        action: { label: "Marcar ausente", onClick: () => setAbsentTarget(a) },
      });
    } else {
      toast.success(`Chamando ${name} (${next}/${MAX_CALLS})`, { description: destino });
    }
  };


  /* ---------- Ausência ---------- */
  const [absentTarget, setAbsentTarget] = useState<Appointment | null>(null);
  const [absentReason, setAbsentReason] = useState("");
  const confirmAbsent = async () => {
    if (!absentTarget) return;
    const prevNotes = (absentTarget as any).notes || "";
    await updateAppointment.mutateAsync({
      id: absentTarget.id,
      status: "nao_compareceu" as any,
      notes: absentReason ? `${prevNotes}\nAusência: ${absentReason}`.trim() : prevNotes,
    } as any);
    setAbsentTarget(null);
    setAbsentReason("");
  };

  /* ---------- Painel de detalhes ---------- */
  const [detail, setDetail] = useState<Appointment | null>(null);
  const detailLive = useMemo(
    () => (detail ? dayList.find(a => a.id === detail.id) ?? detail : null),
    [detail, dayList],
  );

  /* ---------- Atalhos ---------- */
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") {
        if (e.key === "Escape") (e.target as HTMLElement).blur();
        return;
      }
      if (e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key.toLowerCase() === "c") {
        const first = waitingList.find(a => ACTIVE_STATUSES.includes(a.status));
        if (first) callPatient(first);
      }
      if (e.key.toLowerCase() === "r") refresh();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const nextPatient = useMemo(
    () => dayList.filter(a => ACTIVE_STATUSES.includes(a.status))
      .sort((a, b) => priorityRank(a) - priorityRank(b) ||
        parseAgendaDateTime(a.scheduled_at).getTime() - parseAgendaDateTime(b.scheduled_at).getTime())[0],
    [dayList],
  );

  const slaTone = (m: number) =>
    m > 20 ? "text-destructive" : m > 10 ? "text-amber-600" : "text-muted-foreground";

  const kpis = [
    { icon: Users, label: "Na sala", value: stats.total, tone: "text-primary", bg: "bg-primary/10" },
    { icon: Hourglass, label: "Aguardando", value: stats.aguardando, tone: "text-amber-600", bg: "bg-amber-500/10" },
    { icon: PlayCircle, label: "Em atendimento", value: stats.emAtendimento, tone: "text-emerald-600", bg: "bg-emerald-500/10" },
    { icon: CheckCircle, label: "Concluídos", value: stats.concluidos, tone: "text-teal-600", bg: "bg-teal-500/10" },
    { icon: Timer, label: "Espera média", value: `${stats.tempoMedio}min`, tone: "text-blue-600", bg: "bg-blue-500/10" },
    { icon: AlertCircle, label: "Acima do SLA", value: stats.atrasados, tone: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <DoorOpen className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground leading-tight">Sala de Espera</h1>
              <p className="text-xs text-muted-foreground truncate">
                {format(now, "EEEE, dd 'de' MMMM", { locale: ptBR })} · {format(now, "HH:mm:ss")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CallSourceChip source={callSource} onSave={saveCallSource} />

            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setVoiceOn(v => !v)}>
                    {voiceOn ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{voiceOn ? "Locução ativa" : "Locução desativada"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md border bg-background/60">
              <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} className="scale-75" />
              <span className="text-[10px] text-muted-foreground">Auto 30s</span>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={refresh}>
              <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/agenda")} className="gap-1.5 text-xs">
              <CalendarClock className="h-3.5 w-3.5" />Agenda
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Heart className="h-4 w-4 mr-1" />Início
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-5 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map(k => (
            <Card key={k.label} className="border-border/60 shadow-sm">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0", k.bg)}>
                  <k.icon className={cn("h-4 w-4", k.tone)} />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold leading-none">{k.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">{k.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Próximo paciente */}
        {nextPatient && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-3 px-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-10 w-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {initials(patientName(nextPatient))}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-primary font-semibold">Próximo da fila</p>
                  <p className="font-semibold text-sm truncate">{patientName(nextPatient)}</p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {formatAgendaTime(nextPatient.scheduled_at)} · {nextPatient.profiles?.full_name || "Sem profissional"} ·{" "}
                    <span className={slaTone(waitMinutes(nextPatient))}>{waitMinutes(nextPatient)}min de espera</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-1.5" onClick={() => callPatient(nextPatient)}>
                  <Megaphone className="h-3.5 w-3.5" />Chamar
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => quickAction(nextPatient.id, "em_andamento")}>
                  <PlayCircle className="h-3.5 w-3.5" />Atender
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filtros */}
        <Card>
          <CardContent className="py-3 px-4 flex flex-wrap items-center gap-2">
            <Tabs value={tab} onValueChange={setTab} className="mr-1">
              <TabsList className="h-8">
                <TabsTrigger value="aguardando" className="text-xs h-6 px-2.5">Aguardando <span className="ml-1 opacity-60">{tabCounts.aguardando}</span></TabsTrigger>
                <TabsTrigger value="atendimento" className="text-xs h-6 px-2.5">Em atendimento <span className="ml-1 opacity-60">{tabCounts.atendimento}</span></TabsTrigger>
                <TabsTrigger value="finalizados" className="text-xs h-6 px-2.5">Finalizados <span className="ml-1 opacity-60">{tabCounts.finalizados}</span></TabsTrigger>
                <TabsTrigger value="todos" className="text-xs h-6 px-2.5">Todos <span className="ml-1 opacity-60">{tabCounts.todos}</span></TabsTrigger>
              </TabsList>
            </Tabs>

            <Separator orientation="vertical" className="h-6 hidden lg:block" />

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input ref={searchRef} placeholder="Buscar paciente...  ( / )" className="h-8 w-[220px] pl-8 text-xs"
                value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
            </div>

            {agendas && agendas.length > 0 && (
              <Select value={filterAgenda} onValueChange={setFilterAgenda}>
                <SelectTrigger className="h-8 w-[150px] text-xs"><SelectValue placeholder="Agenda" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Agendas</SelectItem>
                  {agendas.map(ag => <SelectItem key={ag.id} value={ag.id}>{ag.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Situação" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Situações</SelectItem>
                {Object.entries(waitingStatusConfig).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Prioridade" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda Prioridade</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="prioritario">Prioritário</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>

            <div className="ml-auto hidden xl:flex items-center gap-2 text-[10px] text-muted-foreground">
              <kbd className="px-1.5 py-0.5 rounded border bg-muted">/</kbd> buscar
              <kbd className="px-1.5 py-0.5 rounded border bg-muted">C</kbd> chamar próximo
              <kbd className="px-1.5 py-0.5 rounded border bg-muted">R</kbd> atualizar
            </div>
          </CardContent>
        </Card>

        {/* Lista */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !waitingList.length ? (
          <Card className="p-12 text-center">
            <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum paciente nesta visão</p>
            <p className="text-xs text-muted-foreground mt-1">Pacientes aparecem aqui após check-in ou confirmação na agenda</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-20">Hora</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Paciente</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-52">Profissional / Local</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-28">Convênio</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-28">Espera</th>
                      <th className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-32">Situação</th>
                      <th className="text-right px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground w-56">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {waitingList.map(a => {
                      const sc = waitingStatusConfig[a.status] || waitingStatusConfig.em_espera;
                      const mins = waitMinutes(a);
                      const procedures = getProcedures(a);
                      const call = calls[a.id];
                      const priority = (a as any).priority;
                      const name = patientName(a);
                      const closed = CLOSED_STATUSES.includes(a.status);

                      return (
                        <tr key={a.id}
                          className={cn(
                            "group hover:bg-muted/30 transition-colors cursor-pointer",
                            a.status === "em_andamento" && "bg-amber-50/40",
                            priority === "urgente" && !closed && "bg-destructive/[0.04]",
                            closed && "opacity-70",
                          )}
                          onClick={() => setDetail(a)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={cn("h-8 w-1 rounded-full shrink-0",
                                priority === "urgente" ? "bg-destructive" : priority === "prioritario" ? "bg-amber-500" : sc.dot)} />
                              <div>
                                <span className="font-mono font-semibold text-xs block">{formatAgendaTime(a.scheduled_at)}</span>
                                <span className="text-[10px] text-muted-foreground">{a.duration_minutes || 30}min</span>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                                {initials(name)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-medium text-sm truncate">{name}</span>
                                  {procedures.length > 0 && (
                                    <TooltipProvider delayDuration={100}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span className="inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-semibold cursor-help">
                                            {procedures.length}
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent side="right" className="max-w-xs">
                                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-1 opacity-70">Procedimentos lançados</p>
                                          <ul className="list-disc pl-4 space-y-0.5 text-xs">
                                            {procedures.map((p, i) => <li key={i}>{p}</li>)}
                                          </ul>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                  <span className="text-[10px] text-muted-foreground capitalize">{a.appointment_type}</span>
                                  {!a.patient_id && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-50 text-amber-600 border-amber-200">Cadastro pendente</Badge>}
                                  {(a as any).is_fit_in && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-violet-50 text-violet-600 border-violet-200">Encaixe</Badge>}
                                  {(a as any).is_return && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">Retorno</Badge>}
                                  {(a as any).is_new_patient && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-emerald-50 text-emerald-600 border-emerald-200">Novo</Badge>}
                                  {priority === "urgente" && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-destructive/10 text-destructive border-destructive/20">Urgente</Badge>}
                                  {priority === "prioritario" && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-50 text-amber-700 border-amber-200">Prioritário</Badge>}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <p className="text-xs truncate">{a.profiles?.full_name || "—"}</p>
                            <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                              <MapPin className="h-3 w-3" />{(a as any).room || a.location || "Recepção"}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-xs text-muted-foreground capitalize truncate">{(a as any).insurance || "Particular"}</td>

                          <td className="px-4 py-3">
                            {ACTIVE_STATUSES.includes(a.status) || a.status === "em_andamento" ? (
                              <div>
                                <span className={cn("text-xs font-semibold", slaTone(mins))}>
                                  {mins > 60 ? `${Math.floor(mins / 60)}h${String(mins % 60).padStart(2, "0")}` : `${mins}min`}
                                </span>
                                {call && (
                                  <p className="text-[10px] text-muted-foreground">
                                    {call.count}/{MAX_CALLS} chamadas · {Math.max(0, Math.floor(differenceInSeconds(now, new Date(call.at)) / 60))}min
                                  </p>
                                )}
                              </div>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </td>

                          <td className="px-4 py-3">
                            <Badge variant="outline" className={cn("text-[10px] gap-1", sc.color)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />{sc.label}
                            </Badge>
                          </td>

                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {!closed && (
                                <Button size="sm" variant="outline"
                                  className="h-7 px-2 text-[10px] gap-1 border-primary/30 text-primary hover:bg-primary/5"
                                  title="Chamar paciente" onClick={() => callPatient(a)}>
                                  <Megaphone className="h-3 w-3" />Chamar
                                  {call && <span className="ml-0.5 rounded-full bg-primary/10 px-1 text-[9px] font-semibold">{call.count}x</span>}
                                </Button>
                              )}
                              {["chegou", "confirmado", "em_espera", "agendado", "encaixe"].includes(a.status) && (
                                <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] gap-1 border-amber-200 text-amber-700 hover:bg-amber-50"
                                  onClick={() => quickAction(a.id, "em_andamento")}>
                                  <PlayCircle className="h-3 w-3" />Atender
                                </Button>
                              )}
                              {a.status === "em_andamento" && (
                                <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  onClick={() => quickAction(a.id, "concluido")}>
                                  <CheckCircle className="h-3 w-3" />Concluir
                                </Button>
                              )}
                              <TooltipProvider delayDuration={200}>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={!a.patient_id}
                                      onClick={() => navigate(`/prontuario/${a.patient_id}`)}>
                                      <FileText className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Prontuário</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                                      onClick={() => quickAction(a.id, "em_espera")}>
                                      <RotateCcw className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Devolver para espera</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                      onClick={() => setAbsentTarget(a)}>
                                      <UserX className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Marcar ausência</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive"
                                      onClick={() => quickAction(a.id, "cancelado")}>
                                      <Ban className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Cancelar</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground" />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Painel de detalhes */}
      <Sheet open={!!detailLive} onOpenChange={o => !o && setDetail(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {detailLive && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {initials(patientName(detailLive))}
                  </div>
                  {patientName(detailLive)}
                </SheetTitle>
                <SheetDescription>
                  {formatAgendaTime(detailLive.scheduled_at)} · {detailLive.appointment_type} ·{" "}
                  {waitingStatusConfig[detailLive.status]?.label || detailLive.status}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Stethoscope, label: "Profissional", value: detailLive.profiles?.full_name || "—" },
                    { icon: MapPin, label: "Local", value: (detailLive as any).room || detailLive.location || "Recepção" },
                    { icon: ShieldCheck, label: "Convênio", value: (detailLive as any).insurance || "Particular" },
                    { icon: Phone, label: "Contato", value: (detailLive as any).phone || (detailLive as any).provisional_phone || "—" },
                    { icon: Activity, label: "Especialidade", value: (detailLive as any).specialty || "—" },
                    { icon: Timer, label: "Espera", value: `${waitMinutes(detailLive)}min` },
                  ].map(f => (
                    <div key={f.label} className="rounded-lg border p-2.5">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                        <f.icon className="h-3 w-3" />{f.label}
                      </p>
                      <p className="text-xs font-medium mt-1 break-words">{f.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Procedimentos lançados</p>
                  {getProcedures(detailLive).length ? (
                    <ul className="space-y-1">
                      {getProcedures(detailLive).map((p, i) => (
                        <li key={i} className="text-xs rounded-md border bg-muted/30 px-2.5 py-1.5">{p}</li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-muted-foreground">Nenhum procedimento registrado.</p>}
                </div>

                {calls[detailLive.id] && (
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <p className="text-xs font-medium text-primary">
                      {calls[detailLive.id].count} chamada(s) realizada(s)
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Última há {Math.max(0, Math.floor(differenceInSeconds(now, new Date(calls[detailLive.id].at)) / 60))}min
                    </p>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" className="gap-1.5" onClick={() => callPatient(detailLive)}>
                    <Megaphone className="h-3.5 w-3.5" />Chamar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => quickAction(detailLive.id, "em_andamento")}>
                    <PlayCircle className="h-3.5 w-3.5" />Atender
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => quickAction(detailLive.id, "concluido")}>
                    <CheckCircle className="h-3.5 w-3.5" />Concluir
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" disabled={!detailLive.patient_id}
                    onClick={() => navigate(`/prontuario/${detailLive.patient_id}`)}>
                    <FileText className="h-3.5 w-3.5" />Prontuário
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAbsentTarget(detailLive)}>
                    <UserX className="h-3.5 w-3.5" />Ausente
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-1.5 text-destructive" onClick={() => quickAction(detailLive.id, "cancelado")}>
                    <Ban className="h-3.5 w-3.5" />Cancelar
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Ausência */}
      <Dialog open={!!absentTarget} onOpenChange={o => { if (!o) { setAbsentTarget(null); setAbsentReason(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar ausência</DialogTitle>
            <DialogDescription>
              {absentTarget ? `${patientName(absentTarget)} será marcado como não compareceu.` : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Justificativa (opcional)</label>
            <Textarea rows={3} value={absentReason} onChange={e => setAbsentReason(e.target.value)}
              placeholder="Ex.: paciente não atendeu após 3 chamadas" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setAbsentTarget(null); setAbsentReason(""); }}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmAbsent}>Confirmar ausência</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
