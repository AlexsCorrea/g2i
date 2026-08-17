import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Boxes, PackageX, RefreshCcw, Warehouse } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { DemoBanner, KpiCard, chartTooltipStyle } from "./DashboardShared";
import { brl, consumoPorSetor, estoqueCurvaABC, giroEstoque, itensCriticos } from "./demoData";

const statusMap = {
  critico: { label: "Crítico", cls: "bg-destructive/10 text-destructive border-destructive/30" },
  atencao: { label: "Atenção", cls: "bg-warning/10 text-warning border-warning/30" },
  ok: { label: "Normal", cls: "bg-success/10 text-success border-success/30" },
};

export function InventoryDashboard() {
  const valorTotal = estoqueCurvaABC.reduce((s, c) => s + c.valor, 0);
  const itensTotais = estoqueCurvaABC.reduce((s, c) => s + c.itens, 0);
  const criticos = itensCriticos.filter((i) => i.status === "critico").length;
  const giroAtual = giroEstoque[giroEstoque.length - 1];

  return (
    <div className="space-y-6">
      <DemoBanner text="Painel de estoque e suprimentos com dados demonstrativos: curva ABC, consumo por setor, giro e rupturas." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={Warehouse} label="Valor imobilizado" value={brl(valorTotal)} hint={`${itensTotais} itens cadastrados`} color="text-primary" bg="bg-primary/10" />
        <KpiCard icon={RefreshCcw} label="Giro de estoque" value={`${giroAtual.giro}x`} hint="Média mensal" color="text-success" bg="bg-success/10" />
        <KpiCard icon={PackageX} label="Taxa de ruptura" value={`${giroAtual.ruptura}%`} hint="Itens indisponíveis" color="text-warning" bg="bg-warning/10" />
        <KpiCard icon={Boxes} label="Itens abaixo do mínimo" value={criticos} hint="Reposição urgente" color="text-destructive" bg="bg-destructive/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Curva ABC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {estoqueCurvaABC.map((c) => (
              <div key={c.classe} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">Classe {c.classe}</span>
                  <span className="text-muted-foreground">{brl(c.valor)}</span>
                </div>
                <Progress value={c.participacao} className="h-2" />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{c.itens} itens</span>
                  <span>{c.participacao}% do valor</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Consumo por setor (período)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consumoPorSetor} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v / 1000}k`} />
                <YAxis type="category" dataKey="setor" tick={{ fontSize: 11 }} width={110} stroke="hsl(var(--muted-foreground))" />
                <Tooltip {...chartTooltipStyle} formatter={(v: number) => brl(v)} />
                <Bar dataKey="valor" name="Consumo" fill="hsl(210, 85%, 45%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Giro x Ruptura</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={giroEstoque}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="giro" name="Giro (x)" stroke="hsl(160, 70%, 38%)" strokeWidth={2} />
                <Line type="monotone" dataKey="ruptura" name="Ruptura (%)" stroke="hsl(0, 72%, 51%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Itens em ponto de atenção</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {itensCriticos.map((i) => (
              <div key={i.item} className="flex items-center gap-3 rounded-lg border p-2.5">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{i.item}</div>
                  <div className="text-[10px] text-muted-foreground">
                    Saldo {i.saldo} / mín. {i.minimo} · validade {i.validade}
                  </div>
                </div>
                <Badge variant="outline" className={`text-[10px] ${statusMap[i.status].cls}`}>
                  {statusMap[i.status].label}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
