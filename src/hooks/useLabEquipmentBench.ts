import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sb = supabase as any;

export function useEquipmentAgents() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lab-equipment-agents"],
    queryFn: async () => {
      const { data, error } = await sb
        .from("lab_equipment_agents")
        .select("*, lab_equipment(name, sector, manufacturer)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });
  const upsert = useMutation({
    mutationFn: async (item: any) => {
      if (item.id) {
        const { id, lab_equipment, ...rest } = item;
        const { error } = await sb.from("lab_equipment_agents").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("lab_equipment_agents").insert(item);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lab-equipment-agents"] }); toast.success("Agente salvo"); },
    onError: (e: any) => toast.error(e.message),
  });
  return { list, upsert };
}

export function useEquipmentMessages(equipmentId?: string) {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lab-equipment-messages", equipmentId ?? "all"],
    queryFn: async () => {
      let q = sb.from("lab_equipment_messages").select("*, lab_equipment(name, manufacturer)").order("received_at", { ascending: false }).limit(200);
      if (equipmentId) q = q.eq("equipment_id", equipmentId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
  const create = useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await sb.from("lab_equipment_messages").insert(item).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab-equipment-messages"] }),
    onError: (e: any) => toast.error(e.message),
  });
  const update = useMutation({
    mutationFn: async ({ id, ...rest }: any) => {
      const { error } = await sb.from("lab_equipment_messages").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lab-equipment-messages"] }),
    onError: (e: any) => toast.error(e.message),
  });
  return { list, create, update };
}

export function useAnalyteMap(equipmentId?: string) {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["lab-equipment-analyte-map", equipmentId ?? "all"],
    queryFn: async () => {
      let q = sb.from("lab_equipment_analyte_map").select("*, lab_equipment(name)").order("equipment_code");
      if (equipmentId) q = q.eq("equipment_id", equipmentId);
      const { data, error } = await q;
      if (error) throw error;
      return data as any[];
    },
  });
  const upsert = useMutation({
    mutationFn: async (item: any) => {
      if (item.id) {
        const { id, lab_equipment, ...rest } = item;
        const { error } = await sb.from("lab_equipment_analyte_map").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("lab_equipment_analyte_map").insert(item);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lab-equipment-analyte-map"] }); toast.success("Mapeamento salvo"); },
    onError: (e: any) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await sb.from("lab_equipment_analyte_map").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lab-equipment-analyte-map"] }); toast.success("Removido"); },
    onError: (e: any) => toast.error(e.message),
  });
  return { list, upsert, remove };
}
