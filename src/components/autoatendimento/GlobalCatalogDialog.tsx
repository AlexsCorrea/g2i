import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  useGlobalTicketTypes, useUpsertGlobalTicketType, useDeleteGlobalTicketType,
  type GlobalTicketType,
} from "@/hooks/useTotem";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type EditableRow = Pick<GlobalTicketType, "id" | "label" | "code" | "prefix" | "color" | "active">;

function rowKey(r: EditableRow) {
  return JSON.stringify({ label: r.label, prefix: r.prefix, color: r.color || "", active: !!r.active });
}

interface Props {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}

export function GlobalCatalogDialog({ trigger, open, onOpenChange }: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open! : internalOpen;
  const setOpen = (o: boolean) => { if (isControlled) onOpenChange?.(o); else setInternalOpen(o); };

  const { data: globals } = useGlobalTicketTypes();
  const upsert = useUpsertGlobalTicketType();
  const remove = useDeleteGlobalTicketType();

  const [rows, setRows] = useState<EditableRow[]>([]);
  const originalRef = useRef<Record<string, string>>({});
  const [newDraft, setNewDraft] = useState({ label: "", prefix: "N", color: "#1e5a8a" });
  const [confirmDelete, setConfirmDelete] = useState<EditableRow | null>(null);

  // Sync rows from server every time the catalog loads / dialog opens
  useEffect(() => {
    const next: EditableRow[] = (globals ?? []).map(g => ({
      id: g.id, label: g.label, code: g.code,
      prefix: g.prefix, color: g.color || "#1e5a8a", active: g.active,
    }));
    setRows(next);
    const orig: Record<string, string> = {};
    next.forEach(r => { orig[r.id] = rowKey(r); });
    originalRef.current = orig;
  }, [globals, isOpen]);

  const dirtyIds = useMemo(
    () => rows.filter(r => originalRef.current[r.id] !== rowKey(r)).map(r => r.id),
    [rows]
  );
  const dirtyCount = dirtyIds.length;

  const updateRow = (id: string, patch: Partial<EditableRow>) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));

  const resetRow = (id: string) => {
    const orig = (globals ?? []).find(g => g.id === id);
    if (!orig) return;
    updateRow(id, {
      label: orig.label, prefix: orig.prefix,
      color: orig.color || "#1e5a8a", active: orig.active,
    });
  };

  const handleSaveAll = async () => {
    if (dirtyCount === 0) return;
    try {
      for (const id of dirtyIds) {
        const r = rows.find(x => x.id === id);
        if (!r) continue;
        await upsert.mutateAsync({
          id, label: r.label, prefix: r.prefix, color: r.color, active: r.active,
        });
      }
      toast.success(`${dirtyCount} alteração(ões) salva(s) no catálogo`);
    } catch {/* hook toasts the error */}
  };

  const handleAddNew = async () => {
    if (!newDraft.label.trim()) return;
    await upsert.mutateAsync({
      label: newDraft.label.trim(),
      prefix: (newDraft.prefix.toUpperCase().slice(0, 2) || "N"),
      color: newDraft.color,
    });
    setNewDraft({ label: "", prefix: "N", color: "#1e5a8a" });
  };

  const requestClose = () => {
    if (dirtyCount > 0) setConfirmDiscard(true);
    else setOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(o) => { if (!o) requestClose(); else setOpen(true); }}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent
          className="max-w-3xl p-0 gap-0 max-h-[85vh] flex flex-col"
          onEscapeKeyDown={(e) => { if (dirtyCount > 0) { e.preventDefault(); setConfirmDiscard(true); } }}
          onPointerDownOutside={(e) => { if (dirtyCount > 0) { e.preventDefault(); setConfirmDiscard(true); } }}
        >
          <DialogHeader className="px-6 pt-6 pb-3 border-b shrink-0">
            <DialogTitle>Catálogo global de tipos de senha</DialogTitle>
            <DialogDescription>
              Cadastro global. Cada unidade escolhe quais tipos habilitar e quais prioridades aceita.
            </DialogDescription>
          </DialogHeader>

          {/* Corpo rolável */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {dirtyCount > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {dirtyCount} alteração(ões) não salva(s). Clique em <strong>Salvar alterações do catálogo</strong> para aplicar.
              </div>
            )}

            <div className="space-y-2">
              {rows.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum tipo cadastrado.</p>
              )}
              <div className="grid grid-cols-12 gap-2 px-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                <div className="col-span-4">Nome</div>
                <div className="col-span-2">Código</div>
                <div className="col-span-1">Sigla</div>
                <div className="col-span-1">Cor</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-1 text-right">Ações</div>
              </div>
              {rows.map(r => {
                const dirty = originalRef.current[r.id] !== rowKey(r);
                return (
                  <div
                    key={r.id}
                    className={`grid grid-cols-12 gap-2 items-center border rounded p-2 bg-card transition-colors ${
                      dirty ? "border-amber-400 bg-amber-50/40" : ""
                    }`}
                  >
                    <div className="col-span-4">
                      <Input value={r.label} onChange={e => updateRow(r.id, { label: e.target.value })} className="h-8" />
                    </div>
                    <div className="col-span-2 font-mono text-xs text-muted-foreground truncate" title={r.code}>{r.code}</div>
                    <div className="col-span-1">
                      <Input
                        value={r.prefix}
                        onChange={e => updateRow(r.id, { prefix: e.target.value.toUpperCase().slice(0, 2) })}
                        className="h-8 text-center"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="color"
                        value={r.color || "#1e5a8a"}
                        onChange={e => updateRow(r.id, { color: e.target.value })}
                        className="h-8 p-0.5 w-full"
                      />
                    </div>
                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                      <Switch checked={r.active} onCheckedChange={a => updateRow(r.id, { active: a })} />
                      <span className="text-xs text-muted-foreground">{r.active ? "Ativo" : "Inativo"}</span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0"
                        onClick={() => setConfirmDelete(r)} title="Remover">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-semibold mb-2">Novo tipo</p>
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-6">
                  <Label className="text-xs">Nome</Label>
                  <Input
                    value={newDraft.label}
                    onChange={e => setNewDraft({ ...newDraft, label: e.target.value })}
                    placeholder="Ex.: Consulta, Retorno, Exames…"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Sigla</Label>
                  <Input
                    value={newDraft.prefix}
                    onChange={e => setNewDraft({ ...newDraft, prefix: e.target.value.toUpperCase().slice(0, 2) })}
                  />
                </div>
                <div className="col-span-3">
                  <Label className="text-xs">Cor</Label>
                  <Input type="color" value={newDraft.color}
                    onChange={e => setNewDraft({ ...newDraft, color: e.target.value })} />
                </div>
                <div className="col-span-1">
                  <Button onClick={handleAddNew} className="w-full" disabled={upsert.isPending || !newDraft.label.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                O código é gerado automaticamente a partir do nome (único e normalizado).
              </p>
            </div>
          </div>

          {/* Rodapé fixo */}
          <DialogFooter className="px-6 py-4 border-t shrink-0 bg-background">
            <Button variant="outline" onClick={requestClose}>Cancelar</Button>
            <Button onClick={handleSaveAll} disabled={dirtyCount === 0 || upsert.isPending}>
              <Save className="w-4 h-4 mr-1" /> Salvar alterações do catálogo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Existem {dirtyCount} alteração(ões) não salva(s) no catálogo. Se você sair agora, elas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setConfirmDiscard(false); setOpen(false); }}
            >
              Descartar alterações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover tipo de senha</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{confirmDelete?.label}</strong> do catálogo global?
              Unidades que tiverem habilitado este tipo deixarão de exibi-lo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) remove.mutate(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
