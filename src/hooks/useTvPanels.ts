import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type TvPanel = {
  id: string;
  name: string;
  location: string | null;
  is_active: boolean;
  notes: string | null;
  ads_enabled: boolean;
  sound_enabled: boolean;
  locution_enabled: boolean;
  show_history: boolean;
  show_clock: boolean;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

const STORAGE_KEY = "zurich.tv_panel_id";

export function getSelectedTvPanelId(): string | null {
  try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
}
export function setSelectedTvPanelId(id: string) {
  try { localStorage.setItem(STORAGE_KEY, id); } catch {}
}
export function clearSelectedTvPanelId() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function useTvPanels() {
  return useQuery({
    queryKey: ["tv_panels", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tv_panels").select("*").order("name");
      if (error) throw error;
      return (data ?? []) as TvPanel[];
    },
  });
}

export function useActiveTvPanels() {
  return useQuery({
    queryKey: ["tv_panels", "active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tv_panels").select("*").eq("is_active", true).order("name");
      if (error) throw error;
      return (data ?? []) as TvPanel[];
    },
  });
}

export function useTvPanel(id: string | null) {
  return useQuery({
    queryKey: ["tv_panels", "one", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tv_panels").select("*").eq("id", id!).maybeSingle();
      if (error) throw error;
      return data as TvPanel | null;
    },
  });
}

export function useUpsertTvPanel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: Partial<TvPanel> & { name: string; id?: string }) => {
      const payload: any = { ...p };
      if (payload.id) {
        const { id, ...rest } = payload;
        const { error } = await supabase.from("tv_panels").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("tv_panels").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tv_panels"] });
      toast.success("Painel TV salvo");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar painel TV"),
  });
}

export function useDeleteTvPanel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tv_panels").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tv_panels"] });
      toast.success("Painel TV removido");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao remover"),
  });
}
