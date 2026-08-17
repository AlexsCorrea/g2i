import { useMemo } from "react";
import {
  Activity, TrendingUp, TrendingDown, HeartPulse, Pill, FlaskConical,
  Clock, ShieldCheck, Thermometer, Droplets, CalendarCheck, AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Painéis demonstrativos do prontuário.
 * ATENÇÃO: dados fictícios (demonstração / apresentação).
 */

const days = ["01/08", "02/08", "03/08", "04/08", "05/08", "06/08", "07/08", "08/08", "09/08", "10/08"];

const vitalsTrend = days.map((d, i) => ({
  dia: d,
  fc: 88 + Math.round(Math.sin(i / 1.6) * 9),
  pas: 128 + Math.round(Math.cos(i / 2) * 10),
  pad: 78 + Math.round(Math.sin(i / 2.4) * 6),
  temp: +(36.4 + Math.abs(Math.sin(i / 3)) * 1.1).toFixed(1),
  spo2: 95 + Math.round(Math.abs(Math.cos(i / 2.2)) * 3),
}));

const fluidBalance = days.map((d, i) => ({
  dia: d,
  entrada: 1800 + i * 40 + (i % 3) * 120,
  saida: 1650 + i * 35 + (i % 4) * 100,
}));

const painScore = days.map((d, i) => ({ dia: d, dor: Math.max(0, 8 - i * 0.7 + (i % 3 === 0 ? 1 : 0)) }));

const adherence = [
  { nome: "Administrado", valor: 84 },
  { nome: "Atrasado", valor: 11 },
  { nome: "Não administrado", valor: 5 },
];

const adherenceColors = ["hsl(var(--primary))", "hsl(var(--warning, 38 92% 50%))", "hsl(var(--destructive))"];

const labTrend = [
  { exame: "Hemoglobina", ref: 100, atual: 88 },
  { exame: "Leucócitos", ref: 100, atual: 132 },
  { exame: "Creatinina", ref: 100, atual: 118 },
  { exame: "PCR", ref: 100, atual: 165 },
  { exame: "Sódio", ref: 100, atual: 97 },
  { exame: "Potássio", ref: 100, atual: 104 },
];

const riskRadar = [
  { eixo: "Queda (Morse)", valor: 65 },
  { eixo: "Lesão por pressão (Braden)", valor: 48 },
  { eixo: "Nível de consciência", valor: 88 },
  { eixo: "Risco nutricional", valor: 42 },
  { eixo: "Risco infeccioso", valor: 57 },
  { eixo: "Adesão terapêutica", valor: 84 },
];

const careTimeline = [
  { turno: "Manhã", evolucoes: 3, prescricoes: 2, exames: 4 },
  { turno: "Tarde", evolucoes: 2, prescricoes: 1, exames: 2 },
  { turno: "Noite", evolucoes: 2, prescricoes: 3, exames: 1 },
];

const upcoming = [
  { titulo: "Retorno ambulatorial — Pediatria", data: "24/08/2026 09:30", tipo: "Consulta" },
  { titulo: "Hemograma completo + PCR", data: "19/08/2026 07:00", tipo: "Exame" },
  { titulo: "Sessão de fisioterapia respiratória", data: "18/08/2026 15:00", tipo: "Terapia" },
  { titulo: "Reavaliação nutricional", data: "20/08/2026 11:00", tipo: "Multi" },
];

interface KpiProps {
  label: string;
  value: string;
  helper?: string;
  trend?: "up" | "down" | "flat";
  icon: React.ElementType;
  tone?: "default" | "warning" | "danger" | "success";
}

function Kpi({ label, value, helper, trend, icon: Icon, tone = "default" }: KpiProps) {
  const toneClass =
    tone === "danger" ? "text-destructive bg-destructive/10"
    : tone === "warning" ? "text-amber-600 bg-amber-500/10"
    : tone === "success" ? "text-emerald-600 bg-emerald-500/10"
    : "text-primary bg-primary/10";
  const TrendIcon = trend === "down" ? TrendingDown : TrendingUp;
  return (
    <div className="medical-card p-4 flex items-start gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${toneClass}`}>
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold text-foreground leading-tight">{value}</p>
        {helper && (
          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
            {trend && <TrendIcon className="h-3 w-3" />}
            {helper}
          </p>
        )}
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="medical-card p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="h-[240px]">{children}</div>
    </div>
  );
}

const axisProps = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  contentStyle: {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
    color: "hsl(var(--foreground))",
  },
} as const;

