import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const todayRange = () => {
  const d = format(new Date(), "yyyy-MM-dd");
  return { start: `${d}T00:00:00`, end: `${d}T23:59:59`, day: d };
};

export interface RoomQueueItem {
  id: string;
  title: string;
  scheduled_at: string;
  status: string;
  appointment_type: string;
  location: string | null;
  duration_minutes: number | null;
  patient_id: string | null;
  patients?: { full_name: string; birth_date: string | null } | null;
}

/** Fila do profissional: pacientes já presentes ou aguardando atendimento hoje. */
export function useDoctorQueue() {
  return useQuery({
    queryKey: ["doctor-room-queue"],
    refetchInterval: 60_000,
    queryFn: async () => {
      const { start, end } = todayRange();
      const { data, error } = await supabase
        .from("appointments")
        .select(
          "id, title, scheduled_at, status, appointment_type, location, duration_minutes, patient_id, patients(full_name, birth_date)",
        )
        .gte("scheduled_at", start)
        .lte("scheduled_at", end)
        .in("status", ["chegou", "em_espera", "confirmado", "agendado", "em_andamento", "encaixe"])
        .order("scheduled_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as RoomQueueItem[];
    },
  });
}

/** Resultados laboratoriais liberados/críticos aguardando conferência médica. */
export function useDoctorLabResults() {
  return useQuery({
    queryKey: ["doctor-room-lab"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lab_results")
        .select("id, status, is_critical, is_abnormal, created_at, value, unit")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Solicitações de exames em aberto. */
export function useDoctorExamRequests() {
  return useQuery({
    queryKey: ["doctor-room-exams"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_requests")
        .select("id, exam_type, exam_category, status, priority, created_at, patient_id, patients(full_name)")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

/** Pacientes internados sob cuidado. */
export function useDoctorInpatients() {
  return useQuery({
    queryKey: ["doctor-room-inpatients"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, full_name, status, room, bed, admission_date, birth_date")
        .eq("status", "internado")
        .order("admission_date", { ascending: true })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Cirurgias do dia. */
export function useDoctorSurgeries() {
  return useQuery({
    queryKey: ["doctor-room-surgeries"],
    staleTime: 60_000,
    queryFn: async () => {
      const { day } = todayRange();
      const { data, error } = await supabase
        .from("surgical_procedures")
        .select("id, procedure_type, description, scheduled_date, start_time, status, patient_id, patients(full_name)")
        .eq("scheduled_date", day)
        .order("start_time", { ascending: true });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}

/** Prescrições ativas do dia. */
export function useDoctorPrescriptions() {
  return useQuery({
    queryKey: ["doctor-room-prescriptions"],
    staleTime: 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("id, name, dosage, route, frequency, status, patient_id, patients(full_name)")
        .eq("status", "ativo")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });
}
