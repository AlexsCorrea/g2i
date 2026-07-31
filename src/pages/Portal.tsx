import React, { useState, useEffect, useCallback } from "react";
import {
  Ticket,
  CalendarCheck,
  ArrowLeft,
  Bell,
  BellOff,
  BellRing,
  Clock,
  Users,
  Search,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Crown,
  UserCheck,
  Smartphone,
  Home,
  RotateCcw,
  History,
  MapPin,
  Volume2,
} from "lucide-react";
import { DateMaskInput } from "@/components/ui/date-mask-input";
import { supabase } from "@/integrations/supabase/client";
import { PriorityBadge } from "@/components/queue/PriorityBadge";
import { useGenerateTicket, useQueueTicketById, useQueueTickets } from "@/hooks/useQueueTickets";
import { useUnitConfig } from "@/hooks/useUnitConfig";

type NotifState = "active" | "denied" | "foreground_only" | "ios_no_pwa" | "not_configured";

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
}

function getNotifState(): NotifState {
  if (!("Notification" in window)) {
    if (isIOS() && !isStandalone()) return "ios_no_pwa";
    return "foreground_only";
  }
  if (Notification.permission === "granted") return "active";
  if (Notification.permission === "denied") return "denied";
  return "not_configured";
}

function NotifBadge({ state, compact }: { state: NotifState; compact?: boolean }) {
  const configs: Record<
    NotifState,
    { icon: React.ReactNode; label: string; bg: string; border: string; text: string }
  > = {
    active: {
      icon: <Bell className="w-4 h-4 text-green-300" />,
      label: "Alertas ativos",
      bg: "bg-green-500/20",
      border: "border-green-400/40",
      text: "text-green-200",
    },
    denied: {
      icon: <BellOff className="w-4 h-4 text-red-300" />,
      label: "Notificações recusadas neste dispositivo",
      bg: "bg-red-500/20",
      border: "border-red-400/40",
      text: "text-red-200",
    },
    foreground_only: {
      icon: <Bell className="w-4 h-4 text-blue-300" />,
      label: "Alertas disponíveis com o portal aberto",
      bg: "bg-blue-500/20",
      border: "border-blue-400/40",
      text: "text-blue-200",
    },
    ios_no_pwa: {
      icon: <Bell className="w-4 h-4 text-blue-300" />,
      label: "Alertas disponíveis com o portal aberto",
      bg: "bg-blue-500/20",
      border: "border-blue-400/40",
      text: "text-blue-200",
    },
    not_configured: {
      icon: <BellOff className="w-4 h-4 text-yellow-300" />,
      label: "Alertas não configurados",
      bg: "bg-yellow-500/20",
      border: "border-yellow-400/40",
      text: "text-yellow-200",
    },
  };
  const c = configs[state];
  return (
    <div className={`flex items-center gap-2 ${c.bg} border ${c.border} rounded-full px-4 py-2`}>
      {c.icon}
      <span className={`${c.text} text-xs font-semibold ${compact ? "max-w-[180px] truncate" : ""}`}>{c.label}</span>
    </div>
  );
}

type PortalStep =
  | "home"
  | "ticket-category"
  | "ticket-subtype"
  | "confirm-notif"
  | "tracking"
  | "checkin-identify"
  | "checkin-confirm"
  | "checkin-update"
  | "checkin-done"
  | "history";

interface TicketCategory {
  id: string;
  label: string;
  description: string;
  color: string;
  context?: string;
  subtypes?: { id: string; label: string; description: string }[];
}

const categories: TicketCategory[] = [
  {
    id: "normal",
    label: "Normal",
    description: "Atendimento geral",
    color: "hsl(var(--primary))",
    subtypes: [
      { id: "consulta", label: "Consulta", description: "Sem agendamento prévio" },
      { id: "retorno_pos_operatorio", label: "Retorno Pós-op", description: "Retorno cirúrgico" },
      { id: "normal", label: "Outros", description: "Atendimento geral" },
    ],
  },
  { id: "preferencial", label: "Preferencial", description: "Gestantes, PCD", color: "hsl(var(--accent))" },
  { id: "preferencial_60", label: "60+", description: "Idosos 60+", color: "hsl(38,92%,50%)" },
  { id: "preferencial_80", label: "80+", description: "Prioridade máxima", color: "hsl(0,72%,51%)" },
];