export function PatientBoards({ patientName }: { patientName?: string }) {
  const nps = useMemo(() => 72, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Painéis do Paciente</h2>
          <p className="text-xs text-muted-foreground">
            Visão consolidada de evolução clínica, terapêutica e assistencial{patientName ? ` — ${patientName}` : ""}
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] gap-1 border-amber-500/40 text-amber-600 bg-amber-500/10">
          <AlertTriangle className="h-3 w-3" /> Dados demonstrativos
        </Badge>
      </div>

      <Tabs defaultValue="clinico" className="w-full">
        <TabsList className="bg-muted/50 h-9">
          <TabsTrigger value="clinico" className="text-xs">Clínico</TabsTrigger>
          <TabsTrigger value="terapeutico" className="text-xs">Terapêutico</TabsTrigger>
          <TabsTrigger value="risco" className="text-xs">Risco e Qualidade</TabsTrigger>
          <TabsTrigger value="jornada" className="text-xs">Jornada</TabsTrigger>
        </TabsList>

        {/* CLÍNICO */}
        <TabsContent value="clinico" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Freq. cardíaca média" value="89 bpm" helper="+4% vs. semana anterior" trend="up" icon={HeartPulse} />
            <Kpi label="Temperatura máx." value="37,6 °C" helper="Pico em 05/08" trend="down" icon={Thermometer} tone="warning" />
            <Kpi label="SpO₂ média" value="96%" helper="Estável nas últimas 72h" trend="flat" icon={Activity} tone="success" />
            <Kpi label="Balanço hídrico 24h" value="+180 ml" helper="Positivo há 3 dias" trend="up" icon={Droplets} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Sinais vitais — tendência 10 dias" subtitle="FC, PA sistólica e diastólica">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vitalsTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" {...axisProps} />
                  <YAxis {...axisProps} />
                  <RTooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="fc" name="FC" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pas" name="PAS" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="pad" name="PAD" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Balanço hídrico" subtitle="Entradas x saídas (ml)">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fluidBalance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" {...axisProps} />
                  <YAxis {...axisProps} />
                  <RTooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="entrada" name="Entrada" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                  <Area type="monotone" dataKey="saida" name="Saída" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.15)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Escala de dor" subtitle="Autoavaliação 0-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={painScore}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="dia" {...axisProps} />
                  <YAxis domain={[0, 10]} {...axisProps} />
                  <RTooltip {...tooltipStyle} />
                  <Bar dataKey="dor" name="Dor" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Exames laboratoriais" subtitle="% em relação ao valor de referência">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={labTrend} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" {...axisProps} />
                  <YAxis type="category" dataKey="exame" width={90} {...axisProps} />
                  <RTooltip {...tooltipStyle} />
                  <Bar dataKey="atual" name="% do referencial" radius={[0, 4, 4, 0]}>
                    {labTrend.map((entry) => (
                      <Cell
                        key={entry.exame}
                        fill={entry.atual > 130 ? "hsl(var(--destructive))" : entry.atual > 110 ? "hsl(38 92% 50%)" : "hsl(var(--primary))"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* TERAPÊUTICO */}
        <TabsContent value="terapeutico" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Adesão à prescrição" value="84%" helper="Meta institucional: 95%" trend="down" icon={Pill} tone="warning" />
            <Kpi label="Doses do dia" value="18 / 21" helper="3 pendentes no turno noite" icon={CalendarCheck} />
            <Kpi label="Exames pendentes" value="2" helper="1 com coleta atrasada" icon={FlaskConical} tone="danger" />
            <Kpi label="Tempo médio de checagem" value="12 min" helper="-3 min vs. média da unidade" trend="down" icon={Clock} tone="success" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Checagem de medicamentos" subtitle="Distribuição das doses da semana">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RTooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Pie data={adherence} dataKey="valor" nameKey="nome" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {adherence.map((entry, i) => (
                      <Cell key={entry.nome} fill={adherenceColors[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <div className="medical-card p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Metas terapêuticas</h3>
                <p className="text-[11px] text-muted-foreground">Progresso do plano de cuidado</p>
              </div>
              {[
                { label: "Controle da febre (&lt; 37,5 °C por 48h)", value: 70 },
                { label: "Desmame de oxigênio", value: 45 },
                { label: "Aceitação da dieta oral", value: 82 },
                { label: "Deambulação assistida", value: 30 },
                { label: "Plano de alta preenchido", value: 60 },
              ].map((m) => (
                <div key={m.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-foreground" dangerouslySetInnerHTML={{ __html: m.label }} />
                    <span className="text-muted-foreground">{m.value}%</span>
                  </div>
                  <Progress value={m.value} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* RISCO */}
        <TabsContent value="risco" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Risco de queda" value="Moderado" helper="Morse 45 pontos" icon={AlertTriangle} tone="warning" />
            <Kpi label="Risco de lesão por pressão" value="Baixo" helper="Braden 18 pontos" icon={ShieldCheck} tone="success" />
            <Kpi label="Eventos adversos" value="0" helper="Nenhum nos últimos 30 dias" icon={ShieldCheck} tone="success" />
            <Kpi label="Precauções ativas" value="Contato" helper="Desde 04/08" icon={ShieldCheck} tone="warning" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="Perfil de risco" subtitle="Escalas normalizadas (0-100)">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={riskRadar} outerRadius={90}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="eixo" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar dataKey="valor" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" />
                  <RTooltip {...tooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Produção assistencial por turno" subtitle="Registros das últimas 24h">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={careTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="turno" {...axisProps} />
                  <YAxis {...axisProps} />
                  <RTooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="evolucoes" name="Evoluções" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="prescricoes" name="Prescrições" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="exames" name="Exames" fill="hsl(38 92% 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* JORNADA */}
        <TabsContent value="jornada" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi label="Tempo de internação" value="6 dias" helper="Média da especialidade: 5,2 dias" trend="up" icon={Clock} />
            <Kpi label="Consultas no ano" value="11" helper="3 no último trimestre" icon={CalendarCheck} />
            <Kpi label="Satisfação (NPS)" value={`${nps}`} helper="Zona de qualidade" trend="up" icon={ShieldCheck} tone="success" />
            <Kpi label="Faltas em agendamentos" value="1" helper="Taxa de absenteísmo 9%" icon={AlertTriangle} tone="warning" />
          </div>

          <div className="medical-card p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Próximos compromissos</h3>
            <div className="divide-y divide-border">
              {upcoming.map((item) => (
                <div key={item.titulo} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">{item.titulo}</p>
                    <p className="text-[11px] text-muted-foreground">{item.data}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{item.tipo}</Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
