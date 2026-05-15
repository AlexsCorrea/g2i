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

/* ===== Ticket type x priorities (N:N) ===== */
export interface TicketTypePriority {
  id: string;
  ticket_type_id: string;
  priority_code: string;
  enabled: boolean;
}

export function useTicketTypePriorities(unitId?: string | null) {
  return useQuery({
    queryKey: ["totem_ticket_type_priorities", unitId ?? "all"],
    queryFn: async () => {
      let q = (supabase as any)
        .from("totem_ticket_type_priorities")
        .select("id, ticket_type_id, priority_code, enabled, totem_ticket_types!inner(unit_id)");
      if (unitId) q = q.eq("totem_ticket_types.unit_id", unitId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as any[]).map((r) => ({
        id: r.id,
        ticket_type_id: r.ticket_type_id,
        priority_code: r.priority_code,
        enabled: r.enabled,
      })) as TicketTypePriority[];
    },
    staleTime: 30_000,
  });
}

export function useSetTicketTypePriorities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { ticket_type_id: string; priority_codes: string[] }) => {
      // delete and re-insert (simple atomic-ish replacement)
      await (supabase as any).from("totem_ticket_type_priorities").delete().eq("ticket_type_id", params.ticket_type_id);
      if (params.priority_codes.length > 0) {
        const rows = params.priority_codes.map((code) => ({
          ticket_type_id: params.ticket_type_id,
          priority_code: code,
          enabled: true,
        }));
        const { error } = await (supabase as any).from("totem_ticket_type_priorities").insert(rows);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totem_ticket_type_priorities"] });
      toast.success("Prioridades atualizadas");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/* ===== GLOBAL ticket types catalog ===== */
export interface GlobalTicketType {
  id: string;
  code: string;
  label: string;
  prefix: string;
  color: string | null;
  default_display_order: number;
  active: boolean;
}

export function useGlobalTicketTypes() {
  return useQuery({
    queryKey: ["totem_ticket_types_global"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("totem_ticket_types_global")
        .select("*")
        .order("default_display_order")
        .order("label");
      if (error) throw error;
      return data as GlobalTicketType[];
    },
    staleTime: 30_000,
  });
}

function normalizeCode(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function useUpsertGlobalTicketType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<GlobalTicketType> & { label: string; code?: string }) => {
      const { id, ...rest } = payload;
      const code = normalizeCode(rest.code || rest.label);
      if (id) {
        const { data, error } = await (supabase as any)
          .from("totem_ticket_types_global")
          .update({ ...rest, code })
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as GlobalTicketType;
      } else {
        const { data, error } = await (supabase as any)
          .from("totem_ticket_types_global")
          .insert({ ...rest, code })
          .select()
          .single();
        if (error) {
          if (String(error.message || "").toLowerCase().includes("duplicate")) {
            throw new Error(`Já existe um tipo com o código "${code}". Use outro nome.`);
          }
          throw error;
        }
        return data as GlobalTicketType;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totem_ticket_types_global"] });
      qc.invalidateQueries({ queryKey: ["totem_unit_ticket_types"] });
      toast.success("Tipo global salvo");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useDeleteGlobalTicketType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("totem_ticket_types_global").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["totem_ticket_types_global"] });
      qc.invalidateQueries({ queryKey: ["totem_unit_ticket_types"] });
      toast.success("Tipo global removido");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/* ===== Unit ↔ Global Ticket Type link ===== */
export interface UnitTicketTypeRow {
  id: string;
  unit_id: string;
  ticket_type_global_id: string;
  enabled: boolean;
  display_order: number;
  color_override: string | null;
  global: GlobalTicketType;
  priority_codes: string[];
}

export function useUnitTicketTypes(unitId: string | null | undefined) {
  return useQuery({
    queryKey: ["totem_unit_ticket_types", unitId],
    queryFn: async () => {
      if (!unitId) return [];
      const { data, error } = await (supabase as any)
        .from("totem_unit_ticket_types")
        .select("*, global:totem_ticket_types_global(*), totem_unit_ticket_type_priorities(priority_code, enabled)")
        .eq("unit_id", unitId)
        .order("display_order");
      if (error) throw error;
      return (data as any[]).map((r) => ({
        id: r.id,
        unit_id: r.unit_id,
        ticket_type_global_id: r.ticket_type_global_id,
        enabled: r.enabled,
        display_order: r.display_order,
        color_override: r.color_override,
        global: r.global,
        priority_codes: (r.totem_unit_ticket_type_priorities || [])
          .filter((p: any) => p.enabled)
          .map((p: any) => p.priority_code),
      })) as UnitTicketTypeRow[];
    },
    enabled: !!unitId,
    staleTime: 30_000,
  });
}

export interface UnitTicketTypeDraft {
  ticket_type_global_id: string;
  enabled: boolean;
  display_order: number;
  color_override: string | null;
  priority_codes: string[];
  /** existing link id (when known) */
  id?: string;
}

export function useSaveUnitTicketTypesBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { unit_id: string; items: UnitTicketTypeDraft[] }) => {
      const { unit_id, items } = params;
      // upsert links
      const linkPayload = items.map((it) => ({
        ...(it.id ? { id: it.id } : {}),
        unit_id,
        ticket_type_global_id: it.ticket_type_global_id,
        enabled: it.enabled,
        display_order: it.display_order,
        color_override: it.color_override,
      }));
      const { data: upserted, error: upsertErr } = await (supabase as any)
        .from("totem_unit_ticket_types")
        .upsert(linkPayload, { onConflict: "unit_id,ticket_type_global_id" })
        .select("id, ticket_type_global_id");
      if (upsertErr) throw upsertErr;
      const idByGlobal = new Map<string, string>();
      (upserted as any[]).forEach((r) => idByGlobal.set(r.ticket_type_global_id, r.id));

      // For each item, replace its priorities atomically (delete + insert)
      for (const it of items) {
        const linkId = idByGlobal.get(it.ticket_type_global_id) ?? it.id;
        if (!linkId) continue;
        await (supabase as any).from("totem_unit_ticket_type_priorities").delete().eq("unit_ticket_type_id", linkId);
        if (it.priority_codes.length > 0) {
          const rows = it.priority_codes.map((c) => ({
            unit_ticket_type_id: linkId,
            priority_code: c,
            enabled: true,
          }));
          const { error: pErr } = await (supabase as any).from("totem_unit_ticket_type_priorities").insert(rows);
          if (pErr) throw pErr;
        }
      }
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["totem_unit_ticket_types", vars.unit_id] });
      qc.invalidateQueries({ queryKey: ["totem_unit_ticket_types"] });
      toast.success("Alterações salvas");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/* ===== Institution settings (singleton) ===== */
