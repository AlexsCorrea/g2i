import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO, differenceInYears, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Stethoscope, Users, FlaskConical, BedDouble, Scissors, Pill, Sparkles,
  Calendar, ClipboardList, FileText, Microscope, ArrowRight, Clock,
  AlertTriangle, PlayCircle, Activity, Printer, DoorOpen, LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DoctorDayHome } from "@/components/dashboard/DoctorDayHome";
import { useTodayAppointments, useRecentPatients } from "@/hooks/useDashboardStats";
import {
  useDoctorQueue, useDoctorLabResults, useDoctorExamRequests,
  useDoctorInpatients, useDoctorSurgeries, useDoctorPrescriptions,
} from "@/hooks/useDoctorRoom";

const statusTone: Record<string, string> = {
  chegou: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  em_espera: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  em_andamento: "bg-primary/10 text-primary border-primary/20",
  confirmado: "bg-sky-500/10 text-sky-700 border-sky-500/20",
  agendado: "bg-muted text-muted-foreground border-border",
  encaixe: "bg-violet-500/10 text-violet-700 border-violet-500/20",
};

const age = (d?: string | null) => (d ? `${differenceInYears(new Date(), parseISO(d))}a` : "—");

export default function SalaMedico() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: appointments, isLoading } = useTodayAppointments();
  const { data: patients } = useRecentPatients();
  const { data: queue } = useDoctorQueue();
  const { data: labResults } = useDoctorLabResults();
  const { data: examRequests } = useDoctorExamRequests();
  const { data: inpatients } = useDoctorInpatients();
  const { data: surgeries } = useDoctorSurgeries();
  const { data: prescriptions } = useDoctorPrescriptions();

  const doctorName = profile?.full_name ?? "Doutor(a)";

  const waiting = useMemo(
    () => (queue ?? []).filter((q) => ["chegou", "em_espera", "em_andamento", "encaixe"].includes(q.status)),
    [queue],
  );
  const criticals = useMemo(() => (labResults ?? []).filter((r: any) => r.is_critical), [labResults]);

  const counters = [
    { label: "Na sala de espera", value: waiting.length, icon: DoorOpen, tone: "text-amber-600" },
    { label: "Agenda de hoje", value: appointments?.length ?? 0, icon: Calendar, tone: "text-primary" },
    { label: "Resultados críticos", value: criticals.length, icon: AlertTriangle, tone: "text-destructive" },
    { label: "Cirurgias hoje", value: surgeries?.length ?? 0, icon: Scissors, tone: "text-violet-600" },
    { label: "Internados", value: inpatients?.length ?? 0, icon: BedDouble, tone: "text-sky-600" },
    { label: "Prescrições ativas", value: prescriptions?.length ?? 0, icon: Pill, tone: "text-emerald-600" },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-6 space-y-5">
      {/* Cabeçalho */}
      <div className="rounded-xl border bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">Sala do Profissional</p>
              <h1 className="text-2xl font-semibold text-foreground">{doctorName}</h1>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.specialty ? `${profile.specialty} · ` : ""}
                {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => navigate("/atendimentos/abertura")} className="gap-1.5">
              <PlayCircle className="h-4 w-4" /> Abrir atendimento
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/agenda")} className="gap-1.5">
              <Calendar className="h-4 w-4" /> Minha agenda
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate("/agenda/imprimir")} className="gap-1.5">
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2.5 mt-4">
          {counters.map((c) => (
            <div key={c.label} className="rounded-lg border bg-card p-3 flex items-center gap-2.5">
              <c.icon className={cn("h-4 w-4 shrink-0", c.tone)} />
              <div>
                <div className={cn("text-xl font-bold leading-none", c.tone)}>{c.value}</div>
                <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{c.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Tabs defaultValue="dia">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="dia" className="gap-1.5"><Activity className="h-4 w-4" /> Meu dia</TabsTrigger>
          <TabsTrigger value="fila" className="gap-1.5"><Users className="h-4 w-4" /> Fila de atendimento</TabsTrigger>
          <TabsTrigger value="resultados" className="gap-1.5"><FlaskConical className="h-4 w-4" /> Resultados & exames</TabsTrigger>
          <TabsTrigger value="internados" className="gap-1.5"><BedDouble className="h-4 w-4" /> Internados & cirurgias</TabsTrigger>
          <TabsTrigger value="prescricoes" className="gap-1.5"><Pill className="h-4 w-4" /> Prescrições</TabsTrigger>
          <TabsTrigger value="ferramentas" className="gap-1.5"><Sparkles className="h-4 w-4" /> Ferramentas</TabsTrigger>
        </TabsList>

        {/* MEU DIA */}
        <TabsContent value="dia" className="mt-4">
          <DoctorDayHome
            appointments={appointments}
            loadingAppointments={isLoading}
            patients={patients}
            doctorName={doctorName}
          />
        </TabsContent>

        {/* FILA */}
        <TabsContent value="fila" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Pacientes do dia ({queue?.length ?? 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[560px]">
                <div className="space-y-2 pr-2">
                  {!queue?.length && (
                    <p className="text-sm text-muted-foreground text-center py-10">Nenhum paciente na fila hoje.</p>
                  )}
                  {(queue ?? []).map((q) => {
                    const late = differenceInMinutes(new Date(), parseISO(q.scheduled_at));
                    return (
                      <div key={q.id} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                        <div className="w-14 text-center shrink-0">
                          <div className="text-sm font-semibold tabular-nums">{format(parseISO(q.scheduled_at), "HH:mm")}</div>
                          <div className="text-[10px] text-muted-foreground">{q.duration_minutes ?? 30}min</div>
                        </div>
                        <div className="h-9 w-px bg-border" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {q.patients?.full_name ?? q.title}
                            <span className="text-xs text-muted-foreground ml-2">{age(q.patients?.birth_date)}</span>
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {q.title}{q.location ? ` · ${q.location}` : ""}
                          </p>
                        </div>
                        {late > 10 && ["chegou", "em_espera"].includes(q.status) && (
                          <Badge variant="outline" className="text-[10px] gap-1 border-amber-500/30 text-amber-700">
                            <Clock className="h-3 w-3" /> {late}min
                          </Badge>
                        )}
                        <Badge variant="outline" className={cn("text-[10px] shrink-0", statusTone[q.status])}>
                          {q.status.replace("_", " ")}
                        </Badge>
                        <Button
                          size="sm"
                          variant={["chegou", "em_andamento"].includes(q.status) ? "default" : "outline"}
                          className="shrink-0 gap-1"
                          onClick={() => (q.patient_id ? navigate(`/prontuario/${q.patient_id}`) : navigate("/atendimentos/abertura"))}
                        >
                          Atender <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESULTADOS */}
        <TabsContent value="resultados" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FlaskConical className="h-4 w-4 text-primary" /> Resultados laboratoriais recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {!labResults?.length && <p className="text-sm text-muted-foreground py-8 text-center">Sem resultados.</p>}
              {(labResults ?? []).map((r: any) => (
                <div key={r.id} className="flex items-center gap-2 rounded-md border p-2.5">
                  <span className={cn(
                    "h-2 w-2 rounded-full shrink-0",
                    r.is_critical ? "bg-destructive" : r.is_abnormal ? "bg-amber-500" : "bg-emerald-500",
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      Resultado {r.value ?? "—"} {r.unit ?? ""}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {format(parseISO(r.created_at), "dd/MM HH:mm")} · {r.status}
                    </p>
                  </div>
                  {r.is_critical && <Badge variant="destructive" className="text-[10px]">crítico</Badge>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/laboratorio")}>
                Abrir laboratório
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Microscope className="h-4 w-4 text-primary" /> Solicitações de exames
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {!examRequests?.length && <p className="text-sm text-muted-foreground py-8 text-center">Sem solicitações.</p>}
              {(examRequests ?? []).map((e: any) => (
                <button
                  key={e.id}
                  onClick={() => e.patient_id && navigate(`/prontuario/${e.patient_id}`)}
                  className="w-full flex items-center gap-2 rounded-md border p-2.5 text-left hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{e.exam_type}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {e.patients?.full_name ?? "Paciente"} · {e.exam_category ?? "geral"}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{e.status}</Badge>
                </button>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/diagnostico/laudos")}>
                Abrir laudos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INTERNADOS & CIRURGIAS */}
        <TabsContent value="internados" className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-primary" /> Pacientes internados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {!inpatients?.length && <p className="text-sm text-muted-foreground py-8 text-center">Nenhum internado.</p>}
              {(inpatients ?? []).map((p: any) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/prontuario/${p.id}`)}
                  className="w-full flex items-center gap-2.5 rounded-md border p-2.5 text-left hover:bg-muted/50"
                >
                  <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
                    {p.full_name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{p.full_name} <span className="text-muted-foreground">{age(p.birth_date)}</span></p>
                    <p className="text-[10px] text-muted-foreground">
                      Leito {p.bed ?? "—"} · Quarto {p.room ?? "—"}
                      {p.admission_date ? ` · desde ${format(parseISO(p.admission_date), "dd/MM")}` : ""}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Scissors className="h-4 w-4 text-violet-600" /> Cirurgias de hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {!surgeries?.length && <p className="text-sm text-muted-foreground py-8 text-center">Sem cirurgias hoje.</p>}
              {(surgeries ?? []).map((s: any) => (
                <div key={s.id} className="flex items-center gap-2.5 rounded-md border p-2.5">
                  <div className="w-12 text-center shrink-0">
                    <div className="text-xs font-semibold tabular-nums">{s.start_time?.slice(0, 5) ?? "--:--"}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{s.procedure_type}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{s.patients?.full_name ?? "Paciente"}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{s.status}</Badge>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/agenda/centro-cirurgico")}>
                Centro cirúrgico
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PRESCRIÇÕES */}
        <TabsContent value="prescricoes" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Pill className="h-4 w-4 text-emerald-600" /> Prescrições ativas em acompanhamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {!prescriptions?.length && <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma prescrição ativa.</p>}
              {(prescriptions ?? []).map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => m.patient_id && navigate(`/prontuario/${m.patient_id}`)}
                  className="w-full flex items-center gap-2.5 rounded-md border p-2.5 text-left hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{m.name} · {m.dosage}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {m.patients?.full_name ?? "Paciente"} · {m.route ?? "—"} · {m.frequency ?? "—"}
                    </p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FERRAMENTAS */}
        <TabsContent value="ferramentas" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {[
              { label: "Prontuário do paciente", desc: "Buscar e abrir prontuários", icon: FileText, path: "/patients" },
              { label: "Abertura de atendimento", desc: "Iniciar novo atendimento", icon: ClipboardList, path: "/atendimentos/abertura" },
              { label: "Sala de espera", desc: "Acompanhar chegada de pacientes", icon: DoorOpen, path: "/salas/espera" },
              { label: "Agenda", desc: "Dia, semana e mês", icon: Calendar, path: "/agenda" },
              { label: "Centro cirúrgico", desc: "Mapa cirúrgico", icon: Scissors, path: "/agenda/centro-cirurgico" },
              { label: "Laboratório", desc: "Resultados e laudos", icon: FlaskConical, path: "/laboratorio" },
              { label: "Diagnóstico por imagem", desc: "Laudos e exames", icon: Microscope, path: "/diagnostico/laudos" },
              { label: "Internados", desc: "Pacientes sob cuidado", icon: BedDouble, path: "/assistencial/internados" },
              { label: "Farmácia", desc: "Prescrições e dispensação", icon: Pill, path: "/assistencial/farmacia" },
              { label: "Indicadores", desc: "Produção e desempenho", icon: LineChart, path: "/dashboards" },
              { label: "Imprimir agenda", desc: "Versão para impressão", icon: Printer, path: "/agenda/imprimir" },
              { label: "Relatórios da agenda", desc: "Produção por período", icon: Activity, path: "/agenda/relatorios" },
            ].map((t) => (
              <button
                key={t.path + t.label}
                onClick={() => navigate(t.path)}
                className="rounded-xl border bg-card p-4 text-left hover:border-primary/40 hover:bg-primary/5 transition-colors"
              >
                <t.icon className="h-5 w-5 text-primary mb-2" />
                <p className="text-sm font-medium text-foreground">{t.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
