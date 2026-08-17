import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export function DemoBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-muted-foreground">
      <Info className="h-3.5 w-3.5 text-warning shrink-0" />
      <span>{text}</span>
      <Badge variant="outline" className="ml-auto text-[10px]">Demo</Badge>
    </div>
  );
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "text-primary",
  bg = "bg-primary/10",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  color?: string;
  bg?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div className="min-w-0">
          <div className={`text-xl font-bold leading-tight ${color}`}>{value}</div>
          <div className="text-[11px] text-muted-foreground leading-tight">{label}</div>
          {hint && <div className="text-[10px] text-muted-foreground/80 mt-1">{hint}</div>}
        </div>
      </div>
    </Card>
  );
}

export const chartTooltipStyle = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
    color: "hsl(var(--popover-foreground))",
  },
};
