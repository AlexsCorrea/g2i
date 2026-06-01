import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppointments, useUpdateAppointment, useDeleteAppointment } from "@/hooks/useAppointments";
import { useScheduleAgendas, useSchedulePeriods, useScheduleBlocks, useScheduleHolidays, type ScheduleAgenda } from "@/hooks/useScheduleAgendas";
import { useAppointmentLogs, useCreateAppointmentLog } from "@/hooks/useAppointmentLogs";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Plus, CalendarIcon, Clock, User, Loader2, List,
  LayoutGrid, ChevronLeft, ChevronRight, Trash2, Search,
  FileText, CheckCircle, UserCheck, Edit, Phone, X,
  Ban, RotateCcw, PlayCircle, DoorOpen, Eye, Filter, AlertTriangle, Lock, Users, GripVertical
} from "lucide-react";
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { isHourAvailable, isTimeAvailable } from "@/lib/agendaAvailability";
import { toast } from "sonner";
import { formatAgendaDateTime as formatAgendaDateTimeValue, formatAgendaTime as formatAgendaTimeValue, parseAgendaDateTime as parseAgendaDateTimeValue, toAgendaLocalISOString } from "@/lib/agendaDateTime";
import AppointmentFormDialog from "./AppointmentFormDialog";
import MassTransferDialog from "./MassTransferDialog";
import DragConfirmDialog from "./DragConfirmDialog";

