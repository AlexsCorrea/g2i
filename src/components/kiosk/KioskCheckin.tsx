import React, { useState } from "react";
import { ArrowLeft, Search, CheckCircle2, AlertCircle, UserPlus, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useGenerateTicket } from "@/hooks/useQueueTickets";
import { DateMaskInput } from "@/components/ui/date-mask-input";
import type { KioskResultData } from "@/pages/Kiosk";

interface Props {
  onBack: () => void;
  onResult: (data: KioskResultData) => void;
}

interface FoundAppointment {
  id: string;
  title: string;
  scheduled_at: string;
  appointment_type: string;
  status: string;
  location: string | null;
  patient_id: string | null;
  patient_name: string;
  professional_name: string | null;
  is_provisional: boolean;
}

interface PatientInfo {
  id: string;
  full_name: string;
  phone: string | null;
  health_insurance: string | null;
  health_insurance_number: string | null;
  updated_at: string;
}

type Step = "identify" | "update" | "confirm" | "complete_registration";

// Statuses that represent a valid appointment for check-in
const VALID_CHECKIN_STATUSES = [
  "agendado", "confirmado", "chegou", "em_espera", "encaixe", "reagendado",
];
// Statuses that should NOT appear in check-in
const EXCLUDED_STATUSES = ["cancelado", "nao_compareceu", "concluido", "em_andamento"];

