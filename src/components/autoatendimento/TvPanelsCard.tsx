import React, { useState } from "react";
import {
  useTvPanels, useUpsertTvPanel, useDeleteTvPanel, type TvPanel,
} from "@/hooks/useTvPanels";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tv, Plus, Trash2, Pencil, ChevronDown } from "lucide-react";

type Draft = Partial<TvPanel> & { name: string };

const empty: Draft = {
  name: "", location: "", notes: "",
  is_active: true, ads_enabled: true, sound_enabled: true,
  locution_enabled: true, show_history: true, show_clock: true,
  primary_color: "", secondary_color: "", logo_url: "",
};

export function TvPanelsCard() {
  const { data: panels } = useTvPanels();
  const upsert = useUpsertTvPanel();
  const remove = useDeleteTvPanel();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const startNew = () => { setDraft(empty); setEditingId(null); setOpen(true); };
  const startEdit = (p: TvPanel) => {
    setDraft({ ...p });
    setEditingId(p.id);
    setOpen(true);
  };
  const save = () => {
    if (!draft.name.trim()) return;
    const payload: any = { ...draft, name: draft.name.trim() };
    // normalize empty strings -> null for optional fields
    ["location","notes","primary_color","secondary_color","logo_url"].forEach(k => {
      if (payload[k] === "") payload[k] = null;
    });
    if (editingId) payload.id = editingId;
    upsert.mutate(payload, { onSuccess: () => setOpen(false) });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Tv className="w-5 h-5" /> Painéis TV (Chamada)
            </CardTitle>
            <CardDescription>
              Cadastro global de TVs/painéis físicos. Cada dispositivo escolhe qual TV é ao abrir <span className="font-mono">/painel-tv</span>. Não há vínculo fixo com unidade.
            </CardDescription>
          </div>
          <Button onClick={startNew} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Novo painel
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {(panels ?? []).length === 0 && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum painel TV cadastrado.
          </p>
        )}
        {(panels ?? []).map(p => (
          <div key={p.id} className="flex items-center gap-3 p-3 border rounded-lg">
            <Tv className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold truncate">{p.name}</p>
                {!p.is_active && <Badge variant="secondary">Inativo</Badge>}
              </div>
              {p.location && <p className="text-xs text-muted-foreground truncate">{p.location}</p>}
            </div>
            <Button size="sm" variant="ghost" onClick={() => startEdit(p)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              if (confirm(`Remover o painel "${p.name}"?`)) remove.mutate(p.id);
            }}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar painel TV" : "Novo painel TV"}</DialogTitle>
            <DialogDescription>
              Cadastre o dispositivo físico. A escolha de em quais TVs uma chamada aparece será feita posteriormente no painel do atendente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Nome *</Label>
              <Input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}
                placeholder="Ex: TV Recepção Geral" />
            </div>
            <div>
              <Label className="text-xs">Localização</Label>
              <Input value={draft.location ?? ""} onChange={e => setDraft({ ...draft, location: e.target.value })}
                placeholder="Ex: Hall de entrada" />
            </div>
            <div>
              <Label className="text-xs">Observações</Label>
              <Textarea value={draft.notes ?? ""} onChange={e => setDraft({ ...draft, notes: e.target.value })}
                rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Toggle label="Ativo" v={!!draft.is_active} on={v => setDraft({ ...draft, is_active: v })} />
              <Toggle label="Anúncios" v={!!draft.ads_enabled} on={v => setDraft({ ...draft, ads_enabled: v })} />
              <Toggle label="Som" v={!!draft.sound_enabled} on={v => setDraft({ ...draft, sound_enabled: v })} />
              <Toggle label="Locução" v={!!draft.locution_enabled} on={v => setDraft({ ...draft, locution_enabled: v })} />
              <Toggle label="Últimas chamadas" v={!!draft.show_history} on={v => setDraft({ ...draft, show_history: v })} />
              <Toggle label="Relógio" v={!!draft.show_clock} on={v => setDraft({ ...draft, show_clock: v })} />
            </div>

            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  Configurações visuais avançadas
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground">
                  Opcional. Se vazio, usa o tema padrão da instituição/unidade.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Cor primária</Label>
                    <Input type="text" value={draft.primary_color ?? ""}
                      onChange={e => setDraft({ ...draft, primary_color: e.target.value })}
                      placeholder="#1e5a8a" />
                  </div>
                  <div>
                    <Label className="text-xs">Cor secundária</Label>
                    <Input type="text" value={draft.secondary_color ?? ""}
                      onChange={e => setDraft({ ...draft, secondary_color: e.target.value })}
                      placeholder="#0f3460" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Logo (URL)</Label>
                  <Input value={draft.logo_url ?? ""} onChange={e => setDraft({ ...draft, logo_url: e.target.value })}
                    placeholder="https://..." />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!draft.name.trim() || upsert.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function Toggle({ label, v, on }: { label: string; v: boolean; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-2 p-2 border rounded-md">
      <Label className="text-sm">{label}</Label>
      <Switch checked={v} onCheckedChange={on} />
    </div>
  );
}
