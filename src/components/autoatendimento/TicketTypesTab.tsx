import React, { useState } from "react";
import { useTicketTypes, useUpsertTicketType, useDeleteTicketType, type TotemTicketType } from "@/hooks/useTotem";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

export function TicketTypesTab({ unitId }: { unitId: string }) {
  const { data: types } = useTicketTypes(unitId);
  const upsert = useUpsertTicketType();
  const remove = useDeleteTicketType();
  const [draft, setDraft] = useState({ code: "", label: "", prefix: "N", priority: 0, color: "#1e5a8a" });

  const handleAdd = () => {
    if (!draft.code || !draft.label) return;
    upsert.mutate({
      unit_id: unitId,
      code: draft.code.toLowerCase().replace(/\s+/g, "_"),
      label: draft.label,
      prefix: draft.prefix || "N",
      priority: Number(draft.priority) || 0,
      color: draft.color,
      display_order: (types?.length || 0) + 1,
      active: true,
    });
    setDraft({ code: "", label: "", prefix: "N", priority: 0, color: "#1e5a8a" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipos de Senha desta Unidade</CardTitle>
        <CardDescription>Cadastre as categorias que aparecerão nos totens vinculados a esta unidade. Apenas tipos ativos serão exibidos.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {(types ?? []).map(t => (
            <TicketTypeRow key={t.id} item={t} onSave={(p) => upsert.mutate({ ...p, unit_id: unitId } as any)} onDelete={() => remove.mutate(t.id)} />
          ))}
          {(types?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">Nenhum tipo cadastrado.</p>}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold mb-2">Novo tipo de senha</p>
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-3">
              <Label className="text-xs">Código</Label>
              <Input value={draft.code} onChange={e => setDraft({ ...draft, code: e.target.value })} placeholder="ex: consulta" />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Rótulo</Label>
              <Input value={draft.label} onChange={e => setDraft({ ...draft, label: e.target.value })} placeholder="Ex: Consulta" />
            </div>
            <div className="col-span-1">
              <Label className="text-xs">Prefixo</Label>
              <Input value={draft.prefix} onChange={e => setDraft({ ...draft, prefix: e.target.value.toUpperCase().slice(0, 2) })} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Prioridade</Label>
              <Input type="number" min={0} max={9} value={draft.priority} onChange={e => setDraft({ ...draft, priority: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Cor</Label>
              <Input type="color" value={draft.color} onChange={e => setDraft({ ...draft, color: e.target.value })} />
            </div>
            <div className="col-span-1">
              <Button onClick={handleAdd} className="w-full"><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TicketTypeRow({ item, onSave, onDelete }: { item: TotemTicketType; onSave: (p: Partial<TotemTicketType> & { id: string }) => void; onDelete: () => void }) {
  const [v, setV] = useState(item);
  const dirty = JSON.stringify(v) !== JSON.stringify(item);
  return (
    <div className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg">
      <div className="col-span-3"><Input value={v.label} onChange={e => setV({ ...v, label: e.target.value })} /></div>
      <div className="col-span-1"><Input value={v.prefix} onChange={e => setV({ ...v, prefix: e.target.value.toUpperCase().slice(0, 2) })} /></div>
      <div className="col-span-2"><Input type="number" min={0} max={9} value={v.priority} onChange={e => setV({ ...v, priority: Number(e.target.value) })} /></div>
      <div className="col-span-1"><Input type="color" value={v.color || "#1e5a8a"} onChange={e => setV({ ...v, color: e.target.value })} /></div>
      <div className="col-span-2 flex items-center gap-2"><Switch checked={v.active} onCheckedChange={a => setV({ ...v, active: a })} /><span className="text-xs">Ativo</span></div>
      <div className="col-span-2 text-xs text-muted-foreground font-mono truncate">{v.code}</div>
      <div className="col-span-1 flex gap-1">
        <Button size="sm" variant={dirty ? "default" : "outline"} disabled={!dirty} onClick={() => onSave({ id: v.id, label: v.label, prefix: v.prefix, priority: v.priority, color: v.color, active: v.active })}>Salvar</Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="w-3 h-3" /></Button>
      </div>
    </div>
  );
}