const appointmentTypes = [
  { value: "consulta", label: "Consulta" },
  { value: "exame", label: "Exame" },
  { value: "procedimento", label: "Procedimento" },
  { value: "cirurgia", label: "Cirurgia" },
  { value: "retorno", label: "Retorno" },
  { value: "fisioterapia", label: "Fisioterapia" },
];

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  agendado: { label: "Agendado", color: "bg-primary/10 text-primary border-primary/20", dot: "bg-primary" },
  confirmado: { label: "Confirmado", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300", dot: "bg-emerald-500" },
  em_espera: { label: "Em Espera", color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300", dot: "bg-yellow-500" },
  em_andamento: { label: "Em Atendimento", color: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300", dot: "bg-amber-500" },
  concluido: { label: "Concluído", color: "bg-muted text-muted-foreground border-muted", dot: "bg-muted-foreground" },
  cancelado: { label: "Cancelado", color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  nao_compareceu: { label: "Não Compareceu", color: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive" },
  reagendado: { label: "Reagendado", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300", dot: "bg-blue-500" },
  encaixe: { label: "Encaixe", color: "bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300", dot: "bg-violet-500" },
  chegou: { label: "Chegou", color: "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300", dot: "bg-teal-500" },
};

const allStatuses = Object.keys(statusConfig);

function parseLocalTime(ts: string): Date {
  return parseAgendaDateTimeValue(ts);
}

function formatTime(ts: string): string {
  return formatAgendaTimeValue(ts);
}

function formatDatetime(ts: string): string {
  return formatAgendaDateTimeValue(ts);
}

export default function AgendaOperational() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"list" | "day" | "week" | "month">("day");
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [selectedAgendaIds, setSelectedAgendaIds] = useState<string[]>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [agendaFilterOpen, setAgendaFilterOpen] = useState(false);
  const [isEncaixe, setIsEncaixe] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [checkinAppt, setCheckinAppt] = useState<any>(null);
  const [checkinNotes, setCheckinNotes] = useState("");
  const [formDefaultDate, setFormDefaultDate] = useState<string>("");
  const [formDefaultTime, setFormDefaultTime] = useState<string>("08:00");
  const [formDefaultAgenda, setFormDefaultAgenda] = useState<string>("");
  const [showMassTransfer, setShowMassTransfer] = useState(false);

  // Drag & drop state
  const [dragAppt, setDragAppt] = useState<any>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [dragConfirmOpen, setDragConfirmOpen] = useState(false);
  const [dragSaving, setDragSaving] = useState(false);
  const [dragConfirmData, setDragConfirmData] = useState<{
    patientName: string; sourceAgenda: string; targetAgenda: string;
    sourceTime: string; targetTime: string; isTransfer: boolean;
    appointmentId: string; targetAgendaId: string; newScheduledAt: string;
  } | null>(null);

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthGridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthGridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: monthGridStart, end: monthGridEnd });

  const { data: dayAppointments, isLoading } = useAppointments({ date: (viewMode === "week" || viewMode === "month") ? undefined : dateStr });
  const { data: weekAppointments } = useAppointments((viewMode === "week" || viewMode === "month") ? {} : undefined);
  const { data: agendas } = useScheduleAgendas();
  const { data: allPeriods } = useSchedulePeriods();
  const { data: allBlocks } = useScheduleBlocks();
  const { data: allHolidays } = useScheduleHolidays();
  const updateAppointment = useUpdateAppointment();
  const deleteAppointment = useDeleteAppointment();
  const createLog = useCreateAppointmentLog();
  const { data: selectedApptLogs } = useAppointmentLogs(selectedAppt?.id);

  const periods = allPeriods || [];
  const blocks = allBlocks || [];
  const holidays = allHolidays || [];

  // Check if a slot is blocked
  const isSlotBlocked = (agendaId: string, date: Date, hour: number): string | null => {
    const dateStr2 = format(date, "yyyy-MM-dd");
    // Check holidays
    const holiday = holidays.find(h => h.holiday_date === dateStr2 && h.auto_block &&
      (!h.affected_agendas?.length || h.affected_agendas.includes(agendaId)));
    if (holiday) return `Feriado: ${holiday.name}`;
    // Check blocks
    const block = blocks.find(b => {
      if (b.agenda_id !== agendaId) return false;
      if (dateStr2 < b.start_date || dateStr2 > b.end_date) return false;
      if (b.block_type === "total") return true;
      if (b.start_time && b.end_time) {
        const bsh = parseInt(b.start_time.split(":")[0], 10);
        const beh = parseInt(b.end_time.split(":")[0], 10);
        return hour >= bsh && hour < beh;
      }
      return true;
    });
    if (block) return `Bloqueado: ${block.reason}`;
    return null;
  };

  const activeAgendas = useMemo(() => agendas?.filter(a => a.status === "ativa") || [], [agendas]);
  const displayedAgendas = useMemo(() => {
    if (selectedAgendaIds.length === 0) return activeAgendas;
    return activeAgendas.filter(a => selectedAgendaIds.includes(a.id));
  }, [activeAgendas, selectedAgendaIds]);

  const appointments = useMemo(() => {
    const raw = viewMode === "week"
      ? weekAppointments?.filter(a => {
          const d = parseLocalTime(a.scheduled_at);
          return d >= weekStart && d <= weekEnd;
        })
      : viewMode === "month"
        ? weekAppointments?.filter(a => {
            const d = parseLocalTime(a.scheduled_at);
            return d >= monthGridStart && d <= monthGridEnd;
          })
        : dayAppointments;
    return raw || [];
  }, [viewMode, dayAppointments, weekAppointments, weekStart, weekEnd, monthGridStart, monthGridEnd]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterType !== "all" && a.appointment_type !== filterType) return false;
      if (selectedAgendaIds.length > 0 && !(a as any).agenda_id) return false;
      if (selectedAgendaIds.length > 0 && !selectedAgendaIds.includes((a as any).agenda_id)) return false;
      if (filterSearch) {
        const search = filterSearch.toLowerCase();
        const matchName = a.patients?.full_name?.toLowerCase().includes(search);
        const matchTitle = a.title?.toLowerCase().includes(search);
        if (!matchName && !matchTitle) return false;
      }
      return true;
    });
  }, [appointments, filterStatus, filterType, selectedAgendaIds, filterSearch]);

  const handleCheckin = async () => {
    if (!checkinAppt) return;
    const oldStatus = checkinAppt.status;
    await updateAppointment.mutateAsync({
      id: checkinAppt.id,
      status: "chegou" as any,
      notes: checkinNotes ? `${checkinAppt.notes || ''}\n[Chegada] ${checkinNotes}`.trim() : checkinAppt.notes
    });
    createLog.mutate({ appointment_id: checkinAppt.id, action: "check-in", old_status: oldStatus, new_status: "chegou", changed_by: profile?.id, details: checkinNotes ? { notes: checkinNotes } : null });
    setCheckinAppt(null);
    setCheckinNotes("");
    if (selectedAppt?.id === checkinAppt.id) setSelectedAppt(null);
  };

  const quickAction = async (id: string, status: string) => {
    const appt = appointments.find(a => a.id === id);
    await updateAppointment.mutateAsync({ id, status: status as any });
    createLog.mutate({ appointment_id: id, action: "status_change", old_status: appt?.status || null, new_status: status, changed_by: profile?.id });
    if (selectedAppt?.id === id) setSelectedAppt(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    createLog.mutate({ appointment_id: id, action: "deleted", changed_by: profile?.id });
    await deleteAppointment.mutateAsync(id);
    if (selectedAppt?.id === id) setSelectedAppt(null);
  };

  const toggleAgenda = (id: string) => {
    setSelectedAgendaIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const openNewAppointment = (date: string, time: string, agendaId?: string, asEncaixe = false) => {
    setFormDefaultDate(date);
    setFormDefaultTime(time);
    setFormDefaultAgenda(agendaId || "");
    setIsEncaixe(asEncaixe);
    setEditingAppointment(null);
    setShowForm(true);
  };

  const handleSlotClick = (time: string, agenda: ScheduleAgenda | null) => {
    const dayOfWeek = selectedDate.getDay();
    const hour = parseInt(time.split(":")[0], 10);

    if (agenda) {
      const blockReason = isSlotBlocked(agenda.id, selectedDate, hour);
      if (blockReason) {
        toast.error(blockReason);
        return;
      }
      const available = isTimeAvailable(periods, agenda.id, dayOfWeek, time);
      if (!available) {
        toast.error("Esta agenda não possui período aberto neste horário.");
        return;
      }
      // Check conflicts at this exact time
      const existingAppts = filteredAppointments.filter(a => {
        const d = parseLocalTime(a.scheduled_at);
        const apptTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        return apptTime === time && (a as any).agenda_id === agenda.id;
      });
      if (existingAppts.length > 0 && !agenda.allows_overlap) {
        toast.error("Já existe um agendamento neste horário. Use 'Encaixe' para sobrepor.");
        return;
      }
    }
    openNewAppointment(dateStr, time, agenda?.id);
  };

  // Drag handlers
  const handleDragStart = useCallback((e: React.DragEvent, appointment: any) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", appointment.id);
    setDragAppt(appointment);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, slotKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverSlot(slotKey);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverSlot(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, time: string, agenda: ScheduleAgenda | null) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (!dragAppt || !agenda) return;

    const dayOfWeek = selectedDate.getDay();
    const hour = parseInt(time.split(":")[0], 10);

    // Validate destination
    const blockReason = isSlotBlocked(agenda.id, selectedDate, hour);
    if (blockReason) { toast.error(blockReason); setDragAppt(null); return; }

    const available = isTimeAvailable(periods, agenda.id, dayOfWeek, time);
    if (!available) { toast.error("Horário fora do período da agenda destino."); setDragAppt(null); return; }

    // Check conflicts
    const existingAppts = filteredAppointments.filter(a => {
      if (a.id === dragAppt.id) return false;
      const d = parseLocalTime(a.scheduled_at);
      const apptTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      return apptTime === time && (a as any).agenda_id === agenda.id;
    });
    if (existingAppts.length > 0 && !agenda.allows_overlap) {
      toast.error("Já existe um agendamento neste horário. Use 'Encaixe' para sobrepor.");
      setDragAppt(null);
      return;
    }

    const srcAgendaId = (dragAppt as any).agenda_id;
    const isTransfer = srcAgendaId !== agenda.id;
    const srcAgenda = agendas?.find(a => a.id === srcAgendaId);
    const srcTime = formatTime(dragAppt.scheduled_at);
    const localIso = toAgendaLocalISOString(dateStr, time);

    setDragConfirmData({
      patientName: dragAppt.patients?.full_name || (dragAppt as any).provisional_name || dragAppt.title,
      sourceAgenda: srcAgenda?.name || "—",
      targetAgenda: agenda.name,
      sourceTime: srcTime,
      targetTime: time,
      isTransfer,
      appointmentId: dragAppt.id,
      targetAgendaId: agenda.id,
      newScheduledAt: localIso,
    });
    setDragConfirmOpen(true);
    setDragAppt(null);
  }, [dragAppt, selectedDate, periods, filteredAppointments, agendas]);

  const confirmDrag = async () => {
    if (!dragConfirmData) return;
    const { appointmentId, targetAgendaId: tAgId, newScheduledAt, isTransfer, sourceTime, targetTime, sourceAgenda, targetAgenda } = dragConfirmData;
    const appt = appointments.find(a => a.id === appointmentId);
    setDragSaving(true);
    try {
      await updateAppointment.mutateAsync({
        id: appointmentId,
        agenda_id: tAgId,
        scheduled_at: newScheduledAt,
      } as any);
      createLog.mutate({
        appointment_id: appointmentId,
        action: isTransfer ? "transfer" : "reschedule",
        old_status: appt?.status || null,
        new_status: appt?.status || null,
        changed_by: profile?.id,
        details: {
          type: isTransfer ? "transfer" : "reschedule",
          source_agenda: sourceAgenda,
          target_agenda: targetAgenda,
          original_time: sourceTime,
          new_time: targetTime,
        } as any,
      });
      toast.success(isTransfer ? "Agendamento transferido!" : "Agendamento remarcado!");
    } catch (err) {
      toast.error("Erro ao mover agendamento. O card foi mantido na posição original.");
    } finally {
      setDragSaving(false);
      setDragConfirmOpen(false);
      setDragConfirmData(null);
    }
  };

  // Dynamic hour range based on displayed agendas' periods
  const hours = useMemo(() => {
    const dayOfWeek = selectedDate.getDay();
    let minHour = 7, maxHour = 20;
    if (periods.length > 0 && displayedAgendas.length > 0) {
      let foundAny = false;
      displayedAgendas.forEach(ag => {
        const agPeriods = periods.filter(p => p.agenda_id === ag.id && p.day_of_week === dayOfWeek);
        agPeriods.forEach(p => {
          const sh = parseInt(p.start_time.split(":")[0], 10);
          const eh = parseInt(p.end_time.split(":")[0], 10);
          if (!foundAny) { minHour = sh; maxHour = eh; foundAny = true; }
          else { minHour = Math.min(minHour, sh); maxHour = Math.max(maxHour, eh); }
        });
      });
    }
    const length = Math.max(maxHour - minHour, 1);
    return Array.from({ length }, (_, i) => i + minHour);
  }, [selectedDate, periods, displayedAgendas]);

  const stats = useMemo(() => {
    if (!filteredAppointments) return { total: 0, confirmados: 0, aguardando: 0, emEspera: 0, chegou: 0 };
    return {
      total: filteredAppointments.length,
      confirmados: filteredAppointments.filter(a => a.status === "confirmado" || a.status === "concluido").length,
      aguardando: filteredAppointments.filter(a => a.status === "agendado").length,
      emEspera: filteredAppointments.filter(a => a.status === "em_espera" || a.status === "em_andamento").length,
      chegou: filteredAppointments.filter(a => (a.status as string) === "chegou").length,
    };
  }, [filteredAppointments]);

  const getAgendaColor = (agendaId?: string | null): string => {
    if (!agendaId) return "#6b7280";
    const ag = agendas?.find(a => a.id === agendaId);
    return (ag as any)?.color || "#6b7280";
  };

  /* ── Appointment card ── */
  const renderAppointmentCard = (appointment: any, compact = false) => {
    const sc = statusConfig[appointment.status] || statusConfig.agendado;
    const isSelected = selectedAppt?.id === appointment.id;
    const agColor = getAgendaColor((appointment as any).agenda_id);
    const isProvisional = !appointment.patient_id;

    return (
      <div
        key={appointment.id}
        className={cn(
          "rounded-lg border transition-all cursor-pointer group",
          compact ? "p-1.5" : "px-3 py-2",
          isSelected ? "ring-2 ring-primary/40 shadow-md border-primary/30" : "hover:shadow-sm hover:border-border/80",
        )}
        style={{ borderLeftWidth: "3px", borderLeftColor: agColor }}
        onClick={() => setSelectedAppt(appointment)}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono font-semibold text-xs tabular-nums w-11 shrink-0">
            {formatTime(appointment.scheduled_at)}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={cn("font-medium truncate", compact ? "text-[11px]" : "text-xs")}>
                {appointment.patients?.full_name || appointment.title}
              </span>
              {(appointment as any).is_fit_in && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 bg-violet-50 text-violet-600 border-violet-200 shrink-0">Enc</Badge>
              )}
              {(appointment as any).is_return && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200 shrink-0">Ret</Badge>
              )}
              {isProvisional && (
                <Badge variant="outline" className="text-[8px] px-1 py-0 bg-amber-50 text-amber-600 border-amber-200 shrink-0">Cadastro pendente</Badge>
              )}
            </div>
            {!compact && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                <span>{appointmentTypes.find(t => t.value === appointment.appointment_type)?.label}</span>
                {(appointment as any).insurance && <span>· {(appointment as any).insurance}</span>}
                <span>· {appointment.duration_minutes}min</span>
              </div>
            )}
          </div>
          <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 shrink-0", sc.color)}>{sc.label}</Badge>

          {/* Hover quick actions */}
          {!compact && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {appointment.status === "agendado" && (
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Confirmar"
                  onClick={(e) => { e.stopPropagation(); quickAction(appointment.id, "confirmado"); }}>
                  <CheckCircle className="h-3 w-3 text-emerald-600" />
                </Button>
              )}
              {(appointment.status === "agendado" || appointment.status === "confirmado") && (
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Check-in"
                  onClick={(e) => { e.stopPropagation(); setCheckinAppt(appointment); }}>
                  <UserCheck className="h-3 w-3 text-teal-600" />
                </Button>
              )}
              {(appointment.status === "chegou" || appointment.status === "em_espera") && (
                <Button variant="ghost" size="icon" className="h-6 w-6" title="Atender"
                  onClick={(e) => { e.stopPropagation(); quickAction(appointment.id, "em_andamento"); }}>
                  <PlayCircle className="h-3 w-3 text-amber-600" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-6 w-6" title="Editar"
                onClick={(e) => { e.stopPropagation(); setEditingAppointment(appointment); setIsEncaixe(false); setShowForm(true); }}>
                <Edit className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── Detail panel ── */
  const renderDetailPanel = () => {
    if (!selectedAppt) return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <Eye className="h-10 w-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Clique em um agendamento</p>
      </div>
    );

    const a = selectedAppt;
    const sc = statusConfig[a.status] || statusConfig.agendado;
    const isProvisional = !a.patient_id;

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-full", sc.dot)} />
            <Badge variant="outline" className={cn("text-xs", sc.color)}>{sc.label}</Badge>
            {isProvisional && <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">Cadastro pendente</Badge>}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedAppt(null)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-base">{a.patients?.full_name || (a as any).provisional_name || a.title}</h3>
            {isProvisional && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                <AlertTriangle className="h-3 w-3" />
                Paciente provisório — cadastro precisa ser finalizado
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              <span>{formatDatetime(a.scheduled_at)}</span>
              <span>· {a.duration_minutes}min</span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><span className="text-muted-foreground block">Tipo</span><span className="font-medium">{appointmentTypes.find(t => t.value === a.appointment_type)?.label}</span></div>
            <div><span className="text-muted-foreground block">Convênio</span><span className="font-medium capitalize">{(a as any).insurance || "—"}</span></div>
            <div><span className="text-muted-foreground block">Sala</span><span className="font-medium">{(a as any).room || a.location || "—"}</span></div>
            <div><span className="text-muted-foreground block">Prioridade</span><span className="font-medium capitalize">{(a as any).priority || "normal"}</span></div>
            <div><span className="text-muted-foreground block">Canal</span><span className="font-medium capitalize">{(a as any).origin_channel || "—"}</span></div>
            <div><span className="text-muted-foreground block">Profissional</span><span className="font-medium">{a.profiles?.full_name || "—"}</span></div>
            {(a as any).phone && (
              <div className="col-span-2"><span className="text-muted-foreground block">Telefone</span><span className="font-medium flex items-center gap-1"><Phone className="h-3 w-3" />{(a as any).phone}</span></div>
            )}
          </div>

          {a.notes && (
            <>
              <Separator />
              <div><span className="text-xs text-muted-foreground block mb-1">Observações</span><p className="text-xs whitespace-pre-wrap bg-muted/30 rounded-md p-2">{a.notes}</p></div>
            </>
          )}

          <div className="flex flex-wrap gap-1.5">
            {(a as any).is_fit_in && <Badge variant="outline" className="text-[10px] bg-violet-50 text-violet-700 border-violet-200">Encaixe</Badge>}
            {(a as any).is_return && <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">Retorno</Badge>}
            {(a as any).is_new_patient && <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">Paciente Novo</Badge>}
          </div>

          {/* Audit trail */}
          {selectedApptLogs && selectedApptLogs.length > 0 && (
            <>
              <Separator />
              <div>
                <span className="text-xs text-muted-foreground font-semibold block mb-2">Histórico</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {selectedApptLogs.map(log => (
                    <div key={log.id} className="text-[10px] flex items-start gap-2 text-muted-foreground">
                      <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">{log.action === "status_change" ? `${statusConfig[log.old_status || ""]?.label || log.old_status} → ${statusConfig[log.new_status || ""]?.label || log.new_status}` : log.action === "check-in" ? "Check-in realizado" : log.action === "deleted" ? "Excluído" : log.action}</span>
                        <span className="block">{new Date(log.created_at).toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="border-t p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {a.status === "agendado" && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => quickAction(a.id, "confirmado")}><CheckCircle className="h-3.5 w-3.5" />Confirmar</Button>
            )}
            {(a.status === "agendado" || a.status === "confirmado") && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-teal-200 text-teal-700 hover:bg-teal-50"
                onClick={() => setCheckinAppt(a)}><UserCheck className="h-3.5 w-3.5" />Check-in</Button>
            )}
            {(a.status === "chegou" || a.status === "em_espera") && (
              <>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={() => quickAction(a.id, "em_andamento")}><PlayCircle className="h-3.5 w-3.5" />Atender</Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs"
                  onClick={() => quickAction(a.id, "em_espera")}><DoorOpen className="h-3.5 w-3.5" />Sala Espera</Button>
              </>
            )}
            {a.status === "em_andamento" && (
              <Button size="sm" variant="outline" className="gap-1.5 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => quickAction(a.id, "concluido")}><CheckCircle className="h-3.5 w-3.5" />Concluir</Button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1"
              onClick={() => { setEditingAppointment(a); setIsEncaixe(false); setShowForm(true); }}><Edit className="h-3 w-3" />Editar</Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1"
              onClick={() => navigate(`/prontuario/${a.patient_id}`)}><FileText className="h-3 w-3" />Prontuário</Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1"
              onClick={() => quickAction(a.id, "reagendado")}><RotateCcw className="h-3 w-3" />Reagendar</Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1"
              onClick={() => quickAction(a.id, "nao_compareceu")}><Ban className="h-3 w-3" />Faltou</Button>
            <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1 text-destructive hover:text-destructive"
              onClick={() => handleDelete(a.id)}><Trash2 className="h-3 w-3" />Excluir</Button>
          </div>
        </div>
      </div>
    );
  };

  /* ── Multi-agenda day columns ── */
  const renderMultiAgendaDay = () => {
    const cols = displayedAgendas.length > 0 ? displayedAgendas : [null];
    const isMulti = cols.length > 1 && cols[0] !== null;
    const dayOfWeek = selectedDate.getDay();

    return (
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <div style={{ minWidth: isMulti ? `${cols.length * 220 + 56}px` : undefined }}>
            {/* Column headers */}
            {isMulti && (
              <div className="flex border-b sticky top-0 bg-card z-10">
                <div className="w-14 shrink-0 border-r bg-muted/30" />
                {cols.map((ag) => {
                  const prof = (ag as any)?.profiles;
                  const initials = prof?.full_name
                    ? prof.full_name.split(" ").filter(Boolean).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
                    : ag!.name.split(" ").filter(Boolean).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
                  // Get open periods for this day
                  const agPeriods = periods.filter(p => p.agenda_id === ag!.id && p.day_of_week === dayOfWeek);
                  const periodLabel = agPeriods.length > 0
                    ? agPeriods.map(p => `${p.start_time.slice(0,5)}–${p.end_time.slice(0,5)}`).join(" | ")
                    : "Sem período";
                  return (
                    <div key={ag!.id} className="flex-1 min-w-[200px] px-3 py-2.5 border-r" style={{ borderTopWidth: "3px", borderTopColor: (ag as any)?.color || "hsl(var(--muted-foreground))" }}>
                      <div className="flex items-center gap-2 justify-center">
                        {ag!.professional_id && (
                          <Avatar className="h-7 w-7 shrink-0">
                            {prof?.avatar_url ? (
                              <AvatarImage src={prof.avatar_url} alt={prof.full_name || ag!.name} />
                            ) : null}
                            <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="text-left min-w-0">
                          <p className="text-xs font-semibold truncate">{prof?.full_name || ag!.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{ag!.specialty || prof?.specialty || ag!.unit || ""}</p>
                          <p className={cn(
                            "text-[9px] font-mono truncate mt-0.5",
                            agPeriods.length > 0 ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-destructive/60"
                          )}>{periodLabel}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Time rows with sub-slots */}
            <div className="divide-y">
              {hours.map(hour => {
                return (
                  <div key={hour} className="flex">
                    {/* Time ruler */}
                    <div className="w-14 shrink-0 border-r bg-muted/40 flex items-start justify-center pt-1.5">
                      <span className="text-[11px] font-bold text-foreground/80 tabular-nums tracking-tight">
                        {String(hour).padStart(2, "0")}:00
                      </span>
                    </div>
                    {cols.map((ag, ci) => {
                      const agInterval = ag?.default_interval || 30;
                      const slotsPerHour = Math.max(Math.floor(60 / agInterval), 1);
                      const agSubSlots = Array.from({ length: slotsPerHour }, (_, i) => i * agInterval);
                      const blockReason = ag ? isSlotBlocked(ag.id, selectedDate, hour) : null;
                      const periodOpen = ag ? isTimeAvailable(periods, ag.id, dayOfWeek, `${String(hour).padStart(2, "0")}:00`) : true;

                      // Proportional height: base is ~2.5px per minute, min 28px per slot
                      const pxPerMin = 2.5;
                      const slotHeightPx = Math.max(Math.round(agInterval * pxPerMin), 28);

                      return (
                        <div key={ag?.id || ci} className={cn(
                          "flex-1 min-w-[200px] flex flex-col",
                          isMulti && "border-r",
                          !periodOpen && !blockReason && "bg-muted/50",
                        )}>
                          {agSubSlots.map((minOffset, si) => {
                            const slotTime = `${String(hour).padStart(2, "0")}:${String(minOffset).padStart(2, "0")}`;
                            const slotKey = `${ag?.id || ci}-${slotTime}`;
                            const available = ag ? isTimeAvailable(periods, ag.id, dayOfWeek, slotTime) : true;
                            const isDragOver = dragOverSlot === slotKey;

                            // Find appointments at this exact sub-slot
                            const slotAppts = filteredAppointments.filter(a => {
                              const d = parseLocalTime(a.scheduled_at);
                              if (d.getHours() !== hour) return false;
                              const apptMin = d.getMinutes();
                              const snapped = Math.floor(apptMin / agInterval) * agInterval;
                              if (snapped !== minOffset) return false;
                              if (ag && (a as any).agenda_id !== ag.id) return false;
                              return true;
                            });

                            return (
                              <div
                                key={slotKey}
                                className={cn(
                                  "px-1 py-0.5 transition-colors relative",
                                  si < agSubSlots.length - 1 && "border-b border-dashed border-border/30",
                                  si === 0 && "border-t border-border/50",
                                  blockReason && "bg-destructive/5",
                                  !available && !blockReason && "bg-muted/30",
                                  isDragOver && available && !blockReason && "bg-primary/10 ring-1 ring-inset ring-primary/30",
                                  isDragOver && (!available || blockReason) && "bg-destructive/10",
                                )}
                                style={{ minHeight: `${slotHeightPx}px` }}
                                onDragOver={available && !blockReason ? (e) => handleDragOver(e, slotKey) : undefined}
                                onDragLeave={handleDragLeave}
                                onDrop={available && !blockReason ? (e) => handleDrop(e, slotTime, ag) : undefined}
                              >
                                {/* Sub-slot time label — always visible when no appointment */}
                                {agSubSlots.length > 1 && !slotAppts.length && available && !blockReason && (
                                  <span className={cn(
                                    "absolute left-1.5 top-0.5 font-mono select-none pointer-events-none tabular-nums",
                                    si === 0
                                      ? "text-[10px] text-foreground/50 font-semibold"
                                      : "text-[10px] text-foreground/40 font-medium"
                                  )}>
                                    {slotTime}
                                  </span>
                                )}

                                {slotAppts.map(a => (
                                  <div
                                    key={a.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, a)}
                                    onDragEnd={() => setDragAppt(null)}
                                    className="cursor-grab active:cursor-grabbing"
                                  >
                                    {renderAppointmentCard(a, isMulti)}
                                  </div>
                                ))}

                                {!slotAppts.length && blockReason && si === 0 && (
                                  <div className="w-full h-full rounded flex items-center justify-center gap-1 text-destructive/40" title={blockReason}>
                                    <Ban className="h-3 w-3" />
                                    <span className="text-[9px] truncate max-w-[120px]">{blockReason}</span>
                                  </div>
                                )}

                                {!slotAppts.length && !blockReason && available && (
                                  <button
                                    className="w-full h-full rounded border border-dashed border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all flex items-center justify-center group/slot"
                                    onClick={() => handleSlotClick(slotTime, ag)}
                                  >
                                    <Plus className="h-3 w-3 text-muted-foreground/0 group-hover/slot:text-primary/40 transition-opacity" />
                                  </button>
                                )}

                                {!slotAppts.length && !blockReason && !available && si === 0 && (
                                  <div className="w-full h-full rounded flex items-center justify-center gap-1 text-muted-foreground/30">
                                    <Lock className="h-3 w-3" />
                                    <span className="text-[9px]">Fechado</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { icon: CalendarIcon, label: "Total", value: stats.total, iconColor: "text-primary" },
          { icon: CheckCircle, label: "Confirmados", value: stats.confirmados, iconColor: "text-emerald-600" },
          { icon: Clock, label: "Aguardando", value: stats.aguardando, iconColor: "text-amber-600" },
          { icon: UserCheck, label: "Chegou", value: stats.chegou, iconColor: "text-teal-600" },
          { icon: User, label: "Em Espera/Atend.", value: stats.emEspera, iconColor: "text-violet-600" },
        ].map(({ icon: Icon, label, value, iconColor }) => (
          <Card key={label} className="p-3">
            <div className="flex items-center gap-2">
              <Icon className={cn("h-4 w-4", iconColor)} />
              <div>
                <p className="text-lg font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Date nav */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                if (viewMode === "month") setSelectedDate(subMonths(selectedDate, 1));
                else setSelectedDate(subDays(selectedDate, viewMode === "week" ? 7 : 1));
              }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2 h-8 text-sm font-medium">
                    <CalendarIcon className="h-3.5 w-3.5" />
                    {viewMode === "week"
                      ? `${format(weekStart, "dd/MM")} — ${format(weekEnd, "dd/MM/yyyy")}`
                      : viewMode === "month"
                        ? format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })
                        : format(selectedDate, "dd/MM/yyyy (EEE)", { locale: ptBR })
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[60]" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={d => { if (d) { setSelectedDate(d); setCalendarOpen(false); } }} locale={ptBR} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                if (viewMode === "month") setSelectedDate(addMonths(selectedDate, 1));
                else setSelectedDate(addDays(selectedDate, viewMode === "week" ? 7 : 1));
              }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectedDate(new Date())}>Hoje</Button>
            </div>

            <div className="h-6 w-px bg-border mx-1" />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Buscar paciente..." className="h-8 w-[170px] pl-8 text-xs" value={filterSearch} onChange={e => setFilterSearch(e.target.value)} />
            </div>

            {/* Multi-agenda filter */}
            <Popover open={agendaFilterOpen} onOpenChange={setAgendaFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-8 gap-1.5 text-xs", selectedAgendaIds.length > 0 && "border-primary text-primary")}>
                  <Filter className="h-3.5 w-3.5" />
                  Agendas {selectedAgendaIds.length > 0 && `(${selectedAgendaIds.length})`}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0 z-[60]" align="start">
                <div className="p-3 border-b">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Selecionar Agendas</Label>
                    {selectedAgendaIds.length > 0 && (
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={() => setSelectedAgendaIds([])}>Limpar</Button>
                    )}
                  </div>
                </div>
                <ScrollArea className="max-h-64">
                  <div className="p-2 space-y-1">
                    {activeAgendas.map(ag => (
                      <label key={ag.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-xs">
                        <Checkbox
                          checked={selectedAgendaIds.includes(ag.id)}
                          onCheckedChange={() => toggleAgenda(ag.id)}
                        />
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: (ag as any).color || "#6b7280" }} />
                        <span className="truncate flex-1">{ag.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{ag.unit || ""}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            {/* Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {allStatuses.map(s => <SelectItem key={s} value={s}>{statusConfig[s]?.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="h-6 w-px bg-border mx-1" />

            {/* View toggle */}
            <div className="flex border rounded-lg overflow-hidden">
              {[
                { value: "list" as const, icon: List, label: "Lista" },
                { value: "day" as const, icon: LayoutGrid, label: "Dia" },
                { value: "week" as const, icon: CalendarIcon, label: "Semana" },
                { value: "month" as const, icon: CalendarDays, label: "Mês" },
              ].map(({ value, icon: Icon, label }) => (
                <Button key={value} variant={viewMode === value ? "default" : "ghost"} size="icon" className="h-8 w-8 rounded-none" onClick={() => setViewMode(value)} title={label}>
                  <Icon className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>

            {/* Actions */}
            <div className="ml-auto flex gap-2">
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => navigate("/agenda/relatorios")}>
                <FileText className="h-3.5 w-3.5" />Relatórios
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setShowMassTransfer(true)}>
                <Users className="h-3.5 w-3.5" />Transferência
              </Button>
              <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => openNewAppointment(dateStr, "08:00", "", true)}>
                <UserCheck className="h-3.5 w-3.5" />Encaixe
              </Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => openNewAppointment(dateStr, "08:00")}>
                <Plus className="h-3.5 w-3.5" />Agendar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected agendas chips */}
      {selectedAgendaIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayedAgendas.map(ag => (
            <Badge key={ag.id} variant="outline" className="gap-1.5 pr-1 cursor-pointer hover:bg-muted/50"
              onClick={() => toggleAgenda(ag.id)}>
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: (ag as any).color || "#6b7280" }} />
              <span className="text-xs">{ag.name}</span>
              <X className="h-3 w-3 ml-1 text-muted-foreground" />
            </Badge>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusConfig).map(([key, { label, dot }]) => (
          <button key={key} className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}>
            <div className={cn("h-2 w-2 rounded-full", dot)} />
            <span className={cn("text-[10px]", filterStatus === key ? "font-semibold text-foreground" : "text-muted-foreground")}>{label}</span>
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex gap-4">
        <div className={cn("flex-1 min-w-0", selectedAppt && viewMode !== "week" && viewMode !== "month" && "max-w-[calc(100%-340px)]")}>
          {isLoading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : viewMode === "list" ? (
            <div className="space-y-2">
              {!filteredAppointments?.length ? (
                <Card className="p-8 text-center">
                  <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground">Nenhum agendamento</p>
                  <Button variant="link" onClick={() => openNewAppointment(dateStr, "08:00")}>Criar agendamento</Button>
                </Card>
              ) : (
                filteredAppointments.map(a => renderAppointmentCard(a))
              )}
            </div>
          ) : viewMode === "day" ? (
            renderMultiAgendaDay()
          ) : viewMode === "month" ? (
            /* Month view */
            <Card>
              <CardContent className="p-0 overflow-hidden">
                <div className="grid grid-cols-7 border-b bg-muted/30">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map(d => (
                    <div key={d} className="px-2 py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide border-r last:border-r-0">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 auto-rows-fr">
                  {monthDays.map((day, idx) => {
                    const inMonth = isSameMonth(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    const dayAppts = filteredAppointments?.filter(a => isSameDay(parseLocalTime(a.scheduled_at), day))
                      .sort((a, b) => parseLocalTime(a.scheduled_at).getTime() - parseLocalTime(b.scheduled_at).getTime()) || [];
                    const maxShow = 3;
                    const extra = dayAppts.length - maxShow;
                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          "min-h-[110px] border-r border-b last:border-r-0 p-1.5 flex flex-col gap-1 cursor-pointer hover:bg-muted/40 transition-colors",
                          !inMonth && "bg-muted/20 text-muted-foreground/60",
                          isToday && "bg-primary/5",
                          (idx + 1) % 7 === 0 && "border-r-0",
                        )}
                        onClick={() => { setSelectedDate(day); setViewMode("day"); }}
                        onDoubleClick={(e) => { e.stopPropagation(); openNewAppointment(format(day, "yyyy-MM-dd"), "08:00"); }}
                      >
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-xs font-semibold tabular-nums",
                            isToday && "inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground",
                          )}>{format(day, "d")}</span>
                          {dayAppts.length > 0 && (
                            <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-medium">{dayAppts.length}</Badge>
                          )}
                        </div>
                        <div className="flex-1 space-y-0.5 overflow-hidden">
                          {dayAppts.slice(0, maxShow).map(a => {
                            const sc = statusConfig[a.status] || statusConfig.agendado;
                            const agColor = getAgendaColor((a as any).agenda_id);
                            return (
                              <div
                                key={a.id}
                                className={cn("text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-1", sc.color)}
                                style={{ borderLeft: `2px solid ${agColor}` }}
                                onClick={(e) => { e.stopPropagation(); setSelectedAppt(a); }}
                                title={`${formatTime(a.scheduled_at)} ${a.patients?.full_name || a.title}`}
                              >
                                <span className="font-mono font-semibold shrink-0">{formatTime(a.scheduled_at)}</span>
                                <span className="truncate">{a.patients?.full_name || (a as any).provisional_name || a.title}</span>
                              </div>
                            );
                          })}
                          {extra > 0 && (
                            <div className="text-[9px] text-muted-foreground font-medium px-1">+{extra} mais</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Week view */
            <Card>
              <CardContent className="p-0 overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 border-b">
                    <div className="p-2 text-xs font-medium text-muted-foreground border-r bg-muted/30" />
                    {weekDays.map(day => (
                      <div key={day.toISOString()} className={cn("p-2 text-center border-r", isSameDay(day, new Date()) && "bg-primary/5")}>
                        <div className="text-[10px] text-muted-foreground uppercase">{format(day, "EEE", { locale: ptBR })}</div>
                        <div className={cn("text-sm font-semibold", isSameDay(day, new Date()) && "text-primary")}>{format(day, "dd")}</div>
                      </div>
                    ))}
                  </div>
                  {hours.map(hour => (
                    <div key={hour} className="grid grid-cols-8 border-b min-h-[48px]">
                      <div className="p-1 text-[10px] font-medium text-muted-foreground border-r bg-muted/30 flex items-start justify-center pt-1.5">
                        {String(hour).padStart(2, "0")}:00
                      </div>
                      {weekDays.map(day => {
                        const dayAppts = filteredAppointments?.filter(a => {
                          const d = parseLocalTime(a.scheduled_at);
                          return isSameDay(d, day) && d.getHours() === hour;
                        });
                        return (
                          <div key={day.toISOString()} className={cn("p-0.5 border-r", isSameDay(day, new Date()) && "bg-primary/5")}>
                            {dayAppts?.map(a => {
                              const sc = statusConfig[a.status] || statusConfig.agendado;
                              const agColor = getAgendaColor((a as any).agenda_id);
                              return (
                                <div key={a.id} className={cn("text-[9px] p-1 rounded border mb-0.5 truncate cursor-pointer hover:shadow", sc.color)}
                                  style={{ borderLeftWidth: "2px", borderLeftColor: agColor }}
                                  onClick={() => setSelectedAppt(a)}
                                  title={`${a.title} - ${a.patients?.full_name}`}>
                                  <span className="font-semibold">{formatTime(a.scheduled_at)}</span> {a.patients?.full_name || a.title}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detail panel */}
        {selectedAppt && viewMode !== "week" && (
          <Card className="w-[320px] shrink-0 sticky top-20 self-start max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
            {renderDetailPanel()}
          </Card>
        )}
      </div>

      {/* Week view detail dialog */}
      {selectedAppt && viewMode === "week" && (
        <Dialog open={!!selectedAppt} onOpenChange={(open) => { if (!open) setSelectedAppt(null); }}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto">
              {renderDetailPanel()}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Form Dialog */}
      <AppointmentFormDialog
        open={showForm}
        onOpenChange={open => { setShowForm(open); if (!open) setEditingAppointment(null); }}
        defaultDate={formDefaultDate || dateStr}
        defaultTime={formDefaultTime}
        defaultAgendaId={formDefaultAgenda}
        isEncaixe={isEncaixe}
        editAppointment={editingAppointment}
      />

      {/* Check-in Dialog */}
      <Dialog open={!!checkinAppt} onOpenChange={open => !open && setCheckinAppt(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-teal-600" />Registrar Chegada</DialogTitle><DialogDescription className="sr-only">Formulário</DialogDescription></DialogHeader>
          {checkinAppt && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Paciente:</span><span className="font-medium text-right">{checkinAppt.patients?.full_name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Horário:</span><span className="font-medium">{formatTime(checkinAppt.scheduled_at)}</span></div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Observações da chegada</Label>
                <Textarea value={checkinNotes} onChange={e => setCheckinNotes(e.target.value)} rows={2} className="text-xs" placeholder="Observações opcionais..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setCheckinAppt(null)}>Cancelar</Button>
                <Button size="sm" className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white" onClick={handleCheckin}>
                  <UserCheck className="h-4 w-4" />Confirmar Chegada
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Drag Confirm Dialog */}
      <DragConfirmDialog
        open={dragConfirmOpen}
        onOpenChange={(v) => { if (!v && !dragSaving) { setDragConfirmOpen(false); setDragConfirmData(null); } }}
        onConfirm={confirmDrag}
        loading={dragSaving}
        data={dragConfirmData}
      />

      {/* Mass Transfer Dialog */}
      <MassTransferDialog
        open={showMassTransfer}
        onOpenChange={setShowMassTransfer}
        defaultDate={dateStr}
        agendas={activeAgendas}
      />
    </div>
  );
}
