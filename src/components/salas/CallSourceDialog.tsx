import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tv, Monitor, MonitorSpeaker, Pencil, Ban } from "lucide-react";
import { useActiveTvPanels } from "@/hooks/useTvPanels";
import { useTotemUnits } from "@/hooks/useTotem";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type CallSource = {
  enabled: boolean;
  panelIds: string[];
  attendantPanel: string;
  unitIds: string[];
};

const KEY = "zurich.call_source.v1";
const EMPTY: CallSource = { enabled: false, panelIds: [], attendantPanel: "", unitIds: [] };

function read(): CallSource {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch { return EMPTY; }
}

/** Preferência de origem da chamada do usuário (persistida localmente). */
export function useCallSource() {
  const [source, setSource] = useState<CallSource>(() => read());

  const save = useCallback((next: CallSource) => {
    setSource(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage indisponível */ }
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setSource(read()); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { source, save };
}

function toggle(list: string[], id: string) {
  return list.includes(id) ? list.filter(v => v !== id) : [...list, id];
}

export function CallSourceChip({
  source, onSave, className,
}: { source: CallSource; onSave: (s: CallSource) => void; className?: string }) {
  const [open, setOpen] = useState(false);
  const { data: panels } = useActiveTvPanels();
  const { data: units } = useTotemUnits();
  const [draft, setDraft] = useState<CallSource>(source);

  useEffect(() => { if (open) setDraft(source); }, [open, source]);

  const label = useMemo(() => {
    if (!source.enabled) return "Não utilizando";
    const names = (panels ?? []).filter(p => source.panelIds.includes(p.id)).map(p => p.name);
    const parts = [
      names.length ? names.join(", ") : "Sem painel",
      source.attendantPanel || null,
    ].filter(Boolean);
    return parts.join(" · ");
  }, [source, panels]);

  const confirm = () => {
    if (!draft.panelIds.length) { toast.error("Selecione ao menos um painel de destino"); return; }
    if (!draft.attendantPanel.trim()) { toast.error("Informe o painel/guichê do atendente"); return; }
    onSave({ ...draft, enabled: true, attendantPanel: draft.attendantPanel.trim() });
    setOpen(false);
    toast.success("Origem da chamada configurada");
  };

  const disable = () => {
    onSave({ ...EMPTY });
    setOpen(false);
    toast.message("Chamadas em painel desativadas para este usuário");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs transition-colors max-w-[320px]",
          source.enabled
            ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
            : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
          className,
        )}
        title="Configurar origem da chamada"
      >
        <MonitorSpeaker className="h-3.5 w-3.5 shrink-0" />
        <span className="font-semibold hidden sm:inline">Origem da chamada:</span>
        <span className="truncate">{label}</span>
        <Pencil className="h-3 w-3 opacity-70 shrink-0" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Origem da chamada</DialogTitle>
            <DialogDescription>
              Defina para quais painéis suas chamadas serão enviadas e qual guichê/sala será anunciado.
              A escolha vale apenas para o seu usuário neste dispositivo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5">
                <Tv className="h-3.5 w-3.5" /> Painel(is) de destino <span className="text-destructive">*</span>
              </Label>
              <ScrollArea className="max-h-40 rounded-md border">
                <div className="p-2 space-y-1">
                  {(panels ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground p-2">
                      Nenhum painel TV ativo cadastrado em /admin-autoatendimento.
                    </p>
                  )}
                  {(panels ?? []).map(p => (
                    <label key={p.id} className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted cursor-pointer">
                      <Checkbox
                        checked={draft.panelIds.includes(p.id)}
                        onCheckedChange={() => setDraft(d => ({ ...d, panelIds: toggle(d.panelIds, p.id) }))}
                      />
                      <span className="text-sm">{p.name}</span>
                      {p.location && <span className="text-[11px] text-muted-foreground">· {p.location}</span>}
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5" htmlFor="attendant-panel">
                <Monitor className="h-3.5 w-3.5" /> Painel do atendente (guichê/sala) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="attendant-panel"
                placeholder="Ex.: Guichê 02 / Consultório 3"
                value={draft.attendantPanel}
                onChange={(e) => setDraft(d => ({ ...d, attendantPanel: e.target.value }))}
              />
            </div>

            {(units ?? []).length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Unidades de totem (opcional)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {(units ?? []).map((u: any) => {
                    const on = draft.unitIds.includes(u.id);
                    return (
                      <Badge
                        key={u.id}
                        variant={on ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setDraft(d => ({ ...d, unitIds: toggle(d.unitIds, u.id) }))}
                      >
                        {u.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" onClick={disable} className="gap-1.5">
              <Ban className="h-4 w-4" /> Não irei utilizar
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={confirm}>Confirmar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