export function KioskCheckin({ onBack, onResult }: Props) {
  const [step, setStep] = useState<Step>("identify");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<FoundAppointment[]>([]);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [updateFields, setUpdateFields] = useState({ phone: "", insurance: "", insurance_number: "" });
  const [selectedAppt, setSelectedAppt] = useState<FoundAppointment | null>(null);
  const [regFields, setRegFields] = useState({ name: "", birth_date: "", cpf: "", phone: "", insurance: "" });
  const generateTicket = useGenerateTicket();

  const formatCpf = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const isOutdated = (updatedAt: string) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(updatedAt) < sixMonthsAgo;
  };

  const handleSearch = async () => {
    setError("");
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length < 11) { setError("CPF inválido. Digite os 11 dígitos."); return; }
    if (!birthDate) { setError("Informe a data de nascimento."); return; }
    setLoading(true);

    try {
      // Identity is validated server-side (CPF + birth date) — no anonymous DB access.
      const res = await callPublicQueue<{ patient: PatientInfo | null; appointments: FoundAppointment[] }>(
        "search_checkin",
        { cpf: cleanCpf, birth_date: birthDate },
      );
      const matchedPatient = res.patient;
      const foundAppointments = res.appointments || [];

      if (matchedPatient) {
        setPatient(matchedPatient);
        if (!matchedPatient.phone || isOutdated((matchedPatient as any).updated_at)) {
          setUpdateFields({
            phone: matchedPatient.phone || "",
            insurance: (matchedPatient as any).health_insurance || "",
            insurance_number: (matchedPatient as any).health_insurance_number || "",
          });
        }
      }

      if (foundAppointments.length === 0) {
        setError("Nenhum agendamento encontrado para hoje com os dados informados.");
        setLoading(false);
        return;
      }

      setAppointments(foundAppointments);

      // If registered patient needs update, go to update step first
      if (matchedPatient && (!matchedPatient.phone || isOutdated((matchedPatient as any).updated_at))) {
        setStep("update");
      } else {
        setStep("confirm");
      }
    } catch (err: any) {
      setError("Erro ao buscar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAndContinue = async () => {
    if (!patient) return;
    if (!updateFields.phone.trim()) { setError("Telefone é obrigatório."); return; }
    setLoading(true);
    setError("");
    try {
      await callPublicQueue("update_contact", {
        cpf: cpf.replace(/\D/g, ""),
        birth_date: birthDate,
        phone: updateFields.phone,
        insurance: updateFields.insurance,
        insurance_number: updateFields.insurance_number,
      });
      setStep("confirm");
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  const handleConfirmCheckin = async (appt: FoundAppointment) => {
    // If provisional, offer completion flow
    if (appt.is_provisional) {
      setSelectedAppt(appt);
      setRegFields({
        name: appt.patient_name !== "Paciente provisório" ? appt.patient_name : "",
        birth_date: birthDate,
        cpf: cpf.replace(/\D/g, ""),
        phone: "",
        insurance: "",
      });
      setStep("complete_registration");
      return;
    }

    await doCheckin(appt);
  };

  const doCheckin = async (appt: FoundAppointment) => {
    setLoading(true);
    setError("");
    try {
      const res = await callPublicQueue<{ ticket: any }>("confirm_checkin", {
        cpf: cpf.replace(/\D/g, ""),
        birth_date: birthDate,
        appointment_id: appt.id,
        ticket_type: "consulta",
        queue_name: "recepcao",
        source: "totem",
      });
      const ticket = res.ticket;
      onResult({
        ticketNumber: ticket.ticket_number,
        ticketType: "consulta",
        patientName: appt.patient_name,
        professional: appt.professional_name || undefined,
        time: new Date(appt.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        ticketId: ticket.id,
      });
    } catch { setError("Erro ao confirmar check-in."); } finally { setLoading(false); }
  };

  const handleCompleteRegistration = async () => {
    if (!selectedAppt) return;
    if (!regFields.name.trim()) { setError("Nome completo é obrigatório."); return; }
    if (!regFields.birth_date) { setError("Data de nascimento é obrigatória."); return; }
    if (!regFields.cpf || regFields.cpf.length < 11) { setError("CPF é obrigatório (11 dígitos)."); return; }
    setLoading(true);
    setError("");

    try {
      const res = await callPublicQueue<{ patient: { id: string; full_name: string } }>("complete_registration", {
        cpf: regFields.cpf,
        birth_date: regFields.birth_date,
        appointment_id: selectedAppt.id,
        name: regFields.name,
        phone: regFields.phone,
        insurance: regFields.insurance,
      });

      const updatedAppt: FoundAppointment = {
        ...selectedAppt,
        patient_id: res.patient.id,
        patient_name: res.patient.full_name,
        is_provisional: false,
      };

      await doCheckin(updatedAppt);
    } catch (err: any) {
      setError("Erro ao completar cadastro: " + err.message);
      setLoading(false);
    }
  };


  const handleSkipRegistration = async () => {
    if (!selectedAppt) return;
    // Proceed with check-in without completing registration
    await doCheckin(selectedAppt);
  };

  // ── COMPLETE REGISTRATION STEP ──
  if (step === "complete_registration") {
    return (
      <div className="space-y-6">
        <button onClick={() => setStep("confirm")} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /><span className="text-lg">Voltar</span>
        </button>
        <div className="text-center space-y-2">
          <UserPlus className="w-12 h-12 text-yellow-300 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Cadastro pendente</h1>
          <p className="text-white/70">Seu cadastro precisa ser concluído para finalizar o check-in.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nome completo *</label>
            <input type="text" value={regFields.name}
              onChange={e => setRegFields(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome completo"
              className="w-full h-14 text-lg text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Data de nascimento *</label>
            <DateMaskInput value={regFields.birth_date} onChange={v => setRegFields(f => ({ ...f, birth_date: v }))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">CPF *</label>
            <input type="text" inputMode="numeric"
              value={formatCpf(regFields.cpf)}
              onChange={e => setRegFields(f => ({ ...f, cpf: e.target.value.replace(/\D/g, "").slice(0, 11) }))}
              placeholder="000.000.000-00"
              className="w-full h-14 text-lg text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Telefone</label>
            <input type="tel" inputMode="tel" value={regFields.phone}
              onChange={e => setRegFields(f => ({ ...f, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="w-full h-14 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Convênio</label>
            <input type="text" value={regFields.insurance}
              onChange={e => setRegFields(f => ({ ...f, insurance: e.target.value }))}
              placeholder="Nome do convênio"
              className="w-full h-14 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
            </div>
          )}
          <button onClick={handleCompleteRegistration} disabled={loading}
            className="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
            <UserPlus className="w-5 h-5" />{loading ? "Salvando..." : "Completar cadastro e fazer check-in"}
          </button>
          <button onClick={handleSkipRegistration} disabled={loading}
            className="w-full h-12 bg-muted text-foreground text-base font-medium rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
            <ArrowRight className="w-4 h-4" />Finalizar na recepção
          </button>
        </div>
      </div>
    );
  }

  // ── UPDATE STEP ──
  if (step === "update") {
    return (
      <div className="space-y-6">
        <button onClick={() => setStep("identify")} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /><span className="text-lg">Voltar</span>
        </button>
        <div className="text-center space-y-2">
          <AlertCircle className="w-12 h-12 text-yellow-300 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Dados desatualizados</h1>
          <p className="text-white/70">Atualize seus dados para continuar</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Telefone *</label>
            <input type="tel" inputMode="tel" value={updateFields.phone}
              onChange={e => setUpdateFields(f => ({ ...f, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              className="w-full h-14 text-xl text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Convênio</label>
            <input type="text" value={updateFields.insurance}
              onChange={e => setUpdateFields(f => ({ ...f, insurance: e.target.value }))}
              placeholder="Nome do convênio"
              className="w-full h-14 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Nº Carteirinha</label>
            <input type="text" value={updateFields.insurance_number}
              onChange={e => setUpdateFields(f => ({ ...f, insurance_number: e.target.value }))}
              placeholder="Número do plano"
              className="w-full h-14 text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-xl p-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
            </div>
          )}
          <button onClick={handleUpdateAndContinue} disabled={loading}
            className="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50">
            {loading ? "Salvando..." : "Atualizar e Continuar"}
          </button>
        </div>
      </div>
    );
  }

  // ── CONFIRM STEP ──
  if (step === "confirm") {
    return (
      <div className="space-y-6">
        <button onClick={() => setStep("identify")} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" /><span className="text-lg">Voltar</span>
        </button>
        <div className="text-center space-y-2">
          <CheckCircle2 className="w-12 h-12 text-green-300 mx-auto" />
          <h1 className="text-2xl font-bold text-white">Agendamentos encontrados</h1>
          <p className="text-white/70">Confirme sua consulta para realizar o check-in</p>
        </div>
        <div className="space-y-3">
          {appointments.map((appt) => (
            <button key={appt.id} onClick={() => handleConfirmCheckin(appt)} disabled={loading}
              className="w-full bg-white rounded-2xl p-5 text-left shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50">
              <div className="flex items-center justify-between">
                <p className="font-bold text-lg text-foreground">{appt.patient_name}</p>
                {appt.is_provisional && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                    Cadastro pendente
                  </span>
                )}
              </div>
              <p className="text-primary font-medium">
                {new Date(appt.scheduled_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} — {appt.title}
              </p>
              {appt.professional_name && <p className="text-sm text-muted-foreground">Dr(a). {appt.professional_name}</p>}
              {appt.location && <p className="text-sm text-muted-foreground">📍 {appt.location}</p>}
              <div className="mt-3 bg-primary/10 rounded-lg px-3 py-2 text-center">
                <span className="text-sm font-medium text-primary">Toque para confirmar check-in</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── IDENTIFY STEP ──
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" /><span className="text-lg">Voltar</span>
      </button>
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">Confirmar Consulta</h1>
        <p className="text-white/70">Informe seus dados para localizar seu agendamento</p>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-lg space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">CPF</label>
          <input type="text" inputMode="numeric" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))}
            placeholder="000.000.000-00"
            className="w-full h-14 text-xl text-center border-2 border-border rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Data de Nascimento</label>
          <DateMaskInput value={birthDate} onChange={setBirthDate} />
        </div>
        {error && (
          <div className="flex items-center gap-2 text-destructive bg-red-50 rounded-xl p-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" /><span className="text-sm">{error}</span>
          </div>
        )}
        <button onClick={handleSearch} disabled={loading || !birthDate || cpf.replace(/\D/g, "").length < 11}
          className="w-full h-14 bg-primary text-white text-lg font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-[0.98]">
          <Search className="w-5 h-5" />{loading ? "Buscando..." : "Buscar Agendamento"}
        </button>
      </div>
    </div>
  );
}
