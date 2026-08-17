import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, parseISO, differenceInMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar, Clock, CheckCircle2, Timer, UserX, ArrowRight, Stethoscope,
  AlertTriangle, BedDouble, FileText, Activity, ChevronRight, CircleDot, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TodayAppointment, RecentPatient } from "@/hooks/useDashboardStats";
import { useDoctorPendings, useNow } from "@/hooks/useDoctorDay";

const DONE = ["concluido", "finalizado", "atendido"];
const MISSED = ["nao_compareceu", "faltou", "cancelado"];
const RUNNING = ["em_andamento", "em_atendimento", "chegou", "aguardando"];

const typeTone: Record<string, string> = {
  consulta: "bg-primary/10 text-primary border-primary/20",
  retorno: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  exame: "bg-violet-500/10 text-violet-700 border-violet-500/20",
  procedimento: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  cirurgia: "bg-destructive/10 text-destructive border-destructive/20",
};

interface Props {
  appointments: TodayAppointment[] | undefined;
  loadingAppointments: boolean;
  patients: RecentPatient[] | undefined;
  doctorName: string;
}

export function DoctorDayHome({ appointments, loadingAppointments, patients, doctorName }: Props) {
  const navigate = useNavigate();
  const now = useNow();
  const { data: pendingData } = useDoctorPendings();

  const day = useMemo(() => {
    const list = [...(appointments ?? [])].sort(
      (a, b) => +parseISO(a.scheduled_at) - +parseISO(b.scheduled_at),
    );
    const done = list.filter((a) => DONE.includes(a.status));
    const missed = list.filter((a) => MISSED.includes(a.status));
    const running = list.find((a) => ["em_andamento", "em_atendimento"].includes(a.status));
    const upcoming = list.filter(
      (a) => !DONE.includes(a.status) && !MISSED.includes(a.status) && +parseISO(a.scheduled_at) >= now - 15 * 60_000,
    );
    const next = running ?? upcoming[0];
    const waiting = list.filter((a) => RUNNING.includes(a.status)).length;
    const first = list[0] ? parseISO(list[0].scheduled_at) : null;
    const last = list.length ? parseISO(list[list.length - 1].scheduled_at) : null;
    const progress = list.length ? Math.round(((done.length + missed.length) / list.length) * 100) : 0;
    const minutesToNext = next ? differenceInMinutes(parseISO(next.scheduled_at), new Date(now)) : null;
    const loadMinutes = list
      .filter((a) => !MISSED.includes(a.status))
      .reduce((s, a) => s + (a.duration_minutes ?? 30), 0);

    return { list, done, missed, running, upcoming, next, waiting, first, last, progress, minutesToNext, loadMinutes };
  }, [appointments, now]);

  const greeting = () => {
    const h = new Date(now).getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-5">
      {/* ── Hero: resumo do dia + próximo paciente ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 overflow-hidden border-primary/20">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-primary">Meu dia</p>
                <h2 className="text-2xl font-semibold text-foreground mt-0.5">
                  {greeting()}, {/^dr/i.test(doctorName) ? doctorName : `Dr(a). ${doctorName}`}
                </h2>
                <p className="text-sm text-muted-foreground capitalize">
                  {format(new Date(now), "EEEE, d 'de' MMMM", { locale: ptBR })} ·{" "}
                  {day.first && day.last
                    ? `expediente ${format(day.first, "HH:mm")} – ${format(day.last, "HH:mm")}`
                    : "sem agenda registrada"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-foreground tabular-nums">
                  {format(new Date(now), "HH:mm")}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(day.loadMinutes / 60)}h{String(day.loadMinutes % 60).padStart(2, "0")} de carga prevista
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                <span>Progresso do dia</span>
                <span className="font-medium text-foreground">
                  {day.done.length + day.missed.length} de {day.list.length} concluídos
                </span>
              </div>
              <Progress value={day.progress} className="h-2" />
            </div>
          </div>

          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 pt-4">
            <MiniStat icon={Calendar} label="Agendados" value={day.list.length} tone="text-primary" />
            <MiniStat icon={CheckCircle2} label="Atendidos" value={day.done.length} tone="text-emerald-600" />
            <MiniStat icon={Timer} label="Na fila" value={day.waiting} tone="text-amber-600" />
            <MiniStat icon={UserX} label="Faltas" value={day.missed.length} tone="text-destructive" />
          </CardContent>
        </Card>

        {/* Próximo paciente */}
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary" />
              {day.running ? "Em atendimento" : "Próximo paciente"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {loadingAppointments ? (
              <div className="h-28 bg-muted animate-pulse rounded-lg" />
            ) : !day.next ? (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Agenda concluída</p>
                <p className="text-xs text-muted-foreground">Nenhum paciente pendente para hoje</p>
              </div>
            ) : (
              <>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground tabular-nums">
                      {format(parseISO(day.next.scheduled_at), "HH:mm")}
                    </span>
                    {day.minutesToNext !== null && !day.running && (
                      <Badge variant={day.minutesToNext <= 0 ? "destructive" : "secondary"} className="text-[10px]">
                        {day.minutesToNext <= 0 ? "agora" : `em ${day.minutesToNext} min`}
                      </Badge>
                    )}
                    {day.running && (
                      <Badge className="text-[10px] gap-1">
                        <CircleDot className="h-3 w-3 animate-pulse" /> em curso
                      </Badge>
                    )}
                  </div>
                  <p className="text-base font-medium text-foreground mt-2 truncate">
                    {(day.next.patients as any)?.full_name ?? day.next.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{day.next.title}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <Badge variant="outline" className={cn("text-[10px]", typeTone[day.next.appointment_type])}>
                      {day.next.appointment_type}
                    </Badge>
                    {day.next.location && (
                      <Badge variant="outline" className="text-[10px]">{day.next.location}</Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">{day.next.duration_minutes ?? 30} min</Badge>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-4 gap-1.5" onClick={() => navigate("/atendimentos/abertura")}>
                  Iniciar atendimento <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Timeline + laterais ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" /> Linha do tempo de hoje
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/agenda")}>
              Abrir agenda <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent className="max-h-[440px] overflow-y-auto pr-2">
            {loadingAppointments ? (
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />)}
              </div>
            ) : !day.list.length ? (
              <p className="text-sm text-muted-foreground text-center py-10">Nenhum compromisso para hoje</p>
            ) : (
              <ol className="relative pl-4">
                <span className="absolute left-1 top-2 bottom-2 w-px bg-border" />
                {day.list.map((apt) => {
                  const isDone = DONE.includes(apt.status);
                  const isMissed = MISSED.includes(apt.status);
                  const isNext = day.next?.id === apt.id;
                  return (
                    <li key={apt.id} className="relative pl-4 py-1.5">
                      <span
                        className={cn(
                          "absolute -left-3.5 top-4 h-2.5 w-2.5 rounded-full border-2 border-background",
                          isDone ? "bg-emerald-500" : isMissed ? "bg-destructive" : isNext ? "bg-primary animate-pulse" : "bg-muted-foreground/40",
                        )}
                      />
                      <button
                        onClick={() => navigate("/agenda")}
                        className={cn(
                          "w-full flex items-center gap-3 p-2.5 rounded-lg border text-left transition-colors hover:bg-muted/60",
                          isNext ? "border-primary/40 bg-primary/5" : "border-border",
                          isDone && "opacity-70",
                        )}
                      >
                        <div className="w-12 shrink-0 text-center">
                          <div className="text-sm font-semibold tabular-nums">
                            {format(parseISO(apt.scheduled_at), "HH:mm")}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{apt.duration_minutes ?? 30}min</div>
                        </div>
                        <div className="h-8 w-px bg-border" />
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium truncate", isMissed && "line-through text-muted-foreground")}>
                            {(apt.patients as any)?.full_name ?? apt.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {apt.title}{apt.location ? ` · ${apt.location}` : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px] shrink-0", typeTone[apt.appointment_type])}>
                          {apt.appointment_type}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          {/* Pendências clínicas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Pendências clínicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {(pendingData?.pendings ?? []).map((p) => (
                <button
                  key={p.key}
                  onClick={() => navigate(p.path)}
                  className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/60 transition-colors text-left"
                >
                  <span
                    className={cn(
                      "h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold shrink-0",
                      p.tone === "danger" && "bg-destructive/10 text-destructive",
                      p.tone === "warning" && "bg-amber-500/10 text-amber-600",
                      p.tone === "info" && "bg-primary/10 text-primary",
                    )}
                  >
                    {p.count}
                  </span>
                  <span className="text-xs text-foreground flex-1 leading-snug">{p.label}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Meus pacientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Pacientes sob cuidado
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate("/patients")}>
                Ver todos
              </Button>
            </CardHeader>
            <CardContent className="space-y-1">
              {!patients?.length ? (
                <p className="text-xs text-muted-foreground text-center py-6">Nenhum paciente ativo</p>
              ) : (
                patients.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/prontuario/${p.id}`)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/60 transition-colors text-left"
                  >
                    <span className="h-7 w-7 rounded-full bg-primary/10 text-primary text-[10px] font-semibold flex items-center justify-center shrink-0">
                      {p.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{p.full_name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {p.status === "internado"
                          ? `Leito ${p.bed ?? "—"} · Quarto ${p.room ?? "—"}`
                          : "Ambulatorial"}
                      </p>
                    </div>
                    {p.status === "internado" ? (
                      <BedDouble className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    ) : (
                      <Activity className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Atalhos do médico */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Ações rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { label: "Abrir atendimento", path: "/atendimentos/abertura" },
                { label: "Sala de espera", path: "/salas/espera" },
                { label: "Resultados lab.", path: "/laboratorio" },
                { label: "Centro cirúrgico", path: "/agenda/centro-cirurgico" },
              ].map((a) => (
                <Button key={a.path} variant="outline" size="sm" className="text-xs justify-start h-9" onClick={() => navigate(a.path)}>
                  {a.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tone }: { icon: any; label: string; value: number; tone: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-card p-2.5">
      <Icon className={cn("h-4 w-4 shrink-0", tone)} />
      <div>
        <div className={cn("text-lg font-bold leading-none", tone)}>{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}
