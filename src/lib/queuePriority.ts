export type PriorityCode = "normal" | "preferencial" | "preferencial_60" | "preferencial_80";

export interface PriorityMeta {
  code: PriorityCode;
  label: string;
  shortLabel: string;
  weight: number;
  color: string; // tailwind color class hint (badge bg)
  hex: string;
  speech: string;
}

export const PRIORITY_LIST: PriorityMeta[] = [
  { code: "normal",            label: "Normal",            shortLabel: "Normal", weight: 0, color: "bg-slate-200 text-slate-800",  hex: "#64748b", speech: "normal" },
  { code: "preferencial",      label: "Preferencial",      shortLabel: "Pref.",  weight: 2, color: "bg-amber-200 text-amber-900",   hex: "#eab308", speech: "preferencial" },
  { code: "preferencial_60",   label: "Preferencial 60+",  shortLabel: "60+",    weight: 3, color: "bg-orange-300 text-orange-900", hex: "#f97316", speech: "preferencial sessenta mais" },
  { code: "preferencial_80",   label: "Preferencial 80+",  shortLabel: "80+",    weight: 4, color: "bg-red-300 text-red-900",       hex: "#ef4444", speech: "preferencial oitenta mais" },
];

export const PRIORITY_MAP: Record<PriorityCode, PriorityMeta> = Object.fromEntries(
  PRIORITY_LIST.map((p) => [p.code, p])
) as Record<PriorityCode, PriorityMeta>;

export function priorityMeta(code: string | null | undefined): PriorityMeta {
  if (!code) return PRIORITY_MAP.normal;
  return PRIORITY_MAP[code as PriorityCode] ?? PRIORITY_MAP.normal;
}

export function priorityWeight(code: string | null | undefined): number {
  return priorityMeta(code).weight;
}

export function priorityLabel(code: string | null | undefined): string {
  return priorityMeta(code).label;
}
