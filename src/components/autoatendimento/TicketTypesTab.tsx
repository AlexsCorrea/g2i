import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  useGlobalTicketTypes,
  useUpsertGlobalTicketType,
  useDeleteGlobalTicketType,
  useUnitTicketTypes,
  useSaveUnitTicketTypesBatch,
  type GlobalTicketType,
  type UnitTicketTypeDraft,
} from "@/hooks/useTotem";
import { PRIORITY_LIST } from "@/lib/queuePriority";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Trash2, Save, AlertCircle, ChevronDown, Settings2 } from "lucide-react";
import { toast } from "sonner";

type Draft = UnitTicketTypeDraft;

function normalizeDraft(d: Draft): string {
  // Stable key for comparison (priority order ignored)
  return JSON.stringify({
    enabled: !!d.enabled,
    display_order: Number(d.display_order) || 0,
    color_override: d.color_override || null,
    priority_codes: [...(d.priority_codes || [])].sort(),
  });
}

export function TicketTypesTab({ unitId }: { unitId: string }) {
  const { data: globals } = useGlobalTicketTypes();
  const { data: unitLinks } = useUnitTicketTypes(unitId);
  const upsertGlobal = useUpsertGlobalTicketType();
  const removeGlobal = useDeleteGlobalTicketType();
  const saveBatch = useSaveUnitTicketTypesBatch();

  const [draftG, setDraftG] = useState({ label: "", prefix: "N", color: "#1e5a8a" });

  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  // Snapshot of the original loaded state — used to compute real dirty state
  const originalRef = useRef<Record<string, string>>({});

  // (Re)initialise drafts from server state every time unitId/links/globals change
  useEffect(() => {
    const next: Record<string, Draft> = {};
    const orig: Record<string, string> = {};
    (globals ?? []).forEach((g, idx) => {
      const link = (unitLinks ?? []).find((l) => l.ticket_type_global_id === g.id);
      const d: Draft = {
        id: link?.id,
        ticket_type_global_id: g.id,
        enabled: link?.enabled ?? false,
        display_order: link?.display_order ?? (g.default_display_order || idx + 1),
        color_override: link?.color_override ?? null,
        priority_codes: link?.priority_codes ?? ["normal"],
      };
      next[g.id] = d;
      orig[g.id] = normalizeDraft(d);
    });
    setDrafts(next);
    originalRef.current = orig;
  }, [unitId, globals, unitLinks]);

  // Real dirty-state computation
  const dirtyIds = useMemo(() => {
    const ids: string[] = [];
    Object.entries(drafts).forEach(([gid, d]) => {
      if (originalRef.current[gid] !== normalizeDraft(d)) ids.push(gid);
    });
    return ids;
  }, [drafts]);
  const dirtyCount = dirtyIds.length;

  const updateDraft = (gid: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [gid]: { ...prev[gid], ...patch } }));

  const togglePriority = (gid: string, code: string) => {
    const cur = drafts[gid];
    if (!cur) return;
    const set = new Set(cur.priority_codes);
    if (set.has(code)) set.delete(code);
    else set.add(code);
    updateDraft(gid, { priority_codes: Array.from(set) });
  };

  const handleSaveAll = async () => {
    if (dirtyCount === 0) return;
    const items = dirtyIds.map((gid) => drafts[gid]);
    const invalid = items.find((d) => d.enabled && d.priority_codes.length === 0);
    if (invalid) {
      toast.error("Há tipos habilitados sem prioridade. Marque ao menos uma prioridade.");
      return;
    }
    await saveBatch.mutateAsync({ unit_id: unitId, items });
    // Reset originals against the saved state (drafts will be re-synced when unitLinks invalidates)
    const newOrig = { ...originalRef.current };
    dirtyIds.forEach((gid) => { newOrig[gid] = normalizeDraft(drafts[gid]); });
    originalRef.current = newOrig;
  };

  // Warn on unload only when there are real pending changes
  useEffect(() => {
    if (dirtyCount === 0) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirtyCount]);

  const handleAddGlobal = async () => {
    if (!draftG.label.trim()) return;
    await upsertGlobal.mutateAsync({
      label: draftG.label.trim(),
      prefix: draftG.prefix.toUpperCase().slice(0, 2) || "N",
      color: draftG.color,
    });
    setDraftG({ label: "", prefix: "N", color: "#1e5a8a" });
  };

  return (
    <div className="space-y-6">
      {/* ===== Catálogo global ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Tipos de Senha</CardTitle>
          <CardDescription>
            Cadastre aqui os tipos de senha reutilizáveis em todas as unidades. Cada unidade decide depois quais
            tipos habilitar e quais prioridades aceita.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {(globals ?? []).map((g) => (
              <GlobalRow
                key={g.id}
                item={g}
                onSave={(p) => upsertGlobal.mutate({ ...p, id: g.id } as any)}
                onDelete={() => removeGlobal.mutate(g.id)}
              />
            ))}
            {(globals?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum tipo global cadastrado.</p>
            )}
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-2">Novo tipo</p>
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={draftG.label}
                  onChange={(e) => setDraftG({ ...draftG, label: e.target.value })}
                  placeholder="Ex.: Consulta, Retorno, Exames…"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Sigla</Label>
                <Input
                  value={draftG.prefix}
                  onChange={(e) => setDraftG({ ...draftG, prefix: e.target.value.toUpperCase().slice(0, 2) })}
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Cor</Label>
                <Input type="color" value={draftG.color} onChange={(e) => setDraftG({ ...draftG, color: e.target.value })} />
              </div>
              <div className="col-span-1">
                <Button onClick={handleAddGlobal} className="w-full" disabled={upsertGlobal.isPending}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              O código é gerado automaticamente a partir do nome (único e normalizado). Não permite duplicidade.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ===== Habilitação por unidade ===== */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Tipos disponíveis nesta unidade</CardTitle>
            <CardDescription>
              Escolha quais tipos do catálogo aparecem neste setor e quais prioridades cada um aceita.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {dirtyCount > 0 && (
              <Badge variant="outline" className="text-amber-700 border-amber-400">
                <AlertCircle className="w-3 h-3 mr-1" /> {dirtyCount} alteração(ões) não salva(s)
              </Badge>
            )}
            <Button onClick={handleSaveAll} disabled={dirtyCount === 0 || saveBatch.isPending}>
              <Save className="w-4 h-4 mr-1" /> Salvar alterações
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(globals ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Cadastre tipos no catálogo acima para habilitá-los aqui.</p>
          )}
          {(globals ?? []).map((g) => {
            const d = drafts[g.id];
            if (!d) return null;
            const isDirty = originalRef.current[g.id] !== normalizeDraft(d);
            return (
              <UnitTypeRow
                key={g.id}
                global={g}
                draft={d}
                dirty={isDirty}
                onChange={(patch) => updateDraft(g.id, patch)}
                onTogglePriority={(code) => togglePriority(g.id, code)}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============= Linha por tipo: visual compacto + collapsible avançado ============= */
function UnitTypeRow({
  global: g,
  draft: d,
  dirty,
  onChange,
  onTogglePriority,
}: {
  global: GlobalTicketType;
  draft: Draft;
  dirty: boolean;
  onChange: (patch: Partial<Draft>) => void;
  onTogglePriority: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = new Set(d.priority_codes);
  const color = d.color_override || g.color || "#1e5a8a";

  return (
    <div
      className={`rounded-lg border transition-all ${
        d.enabled
          ? "border-primary/30 bg-primary/[0.03]"
          : "border-border bg-muted/20 opacity-80"
      } ${dirty ? "ring-1 ring-amber-300" : ""}`}
    >
      <div className="flex items-center gap-3 p-3">
        <div
          className="w-9 h-9 rounded text-white text-xs flex items-center justify-center font-bold shrink-0"
          style={{ background: d.enabled ? color : "#94a3b8" }}
        >
          {g.prefix}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm truncate">{g.label}</span>
            <span className="text-[10px] font-mono text-muted-foreground truncate">{g.code}</span>
          </div>
          {d.enabled && (
            <div className="flex flex-wrap gap-1 mt-1">
              {d.priority_codes.length === 0 ? (
                <span className="text-[11px] text-amber-600">Marque ao menos uma prioridade.</span>
              ) : (
                d.priority_codes.map((pc) => {
                  const meta = PRIORITY_LIST.find((p) => p.code === pc);
                  if (!meta) return null;
                  return (
                    <span
                      key={pc}
                      className="text-[10px] px-1.5 py-0.5 rounded text-white"
                      style={{ background: meta.hex }}
                    >
                      {meta.shortLabel}
                    </span>
                  );
                })
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Switch checked={d.enabled} onCheckedChange={(v) => onChange({ enabled: v })} />
          <Collapsible open={open} onOpenChange={setOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Settings2 className="w-3.5 h-3.5 mr-1" />
                Avançado
                <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </div>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleContent>
          <div className="border-t px-3 py-3 space-y-3 bg-background/50">
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-3">
                <Label className="text-xs">Ordem</Label>
                <Input
                  type="number"
                  value={d.display_order}
                  onChange={(e) => onChange({ display_order: Number(e.target.value) || 0 })}
                  className="h-8"
                />
              </div>
              <div className="col-span-3">
                <Label className="text-xs">Cor (override)</Label>
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => onChange({ color_override: e.target.value })}
                  className="h-8"
                />
              </div>
              <div className="col-span-2">
                {d.color_override && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={() => onChange({ color_override: null })}
                  >
                    <Trash2 className="w-3 h-3 mr-1" /> Cor padrão
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Label className="text-xs mb-2 block">Prioridades aceitas</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {PRIORITY_LIST.map((p) => {
                  const active = selected.has(p.code);
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => onTogglePriority(p.code)}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                        active
                          ? "border-transparent text-white shadow-sm"
                          : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                      }`}
                      style={active ? { background: p.hex } : {}}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function GlobalRow({
  item,
  onSave,
  onDelete,
}: {
  item: GlobalTicketType;
  onSave: (p: Partial<GlobalTicketType>) => void;
  onDelete: () => void;
}) {
  const [v, setV] = useState(item);
  useEffect(() => setV(item), [item]);
  const dirty = JSON.stringify(v) !== JSON.stringify(item);
  return (
    <div className="grid grid-cols-12 gap-2 items-center border rounded p-2 bg-card">
      <div className="col-span-4">
        <Input value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} className="h-8" />
      </div>
      <div className="col-span-2 font-mono text-xs text-muted-foreground truncate">{v.code}</div>
      <div className="col-span-1">
        <Input value={v.prefix} onChange={(e) => setV({ ...v, prefix: e.target.value.toUpperCase().slice(0, 2) })} className="h-8" />
      </div>
      <div className="col-span-1">
        <Input type="color" value={v.color || "#1e5a8a"} onChange={(e) => setV({ ...v, color: e.target.value })} className="h-8" />
      </div>
      <div className="col-span-2 flex items-center gap-2">
        <Switch checked={v.active} onCheckedChange={(a) => setV({ ...v, active: a })} />
        <span className="text-xs">{v.active ? "Ativo" : "Inativo"}</span>
      </div>
      <div className="col-span-2 flex gap-1 justify-end">
        <Button size="sm" variant={dirty ? "default" : "outline"} disabled={!dirty} onClick={() => onSave({ label: v.label, prefix: v.prefix, color: v.color, active: v.active })}>
          Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
