import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errorHandler";

export interface QueueTicket {
  id: string;
  patient_id: string | null;
  appointment_id: string | null;
  ticket_number: string;
  ticket_type: string;
  priority: number;
  queue_name: string;
  sector: string;
  status: string;
  source: string;
  called_at: string | null;
  called_to: string | null;
  attended_at: string | null;
  completed_at: string | null;
  notification_token: string | null;
  notification_enabled: boolean;
  checkin_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  patients?: { full_name: string; cpf: string | null; nome_social: string | null } | null;
}

export function useQueueTickets(filters?: { queue_name?: string; status?: string; sector?: string }) {
  return useQuery({
    queryKey: ["queue_tickets", filters],
    queryFn: async () => {
      let query = supabase
        .from("queue_tickets")
        .select("*, patients(full_name, cpf, nome_social)")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true });

      if (filters?.queue_name) query = query.eq("queue_name", filters.queue_name);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.sector) query = query.eq("sector", filters.sector);

      // Only today's tickets
      const today = new Date().toISOString().split("T")[0];
      query = query.gte("created_at", `${today}T00:00:00`).lte("created_at", `${today}T23:59:59`);

      const { data, error } = await query;
      if (error) throw error;
      return data as QueueTicket[];
    },
    refetchInterval: 5000,
  });
}

export function useQueueTicketById(ticketId: string | null) {
  return useQuery({
    queryKey: ["queue_ticket", ticketId],
    queryFn: async () => {
      if (!ticketId) return null;
      const { data, error } = await supabase
        .from("queue_tickets")
        .select("*, patients(full_name, cpf, nome_social)")
        .eq("id", ticketId)
        .single();
      if (error) throw error;
      return data as QueueTicket;
    },
    enabled: !!ticketId,
    refetchInterval: 5000,
  });
}

export function useGenerateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      patient_id?: string;
      appointment_id?: string;
      ticket_type: string;
      queue_name: string;
      sector?: string;
      source?: string;
      notification_enabled?: boolean;
      checkin_data?: Record<string, unknown>;
      priority?: number;
      unit_id?: string;
      device_id?: string;
    }) => {
      const priority = params.priority ?? getPriorityFromType(params.ticket_type);
      const prefix = getPrefixFromType(params.ticket_type);
      
      // Get next number for this queue today
      const today = new Date().toISOString().split("T")[0];
      
      // Try to increment counter
      const { data: existing } = await supabase
        .from("queue_counters")
        .select("*")
        .eq("counter_date", today)
        .eq("queue_name", params.queue_name)
        .single();

      let nextNumber: number;
      if (existing) {
        nextNumber = (existing as any).last_number + 1;
        await supabase
          .from("queue_counters")
          .update({ last_number: nextNumber })
          .eq("id", (existing as any).id);
      } else {
        nextNumber = 1;
        await supabase.from("queue_counters").insert({
          counter_date: today,
          queue_name: params.queue_name,
          last_number: 1,
        });
      }

      const ticket_number = `${prefix}${String(nextNumber).padStart(3, "0")}`;

      const insertData: Record<string, unknown> = {
        ticket_number,
        ticket_type: params.ticket_type,
        priority,
        queue_name: params.queue_name,
        sector: params.sector || "geral",
        source: params.source || "totem",
        status: "aguardando",
        notification_enabled: params.notification_enabled || false,
        checkin_data: params.checkin_data || null,
      };
      if (params.patient_id) insertData.patient_id = params.patient_id;
      if (params.appointment_id) insertData.appointment_id = params.appointment_id;
      if (params.unit_id) insertData.unit_id = params.unit_id;
      if (params.device_id) insertData.device_id = params.device_id;

      const { data, error } = await supabase
        .from("queue_tickets")
        .insert(insertData as any)
        .select()
        .single();

      if (error) throw error;

      // Log history
      await supabase.from("queue_history").insert({
        ticket_id: data.id,
        action: "ticket_created",
        new_status: "aguardando",
        details: { source: params.source, ticket_type: params.ticket_type },
      });

      return data as QueueTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue_tickets"] });
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}

export function useCallNextTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { queue_name: string; called_to: string; performed_by?: string }) => {
      // Find next ticket (highest priority first, then oldest)
      const today = new Date().toISOString().split("T")[0];
      const { data: tickets, error: fetchError } = await supabase
        .from("queue_tickets")
        .select("*")
        .eq("queue_name", params.queue_name)
        .eq("status", "aguardando")
        .gte("created_at", `${today}T00:00:00`)
        .lte("created_at", `${today}T23:59:59`)
        .order("priority", { ascending: false })
        .order("created_at", { ascending: true })
        .limit(1);

      if (fetchError) throw fetchError;
      if (!tickets || tickets.length === 0) throw new Error("Nenhuma senha na fila");

      const ticket = tickets[0];
      const { data, error } = await supabase
        .from("queue_tickets")
        .update({
          status: "chamada",
          called_at: new Date().toISOString(),
          called_to: params.called_to,
        })
        .eq("id", ticket.id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("queue_history").insert({
        ticket_id: ticket.id,
        action: "ticket_called",
        old_status: "aguardando",
        new_status: "chamada",
        performed_by: params.performed_by || null,
        details: { called_to: params.called_to },
      });

      return data as QueueTicket;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["queue_tickets"] });
      toast.success(`Senha ${data.ticket_number} chamada!`);
    },
    onError: (error) => {
      toast.error(getUserFriendlyError(error));
    },
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; status: string; performed_by?: string }) => {
      const { data: current } = await supabase
        .from("queue_tickets")
        .select("status")
        .eq("id", params.id)
        .single();

      const updateData: Record<string, unknown> = { status: params.status };
      if (params.status === "em_atendimento") updateData.attended_at = new Date().toISOString();
      if (params.status === "concluida") updateData.completed_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("queue_tickets")
        .update(updateData)
        .eq("id", params.id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from("queue_history").insert({
        ticket_id: params.id,
        action: "status_changed",
        old_status: current?.status || null,
        new_status: params.status,
        performed_by: params.performed_by || null,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["queue_tickets"] });
    },
  });
}

function getPriorityFromType(type: string): number {
  switch (type) {
    case "preferencial_80": return 4;
    case "preferencial_60": return 3;
    case "preferencial": return 2;
    case "retorno_pos_operatorio": return 1;
    case "consulta": return 1;
    default: return 0;
  }
}

function getPrefixFromType(type: string): string {
  switch (type) {
    case "preferencial_80": return "P8";
    case "preferencial_60": return "P6";
    case "preferencial": return "PR";
    case "retorno_pos_operatorio": return "RO";
    case "consulta": return "CO";
    default: return "SN";
  }
}
