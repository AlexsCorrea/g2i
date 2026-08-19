import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments, useUpdateAppointment, type Appointment } from "@/hooks/useAppointments";
import { useScheduleAgendas } from "@/hooks/useScheduleAgendas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  DoorOpen, Search, Clock, User, CheckCircle, PlayCircle, FileText,
  Phone, Megaphone, ArrowLeft, Heart, RotateCcw, Ban, ChevronRight,
  AlertCircle, Shield, Timer, Loader2, Volume2
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatAgendaTime, parseAgendaDateTime } from "@/lib/agendaDateTime";

/* HOMOLOGAÇÃO: temporariamente todos os status refletem na sala de espera */
const WAITING_ROOM_STATUSES = [
  "agendado", "confirmado", "chegou", "em_espera", "em_andamento",
  "concluido", "cancelado", "nao_compareceu", "reagendado", "encaixe"
];

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

export default function SalaEspera() {
  const navigate = useNavigate();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: appointments, isLoading } = useAppointments({ date: today });
  const { data: agendas } = useScheduleAgendas();
  const updateAppointment = useUpdateAppointment();

  const [filterAgenda, setFilterAgenda] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");

  /* Filter appointments that belong in the waiting room */
  const waitingList = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(a => WAITING_ROOM_STATUSES.includes(a.status))
      .filter(a => {
        if (filterAgenda !== "all" && (a as any).agenda_id !== filterAgenda) return false;
        if (filterStatus !== "all" && a.status !== filterStatus) return false;
        if (filterSearch) {
          const s = filterSearch.toLowerCase();
          if (!a.patients?.full_name?.toLowerCase().includes(s) && !a.title.toLowerCase().includes(s)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const statusOrder: Record<string, number> = { em_andamento: 0, em_espera: 1, chegou: 2, confirmado: 3, agendado: 4, encaixe: 5, reagendado: 6, nao_compareceu: 7, concluido: 8, cancelado: 9 };
        const aOrder = statusOrder[a.status] ?? 10;
        const bOrder = statusOrder[b.status] ?? 10;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return parseAgendaDateTime(a.scheduled_at).getTime() - parseAgendaDateTime(b.scheduled_at).getTime();
      });
  }, [appointments, filterAgenda, filterStatus, filterSearch]);

  const stats = useMemo(() => ({
    total: waitingList.length,
    aguardando: waitingList.filter(a => a.status === "em_espera" || a.status === "chegou" || a.status === "confirmado").length,
    emAtendimento: waitingList.filter(a => a.status === "em_andamento").length,
  }), [waitingList]);

  const [calls, setCalls] = useState<Record<string, { count: number; at: number }>>({});

  const quickAction = async (id: string, status: string) => {
    await updateAppointment.mutateAsync({ id, status: status as any });
  };

  /* Procedimentos lançados para o paciente (tooltip) */
  const getProcedures = (a: Appointment): string[] => {
    const raw = [(a as any).description, (a as any).notes].filter(Boolean).join("\n");
    return raw
      .split(/\n|;|\||,/)
      .map(s => s.trim())
      .filter(Boolean);
  };

  /* Chamada do paciente (locução + registro local) */
  const callPatient = (a: Appointment) => {
    const name = a.patients?.full_name || (a as any).provisional_name || a.title;
    const local = (a as any).room || a.location || "recepção";
    setCalls(prev => ({ ...prev, [a.id]: { count: (prev[a.id]?.count || 0) + 1, at: Date.now() } }));
    try {
      const utter = new SpeechSynthesisUtterance(`${name}, comparecer à ${local}.`);
      utter.lang = "pt-BR";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch { /* locução indisponível */ }
    if (a.status === "chegou" || a.status === "confirmado" || a.status === "agendado") {
      updateAppointment.mutate({ id: a.id, status: "em_espera" as any });
    }
    toast.success(`Chamando ${name}`, { description: `Local: ${local}` });
  };

  const getWaitTime = (a: Appointment) => {
    const scheduled = parseAgendaDateTime(a.scheduled_at);
    const now = new Date();
    const mins = differenceInMinutes(now, scheduled);
    if (mins < 0) return null;
    if (mins > 60) return `${Math.floor(mins / 60)}h${mins % 60}min`;
    return `${mins}min`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <DoorOpen className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Sala de Espera</h1>
              <p className="text-xs text-muted-foreground">{format(new Date(), "dd/MM/yyyy (EEEE)", { locale: ptBR })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/agenda")} className="gap-1.5 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />Agenda
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Heart className="h-4 w-4 mr-1" />Início
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4 text-primary" />
              <div><p className="text-lg font-bold">{stats.total}</p><p className="text-[10px] text-muted-foreground">Na Sala</p></div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-amber-600" />
              <div><p className="text-lg font-bold">{stats.aguardando}</p><p className="text-[10px] text-muted-foreground">Aguardando</p></div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <PlayCircle className="h-4 w-4 text-emerald-600" />
              <div><p className="text-lg font-bold">{stats.emAtendimento}</p><p className="text-[10px] text-muted-foreground">Em Atendimento</p></div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Buscar paciente..." className="h-8 w-[200px] pl-8 text-xs" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
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
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !waitingList.length ? (
          <Card className="p-12 text-center">
            <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Nenhum paciente na sala de espera</p>
            <p className="text-xs text-muted-foreground mt-1">Pacientes aparecem aqui após check-in ou confirmação na agenda</p>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-16">Hora</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Paciente</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-24">Tipo</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-28">Convênio</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-24">Espera</th>
                      <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground w-28">Situação</th>
                      <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground w-44">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {waitingList.map(a => {
                      const sc = waitingStatusConfig[a.status] || waitingStatusConfig.em_espera;
                      const waitTime = getWaitTime(a);
                      const isLate = waitTime && parseInt(waitTime) > 30;

                      return (
                        <tr key={a.id} className={cn("hover:bg-muted/20 transition-colors", a.status === "em_andamento" && "bg-amber-50/30")}>
                          <td className="px-4 py-3">
                            <span className="font-mono font-semibold text-xs">{formatAgendaTime(a.scheduled_at)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <span className="font-medium text-sm">{a.patients?.full_name || (a as any).provisional_name || a.title}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                {!a.patient_id && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-50 text-amber-600 border-amber-200">Cadastro pendente</Badge>}
                                {(a as any).is_fit_in && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-violet-50 text-violet-600 border-violet-200">Encaixe</Badge>}
                                {(a as any).is_return && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">Retorno</Badge>}
                                {(a as any).is_new_patient && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-emerald-50 text-emerald-600 border-emerald-200">Novo</Badge>}
                                {(a as any).priority === "urgente" && <Badge variant="outline" className="text-[9px] px-1 py-0 bg-destructive/10 text-destructive border-destructive/20">Urgente</Badge>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{a.appointment_type}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground capitalize">{(a as any).insurance || "—"}</td>
                          <td className="px-4 py-3">
                            {waitTime ? (
                              <span className={cn("text-xs font-medium", isLate ? "text-destructive" : "text-muted-foreground")}>
                                {waitTime}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={cn("text-[10px]", sc.color)}>{sc.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              {(a.status === "chegou" || a.status === "confirmado" || a.status === "em_espera") && (
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
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Prontuário"
                                onClick={() => navigate(`/prontuario/${a.patient_id}`)}>
                                <FileText className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Devolver para espera"
                                onClick={() => quickAction(a.id, "em_espera")}>
                                <RotateCcw className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" title="Cancelar"
                                onClick={() => quickAction(a.id, "cancelado")}>
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
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
    </div>
  );
}