export interface InstitutionSettings {
  id: string;
  name: string;
  logo_url: string | null;
}

export function useInstitutionSettings() {
  return useQuery({
    queryKey: ["institution_settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("institution_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as InstitutionSettings | null;
    },
    staleTime: 60_000,
  });
}

export function useUpdateInstitutionSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: Partial<InstitutionSettings> & { id: string }) => {
      const { id, ...rest } = params;
      const { data, error } = await (supabase as any)
        .from("institution_settings")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["institution_settings"] });
      toast.success("Instituição atualizada");
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
  const { data: device, isLoading: loadingDevice, isFetched: deviceFetched } = useTotemDevice(deviceId);
  const { data: unit, isLoading: loadingUnit, isFetched: unitFetched } = useTotemUnit(device?.unit_id);
  const { data: legacyTypes } = useTicketTypes(device?.unit_id);
  const { data: unitTypes } = useUnitTicketTypes(device?.unit_id);
  const { data: legacyPrios } = useTicketTypePriorities(device?.unit_id);

  // Validate device existence/active and unit active
  useEffect(() => {
    if (!deviceId || !deviceFetched) return;
    if (!device) {
      // device id no longer exists — clear
      setSelectedDeviceId(null);
    }
  }, [deviceId, deviceFetched, device]);

  const deviceInactive = !!device && device.active === false;
  const unitInactive = !!unit && unit.active === false;

  // Prefer NEW model — if unit has links, project them into legacy shape so kiosk code keeps working
  const ticketTypes: TotemTicketType[] = (unitTypes && unitTypes.length > 0)
    ? unitTypes
        .filter((r) => r.enabled && r.global?.active !== false)
        .map((r) => ({
          id: r.id, // link id (used as identifier through kiosk)
          unit_id: r.unit_id,
          code: r.global.code,
          label: r.global.label,
          prefix: r.global.prefix,
          priority: 0,
          color: r.color_override || r.global.color || "#1e5a8a",
          display_order: r.display_order,
          active: true,
        }))
    : (legacyTypes ?? []);

  const ticketTypePriorities: TicketTypePriority[] = (unitTypes && unitTypes.length > 0)
    ? unitTypes.flatMap((r) =>
        r.priority_codes.map((code) => ({
          id: `${r.id}-${code}`,
          ticket_type_id: r.id, // matches projected ticketType.id above
          priority_code: code,
          enabled: true,
        })),
      )
    : (legacyPrios ?? []);

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
    ticketTypes,
    ticketTypePriorities,
    isLoading: loadingDevice || loadingUnit,
    isReady: !!deviceId && !!device && !!unit && !deviceInactive && !unitInactive,
    deviceInactive,
    unitInactive,
    deviceMissing: !!deviceId && deviceFetched && !device,
  };
}
