import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UnitConfig {
  id: string;
  unit_name: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  background_image_url: string | null;
  privacy_mode: string;
  social_name_policy: string;
  call_display_seconds: number;
  ads_enabled: boolean;
  ads_interval_seconds: number;
  locution_enabled: boolean;
  locution_speak_priority: boolean;
  locution_speak_location: boolean;
  sound_enabled: boolean;
  show_clock: boolean;
  show_history: boolean;
  ads_idle_seconds: number;
  totem_retirar_senha: boolean;
  totem_checkin: boolean;
  totem_timeout_seconds: number;
  voice_rate: number;
  voice_pitch: number;
  voice_volume: number;
  pre_call_sound: string;
  print_enabled: boolean;
  print_auto: boolean;
  print_copies: number;
  print_paper_width: string;
  print_show_logo: boolean;
  print_show_qr: boolean;
  print_header_text: string;
  print_footer_text: string;
  print_template: string;
  print_font_size: string;
  print_margin_top: number;
  print_margin_bottom: number;
  print_margin_left: number;
  print_margin_right: number;
  print_block_spacing: number;
  print_cut_extra_height: number;
  print_auto_cut: boolean;
  result_countdown_seconds: number;
}

export interface UnitAd {
  id: string;
  unit_config_id: string | null;
  title: string;
  media_type: string;
  media_url: string;
  display_order: number;
  duration_seconds: number;
  active: boolean;
  created_at: string;
}

/**
 * Returns the first active totem unit as the "default" config for legacy callers
 * (QueueTV, QueuePanel, Portal, LabReports). New code should use useActiveTotemContext().
 */
export function useUnitConfig() {
  return useQuery({
    queryKey: ["unit_config_default"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("totem_units")
        .select("*")
        .eq("active", true)
        .order("name")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null as unknown as UnitConfig;
      return { ...data, unit_name: data.name } as UnitConfig;
    },
    staleTime: 60000,
  });
}

export function useUpdateUnitConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: Partial<UnitConfig> & { id: string }) => {
      const { id, unit_name, ...rest } = params as any;
      const payload = unit_name ? { ...rest, name: unit_name } : rest;
      const { data, error } = await (supabase as any)
        .from("totem_units")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unit_config_default"] });
      qc.invalidateQueries({ queryKey: ["totem_units"] });
      toast.success("Configuração atualizada!");
    },
  });
}

export function useUnitAds() {
  return useQuery({
    queryKey: ["unit_ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unit_ads")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as UnitAd[];
    },
    staleTime: 30000,
  });
}

export function useManageAds() {
  const qc = useQueryClient();
  return {
    add: useMutation({
      mutationFn: async (ad: Omit<UnitAd, "id" | "created_at">) => {
        const { data, error } = await supabase.from("unit_ads").insert(ad as any).select().single();
        if (error) throw error;
        return data;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["unit_ads"] }),
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from("unit_ads").delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => qc.invalidateQueries({ queryKey: ["unit_ads"] }),
    }),
  };
}

/** Format patient display name based on privacy mode */
export function formatPatientDisplay(
  fullName: string | null | undefined,
  nomeSocial: string | null | undefined,
  privacyMode: string,
  ticketNumber: string,
): string {
  if (!fullName) return ticketNumber;

  switch (privacyMode) {
    case "somente_senha":
      return ticketNumber;
    case "senha_iniciais": {
      const name = nomeSocial || fullName;
      const initials = name
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .filter(Boolean)
        .join(".");
      return `${ticketNumber} — ${initials}.`;
    }
    case "senha_nome_social": {
      if (nomeSocial) {
        const parts = nomeSocial.split(" ");
        return `${ticketNumber} — ${parts[0]}${parts.length > 1 ? " " + parts[parts.length - 1][0] + "." : ""}`;
      }
      const parts = fullName.split(" ");
      return `${ticketNumber} — ${parts[0]} ${parts.length > 1 ? parts[parts.length - 1][0] + "." : ""}`;
    }
    case "nome_completo":
      return `${ticketNumber} — ${nomeSocial || fullName}`;
    default:
      return ticketNumber;
  }
}

/** Get display name part only (no ticket number) for speech */
export function getPatientNameForSpeech(
  fullName: string | null | undefined,
  nomeSocial: string | null | undefined,
  privacyMode: string,
): string | null {
  if (!fullName || privacyMode === "somente_senha") return null;

  switch (privacyMode) {
    case "senha_iniciais": {
      const name = nomeSocial || fullName;
      return name
        .split(" ")
        .map((w) => w[0]?.toUpperCase())
        .filter(Boolean)
        .join(" ");
    }
    case "senha_nome_social": {
      if (nomeSocial) {
        const parts = nomeSocial.split(" ");
        return parts[0];
      }
      const parts = fullName.split(" ");
      return parts[0];
    }
    case "nome_completo":
      return nomeSocial || fullName;
    default:
      return null;
  }
}

/** Convert ticket number to spoken form: P8004 → "P oito zero zero quatro" */
export function ticketToSpeech(ticket: string): string {
  const digitMap: Record<string, string> = {
    "0": "zero", "1": "um", "2": "dois", "3": "três", "4": "quatro",
    "5": "cinco", "6": "seis", "7": "sete", "8": "oito", "9": "nove",
  };
  return ticket.split("").map(c => digitMap[c] || c).join(" ");
}

/** Get spoken priority label */
export function priorityToSpeech(ticketType: string): string {
  const map: Record<string, string> = {
    preferencial_80: "oitenta mais",
    preferencial_60: "sessenta mais",
    preferencial: "preferencial",
    retorno_pos_operatorio: "retorno pós-operatório",
    consulta: "consulta",
    exames: "exames",
    financeiro: "financeiro",
    triagem: "triagem",
    normal: "normal",
  };
  return map[ticketType] || "normal";
}
