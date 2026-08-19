import { useState, useMemo, useEffect } from "react";
import { usePatients } from "@/hooks/usePatients";
import { useScheduleAgendas, useSchedulePeriods } from "@/hooks/useScheduleAgendas";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAppointment, useUpdateAppointment, type Appointment } from "@/hooks/useAppointments";
import { isTimeAvailable, isInsuranceAllowed } from "@/lib/agendaAvailability";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Loader2, Search, UserPlus, AlertCircle, AlertTriangle, Lock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAgendaDateTimeParts, toAgendaLocalISOString } from "@/lib/agendaDateTime";

const appointmentTypes = [
  { value: "consulta", label: "Consulta" },
  { value: "exame", label: "Exame" },
  { value: "procedimento", label: "Procedimento" },
  { value: "retorno", label: "Retorno" },
  { value: "fisioterapia", label: "Fisioterapia" },
  { value: "cirurgia", label: "Cirurgia" },
];

const originChannels = [
  { value: "interno", label: "Interno" },
  { value: "telefone", label: "Telefone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "presencial", label: "Presencial" },
  { value: "portal", label: "Portal do Paciente" },
  { value: "encaminhamento", label: "Encaminhamento" },
  { value: "autoagendamento", label: "Autoagendamento" },
];

const priorities = [
  { value: "normal", label: "Normal" },
  { value: "preferencial", label: "Preferencial" },
  { value: "urgente", label: "Urgente" },
  { value: "retorno_prioritario", label: "Retorno Prioritário" },
];

const insurancesList = [
  { value: "particular", label: "Particular" },
  { value: "sus", label: "SUS" },
  { value: "unimed", label: "Unimed" },
  { value: "bradesco_saude", label: "Bradesco Saúde" },
  { value: "amil", label: "Amil" },
  { value: "sulamerica", label: "SulAmérica" },
  { value: "hapvida", label: "Hapvida" },
  { value: "notre_dame", label: "NotreDame Intermédica" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultTime?: string;
  defaultAgendaId?: string;
  isEncaixe?: boolean;
  editAppointment?: Appointment | null;
}

export default function AppointmentFormDialog({ open, onOpenChange, defaultDate, defaultTime, defaultAgendaId, isEncaixe = false, editAppointment }: Props) {
  const { profile } = useAuth();
  const { data: patients } = usePatients();
  const { data: agendas } = useScheduleAgendas();
  const { data: allPeriods } = useSchedulePeriods();
  const createAppointment = useCreateAppointment();
  const updateAppointment = useUpdateAppointment();

  const periods = allPeriods || [];

  const [patientSearch, setPatientSearch] = useState("");
  const [isProvisional, setIsProvisional] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<string[]>([]);

  const [form, setForm] = useState({
    patient_id: "",
    provisional_name: "",
    phone: "",
    birth_date: "",
    title: "",
    appointment_type: "consulta",
    agenda_id: defaultAgendaId || "",
    insurance: "particular",
    origin_channel: "presencial",
    priority: "normal",
    specialty: "",
    room: "",
    scheduled_date: defaultDate || "",
    scheduled_time: defaultTime || "08:00",
    duration_minutes: 30,
    location: "",
    notes: "",
    is_return: false,
    is_new_patient: false,
    is_fit_in: isEncaixe,
    is_pcd: false,
    gender: "",
    responsible: "",
    procedures: "",
    procedure_notes: "",
    admin_notes: "",
    special_needs: "",
    reminder: false,
  });

  // FULL RESET on every open (new appointment or new encaixe)
  useEffect(() => {
    if (!open) return;
    if (editAppointment) return; // editing is handled by the next useEffect

    const cleanForm = {
      patient_id: "",
      provisional_name: "",
      phone: "",
      birth_date: "",
      title: "",
      appointment_type: "consulta" as const,
      agenda_id: defaultAgendaId || "",
      insurance: "particular",
      origin_channel: "presencial",
      priority: "normal",
      specialty: "",
      room: "",
      scheduled_date: defaultDate || "",
      scheduled_time: defaultTime || "08:00",
      duration_minutes: 30,
      location: "",
      notes: "",
      is_return: false,
      is_new_patient: false,
      is_fit_in: isEncaixe,
      is_pcd: false,
      gender: "",
      responsible: "",
      procedures: "",
      procedure_notes: "",
      admin_notes: "",
      special_needs: "",
      reminder: false,
    };
    setForm(cleanForm);
    setPatientSearch("");
    setIsProvisional(false);
    setErrors({});
    setWarnings([]);
  }, [open]); // intentionally only depends on `open` to reset on every modal open

  useEffect(() => {
    if (editAppointment) {
      const { date, time } = getAgendaDateTimeParts(editAppointment.scheduled_at);
      setForm(f => ({
        ...f,
        patient_id: editAppointment.patient_id,
        title: editAppointment.title,
        appointment_type: editAppointment.appointment_type,
        scheduled_date: date,
        scheduled_time: time,
        duration_minutes: editAppointment.duration_minutes ?? 30,
        location: editAppointment.location || "",
        notes: editAppointment.notes || "",
        insurance: (editAppointment as any).insurance || "particular",
        origin_channel: (editAppointment as any).origin_channel || "presencial",
        priority: (editAppointment as any).priority || "normal",
        room: (editAppointment as any).room || "",
        specialty: (editAppointment as any).specialty || "",
        agenda_id: (editAppointment as any).agenda_id || "",
        is_return: (editAppointment as any).is_return || false,
        is_new_patient: (editAppointment as any).is_new_patient || false,
        is_fit_in: (editAppointment as any).is_fit_in || false,
      }));
    }
  }, [editAppointment]);

  const filteredPatients = useMemo(() => {
    if (!patients || !patientSearch || patientSearch.length < 2) return [];
    const s = patientSearch.toLowerCase();
    return patients.filter(p =>
      p.full_name.toLowerCase().includes(s) ||
      p.cpf?.includes(s)
    ).slice(0, 10);
  }, [patients, patientSearch]);

  const selectedPatient = patients?.find(p => p.id === form.patient_id);
  const selectedAgenda = agendas?.find(a => a.id === form.agenda_id);

  // Real-time warnings computation
  const computedWarnings = useMemo(() => {
    const w: string[] = [];
    if (!form.agenda_id || !form.scheduled_date || !form.scheduled_time) return w;
    if (isEncaixe || form.is_fit_in) return w; // Encaixe bypasses

    const dateObj = new Date(form.scheduled_date + "T12:00:00");
    const dayOfWeek = dateObj.getDay();

    const timeAvailable = isTimeAvailable(periods, form.agenda_id, dayOfWeek, form.scheduled_time);
    if (!timeAvailable) {
      w.push("Horário fora do período configurado para esta agenda.");
    }

    if (selectedAgenda && !isInsuranceAllowed(selectedAgenda, form.insurance)) {
      w.push(`Convênio "${insurancesList.find(i => i.value === form.insurance)?.label}" não habilitado para esta agenda.`);
    }

    return w;
  }, [form.agenda_id, form.scheduled_date, form.scheduled_time, form.insurance, isEncaixe, form.is_fit_in, periods, selectedAgenda]);

  // Filtered insurances based on agenda control
  const availableInsurances = useMemo(() => {
    if (!selectedAgenda?.insurance_control || !selectedAgenda.allowed_insurances?.length) {
      return insurancesList;
    }
    return insurancesList.filter(i => selectedAgenda.allowed_insurances!.includes(i.value));
  }, [selectedAgenda]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.patient_id && !isProvisional) e.patient = "Selecione um paciente";
    if (isProvisional && !form.provisional_name.trim()) e.provisional_name = "Preencha o nome do paciente provisório";
    if (isProvisional && !form.birth_date) e.birth_date = "Preencha a data de nascimento";
    if (!form.scheduled_date) e.date = "Informe a data";
    if (!form.scheduled_time) e.time = "Informe o horário";
    if (!form.appointment_type) e.type = "Selecione o tipo";
    if (!form.insurance) e.insurance = "Selecione o convênio";
    if (isEncaixe && !form.notes) e.notes = "Justificativa obrigatória para encaixe";

    // Period validation (only for non-encaixe)
    if (!isEncaixe && !form.is_fit_in && form.agenda_id && form.scheduled_date && form.scheduled_time) {
      const dateObj = new Date(form.scheduled_date + "T12:00:00");
      const dayOfWeek = dateObj.getDay();
      if (!isTimeAvailable(periods, form.agenda_id, dayOfWeek, form.scheduled_time)) {
        e.time = "Horário fora do período configurado. Use Encaixe para agendar fora do horário.";
      }
    }

    // Insurance validation
    if (selectedAgenda && !isInsuranceAllowed(selectedAgenda, form.insurance)) {
      e.insurance = "Convênio não habilitado para esta agenda.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    const scheduledAt = toAgendaLocalISOString(form.scheduled_date, form.scheduled_time);

    const patientName = selectedPatient?.full_name || form.provisional_name;
    const title = form.title || `${appointmentTypes.find(t => t.value === form.appointment_type)?.label || "Consulta"} - ${patientName}`;

    const payload: any = {
      patient_id: form.patient_id || null,
      professional_id: profile?.id || null,
      title: title + (isEncaixe ? " (Encaixe)" : ""),
      description: [form.procedures, form.procedure_notes].filter(Boolean).join(" | ") || null,
      appointment_type: form.appointment_type,
      scheduled_at: scheduledAt,
      duration_minutes: form.duration_minutes,
      status: isEncaixe ? "encaixe" : "agendado",
      location: form.room || form.location || null,
      notes: form.notes || null,
      insurance: form.insurance,
      origin_channel: form.origin_channel,
      priority: form.priority,
      is_return: form.is_return,
      is_new_patient: form.is_new_patient,
      is_fit_in: isEncaixe,
      agenda_id: form.agenda_id || null,
      room: form.room || null,
      specialty: form.specialty || selectedAgenda?.specialty || null,
      phone: form.phone || selectedPatient?.phone || null,
      provisional_name: isProvisional ? form.provisional_name : null,
      provisional_birth_date: isProvisional && form.birth_date ? form.birth_date : null,
      provisional_gender: isProvisional && form.gender ? form.gender : null,
      provisional_phone: isProvisional && form.phone ? form.phone : null,
    };

    if (editAppointment) {
      await updateAppointment.mutateAsync({ id: editAppointment.id, ...payload });
    } else {
      await createAppointment.mutateAsync(payload);
    }

    const toastMsg = isProvisional
      ? "Agendamento salvo como paciente provisório."
      : editAppointment ? "Agendamento atualizado!" : "Agendamento criado!";
    toast.success(toastMsg);
    onOpenChange(false);
  };

  const setField = (key: string, value: any) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => { const n = { ...e }; delete n[key]; return n; });
  };

  const selectPatient = (p: any) => {
    setForm(f => ({
      ...f,
      patient_id: p.id,
      phone: p.phone || "",
      birth_date: p.birth_date || "",
      gender: p.gender || "",
      insurance: p.health_insurance || "particular",
    }));
    setPatientSearch("");
    setIsProvisional(false);
    if (errors.patient) setErrors(e => { const n = { ...e }; delete n.patient; return n; });
  };

  const calcAge = (bd: string) => {
    if (!bd) return "";
    const diff = Date.now() - new Date(bd).getTime();
    return `${Math.floor(diff / 31557600000)} anos`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] p-0 overflow-hidden flex flex-col shadow-2xl border-border/60">
        {/* Fixed header */}
        <div className={cn(
          "px-6 py-4 border-b shrink-0",
          isEncaixe ? "bg-violet-50/60 dark:bg-violet-950/20" : "bg-muted/30"
        )}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-lg">
              {isEncaixe ? (
                <>
                  <div className="h-8 w-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                    <ShieldAlert className="h-4 w-4 text-violet-600" />
                  </div>
                  <span>Novo Encaixe</span>
                  <Badge variant="outline" className="bg-violet-100 text-violet-700 border-violet-300 text-[10px]">Exceção controlada</Badge>
                </>
              ) : (
                <>
                  {editAppointment ? "Editar Agendamento" : "Novo Agendamento"}
                </>
              )}
            </DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Warnings bar */}
          {computedWarnings.length > 0 && !isEncaixe && (
            <div className="space-y-1 mb-4">
              {computedWarnings.map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

        <form id="appointment-form" onSubmit={handleSubmit} className="space-y-5">
          {/* ── SECTION: Paciente ── */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Paciente</h4>

            {!isProvisional && !selectedPatient && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, sobrenome ou CPF..."
                    className="pl-9"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                  />
                </div>
                {filteredPatients.length > 0 && (
                  <div className="border rounded-lg max-h-40 overflow-y-auto divide-y">
                    {filteredPatients.map(p => (
                      <button key={p.id} type="button" onClick={() => selectPatient(p)}
                        className="w-full text-left px-3 py-2 hover:bg-muted/50 text-sm flex justify-between items-center">
                        <span className="font-medium">{p.full_name}</span>
                        <span className="text-xs text-muted-foreground">{p.cpf || p.phone || ""}</span>
                      </button>
                    ))}
                  </div>
                )}
                {errors.patient && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.patient}</p>}
                <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setIsProvisional(true)}>
                  <UserPlus className="h-3.5 w-3.5" />Paciente Provisório
                </Button>
              </div>
            )}

            {selectedPatient && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{selectedPatient.full_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedPatient.cpf || "—"} · {selectedPatient.phone || "—"} {selectedPatient.birth_date ? `· ${calcAge(selectedPatient.birth_date)}` : ""}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setField("patient_id", "")}>Trocar</Button>
                </div>
              </div>
            )}

            {isProvisional && (
              <div className="space-y-3 p-3 border border-dashed border-amber-300 rounded-lg bg-amber-50/30 dark:bg-amber-900/10">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3" />Paciente Provisório — Cadastro pendente
                  </Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setIsProvisional(false); setField("provisional_name", ""); }}>Cancelar</Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs">Nome *</Label>
                    <Input value={form.provisional_name} onChange={e => setField("provisional_name", e.target.value)} placeholder="Nome completo provisório" />
                    {errors.provisional_name && <p className="text-xs text-destructive">{errors.provisional_name}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Data de Nascimento *</Label>
                    <Input type="date" value={form.birth_date} onChange={e => setField("birth_date", e.target.value)} />
                    {errors.birth_date && <p className="text-xs text-destructive">{errors.birth_date}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Celular</Label>
                    <Input value={form.phone} onChange={e => setField("phone", e.target.value)} placeholder="(11) 99999-9999" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Sexo</Label>
                    <Select value={form.gender} onValueChange={v => setField("gender", v)}>
                      <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Responsável</Label>
                    <Input value={form.responsible} onChange={e => setField("responsible", e.target.value)} placeholder="Se menor" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Prioridade</Label>
                <Select value={form.priority} onValueChange={v => setField("priority", v)}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {priorities.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-4 pb-1">
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={form.is_pcd} onCheckedChange={v => setField("is_pcd", !!v)} />PcD
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={form.is_new_patient} onCheckedChange={v => setField("is_new_patient", !!v)} />Novo
                </label>
                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <Checkbox checked={form.is_return} onCheckedChange={v => setField("is_return", !!v)} />Retorno
                </label>
              </div>
            </div>
          </div>

          <Separator />

          {/* ── SECTION: Agendamento + Horário ── */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Agendamento</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Data *</Label>
                <Input type="date" className="h-9 text-xs" value={form.scheduled_date} onChange={e => setField("scheduled_date", e.target.value)} />
                {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Início *</Label>
                <Input type="time" className="h-9 text-xs" value={form.scheduled_time} onChange={e => setField("scheduled_time", e.target.value)} />
                {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duração</Label>
                <Select value={String(form.duration_minutes)} onValueChange={v => setField("duration_minutes", +v)}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[10, 15, 20, 30, 40, 45, 60, 90, 120].map(d => (
                      <SelectItem key={d} value={String(d)}>{d} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Tipo *</Label>
                <Select value={form.appointment_type} onValueChange={v => setField("appointment_type", v)}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Agenda</Label>
                <Select value={form.agenda_id} onValueChange={v => {
                  setField("agenda_id", v);
                  const ag = agendas?.find(a => a.id === v);
                  if (ag) {
                    setField("specialty", ag.specialty || "");
                    setField("duration_minutes", ag.default_duration || 30);
                    // Reset insurance if not allowed on new agenda
                    if (ag.insurance_control && ag.allowed_insurances?.length && !ag.allowed_insurances.includes(form.insurance)) {
                      setField("insurance", ag.allowed_insurances[0] || "particular");
                    }
                  }
                }}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {agendas?.filter(a => a.status === "ativa").map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: (a as any).color || "#6b7280" }} />
                          {a.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5">
                  Convênio *
                  {selectedAgenda?.insurance_control && (
                    <Badge variant="outline" className="text-[8px] px-1 py-0 bg-blue-50 text-blue-600 border-blue-200">Restrito</Badge>
                  )}
                </Label>
                <Select value={form.insurance} onValueChange={v => setField("insurance", v)}>
                  <SelectTrigger className={cn("h-9 text-xs", errors.insurance && "border-destructive")}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {availableInsurances.map(i => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                    {selectedAgenda?.insurance_control && availableInsurances.length < insurancesList.length && (
                      <div className="px-2 py-1.5 text-[10px] text-muted-foreground border-t">
                        <ShieldAlert className="h-3 w-3 inline mr-1" />
                        Agenda com convênios restritos
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {errors.insurance && <p className="text-xs text-destructive">{errors.insurance}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Origem / Canal</Label>
                <Select value={form.origin_channel} onValueChange={v => setField("origin_channel", v)}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {originChannels.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Especialidade</Label>
                <Input className="h-9 text-xs" value={form.specialty} onChange={e => setField("specialty", e.target.value)} placeholder="Ex: Cardiologia" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Sala / Consultório</Label>
                <Input className="h-9 text-xs" value={form.room} onChange={e => setField("room", e.target.value)} placeholder="Ex: Sala 3" />
              </div>
            </div>
          </div>

          <Separator />

          {/* ── SECTION: Outros ── */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Observações</h4>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Procedimentos</Label>
                <Input className="h-9 text-xs" value={form.procedures} onChange={e => setField("procedures", e.target.value)} placeholder="Ex: Consulta cardiológica, ECG" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{isEncaixe ? "Justificativa do Encaixe *" : "Observação Geral"}</Label>
                <Textarea value={form.notes} onChange={e => setField("notes", e.target.value)} rows={2} className="text-xs" placeholder={isEncaixe ? "Motivo do encaixe..." : "Observações gerais"} />
                {errors.notes && <p className="text-xs text-destructive">{errors.notes}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Necessidades Especiais</Label>
                <Input className="h-9 text-xs" value={form.special_needs} onChange={e => setField("special_needs", e.target.value)} placeholder="Ex: Cadeira de rodas" />
              </div>
            </div>
          </div>

        </form>
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 border-t bg-muted/20 px-6 py-3 flex items-center justify-between">
          <div className="text-[10px] text-muted-foreground">
            {isEncaixe && "⚠ Encaixe: justificativa obrigatória"}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" form="appointment-form" disabled={createAppointment.isPending || updateAppointment.isPending}
              className={cn(isEncaixe && "bg-violet-600 hover:bg-violet-700")}>
              {(createAppointment.isPending || updateAppointment.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editAppointment ? "Salvar" : isEncaixe ? "Salvar Encaixe" : "Agendar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
