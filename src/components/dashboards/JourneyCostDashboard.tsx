import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, HeartHandshake, Route, TrendingDown, Wallet } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, ComposedChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DemoBanner, KpiCard, chartTooltipStyle } from "./DashboardShared";
import {
  brl, custoEstruturaTipo, custoPorLinha, custoPorPaciente, jornadaEtapas,
  jornadaTempoTotal, motivosAbandono,
} from "./demoData";

export function JourneyCostDashboard() {
  const tempoTotal = jornadaEtapas.reduce((s, e) => s + e.tempoMedio, 0);
  const conclusao = Math.round((jornadaEtapas[jornadaEtapas.length - 1].pacientes / jornadaEtapas[0].pacientes) * 100);
  const npsAtual = jornadaTempoTotal[jornadaTempoTotal.length - 1].nps;
  const receitaTotal = custoPorLinha.reduce((s, l) => s + l.receita, 0);
  const custoTotal = custoPorLinha.reduce((s, l) => s + l.custo, 0);
  const margem = (((receitaTotal - custoTotal) / receitaTotal) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <DemoBanner text="Jornada do paciente e custos assistenciais com dados demonstrativos: tempos por etapa, abandono, margem por linha de cuidado." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Clock} label="Tempo total da jornada" value={`${tempoTotal} min`} hint="Da chegada ao desfecho" color="text-primary" bg="bg-primary/10" />
        <KpiCard icon={Route} label="Taxa de conclusão" value={`${conclusao}%`} hint="Pacientes que finalizam o fluxo" color="text-success" bg="bg-success/10" />
        <KpiCard icon={HeartHandshake} label="NPS atual" value={npsAtual} hint="Satisfação do paciente" color="text-info" bg="bg-info/10" />
        <KpiCard icon={Wallet} label="Margem assistencial" value={`${margem}%`} hint={`${brl(receitaTotal - custoTotal)} de resultado`} color="text-accent" bg="bg-accent/10" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" /> Funil da jornada do paciente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jornadaEtapas.map((e) => {
            const pct = (e.pacientes / jornadaEtapas[0].pacientes) * 100;
            return (
              <div key={e.etapa} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{e.etapa}</span>
                  <span className="text-muted-foreground">
                    {e.pacientes} pacientes · {e.tempoMedio} min
                  </span>
                </div>
                <Progress value={pct} className="h-2.5" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{pct.toFixed(0)}% do volume inicial</span>
                  <span className={e.sla < 80 ? "text-destructive" : e.sla < 90 ? "text-warning" : "text-success"}>
                    SLA {e.sla}%
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo de jornada x NPS</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={jornadaTempoTotal}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="l" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar yAxisId="l" dataKey="minutos" name="Minutos" fill="hsl(210, 85%, 45%)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="r" type="monotone" dataKey="nps" name="NPS" stroke="hsl(160, 70%, 38%)" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-destructive" /> Motivos de abandono
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={motivosAbandono} dataKey="valor" nameKey="motivo" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {motivosAbandono.map((m) => <Cell key={m.motivo} fill={m.color} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita x custo por linha de cuidado</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={custoPorLinha}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="linha" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="receita" name="Receita" fill="hsl(160, 70%, 38%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="custo" name="Custo" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Estrutura de custos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {custoEstruturaTipo.map((c) => (
              <div key={c.nome} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>{c.nome}</span>
                  <Badge variant="secondary" className="text-[10px]">{c.valor}%</Badge>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.valor}%`, background: c.color }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t space-y-2">
              {custoPorPaciente.slice(-3).map((m) => (
                <div key={m.mes} className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">{m.mes}</span>
                  <span>Custo {brl(m.custoMedio)}</span>
                  <span className="text-success">Receita {brl(m.receitaMedia)}</span>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground">Custo e receita médios por paciente atendido.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
