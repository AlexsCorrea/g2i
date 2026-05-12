import React, { useState } from "react";
import { useTotemDevices, useUpsertTotemDevice, useDeleteTotemDevice, type TotemDevice } from "@/hooks/useTotem";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Copy, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export function DevicesTab({ unitId }: { unitId: string }) {
  const { data: devices } = useTotemDevices(unitId);
  const upsert = useUpsertTotemDevice();
  const remove = useDeleteTotemDevice();
  const [draft, setDraft] = useState({ name: "", location: "", device_identifier: "" });

  const handleAdd = () => {
    if (!draft.name) return;
    upsert.mutate({ unit_id: unitId, ...draft });
    setDraft({ name: "", location: "", device_identifier: "" });
  };

  const copyLink = (deviceId: string) => {
    const url = `${window.location.origin}/kiosk?device=${deviceId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link de provisionamento copiado");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Totens Físicos desta Unidade</CardTitle>
        <CardDescription>Cada totem físico fica vinculado a uma unidade. Use o link de provisionamento para configurar o equipamento na primeira abertura.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {(devices ?? []).map(d => (
            <DeviceRow key={d.id} item={d} onSave={(p) => upsert.mutate({ ...p, unit_id: unitId } as any)} onDelete={() => remove.mutate(d.id)} onCopyLink={() => copyLink(d.id)} />
          ))}
          {(devices?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">Nenhum totem cadastrado.</p>}
        </div>

        <div className="border-t pt-4">
          <p className="text-sm font-semibold mb-2">Novo totem físico</p>
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-4">
              <Label className="text-xs">Nome</Label>
              <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} placeholder="Ex: Totem Recepção 1" />
            </div>
            <div className="col-span-4">
              <Label className="text-xs">Localização</Label>
              <Input value={draft.location} onChange={e => setDraft({ ...draft, location: e.target.value })} placeholder="Ex: Hall principal" />
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Identificador</Label>
              <Input value={draft.device_identifier} onChange={e => setDraft({ ...draft, device_identifier: e.target.value })} placeholder="Ex: REC-01" />
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

function DeviceRow({ item, onSave, onDelete, onCopyLink }: { item: TotemDevice; onSave: (p: Partial<TotemDevice> & { id: string }) => void; onDelete: () => void; onCopyLink: () => void }) {
  const [v, setV] = useState(item);
  const dirty = JSON.stringify(v) !== JSON.stringify(item);
  return (
    <div className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg">
      <div className="col-span-3"><Input value={v.name} onChange={e => setV({ ...v, name: e.target.value })} /></div>
      <div className="col-span-3"><Input value={v.location ?? ""} onChange={e => setV({ ...v, location: e.target.value })} placeholder="Localização" /></div>
      <div className="col-span-2"><Input value={v.device_identifier ?? ""} onChange={e => setV({ ...v, device_identifier: e.target.value })} placeholder="ID" /></div>
      <div className="col-span-2 flex items-center gap-2"><Switch checked={v.active} onCheckedChange={a => setV({ ...v, active: a })} /><span className="text-xs">Ativo</span></div>
      <div className="col-span-2 flex gap-1 justify-end">
        <Button size="sm" variant="ghost" title="Copiar link" onClick={onCopyLink}><LinkIcon className="w-3 h-3" /></Button>
        <Button size="sm" variant={dirty ? "default" : "outline"} disabled={!dirty} onClick={() => onSave({ id: v.id, name: v.name, location: v.location, device_identifier: v.device_identifier, active: v.active })}>Salvar</Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="w-3 h-3" /></Button>
      </div>
    </div>
  );
}
