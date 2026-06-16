import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useLabEquipment } from "@/hooks/useLabIntegration";
import { useAnalyteMap } from "@/hooks/useLabEquipmentBench";
import { ArrowLeftRight, Plus, Trash2, Pencil } from "lucide-react";

const emptyMap: any = { equipment_id: "", equipment_code: "", analyte_name: "", unit: "", decimal_places: "", multiplier: "1", notes: "" };

export default function LabIntAnalyteMap() {
  const { list: equipList } = useLabEquipment();
  const [filterEq, setFilterEq] = useState<string>("all");
  const eqArg = filterEq === "all" ? undefined : filterEq;
  const { list, upsert, remove } = useAnalyteMap(eqArg);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyMap);

  const eqs = equipList.data ?? [];
  const grouped = useMemo(() => {
    const out: Record<string, any[]> = {};
    (list.data ?? []).forEach((m: any) => {
      const k = m.equipment_id;
      (out[k] ||= []).push(m);
    });
    return out;
  }, [list.data]);

  const openNew = () => { setForm({ ...emptyMap, equipment_id: filterEq !== "all" ? filterEq : (eqs[0]?.id ?? "") }); setEditing(null); setShowForm(true); };
  const openEdit = (m: any) => { setForm({ ...emptyMap, ...m, decimal_places: m.decimal_places?.toString() ?? "", multiplier: (m.multiplier ?? 1).toString() }); setEditing(m); setShowForm(true); };

  const save = () => {
    if (!form.equipment_id || !form.equipment_code.trim()) return;
    const payload: any = {
      ...form,
      decimal_places: form.decimal_places ? Number(form.decimal_places) : null,
      multiplier: form.multiplier ? Number(form.multiplier) : 1,
    };
    if (editing) payload.id = editing.id;
    upsert.mutate(payload, { onSuccess: () => setShowForm(false) });
  };

  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeftRight className="h-5 w-5" />
          <span className="text-sm">Mapeamento código-do-equipamento → exame/componente interno</span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterEq} onValueChange={setFilterEq}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Todos os equipamentos" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os equipamentos</SelectItem>
              {eqs.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Novo Mapeamento</Button>
        </div>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum mapeamento cadastrado para o filtro selecionado.</CardContent></Card>
      ) : (
        Object.entries(grouped).map(([eqId, items]) => {
          const eq = eqs.find((e: any) => e.id === eqId);
          return (
            <Card key={eqId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  {eq?.name ?? "Equipamento"}
                  <Badge variant="outline" className="text-xs">{eq?.manufacturer} {eq?.model}</Badge>
                  <Badge variant="secondary" className="text-xs">{items.length} analitos</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>Cód. Equipamento</TableHead>
                    <TableHead>Analito</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead>Casas</TableHead>
                    <TableHead>Mult.</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {items.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-mono text-sm">{m.equipment_code}</TableCell>
                        <TableCell>{m.analyte_name}</TableCell>
                        <TableCell className="text-xs">{m.unit ?? "—"}</TableCell>
                        <TableCell className="text-xs">{m.decimal_places ?? "—"}</TableCell>
                        <TableCell className="text-xs">{m.multiplier ?? 1}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive" onClick={() => { if (confirm("Remover mapeamento?")) remove.mutate(m.id); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          );
        })
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Editar Mapeamento" : "Novo Mapeamento"}</DialogTitle><DialogDescription>Vincula código enviado pelo equipamento ao analito interno</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Equipamento *</Label>
              <Select value={form.equipment_id} onValueChange={v => F("equipment_id", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{eqs.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Cód. equipamento *</Label><Input value={form.equipment_code} onChange={e => F("equipment_code", e.target.value)} placeholder="WBC, GLUC, Na..." /></div>
            <div><Label>Nome do analito</Label><Input value={form.analyte_name} onChange={e => F("analyte_name", e.target.value)} /></div>
            <div><Label>Unidade</Label><Input value={form.unit} onChange={e => F("unit", e.target.value)} /></div>
            <div><Label>Casas decimais</Label><Input value={form.decimal_places} onChange={e => F("decimal_places", e.target.value)} /></div>
            <div><Label>Multiplicador</Label><Input value={form.multiplier} onChange={e => F("multiplier", e.target.value)} /></div>
            <div className="col-span-2"><Label>Observações</Label><Input value={form.notes} onChange={e => F("notes", e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={save}>{editing ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
