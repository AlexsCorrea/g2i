import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const EXCLUDED_STATUSES = ["cancelado", "faltou", "finalizado"];

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

const onlyDigits = (v: unknown) => String(v ?? "").replace(/\D/g, "");
const isDate = (v: unknown) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

function todayRange() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return {
    today,
    start: new Date(`${today}T00:00:00`).toISOString(),
    end: new Date(`${today}T23:59:59`).toISOString(),
  };
}

/** Resolves the patient identified by CPF + birth date. Returns null when credentials don't match. */
async function resolvePatient(cpfRaw: unknown, birthDate: unknown) {
  const cpf = onlyDigits(cpfRaw);
  if (cpf.length !== 11 || !isDate(birthDate)) return null;
  const masked = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  const { data } = await admin
    .from("patients")
    .select("id, full_name, birth_date, phone, health_insurance, health_insurance_number, updated_at")
    .or(`cpf.eq.${cpf},cpf.eq.${masked}`)
    .limit(20);
  return (data || []).find((p: Record<string, unknown>) => p.birth_date === birthDate) || null;
}

/** Confirms the appointment belongs to the identified person (registered or provisional). */
async function resolveAppointment(appointmentId: string, patientId: string | null, birthDate: string) {
  const { start, end } = todayRange();
  const { data } = await admin
    .from("appointments")
    .select("id, patient_id, provisional_birth_date, scheduled_at, status, appointment_type, title, location")
    .eq("id", appointmentId)
    .gte("scheduled_at", start)
    .lte("scheduled_at", end)
    .maybeSingle();
  if (!data) return null;
  if (EXCLUDED_STATUSES.includes(String(data.status))) return null;
  if (data.patient_id) return data.patient_id === patientId ? data : null;
  return data.provisional_birth_date === birthDate ? data : null;
}

function legacyPrefixFromType(type: string): string {
  switch (type) {
    case "preferencial_80": return "P8";
    case "preferencial_60": return "P6";
    case "preferencial": return "PR";
    case "retorno_pos_operatorio": return "RO";
    case "retorno": return "R";
    case "consulta": return "C";
    case "exames": return "E";
    case "financeiro": return "F";
    case "triagem": return "T";
    case "urgencia": return "U";
    default: return "N";
  }
}

function priorityWeight(code: string): number {
  switch (code) {
    case "urgencia": return 100;
    case "preferencial_80": return 80;
    case "preferencial_60": return 60;
    case "preferencial": return 50;
    default: return 0;
  }
}

