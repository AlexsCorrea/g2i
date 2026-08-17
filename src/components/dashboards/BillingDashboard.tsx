import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DollarSign, FileText, AlertTriangle, TrendingUp, Receipt } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, ComposedChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DemoBanner, KpiCard, chartTooltipStyle } from "./DashboardShared";
import {
  brl, contasPorStatus, faturamentoMensal, faturamentoPorConvenio, topProcedimentosFaturados,
} from "./demoData";

export function BillingDashboard() {
  const totalFaturado = faturamentoMensal.reduce((s, m) => s + m.faturado, 0);
  const totalGlosado = faturamentoMensal.reduce((s, m) => s + m.glosado, 0);
  const totalRecebido = faturamentoMensal.reduce((s, m) => s + m.recebido, 0);
  const taxaGlosa = ((totalGlosado / totalFaturado) * 100).toFixed(1);
  const contasAbertas = contasPorStatus.find((c) => c.status === "Em aberto");

  return (
    <div className="space-y-6">
      <DemoBanner text="Painel de faturamento com dados demonstrativos para apresentação e planejamento de gestão." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={DollarSign} label="Faturado no período" value={brl(totalFaturado)} hint="8 meses acumulados" color="text-primary" bg="bg-primary/10" />
        <KpiCard icon={Receipt} label="Recebido" value={brl(totalRecebido)} hint={`${((totalRecebido / totalFaturado) * 100).toFixed(0)}% de conversão`} color="text-success" bg="bg-success/10" />
        <KpiCard icon={AlertTriangle} label="Glosas" value={brl(totalGlosado)} hint={`Taxa de glosa ${taxaGlosa}%`} color="text-destructive" bg="bg-destructive/10" />
        <KpiCard icon={FileText} label="Contas em aberto" value={contasAbertas?.qtd ?? 0} hint={brl(contasAbertas?.valor ?? 0)} color="text-warning" bg="bg-warning/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Faturamento x Recebimento x Glosa
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={faturamentoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => brl(v)} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="faturado" name="Faturado" fill="hsl(210, 85%, 45%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recebido" name="Recebido" fill="hsl(160, 70%, 38%)" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="glosado" name="Glosa" stroke="hsl(0, 72%, 51%)" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contas por status</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={contasPorStatus} dataKey="qtd" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {contasPorStatus.map((c) => <Cell key={c.status} fill={c.color} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Faturamento por convênio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {faturamentoPorConvenio.map((c) => {
              const max = faturamentoPorConvenio[0].valor;
              return (
                <div key={c.nome} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{c.nome}</span>
                    <span className="text-muted-foreground">{brl(c.valor)}</span>
                  </div>
                  <Progress value={(c.valor / max) * 100} className="h-2" />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>{c.contas} contas</span>
                    <span className={c.glosa > 7 ? "text-destructive" : ""}>Glosa {c.glosa}%</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top procedimentos faturados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topProcedimentosFaturados.map((p, i) => (
              <div key={p.nome} className="flex items-center gap-3 rounded-lg border p-2.5">
                <div className="h-7 w-7 rounded-md bg-muted flex items-center justify-center text-xs font-bold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{p.nome}</div>
                  <div className="text-[10px] text-muted-foreground">{p.qtd} realizados · ticket {brl(p.ticket)}</div>
                </div>
                <Badge variant="secondary" className="text-[10px]">{brl(p.qtd * p.ticket)}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
