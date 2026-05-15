import React, { useState, useEffect, useMemo } from "react";
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
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function TicketTypesTab({ unitId }: { unitId: string }) {
  const { data: globals } = useGlobalTicketTypes();
  const { data: unitLinks } = useUnitTicketTypes(unitId);
  const upsertGlobal = useUpsertGlobalTicketType();
  const removeGlobal = useDeleteGlobalTicketType();
  const saveBatch = useSaveUnitTicketTypesBatch();

  const [draftG, setDraftG] = useState({ label: "", prefix: "N", color: "#1e5a8a" });

  // Per-unit drafts keyed by global ticket type id
  type Draft = UnitTicketTypeDraft & { dirty?: boolean };
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  // Initialise drafts from server state every time unitId/links change
  useEffect(() => {
    const next: Record<string, Draft> = {};
    (globals ?? []).forEach((g, idx) => {
      const link = (unitLinks ?? []).find((l) => l.ticket_type_global_id === g.id);
      next[g.id] = {
        id: link?.id,
        ticket_type_global_id: g.id,
        enabled: link?.enabled ?? false,
        display_order: link?.display_order ?? (g.default_display_order || idx + 1),
        color_override: link?.color_override ?? null,
        priority_codes: link?.priority_codes ?? ["normal"],
      };
    });
    setDrafts(next);
  }, [unitId, globals, unitLinks]);

  const dirtyCount = useMemo(
    () => Object.values(drafts).filter((d) => d.dirty).length,
    [drafts],
  );

  const updateDraft = (gid: string, patch: Partial<Draft>) =>
    setDrafts((prev) => ({ ...prev, [gid]: { ...prev[gid], ...patch, dirty: true } }));

  const togglePriority = (gid: string, code: string) => {
    const cur = drafts[gid];
    if (!cur) return;
    const set = new Set(cur.priority_codes);
    if (set.has(code)) set.delete(code);
    else set.add(code);
    updateDraft(gid, { priority_codes: Array.from(set) });
  };

  const handleSaveAll = async () => {
    const items = Object.values(drafts).filter((d) => d.dirty);
    if (items.length === 0) return;
    // Validation: enabled types need at least one priority
    const invalid = items.find((d) => d.enabled && d.priority_codes.length === 0);
    if (invalid) {
      toast.error("Há tipos habilitados sem prioridade. Marque ao menos uma prioridade.");
      return;
    }
    await saveBatch.mutateAsync({
      unit_id: unitId,
      items: items.map(({ dirty, ...rest }) => rest),
    });
  };

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
          <CardTitle>Tipos Globais de Senha</CardTitle>
          <CardDescription>
            Catálogo único reutilizável por todas as unidades. Cada unidade decide quais tipos habilita
            e quais prioridades aceita.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            {(globals ?? []).map((g) => (
              <GlobalRow key={g.id} item={g} onSave={(p) => upsertGlobal.mutate({ ...p, id: g.id } as any)} onDelete={() => removeGlobal.mutate(g.id)} />
            ))}
            {(globals?.length ?? 0) === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum tipo global cadastrado.</p>
            )}
          </div>

          <div className="border-t pt-3">
            <p className="text-sm font-semibold mb-2">Novo tipo global</p>
            <div className="grid grid-cols-12 gap-2 items-end">
              <div className="col-span-6">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={draftG.label}
                  onChange={(e) => setDraftG({ ...draftG, label: e.target.value })}
                  placeholder="Ex: Consulta, Retorno, Exames…"
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Habilitados nesta Unidade</CardTitle>
            <CardDescription>
              Marque quais tipos globais aparecem no totem desta unidade e quais prioridades aceita cada um.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
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
        <CardContent className="space-y-3">
          {(globals ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">Cadastre tipos globais acima para habilitá-los aqui.</p>
          )}
          {(globals ?? []).map((g) => {
            const d = drafts[g.id];
            if (!d) return null;
            const selected = new Set(d.priority_codes);
            return (
              <div key={g.id} className="border rounded-lg p-3 space-y-2 bg-card">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded text-white text-[11px] flex items-center justify-center font-bold"
                      style={{ background: d.color_override || g.color || "#1e5a8a" }}
                    >
                      {g.prefix}
                    </div>
                    <span className="font-semibold text-sm truncate">{g.label}</span>
                  </div>
                  <div className="col-span-2 text-xs font-mono text-muted-foreground truncate">{g.code}</div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Switch checked={d.enabled} onCheckedChange={(v) => updateDraft(g.id, { enabled: v })} />
                    <span className="text-xs">{d.enabled ? "Ativo" : "Inativo"}</span>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={d.display_order}
                      onChange={(e) => updateDraft(g.id, { display_order: Number(e.target.value) || 0 })}
                      className="h-8"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="color"
                      value={d.color_override || g.color || "#1e5a8a"}
                      onChange={(e) => updateDraft(g.id, { color_override: e.target.value })}
                      className="h-8"
                      title="Cor (override desta unidade)"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {d.color_override && (
                      <Button size="sm" variant="ghost" onClick={() => updateDraft(g.id, { color_override: null })} title="Remover override">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1 border-t">
                  <span className="text-xs text-muted-foreground mr-1">Prioridades aceitas:</span>
                  {PRIORITY_LIST.map((p) => {
                    const active = selected.has(p.code);
                    return (
                      <button
                        key={p.code}
                        type="button"
                        onClick={() => togglePriority(g.id, p.code)}
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
                  {d.enabled && selected.size === 0 && (
                    <span className="text-[11px] text-amber-600">Marque ao menos uma prioridade.</span>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
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