async function createTicket(params: Record<string, any>) {
  const { today } = todayRange();
  const queue_name = str(params.queue_name, 60) || "recepcao";
  const ticket_type = str(params.ticket_type, 60) || "normal";
  const priorityCode = str(params.priority_code, 40) || "normal";
  const priority = typeof params.priority === "number" ? params.priority : priorityWeight(priorityCode);
  const prefix = (str(params.prefix, 4) || legacyPrefixFromType(ticket_type)).toUpperCase();

  const { data: existing } = await admin
    .from("queue_counters")
    .select("id, last_number")
    .eq("counter_date", today)
    .eq("queue_name", queue_name)
    .maybeSingle();

  let nextNumber = 1;
  if (existing) {
    nextNumber = (existing as any).last_number + 1;
    await admin.from("queue_counters").update({ last_number: nextNumber }).eq("id", (existing as any).id);
  } else {
    await admin.from("queue_counters").insert({ counter_date: today, queue_name, last_number: 1 });
  }

  const insertData: Record<string, unknown> = {
    ticket_number: `${prefix}${String(nextNumber).padStart(3, "0")}`,
    ticket_type,
    priority,
    priority_code: priorityCode,
    queue_name,
    sector: str(params.sector, 60) || "geral",
    source: str(params.source, 30) || "totem",
    status: "aguardando",
    notification_enabled: !!params.notification_enabled,
    checkin_data: params.checkin_data ?? null,
  };
  if (params.patient_id) insertData.patient_id = params.patient_id;
  if (params.appointment_id) insertData.appointment_id = params.appointment_id;
  if (params.unit_id) insertData.unit_id = params.unit_id;
  if (params.device_id) insertData.device_id = params.device_id;

  const { data, error } = await admin.from("queue_tickets").insert(insertData).select().single();
  if (error) throw new Error(error.message);

  await admin.from("queue_history").insert({
    ticket_id: data.id,
    action: "ticket_created",
    new_status: "aguardando",
    details: { source: insertData.source, ticket_type, priority_code: priorityCode },
  });

  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return fail("Método não suportado", 405);

  try {
    const body = await req.json().catch(() => ({}));
    const action = str(body?.action, 40);
    const { start, end } = todayRange();

    switch (action) {
      /** Kiosk / portal check-in search: CPF + birth date required. */
      case "search_checkin": {
        const birthDate = body.birth_date;
        if (!isDate(birthDate)) return fail("Data de nascimento inválida.");
        if (onlyDigits(body.cpf).length !== 11) return fail("CPF inválido.");

        const patient = await resolvePatient(body.cpf, birthDate);
        const appointments: Record<string, unknown>[] = [];

        if (patient) {
          const { data: appts } = await admin
            .from("appointments")
            .select("id, title, scheduled_at, appointment_type, status, location, professional_id, profiles(full_name)")
            .eq("patient_id", patient.id)
            .gte("scheduled_at", start)
            .lte("scheduled_at", end)
            .not("status", "in", `(${EXCLUDED_STATUSES.join(",")})`);
          for (const a of appts || []) {
            appointments.push({
              id: a.id,
              title: a.title,
              scheduled_at: a.scheduled_at,
              appointment_type: a.appointment_type,
              status: a.status,
              location: a.location,
              patient_id: patient.id,
              patient_name: patient.full_name,
              professional_name: (a as any).profiles?.full_name || null,
              is_provisional: false,
            });
          }
        }

        const { data: provAppts } = await admin
          .from("appointments")
          .select("id, title, scheduled_at, appointment_type, status, location, provisional_name, profiles(full_name)")
          .is("patient_id", null)
          .eq("provisional_birth_date", birthDate)
          .gte("scheduled_at", start)
          .lte("scheduled_at", end)
          .not("status", "in", `(${EXCLUDED_STATUSES.join(",")})`);
        for (const a of provAppts || []) {
          if (appointments.some((fa) => fa.id === a.id)) continue;
          appointments.push({
            id: a.id,
            title: a.title,
            scheduled_at: a.scheduled_at,
            appointment_type: a.appointment_type,
            status: a.status,
            location: a.location,
            patient_id: null,
            patient_name: (a as any).provisional_name || "Paciente provisório",
            professional_name: (a as any).profiles?.full_name || null,
            is_provisional: true,
          });
        }

        return json({ patient, appointments });
      }

      /** Portal/kiosk contact data update, restricted to the identified patient. */
      case "update_contact": {
        const patient = await resolvePatient(body.cpf, body.birth_date);
        if (!patient) return fail("Paciente não encontrado.", 404);
        const phone = str(body.phone, 30);
        if (!phone) return fail("Telefone é obrigatório.");
        const { error } = await admin
          .from("patients")
          .update({
            phone,
            health_insurance: str(body.insurance, 120) || null,
            health_insurance_number: str(body.insurance_number, 60) || null,
          })
          .eq("id", patient.id);
        if (error) return fail("Não foi possível atualizar o cadastro.");
        return json({ ok: true });
      }

      /** Converts a provisional appointment into a registered patient. */
      case "complete_registration": {
        const birthDate = body.birth_date;
        const cpf = onlyDigits(body.cpf);
        const name = str(body.name, 150);
        const appointmentId = str(body.appointment_id, 60);
        if (!isDate(birthDate)) return fail("Data de nascimento inválida.");
        if (cpf.length !== 11) return fail("CPF inválido.");
        if (name.length < 3) return fail("Nome completo é obrigatório.");
        if (!appointmentId) return fail("Agendamento inválido.");

        const appt = await resolveAppointment(appointmentId, null, birthDate);
        if (!appt) return fail("Agendamento não encontrado.", 404);

        const { data: newPatient, error: cErr } = await admin
          .from("patients")
          .insert({
            full_name: name,
            birth_date: birthDate,
            cpf,
            phone: str(body.phone, 30) || null,
            health_insurance: str(body.insurance, 120) || null,
            gender: "nao_informado",
          })
          .select("id, full_name")
          .single();
        if (cErr) return fail("Não foi possível concluir o cadastro.");

        await admin
          .from("appointments")
          .update({ patient_id: newPatient.id, provisional_name: null, provisional_birth_date: null })
          .eq("id", appointmentId);

        return json({ patient: newPatient });
      }

      /** Confirms an appointment and issues the queue ticket in one guarded step. */
      case "confirm_checkin": {
        const birthDate = body.birth_date;
        if (!isDate(birthDate)) return fail("Data de nascimento inválida.");
        const appointmentId = str(body.appointment_id, 60);
        if (!appointmentId) return fail("Agendamento inválido.");
        const patient = await resolvePatient(body.cpf, birthDate);
        const appt = await resolveAppointment(appointmentId, patient?.id ?? null, birthDate);
        if (!appt) return fail("Agendamento não encontrado.", 404);

        await admin.from("appointments").update({ status: "confirmado" }).eq("id", appointmentId);

        const ticket = await createTicket({
          patient_id: appt.patient_id,
          appointment_id: appointmentId,
          ticket_type: str(body.ticket_type, 60) || "consulta",
          queue_name: str(body.queue_name, 60) || "recepcao",
          source: str(body.source, 30) || "totem",
          unit_id: body.unit_id,
          device_id: body.device_id,
          notification_enabled: body.notification_enabled,
          checkin_data: { checkin_at: new Date().toISOString(), source: str(body.source, 30) || "totem", appointment_type: appt.appointment_type },
        });
        return json({ ticket });
      }

      /** Ticket emission (kiosk/portal). Linking to a patient requires CPF + birth date. */
      case "create_ticket": {
        let patientId: string | null = null;
        if (body.patient_id || body.cpf) {
          const patient = await resolvePatient(body.cpf, body.birth_date);
          if (!patient) return fail("Não foi possível validar os dados do paciente.", 403);
          patientId = patient.id;
        }
        const ticket = await createTicket({ ...body, patient_id: patientId, appointment_id: undefined });
        return json({ ticket });
      }

      /** Ticket tracking by its own id (opaque UUID acts as the access token). */
      case "get_ticket": {
        const ticketId = str(body.ticket_id, 60);
        if (!ticketId) return fail("Senha inválida.");
        const { data } = await admin
          .from("queue_tickets")
          .select("id, ticket_number, ticket_type, priority, queue_name, sector, status, source, called_at, called_to, attended_at, completed_at, created_at, updated_at, notification_enabled, patients(full_name, nome_social)")
          .eq("id", ticketId)
          .maybeSingle();
        if (!data) return fail("Senha não encontrada.", 404);
        return json({ ticket: data });
      }

      /** Anonymous waiting list used to compute queue position (no personal data). */
      case "waiting_list": {
        const { data } = await admin
          .from("queue_tickets")
          .select("id, ticket_number, priority, status, created_at")
          .eq("queue_name", str(body.queue_name, 60) || "recepcao")
          .eq("status", "aguardando")
          .gte("created_at", start)
          .lte("created_at", end)
          .order("priority", { ascending: false })
          .order("created_at", { ascending: true });
        return json({ tickets: data || [] });
      }

      /** Lobby TV panel state: called tickets and recent history. */
      case "tv_state": {
        const { data } = await admin
          .from("queue_tickets")
          .select("id, ticket_number, ticket_type, priority, priority_code, queue_name, sector, status, called_at, called_to, created_at, patients(full_name, nome_social)")
          .in("status", ["chamada", "em_atendimento", "concluida", "ausente"])
          .gte("created_at", start)
          .not("called_at", "is", null)
          .order("called_at", { ascending: false })
          .limit(10);
        return json({ tickets: data || [] });
      }

      default:
        return fail("Ação inválida.");
    }
  } catch (err) {
    console.error("[queue-public] error", err);
    return fail("Não foi possível concluir a operação.", 500);
  }
});
