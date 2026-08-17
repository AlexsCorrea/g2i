import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownRight, ArrowUpRight, Banknote, PiggyBank, Percent, CalendarClock } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DemoBanner, KpiCard, chartTooltipStyle } from "./DashboardShared";
import { brl, contasCriticas, despesasPorCategoria, fluxoCaixa, inadimplencia } from "./demoData";

export function FinanceDashboard() {
  const entradas = fluxoCaixa.reduce((s, m) => s + m.entradas, 0);
  const saidas = fluxoCaixa.reduce((s, m) => s + m.saidas, 0);
  const resultado = entradas - saidas;
  const margem = ((resultado / entradas) * 100).toFixed(1);
  const inadAtual = inadimplencia[inadimplencia.length - 1].percentual;

  return (
    <div className="space-y-6">
      <DemoBanner text="Painel financeiro com dados demonstrativos: fluxo de caixa, despesas, inadimplência e vencimentos críticos." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={ArrowUpRight} label="Entradas acumuladas" value={brl(entradas)} color="text-success" bg="bg-success/10" />
        <KpiCard icon={ArrowDownRight} label="Saídas acumuladas" value={brl(saidas)} color="text-destructive" bg="bg-destructive/10" />
        <KpiCard icon={PiggyBank} label="Resultado do período" value={brl(resultado)} hint={`Margem ${margem}%`} color="text-primary" bg="bg-primary/10" />
        <KpiCard icon={Percent} label="Inadimplência atual" value={`${inadAtual}%`} hint="Sobre recebíveis vencidos" color="text-warning" bg="bg-warning/10" />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" /> Fluxo de caixa mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fluxoCaixa}>
              <defs>
                <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 70%, 38%)" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="hsl(160, 70%, 38%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSai" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip {...chartTooltipStyle} formatter={(v: number) => brl(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="entradas" name="Entradas" stroke="hsl(160, 70%, 38%)" fill="url(#gEnt)" strokeWidth={2} />
              <Area type="monotone" dataKey="saidas" name="Saídas" stroke="hsl(0, 72%, 51%)" fill="url(#gSai)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Despesas por categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={despesasPorCategoria} dataKey="valor" nameKey="nome" outerRadius={85}>
                  {despesasPorCategoria.map((d) => <Cell key={d.nome} fill={d.color} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => brl(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {despesasPorCategoria.map((d) => (
                <div key={d.nome} className="flex items-center gap-2 text-[11px]">
                  <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                  <span className="flex-1 truncate">{d.nome}</span>
                  <span className="text-muted-foreground">{brl(d.valor)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Evolução da inadimplência</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={inadimplencia}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="percentual" name="Inadimplência" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Vencimentos críticos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {contasCriticas.map((c) => (
              <div key={c.descricao} className="rounded-lg border p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium truncate">{c.descricao}</span>
                  <Badge variant={c.tipo === "pagar" ? "destructive" : "secondary"} className="text-[10px] shrink-0">
                    {c.tipo === "pagar" ? "A pagar" : "A receber"}
                  </Badge>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>Vence {c.vencimento}</span>
                  <span className="font-semibold">{brl(c.valor)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
