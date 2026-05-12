import React, { useState, useMemo } from "react";
import {
  useTicketTypes,
  useUpsertTicketType,
  useDeleteTicketType,
  useTicketTypePriorities,
  useSetTicketTypePriorities,
  type TotemTicketType,
} from "@/hooks/useTotem";
import { PRIORITY_LIST } from "@/lib/queuePriority";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

export function TicketTypesTab({ unitId }: { unitId: string }) {
  const { data: types } = useTicketTypes(unitId);
  const { data: typePriorities } = useTicketTypePriorities(unitId);
  const upsert = useUpsertTicketType();
  const remove = useDeleteTicketType();
  const setPriorities = useSetTicketTypePriorities();
  const [draft, setDraft] = useState({ code: "", label: "", prefix: "N", color: "#1e5a8a" });

  const prioritiesByType = useMemo(() => {
    const map = new Map<string, string[]>();
    (typePriorities ?? []).forEach((p) => {
      if (!p.enabled) return;
      const arr = map.get(p.ticket_type_id) ?? [];
      arr.push(p.priority_code);
      map.set(p.ticket_type_id, arr);
    });
    return map;
  }, [typePriorities]);

  const handleAdd = () => {
    if (!draft.code || !draft.label) return;
    upsert.mutate({
      unit_id: unitId,
      code: draft.code.toLowerCase().replace(/\s+/g, "_"),
      label: draft.label,
      prefix: draft.prefix || "N",
      priority: 0,
      color: draft.color,
      display_order: (types?.length || 0) + 1,
      active: true,
    });
    setDraft({ code: "", label: "", prefix: "N", color: "#1e5a8a" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Senha desta Unidade</CardTitle>
        <CardDescription>
          Cadastre as categorias e marque quais prioridades cada tipo aceita. As prioridades aparecem como segundo passo no totem.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {(types ?? []).map((t) => (
            <TicketTypeRow
              key={t.id}
              item={t}
              priorityCodes={prioritiesByType.get(t.id) ?? []}
              onSave={(p) => upsert.mutate({ ...p, unit_id: unitId } as any)}
              onPrioritiesChange={(codes) =>
                setPriorities.mutate({ ticket_type_id: t.id, priority_codes: codes })
              }
              onDelete={() => remove.mutate(t.id)}
            />
          ))}
          {(types?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum tipo cadastrado.</p>
          )}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold mb-2">Novo tipo de senha</p>
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-3">
              <Label className="text-xs">Código</Label>
              <Input value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} placeholder="ex: consulta" />
            </div>
            <div className="col-span-4">
              <Label className="text-xs">Rótulo</Label>
              <Input value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} placeholder="Ex: Consulta" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Prefixo</Label>
              <Input value={draft.prefix} onChange={(e) => setDraft({ ...draft, prefix: e.target.value.toUpperCase().slice(0, 2) })} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Cor</Label>
              <Input type="color" value={draft.color} onChange={(e) => setDraft({ ...draft, color: e.target.value })} />
            </div>
            <div className="col-span-1">
              <Button onClick={handleAdd} className="w-full">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Após criar o tipo, marque abaixo as prioridades aceitas (Normal, Preferencial, 60+, 80+).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketTypeRow({
  item,
  priorityCodes,
  onSave,
  onPrioritiesChange,
  onDelete,
}: {
  item: TotemTicketType;
  priorityCodes: string[];
  onSave: (p: Partial<TotemTicketType> & { id: string }) => void;
  onPrioritiesChange: (codes: string[]) => void;
  onDelete: () => void;
}) {
  const [v, setV] = useState(item);
  const dirty = JSON.stringify(v) !== JSON.stringify(item);
  const selected = new Set(priorityCodes);

  const togglePriority = (code: string) => {
    const next = new Set(selected);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    onPrioritiesChange(Array.from(next));
  };

  return (
    <div className="border rounded-lg p-3 space-y-3 bg-card">
      <div className="grid grid-cols-12 gap-2 items-center">
        <div className="col-span-3">
          <Input value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} />
        </div>
        <div className="col-span-1">
          <Input value={v.prefix} onChange={(e) => setV({ ...v, prefix: e.target.value.toUpperCase().slice(0, 2) })} />
        </div>
        <div className="col-span-1">
          <Input type="color" value={v.color || "#1e5a8a"} onChange={(e) => setV({ ...v, color: e.target.value })} />
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <Switch checked={v.active} onCheckedChange={(a) => setV({ ...v, active: a })} />
          <span className="text-xs">Ativo</span>
        </div>
        <div className="col-span-3 text-xs text-muted-foreground font-mono truncate">{v.code}</div>
        <div className="col-span-2 flex gap-1 justify-end">
          <Button
            size="sm"
            variant={dirty ? "default" : "outline"}
            disabled={!dirty}
            onClick={() => onSave({ id: v.id, label: v.label, prefix: v.prefix, color: v.color, active: v.active })}
          >
            Salvar
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
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
              onClick={() => togglePriority(p.code)}
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
        {selected.size === 0 && (
          <span className="text-[11px] text-amber-600">Nenhuma prioridade marcada — este tipo não aparecerá no totem.</span>
        )}
      </div>
    </div>
  );
}
