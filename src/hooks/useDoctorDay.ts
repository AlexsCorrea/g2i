import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface DoctorPending {
  key: string;
  label: string;
  count: number;
  path: string;
  tone: "warning" | "danger" | "info";
}

/**
 * Pendências clínicas reais do dia para a área inicial do médico.
 * Usa apenas contagens (head: true) para ser leve.
 */
export function useDoctorPendings() {
  return useQuery({
    queryKey: ["doctor-day-pendings"],
    staleTime: 60_000,
    queryFn: async () => {
      const today = format(new Date(), "yyyy-MM-dd");

      const [exames, prescricoes, resultados, internados] = await Promise.all([
        supabase.from("exam_requests").select("id", { count: "exact", head: true }).eq("status", "solicitado"),
        supabase.from("medications").select("id", { count: "exact", head: true }).eq("status", "ativo"),
        supabase.from("lab_results").select("id", { count: "exact", head: true }).eq("status", "liberado"),
        supabase.from("patients").select("id", { count: "exact", head: true }).eq("status", "internado"),
      ]);

      const pendings: DoctorPending[] = [
        { key: "exames", label: "Exames solicitados aguardando resultado", count: exames.count ?? 0, path: "/diagnostico/laudos", tone: "warning" },
        { key: "resultados", label: "Resultados liberados para conferência", count: resultados.count ?? 0, path: "/laboratorio", tone: "info" },
        { key: "prescricoes", label: "Prescrições ativas em acompanhamento", count: prescricoes.count ?? 0, path: "/assistencial/farmacia", tone: "info" },
        { key: "internados", label: "Pacientes internados sob cuidado", count: internados.count ?? 0, path: "/assistencial/internados", tone: "warning" },
      ];

      return { pendings, today };
    },
  });
}

/** Relógio ao vivo (atualiza a cada 30s) para contagens regressivas. */
export function useNow(intervalMs = 30_000) {
  return useQuery({
    queryKey: ["doctor-day-now", intervalMs],
    queryFn: async () => Date.now(),
    refetchInterval: intervalMs,
    initialData: Date.now(),
  }).data as number;
}
