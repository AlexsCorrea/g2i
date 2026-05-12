import React, { useState } from "react";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Building2, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import {
  useTotemUnits, useCreateTotemUnit, useUpdateTotemUnit, useDeleteTotemUnit, type TotemUnit,
} from "@/hooks/useTotem";

interface Props {
  trigger: React.ReactNode;
  onUnitChanged?: (id: string) => void;
}

export function UnitsManagerDrawer({ trigger, onUnitChanged }: Props) {
  const { data: units } = useTotemUnits();
  const create = useCreateTotemUnit();
  const update = useUpdateTotemUnit();
  const remove = useDeleteTotemUnit();

  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftObs, setDraftObs] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!draftName.trim()) return;
    const created = await create.mutateAsync(draftName.trim());
    if (draftObs.trim()) {
      await update.mutateAsync({ id: created.id, observations: draftObs.trim() } as any);
    }
    setDraftName("");
    setDraftObs("");
    setAdding(false);
    onUnitChanged?.(created.id);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Gerenciar Unidades de Totem
          </SheetTitle>
          <SheetDescription>
            Cadastre as unidades de atendimento (Ambulatório, Pronto-Socorro, Centro Cirúrgico etc.). Cada unidade
            possui seus próprios totens, tipos de senha, identidade e configurações.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {(units ?? []).map((u) => (
            <UnitRow
              key={u.id}
              unit={u}
              isEditing={editingId === u.id}
              onEdit={() => setEditingId(u.id)}
              onCancelEdit={() => setEditingId(null)}
              onSave={async (payload) => {
                await update.mutateAsync({ id: u.id, ...payload } as any);
                setEditingId(null);
              }}
              onDelete={async () => {
                await remove.mutateAsync(u.id);
              }}
              canDelete={(units?.length || 0) > 1}
            />
          ))}
          {(units?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground italic text-center py-6">
              Nenhuma unidade cadastrada.
            </p>
          )}
        </div>

        <div className="mt-6 border-t pt-6">
          {!adding ? (
            <Button onClick={() => setAdding(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Nova Unidade
            </Button>
          ) : (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <p className="font-semibold text-sm">Nova Unidade</p>
              <div>
                <Label className="text-xs">Nome da Unidade *</Label>
                <Input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Ex: Ambulatório, Pronto-Socorro, Internação"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-xs">Observações (opcional)</Label>
                <Textarea
                  value={draftObs}
                  onChange={(e) => setDraftObs(e.target.value)}
                  placeholder="Notas internas, regras específicas, etc."
                  rows={2}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => { setAdding(false); setDraftName(""); setDraftObs(""); }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreate} disabled={!draftName.trim() || create.isPending}>
                  Criar Unidade
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function UnitRow({
  unit, isEditing, onEdit, onCancelEdit, onSave, onDelete, canDelete,
}: {
  unit: TotemUnit;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSave: (p: { name: string; active: boolean; observations: string | null }) => Promise<void>;
  onDelete: () => Promise<void>;
  canDelete: boolean;
}) {
  const [name, setName] = useState(unit.name);
  const [active, setActive] = useState(unit.active);
  const [obs, setObs] = useState(unit.observations ?? "");

  if (isEditing) {
    return (
      <div className="border rounded-lg p-4 space-y-3 bg-card">
        <div>
          <Label className="text-xs">Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={active} onCheckedChange={setActive} />
          <span className="text-sm">{active ? "Ativa" : "Inativa"}</span>
        </div>
        <div>
          <Label className="text-xs">Observações</Label>
          <Textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} />
        </div>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="ghost" onClick={onCancelEdit}>
            <X className="w-4 h-4 mr-1" /> Cancelar
          </Button>
          <Button size="sm" onClick={() => onSave({ name: name.trim(), active, observations: obs.trim() || null })}>
            <Check className="w-4 h-4 mr-1" /> Salvar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4 flex items-start gap-3 bg-card hover:bg-muted/30 transition-colors">
      <Building2 className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold">{unit.name}</p>
          {unit.active ? (
            <Badge variant="secondary" className="text-xs">Ativa</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Inativa</Badge>
          )}
        </div>
        {unit.observations && <p className="text-xs text-muted-foreground mt-1">{unit.observations}</p>}
      </div>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        {canDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover unidade {unit.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Todos os totens, tipos de senha e anúncios vinculados serão excluídos. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
