import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Handshake, Target, TrendingUp, Users } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend,
} from "recharts";
import { DemoBanner, KpiCard, chartTooltipStyle } from "./DashboardShared";
import { brl, closers, funilComercial, origemLeads } from "./demoData";

export function CommercialDashboard() {
  const leads = closers.reduce((s, c) => s + c.leads, 0);
  const convertidos = closers.reduce((s, c) => s + c.convertidos, 0);
  const receita = closers.reduce((s, c) => s + c.receita, 0);
  const meta = closers.reduce((s, c) => s + c.meta, 0);
  const conversao = ((convertidos / leads) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <DemoBanner text="Painel comercial / closers com dados demonstrativos: funil, conversão por consultor e origem de leads." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Leads no período" value={leads} color="text-primary" bg="bg-primary/10" />
        <KpiCard icon={Handshake} label="Convertidos" value={convertidos} hint={`Conversão ${conversao}%`} color="text-success" bg="bg-success/10" />
        <KpiCard icon={TrendingUp} label="Receita gerada" value={brl(receita)} color="text-accent" bg="bg-accent/10" />
        <KpiCard icon={Target} label="Atingimento da meta" value={`${((receita / meta) * 100).toFixed(0)}%`} hint={`Meta ${brl(meta)}`} color="text-warning" bg="bg-warning/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Funil comercial</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funilComercial} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="etapa" tick={{ fontSize: 10 }} width={140} stroke="hsl(var(--muted-foreground))" />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="valor" name="Volume" fill="hsl(210, 85%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Origem dos leads</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={origemLeads} dataKey="valor" nameKey="nome" innerRadius={50} outerRadius={88} paddingAngle={2}>
                  {origemLeads.map((o) => <Cell key={o.nome} fill={o.color} />)}
                </Pie>
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Desempenho por closer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {closers.map((c) => {
            const atingimento = (c.receita / c.meta) * 100;
            return (
              <div key={c.nome} className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold">{c.nome}</span>
                  <Badge variant={atingimento >= 100 ? "default" : "secondary"} className="text-[10px]">
                    {atingimento.toFixed(0)}% da meta
                  </Badge>
                </div>
                <Progress value={Math.min(atingimento, 100)} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{c.leads} leads · {c.convertidos} fechados ({((c.convertidos / c.leads) * 100).toFixed(0)}%)</span>
                  <span>{brl(c.receita)} / {brl(c.meta)}</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