const typeLabels: Record<string, string> = {
  normal: "Normal",
  preferencial: "Preferencial",
  preferencial_60: "60+",
  preferencial_80: "80+",
  retorno_pos_operatorio: "Ret. Pós-op",
  consulta: "Consulta",
};

interface FoundAppointment {
  id: string;
  title: string;
  scheduled_at: string;
  appointment_type: string;
  patient_id: string;
  patient_name: string;
  professional_name: string | null;
  location: string | null;
}

interface PatientData {
  id: string;
  full_name: string;
  phone: string | null;
  health_insurance: string | null;
  health_insurance_number: string | null;
  updated_at: string;
}

export default function Portal() {
  const [step, setStep] = useState<PortalStep>("home");
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(() => {
    const stored = localStorage.getItem("portal_ticket_id");
    const storedDate = localStorage.getItem("portal_ticket_date");
    const today = new Date().toISOString().split("T")[0];
    if (storedDate !== today) {
      localStorage.removeItem("portal_ticket_id");
      localStorage.removeItem("portal_ticket_date");
      return null;
    }
    return stored;
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<FoundAppointment[]>([]);
  const [checkinResult, setCheckinResult] = useState<{ name: string; ticket: string; time: string } | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [updateFields, setUpdateFields] = useState({ phone: "", insurance: "", insurance_number: "" });
  const [todayTickets, setTodayTickets] = useState<any[]>([]);
  const [notifState, setNotifState] = useState<NotifState>(getNotifState);
  const [pendingTicketType, setPendingTicketType] = useState<string | null>(null);
  const [showNotifWarning, setShowNotifWarning] = useState(false);
  const generateTicket = useGenerateTicket();
  const { data: myTicket } = useQueueTicketById(ticketId);
  const { data: allTickets } = useQueueTickets({ queue_name: "recepcao", status: "aguardando" });
  const { data: unitConfig } = useUnitConfig();

  // Auto-redirect to tracking if active ticket exists
  useEffect(() => {
    if (ticketId && myTicket && step === "home") {
      if (myTicket.status !== "concluida" && myTicket.status !== "ausente" && myTicket.status !== "cancelada") {
        setStep("tracking");
      }
    }
  }, [ticketId, myTicket]);

  const [showCallAlert, setShowCallAlert] = useState(false);

  // Notification + vibration + fullscreen alert on call
  useEffect(() => {
    if (myTicket?.status === "chamada") {
      setShowCallAlert(true);
      // Browser notification
      if (notificationsEnabled && "Notification" in window) {
        new Notification("🔔 Sua vez chegou!", {
          body: `Senha ${myTicket.ticket_number} — Dirija-se ao ${myTicket.called_to || "balcão"}`,
        });
      }
      // Vibration pattern: strong repeated bursts
      if ("vibrate" in navigator) {
        navigator.vibrate([400, 200, 400, 200, 400, 200, 400]);
      }
      // Sound alert
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playBeep = (freq: number, delay: number) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.value = freq;
          osc.type = "sine";
          gain.gain.value = 0.5;
          osc.start(audioCtx.currentTime + delay);
          osc.stop(audioCtx.currentTime + delay + 0.3);
        };
        playBeep(880, 0);
        playBeep(1100, 0.5);
        playBeep(880, 1.0);
        playBeep(1100, 1.5);
      } catch {}
    } else {
      setShowCallAlert(false);
    }
  }, [myTicket?.status]);

  const requestNotifications = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      setNotifState(getNotifState());
      return false;
    }
    const perm = await Notification.requestPermission();
    const granted = perm === "granted";
    setNotifState(granted ? "active" : perm === "denied" ? "denied" : "not_configured");
    setNotificationsEnabled(granted);
    return granted;
  };

  // Load patient's today tickets (server-side identity check)
  const loadTodayTickets = async (cpfValue: string, birth: string) => {
    try {
      const res = await callPublicQueue<{ tickets: any[] }>("patient_tickets", {
        cpf: cpfValue.replace(/\D/g, ""),
        birth_date: birth,
      });
      setTodayTickets(res.tickets || []);
    } catch {
      setTodayTickets([]);
    }
  };

  const doGenerateTicket = async (type: string) => {
    try {
      const ticket = await generateTicket.mutateAsync({
        ticket_type: type,
        queue_name: "recepcao",
        source: "celular",
        notification_enabled: notificationsEnabled,
        ...(patientData ? { patient_id: patientData.id, cpf: cpf.replace(/\D/g, ""), birth_date: birthDate } : {}),
      });
      setTicketId(ticket.id);
      localStorage.setItem("portal_ticket_id", ticket.id);
      localStorage.setItem("portal_ticket_date", new Date().toISOString().split("T")[0]);
      setPendingTicketType(null);
      setShowNotifWarning(false);
      setStep("tracking");
    } catch {
      /* handled */
    }
  };


  const handleGenerateTicket = async (type: string) => {
    if (notifState === "active") {
      await doGenerateTicket(type);
    } else {
      setPendingTicketType(type);
      setStep("confirm-notif");
    }
  };

  const handleActivateNotifNow = async () => {
    const granted = await requestNotifications();
    if (pendingTicketType) await doGenerateTicket(pendingTicketType);
  };

  const handleSkipNotif = () => {
    setShowNotifWarning(true);
  };

  const handleContinueWithoutNotif = async () => {
    setShowNotifWarning(false);
    if (pendingTicketType) await doGenerateTicket(pendingTicketType);
  };

  const handleCategoryClick = (cat: TicketCategory) => {
    // Check for active tickets
    const activeTicket = todayTickets.find((t) => ["aguardando", "chamada", "em_atendimento"].includes(t.status));
    if (activeTicket) {
      const confirm = window.confirm(
        `Você já possui a senha ${activeTicket.ticket_number} (${activeTicket.status === "aguardando" ? "Aguardando" : activeTicket.status === "chamada" ? "Chamada" : "Em atendimento"}). Deseja gerar uma nova senha?`,
      );
      if (!confirm) return;
    }
    if (cat.subtypes) {
      setSelectedCategory(cat);
      setStep("ticket-subtype");
    } else handleGenerateTicket(cat.id);
  };

  const formatCpf = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const isOutdated = (updatedAt: string) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(updatedAt) < sixMonthsAgo;
  };

  const hasMissingCritical = (p: PatientData) => !p.phone;

  const handleSearchAppointment = async () => {
    setError("");
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length < 11) {
      setError("CPF inválido.");
      return;
    }
    if (!birthDate) {
      setError("Informe a data de nascimento.");
      return;
    }
    setLoading(true);
    try {
      const res = await callPublicQueue<{ patient: PatientData | null; appointments: any[] }>("search_checkin", {
        cpf: cleanCpf,
        birth_date: birthDate,
      });
      const patient = res.patient;
      if (!patient) {
        setError("Paciente não encontrado.");
        setLoading(false);
        return;
      }

      setPatientData(patient);
      await loadTodayTickets(cleanCpf, birthDate);

      // Check if cadastral update needed
      if (hasMissingCritical(patient) || isOutdated(patient.updated_at)) {
        setUpdateFields({
          phone: patient.phone || "",
          insurance: (patient as any).health_insurance || "",
          insurance_number: (patient as any).health_insurance_number || "",
        });
        setStep("checkin-update");
        setLoading(false);
        return;
      }

      const appts = (res.appointments || []).filter((a: any) => ["agendado", "confirmado"].includes(a.status));
      if (!appts.length) {
        setError("Nenhum agendamento encontrado para hoje.");
        setLoading(false);
        return;
      }
      setAppointments(
        appts.map((a: any) => ({
          id: a.id,
          title: a.title,
          scheduled_at: a.scheduled_at,
          appointment_type: a.appointment_type,
          patient_id: a.patient_id,
          patient_name: a.patient_name,
          professional_name: a.professional_name || null,
          location: a.location,
        })),
      );
      setStep("checkin-confirm");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAndContinue = async () => {
    if (!patientData) return;
    if (!updateFields.phone.trim()) {
      setError("Telefone é obrigatório.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const cleanCpf = cpf.replace(/\D/g, "");
      await callPublicQueue("update_contact", {
        cpf: cleanCpf,
        birth_date: birthDate,
        phone: updateFields.phone,
        insurance: updateFields.insurance,
        insurance_number: updateFields.insurance_number,
      });

      const res = await callPublicQueue<{ appointments: any[] }>("search_checkin", {
        cpf: cleanCpf,
        birth_date: birthDate,
      });
      const appts = (res.appointments || []).filter((a: any) => ["agendado", "confirmado"].includes(a.status));
      if (!appts.length) {
        setError("Nenhum agendamento encontrado para hoje.");
        setLoading(false);
        return;
      }
      setAppointments(
        appts.map((a: any) => ({
          id: a.id,
          title: a.title,
          scheduled_at: a.scheduled_at,
          appointment_type: a.appointment_type,
          patient_id: a.patient_id,
          patient_name: a.patient_name,
          professional_name: a.professional_name || null,
          location: a.location,
        })),
      );
      setStep("checkin-confirm");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCheckin = async (appt: FoundAppointment) => {
    setLoading(true);
    try {
      const res = await callPublicQueue<{ ticket: any }>("confirm_checkin", {
        cpf: cpf.replace(/\D/g, ""),
        birth_date: birthDate,
        appointment_id: appt.id,
        ticket_type: "consulta",
        queue_name: "recepcao",
        source: "celular",
      });
      const ticket = res.ticket;
      setTicketId(ticket.id);
      localStorage.setItem("portal_ticket_id", ticket.id);
      localStorage.setItem("portal_ticket_date", new Date().toISOString().split("T")[0]);
      setCheckinResult({
        name: appt.patient_name,
        ticket: ticket.ticket_number,
        time: new Date(appt.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      });
      setStep("checkin-done");
    } catch {
      setError("Erro ao confirmar.");
    } finally {
      setLoading(false);
    }
  };


  const resetAll = () => {
    localStorage.removeItem("portal_ticket_id");
    localStorage.removeItem("portal_ticket_date");
    setTicketId(null);
    setSelectedCategory(null);
    setCpf("");
    setBirthDate("");
    setError("");
    setAppointments([]);
    setCheckinResult(null);
    setPatientData(null);
    setTodayTickets([]);
    setStep("home");
  };

  const queuePosition = allTickets && myTicket ? allTickets.findIndex((t) => t.id === myTicket.id) + 1 : null;

  const statusInfo: Record<string, { label: string; emoji: string; color: string }> = {
    aguardando: { label: "Aguardando", emoji: "⏳", color: "text-primary" },
    chamada: { label: "SUA VEZ!", emoji: "🔔", color: "text-green-600" },
    em_atendimento: { label: "Em atendimento", emoji: "👨‍⚕️", color: "text-blue-600" },
    concluida: { label: "Atendimento concluído", emoji: "✅", color: "text-muted-foreground" },
    ausente: { label: "Ausente", emoji: "❌", color: "text-destructive" },
    cancelada: { label: "Cancelada", emoji: "🚫", color: "text-muted-foreground" },
  };

  const BackBtn = ({ onClick }: { onClick: () => void }) => (
    <button onClick={onClick} className="flex items-center gap-2 text-white/80 hover:text-white mb-4">
      <ArrowLeft className="w-5 h-5" />
      <span>Voltar</span>
    </button>
  );

  // ── FULLSCREEN CALL ALERT ──
  if (showCallAlert && myTicket?.status === "chamada") {
    return (
      <div className="fixed inset-0 z-[9999] bg-green-500 flex flex-col items-center justify-center p-6 animate-pulse">
        <p className="text-white/80 text-lg font-medium mb-2">🔔 ATENÇÃO</p>
        <p className="text-white text-6xl md:text-8xl font-black mb-4">SUA VEZ!</p>
        <p className="text-white text-5xl md:text-7xl font-black tracking-widest mb-6">{myTicket.ticket_number}</p>
        {myTicket.called_to && (
          <div className="flex items-center gap-2 text-white/90 text-xl mb-2">
            <MapPin className="w-6 h-6" />
            <span>{myTicket.called_to}</span>
          </div>
        )}
        <p className="text-white/80 text-lg mb-10">Dirija-se ao atendimento</p>
        <button
          onClick={() => setShowCallAlert(false)}
          className="px-10 py-4 bg-white text-green-700 font-black text-xl rounded-2xl shadow-2xl active:scale-95 transition-transform"
        >
          OK, ENTENDI
        </button>
      </div>
    );
  }

  // ── TRACKING ──
  if (step === "tracking" && myTicket) {
    const st = statusInfo[myTicket.status] || statusInfo.aguardando;
    const isDone = ["concluida", "ausente", "cancelada"].includes(myTicket.status);
    const isCalled = myTicket.status === "chamada";
    return (
      <Wrapper>
        {/* Notif badge top */}
        <div className="flex justify-center">
          <button
            onClick={async () => {
              if (notifState !== "active") await requestNotifications();
              setNotifState(getNotifState());
            }}
          >
            <NotifBadge state={notifState} compact />
          </button>
        </div>

        <h1 className="text-lg font-bold text-white text-center">Portal {unitConfig?.unit_name || "Zurich"}</h1>
        <div
          className={`bg-white rounded-3xl p-8 shadow-2xl text-center space-y-4 ${isCalled ? "ring-4 ring-green-400 animate-pulse" : ""}`}
        >
          <p className="text-5xl">{st.emoji}</p>
          <p className={`text-sm uppercase tracking-wider font-semibold ${st.color}`}>{st.label}</p>
          <p className={`text-5xl font-black tracking-wider ${st.color}`}>{myTicket.ticket_number}</p>
          {(myTicket as any).priority_code && (
            <div className="flex justify-center">
              <PriorityBadge priorityCode={(myTicket as any).priority_code} size="md" />
            </div>
          )}
          {myTicket.status === "aguardando" && queuePosition && (
            <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {queuePosition}º na fila
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />~{queuePosition * 5} min
              </span>
            </div>
          )}
          {isCalled && (
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-4">
              <p className="font-black text-green-700 text-2xl">DIRIJA-SE AO ATENDIMENTO!</p>
              {myTicket.called_to && (
                <p className="text-green-600 font-medium mt-1 flex items-center justify-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {myTicket.called_to}
                </p>
              )}
            </div>
          )}
          {myTicket.status === "em_atendimento" && (
            <p className="text-blue-600 font-medium text-sm">Você está sendo atendido</p>
          )}
          {myTicket.status === "aguardando" && (
            <div className="flex items-center gap-2 bg-blue-50 rounded-xl p-3 mt-2">
              <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <p className="text-blue-700 text-xs">Mantenha esta tela aberta para receber seus alertas da chamada.</p>
            </div>
          )}
        </div>

        {/* Second chance CTA if notifications not active */}
        {notifState !== "active" && myTicket.status === "aguardando" && (
          <button
            onClick={async () => {
              await requestNotifications();
              setNotifState(getNotifState());
            }}
            className="w-full bg-yellow-500/90 hover:bg-yellow-500 text-white font-bold rounded-2xl p-4 flex items-center justify-center gap-3 shadow-lg transition-colors"
          >
            <BellRing className="w-6 h-6" />
            <span>Ative os alertas da sua senha</span>
          </button>
        )}
        {isDone && (
          <div className="space-y-3">
            <p className="text-white/60 text-sm text-center">
              Última senha: {myTicket.ticket_number} ({st.label})
            </p>
            <button
              onClick={() => {
                resetAll();
                setStep("ticket-category");
              }}
              className="w-full h-12 bg-white text-primary font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <Ticket className="w-5 h-5" />
              Gerar Nova Senha
            </button>
            <button
              onClick={resetAll}
              className="w-full h-12 bg-white/10 border border-white/30 text-white font-medium rounded-xl flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Voltar ao Início
            </button>
          </div>
        )}
      </Wrapper>
    );
  }

  // ── CONFIRM NOTIFICATIONS ──
  if (step === "confirm-notif") {
    if (showNotifWarning) {
      return (
        <Wrapper>
          <div className="w-full max-w-sm space-y-5 text-center">
            <div className="bg-yellow-500/20 border-2 border-yellow-400/50 rounded-3xl p-6 space-y-4">
              <AlertTriangle className="w-12 h-12 text-yellow-300 mx-auto" />
              <p className="text-white font-bold text-lg">Atenção</p>
              <p className="text-white/80 text-sm leading-relaxed">
                Você <strong>não receberá</strong> som nem vibração quando sua senha for chamada. Será necessário
                acompanhar manualmente pelo portal ou painel de chamadas.
              </p>
            </div>
            <button
              onClick={handleContinueWithoutNotif}
              disabled={generateTicket.isPending}
              className="w-full h-14 bg-white text-primary font-bold rounded-2xl text-lg disabled:opacity-50"
            >
              {generateTicket.isPending ? "Gerando..." : "Entendi, continuar"}
            </button>
            <button
              onClick={() => setShowNotifWarning(false)}
              className="text-white/70 hover:text-white text-sm underline"
            >
              Voltar
            </button>
          </div>
        </Wrapper>
      );
    }

    return (
      <Wrapper>
        <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-5 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Volume2 className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Ative os alertas</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Receba aviso com <strong>som</strong>, <strong>vibração</strong> e <strong>tela de chamada</strong> quando
            sua senha for chamada.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 text-left">
              <Volume2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700 text-sm">Som de alerta</span>
            </div>
            <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 text-left">
              <Smartphone className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700 text-sm">Vibração do celular</span>
            </div>
            <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 text-left">
              <Bell className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-700 text-sm">Tela de chamada em destaque</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-left">
            <p className="text-blue-700 text-xs leading-relaxed">
              💡 Com o portal aberto, som, vibração e tela de chamada funcionam normalmente no seu celular.
            </p>
          </div>

          {/* iOS optional tip — soft suggestion */}
          {isIOS() && !isStandalone() && (
            <details className="text-left">
              <summary className="text-amber-700 text-xs cursor-pointer font-medium">
                Dica opcional: adicionar à Tela de Início
              </summary>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 space-y-1">
                <p className="text-amber-700 text-xs leading-relaxed">
                  Para uma experiência ainda melhor, você pode adicionar este portal à Tela de Início:
                </p>
                <ol className="text-amber-700 text-xs space-y-1 ml-4 list-decimal">
                  <li>
                    Toque em <strong>Compartilhar</strong> (↑)
                  </li>
                  <li>
                    <strong>"Adicionar à Tela de Início"</strong>
                  </li>
                </ol>
              </div>
            </details>
          )}
        </div>

        {notifState !== "foreground_only" && notifState !== "ios_no_pwa" ? (
          <button
            onClick={handleActivateNotifNow}
            disabled={generateTicket.isPending}
            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-lg shadow-lg transition-colors disabled:opacity-50"
          >
            {generateTicket.isPending ? "Gerando..." : "Ativar alertas e continuar"}
          </button>
        ) : (
          <button
            onClick={async () => {
              if (pendingTicketType) await doGenerateTicket(pendingTicketType);
            }}
            disabled={generateTicket.isPending}
            className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-lg shadow-lg transition-colors disabled:opacity-50"
          >
            {generateTicket.isPending ? "Gerando..." : "Continuar com alertas na tela"}
          </button>
        )}
        <button
          onClick={handleSkipNotif}
          className="text-white/60 hover:text-white text-sm underline transition-colors mx-auto block"
        >
          Continuar sem alerta
        </button>
      </Wrapper>
    );
  }

  if (step === "checkin-update") {
    return (
      <Wrapper>
        <BackBtn onClick={() => setStep("checkin-identify")} />
        <div className="text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-yellow-300 mx-auto" />
          <h1 className="text-xl font-bold text-white">Dados desatualizados</h1>
          <p className="text-white/70 text-sm">Atualize seus dados para continuar</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Telefone *</label>
            <input
              type="tel"
              inputMode="tel"
              value={updateFields.phone}
              onChange={(e) => setUpdateFields((f) => ({ ...f, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="w-full h-12 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Convênio</label>
            <input
              type="text"
              value={updateFields.insurance}
              onChange={(e) => setUpdateFields((f) => ({ ...f, insurance: e.target.value }))}
              placeholder="Nome do convênio"
              className="w-full h-12 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Nº Carteirinha</label>
            <input
              type="text"
              value={updateFields.insurance_number}
              onChange={(e) => setUpdateFields((f) => ({ ...f, insurance_number: e.target.value }))}
              placeholder="Número do plano"
              className="w-full h-12 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <button
            onClick={handleUpdateAndContinue}
            disabled={loading}
            className="w-full h-12 bg-primary text-white font-bold rounded-xl active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Atualizar e Continuar"}
          </button>
        </div>
      </Wrapper>
    );
  }

  // ── CHECKIN DONE ──
  if (step === "checkin-done" && checkinResult) {
    return (
      <Wrapper>
        <div className="text-center space-y-3">
          <CheckCircle2 className="w-14 h-14 text-green-300 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Check-in Confirmado!</h1>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-2xl text-center space-y-3">
          <p className="font-bold text-lg text-foreground">{checkinResult.name}</p>
          <p className="text-4xl font-black text-primary">{checkinResult.ticket}</p>
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" />
            {checkinResult.time}
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => setStep("tracking")}
            className="w-full h-12 bg-white text-primary font-bold rounded-xl flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Acompanhar Fila
          </button>
          <button
            onClick={resetAll}
            className="w-full h-12 bg-white/10 border border-white/30 text-white font-medium rounded-xl flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Voltar ao início
          </button>
        </div>
      </Wrapper>
    );
  }

  // ── CHECKIN CONFIRM ──
  if (step === "checkin-confirm") {
    return (
      <Wrapper>
        <BackBtn onClick={() => setStep("checkin-identify")} />
        <div className="text-center space-y-2">
          <CheckCircle2 className="w-10 h-10 text-green-300 mx-auto" />
          <h1 className="text-xl font-bold text-white">Agendamentos encontrados</h1>
        </div>
        <div className="space-y-3">
          {appointments.map((appt) => (
            <button
              key={appt.id}
              onClick={() => handleConfirmCheckin(appt)}
              disabled={loading}
              className="w-full bg-white rounded-2xl p-4 text-left shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              <p className="font-bold text-foreground">{appt.patient_name}</p>
              <p className="text-primary font-medium text-sm">
                {new Date(appt.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} —{" "}
                {appt.title}
              </p>
              {appt.professional_name && (
                <p className="text-xs text-muted-foreground">Dr(a). {appt.professional_name}</p>
              )}
              {appt.location && <p className="text-xs text-muted-foreground">📍 {appt.location}</p>}
              <div className="mt-2 bg-primary/10 rounded-lg px-3 py-1.5 text-center">
                <span className="text-xs font-medium text-primary">Toque para confirmar</span>
              </div>
            </button>
          ))}
        </div>
      </Wrapper>
    );
  }

  // ── CHECKIN IDENTIFY ──
  if (step === "checkin-identify") {
    return (
      <Wrapper>
        <BackBtn onClick={() => setStep("home")} />
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-white">Check-in de Consulta</h1>
          <p className="text-white/70 text-sm">Informe seus dados</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-lg space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">CPF</label>
            <input
              type="text"
              inputMode="numeric"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              className="w-full h-12 text-lg text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Data de Nascimento</label>
            <DateMaskInput value={birthDate} onChange={setBirthDate} className="h-12 text-lg" />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          <button
            onClick={handleSearchAppointment}
            disabled={loading || !birthDate || cpf.replace(/\D/g, "").length < 11}
            className="w-full h-12 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
          >
            <Search className="w-5 h-5" />
            {loading ? "Buscando..." : "Buscar Agendamento"}
          </button>
        </div>
      </Wrapper>
    );
  }

  // ── TICKET SUBTYPE ──
  if (step === "ticket-subtype" && selectedCategory?.subtypes) {
    return (
      <Wrapper>
        <BackBtn onClick={() => setStep("ticket-category")} />
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-white">{selectedCategory.label}</h1>
          <p className="text-white/70 text-sm">Selecione o subtipo</p>
        </div>
        <div className="space-y-3">
          {selectedCategory.subtypes.map((sub) => (
            <button
              key={sub.id}
              onClick={() => handleGenerateTicket(sub.id)}
              disabled={generateTicket.isPending}
              className="w-full bg-white rounded-2xl p-4 flex items-center justify-between shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              <div className="text-left">
                <h3 className="font-bold text-foreground">{sub.label}</h3>
                <p className="text-sm text-muted-foreground">{sub.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </Wrapper>
    );
  }

  // ── TICKET CATEGORY ──
  if (step === "ticket-category") {
    return (
      <Wrapper>
        <BackBtn onClick={() => setStep("home")} />
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold text-white">Retirar Senha</h1>
          <p className="text-white/70 text-sm">Escolha a categoria</p>
        </div>
        <div className="space-y-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              disabled={generateTicket.isPending}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                {cat.id === "preferencial_80" ? (
                  <Crown className="w-5 h-5" style={{ color: cat.color }} />
                ) : cat.id.startsWith("preferencial") ? (
                  <UserCheck className="w-5 h-5" style={{ color: cat.color }} />
                ) : (
                  <Users className="w-5 h-5" style={{ color: cat.color }} />
                )}
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-foreground">{cat.label}</h3>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
              {cat.subtypes && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </Wrapper>
    );
  }

  // ── HOME ──
  return (
    <Wrapper>
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto bg-white/20 rounded-2xl flex items-center justify-center overflow-hidden">
          {unitConfig?.logo_url ? (
            <img src={unitConfig.logo_url} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <Smartphone className="w-7 h-7 text-white" />
          )}
        </div>
        <h1 className="text-2xl font-bold text-white">Portal {unitConfig?.unit_name || "Zurich"}</h1>
        <p className="text-white/60 text-sm">O que deseja fazer?</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setStep("ticket-category")}
          className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-foreground">Retirar Senha Virtual</h2>
            <p className="text-sm text-muted-foreground">Entre na fila sem precisar ir ao totem</p>
          </div>
        </button>

        <button
          onClick={() => {
            setStep("checkin-identify");
            setError("");
            setCpf("");
            setBirthDate("");
          }}
          className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6 text-accent-foreground" />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-bold text-foreground">Fazer Check-in</h2>
            <p className="text-sm text-muted-foreground">Confirme sua consulta agendada</p>
          </div>
        </button>
      </div>

      <p className="text-white/30 text-xs text-center">{unitConfig?.unit_name || "Zurich"} Health System</p>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(210,85%,45%)] to-[hsl(210,85%,30%)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">{children}</div>
    </div>
  );
}
