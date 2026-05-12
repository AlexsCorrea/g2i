import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DEVICE_KEY = "zurich.totem.device_id";

export interface TotemUnit {
  id: string;
  name: string;
  active: boolean;
  observations: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  background_image_url: string | null;
  privacy_mode: string;
  social_name_policy: string;
  call_display_seconds: number;
  show_clock: boolean;
  show_history: boolean;
  ads_enabled: boolean;
  ads_interval_seconds: number;
  ads_idle_seconds: number;
  locution_enabled: boolean;
  locution_speak_priority: boolean;
  locution_speak_location: boolean;
  sound_enabled: boolean;
  voice_rate: number;
  voice_pitch: number;
  voice_volume: number;
  voice_name: string | null;
  pre_call_sound: string;
  totem_retirar_senha: boolean;
  totem_checkin: boolean;
  totem_timeout_seconds: number;
  result_countdown_seconds: number;
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
}

export interface TotemDevice {
  id: string;
  unit_id: string;
  name: string;
  location: string | null;
  device_identifier: string | null;
  active: boolean;
  observations: string | null;
  overrides: Record<string, unknown> | null;
}

export interface TotemTicketType {
  id: string;
  unit_id: string;
  code: string;
  label: string;
  prefix: string;
  priority: number;
  color: string | null;
  display_order: number;
  active: boolean;
}

/* ===== Units ===== */
export function useTotemUnits() {
  return useQuery({
    queryKey: ["totem_units"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("totem_units")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as TotemUnit[];
    },
    staleTime: 30_000,
  });
}

export function useTotemUnit(id: string | undefined | null) {
  return useQuery({
    queryKey: ["totem_unit", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase as any)
        .from("totem_units")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as TotemUnit | null;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useCreateTotemUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await (supabase as any)
        .from("totem_units")
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data as TotemUnit;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totem_units"] });
      toast.success("Unidade criada");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateTotemUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<TotemUnit> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from("totem_units")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["totem_units"] });
      qc.invalidateQueries({ queryKey: ["totem_unit", vars.id] });
      toast.success("Unidade atualizada");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteTotemUnit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("totem_units").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totem_units"] });
      toast.success("Unidade removida");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/* ===== Devices ===== */
export function useTotemDevices(unitId?: string) {
  return useQuery({
    queryKey: ["totem_devices", unitId ?? "all"],
    queryFn: async () => {
      let q = (supabase as any).from("totem_devices").select("*").order("name");
      if (unitId) q = q.eq("unit_id", unitId);
      const { data, error } = await q;
      if (error) throw error;
      return data as TotemDevice[];
    },
    staleTime: 30_000,
  });
}

export function useTotemDevice(id: string | null | undefined) {
  return useQuery({
    queryKey: ["totem_device", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase as any)
        .from("totem_devices")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as TotemDevice | null;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useUpsertTotemDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<TotemDevice> & { unit_id: string; name: string }) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await (supabase as any)
          .from("totem_devices")
          .update(rest)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await (supabase as any)
          .from("totem_devices")
          .insert(rest)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totem_devices"] });
      toast.success("Totem salvo");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteTotemDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("totem_devices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totem_devices"] });
      toast.success("Totem removido");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/* ===== Ticket types ===== */
export function useTicketTypes(unitId: string | null | undefined) {
  return useQuery({
    queryKey: ["totem_ticket_types", unitId],
    queryFn: async () => {
      if (!unitId) return [];
      const { data, error } = await (supabase as any)
        .from("totem_ticket_types")
        .select("*")
        .eq("unit_id", unitId)
        .order("display_order");
      if (error) throw error;
      return data as TotemTicketType[];
    },
    enabled: !!unitId,
    staleTime: 30_000,
  });
}

export function useUpsertTicketType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<TotemTicketType> & { unit_id: string; code: string; label: string }) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await (supabase as any)
          .from("totem_ticket_types")
          .update(rest)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await (supabase as any)
          .from("totem_ticket_types")
          .insert(rest)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["totem_ticket_types", vars.unit_id] });
      toast.success("Tipo de senha salvo");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteTicketType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("totem_ticket_types").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totem_ticket_types"] });
      toast.success("Removido");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/* ===== Selected device (localStorage) ===== */
export function getSelectedDeviceId(): string | null {
  try {
    return localStorage.getItem(DEVICE_KEY);
  } catch {
    return null;
  }
}

export function setSelectedDeviceId(id: string | null) {
  try {
    if (id) localStorage.setItem(DEVICE_KEY, id);
    else localStorage.removeItem(DEVICE_KEY);
  } catch {
    // ignore
  }
}

export function useSelectedDeviceId() {
  const [deviceId, setDeviceIdState] = useState<string | null>(() => getSelectedDeviceId());

  useEffect(() => {
    // honor ?device= URL param for provisioning
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("device");
    if (fromUrl) {
      setSelectedDeviceId(fromUrl);
      setDeviceIdState(fromUrl);
    }
  }, []);

  const update = (id: string | null) => {
    setSelectedDeviceId(id);
    setDeviceIdState(id);
  };

  return { deviceId, setDeviceId: update };
}

/* Resolve unit from selected device, with overrides applied */
export function useActiveTotemContext() {
  const { deviceId, setDeviceId } = useSelectedDeviceId();
  const { data: device, isLoading: loadingDevice } = useTotemDevice(deviceId);
  const { data: unit, isLoading: loadingUnit } = useTotemUnit(device?.unit_id);
  const { data: ticketTypes } = useTicketTypes(device?.unit_id);

  // Merge overrides over unit config
  const effectiveUnit: TotemUnit | null =
    unit && device?.overrides
      ? ({ ...unit, ...device.overrides } as TotemUnit)
      : unit ?? null;

  return {
    deviceId,
    setDeviceId,
    device: device ?? null,
    unit: effectiveUnit,
    ticketTypes: ticketTypes ?? [],
    isLoading: loadingDevice || loadingUnit,
    isReady: !!deviceId && !!device && !!unit,
  };
}
