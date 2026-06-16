import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useLabEquipment } from "@/hooks/useLabIntegration";
import { Cable, Plus, Search, Pencil, Eye } from "lucide-react";

const emptyForm: any = {
  name: "", manufacturer: "", model: "", serial_number: "", interface_code: "",
  sector: "", equipment_type: "", analytes_text: "",
  current_situation: "", current_system: "",
  status: "ativo", homolog_status: "pendente",
  connection_type: "serial", protocol: "ASTM", message_format: "ASTM-E1394",
  direction: "unidirecional",
  host: "", port: "",
  serial_port: "", baud_rate: "9600", data_bits: "8", stop_bits: "1", parity: "N", handshake: "none",
  file_directory: "",
  responsible: "", active: true, notes: "",
};

const homologColor: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800",
  em_analise: "bg-blue-100 text-blue-800",
  homologado: "bg-green-100 text-green-800",
  reprovado: "bg-red-100 text-red-800",
};

export default function LabIntEquipment() {
  const { list, create, update } = useLabEquipment();
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [search, setSearch] = useState("");

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (eq: any) => {
    setForm({
      ...emptyForm,
      ...eq,
      analytes_text: Array.isArray(eq.analytes) ? eq.analytes.join(", ") : "",
      port: eq.port?.toString() ?? "",
      baud_rate: eq.baud_rate?.toString() ?? "9600",
      data_bits: eq.data_bits?.toString() ?? "8",
      stop_bits: eq.stop_bits?.toString() ?? "1",
      active: eq.active !== false,
    });
    setEditingId(eq.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const { analytes_text, ...rest } = form;
    const payload: any = {
      ...rest,
      port: form.port ? Number(form.port) : null,
      baud_rate: form.baud_rate ? Number(form.baud_rate) : null,
      data_bits: form.data_bits ? Number(form.data_bits) : null,
      stop_bits: form.stop_bits ? Number(form.stop_bits) : null,
      analytes: analytes_text ? analytes_text.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
    };
    const cb = { onSuccess: () => setShowForm(false) };
    if (editingId) update.mutate({ id: editingId, ...payload }, cb);
    else create.mutate(payload, cb);
  };

  const filtered = list.data?.filter((eq: any) => {
    const s = search.toLowerCase();
    return !s || eq.name?.toLowerCase().includes(s) || eq.manufacturer?.toLowerCase().includes(s)
      || eq.model?.toLowerCase().includes(s) || eq.sector?.toLowerCase().includes(s);
  }) ?? [];

  const F = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Cable className="h-5 w-5" />
          <span className="text-sm">Cadastro de equipamentos de bancada (interfaceamento real — ASTM / RS-232 / TCP / arquivo)</span>
        </div>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Novo Equipamento</Button>
      </div>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar por nome, fabricante, setor..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Fabricante / Modelo</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Conexão</TableHead>
                <TableHead>Sistema atual</TableHead>
                <TableHead>Homologação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Carregando...</TableCell></TableRow>
              ) : !filtered.length ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum equipamento</TableCell></TableRow>
              ) : filtered.map((eq: any) => (
                <TableRow key={eq.id} className={!eq.active ? "opacity-60" : ""}>
                  <TableCell className="font-medium">{eq.name}</TableCell>
                  <TableCell>{eq.sector ?? "—"}</TableCell>
                  <TableCell className="text-sm">{eq.manufacturer} {eq.model && <span className="text-muted-foreground">· {eq.model}</span>}</TableCell>
                  <TableCell><Badge variant="secondary" className="text-xs">{eq.protocol ?? "—"}</Badge></TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{eq.connection_type ?? "—"}</Badge></TableCell>
                  <TableCell className="text-xs">{eq.current_system ?? "—"}</TableCell>
                  <TableCell><Badge className={`text-xs ${homologColor[eq.homolog_status] || "bg-muted"}`}>{eq.homolog_status ?? "—"}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowDetail(eq)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => openEdit(eq)}><Pencil className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail */}
      <Dialog open={!!showDetail} onOpenChange={() => setShowDetail(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{showDetail?.name}</DialogTitle><DialogDescription>Detalhes técnicos do equipamento</DialogDescription></DialogHeader>
          {showDetail && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Fabricante:</span> {showDetail.manufacturer}</div>
                <div><span className="text-muted-foreground">Modelo:</span> {showDetail.model}</div>
                <div><span className="text-muted-foreground">Setor:</span> {showDetail.sector ?? "—"}</div>
                <div><span className="text-muted-foreground">Tipo:</span> {showDetail.equipment_type ?? "—"}</div>
                <div><span className="text-muted-foreground">Nº Série:</span> <span className="font-mono">{showDetail.serial_number ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Interface:</span> <span className="font-mono">{showDetail.interface_code ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Sistema atual:</span> {showDetail.current_system ?? "—"}</div>
                <div><span className="text-muted-foreground">Situação:</span> {showDetail.current_situation ?? "—"}</div>
                <div><span className="text-muted-foreground">Protocolo:</span> {showDetail.protocol}</div>
                <div><span className="text-muted-foreground">Formato:</span> {showDetail.message_format ?? "—"}</div>
                <div><span className="text-muted-foreground">Direção:</span> {showDetail.direction ?? "—"}</div>
                <div><span className="text-muted-foreground">Tipo conexão:</span> {showDetail.connection_type}</div>
                <div><span className="text-muted-foreground">Host:</span> <span className="font-mono">{showDetail.host ? `${showDetail.host}:${showDetail.port ?? ""}` : "—"}</span></div>
                <div><span className="text-muted-foreground">Porta serial:</span> <span className="font-mono">{showDetail.serial_port ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Serial:</span> <span className="font-mono">{showDetail.baud_rate ?? "—"} {showDetail.data_bits}{showDetail.parity}{showDetail.stop_bits} {showDetail.handshake}</span></div>
                <div><span className="text-muted-foreground">Diretório:</span> <span className="font-mono text-xs">{showDetail.file_directory ?? "—"}</span></div>
                <div><span className="text-muted-foreground">Última comunicação:</span> {showDetail.last_communication_at ? new Date(showDetail.last_communication_at).toLocaleString("pt-BR") : "nunca"}</div>
                <div><span className="text-muted-foreground">Homologação:</span> <Badge className={`text-xs ${homologColor[showDetail.homolog_status] || "bg-muted"}`}>{showDetail.homolog_status}</Badge></div>
              </div>
              {showDetail.analytes?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Analitos atendidos</p>
                  <div className="flex flex-wrap gap-1">
                    {showDetail.analytes.map((a: string) => <Badge key={a} variant="outline" className="text-xs">{a}</Badge>)}
                  </div>
                </div>
              )}
              {showDetail.notes && <div><p className="text-xs text-muted-foreground mb-1">Observações</p><p className="text-sm">{showDetail.notes}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Equipamento" : "Novo Equipamento"}</DialogTitle>
            <DialogDescription>Dados do equipamento de bancada e parâmetros de interfaceamento</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Identificação</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label>Nome *</Label><Input value={form.name} onChange={e => F("name", e.target.value)} /></div>
                <div><Label>Fabricante</Label><Input value={form.manufacturer} onChange={e => F("manufacturer", e.target.value)} /></div>
                <div><Label>Modelo</Label><Input value={form.model} onChange={e => F("model", e.target.value)} /></div>
                <div><Label>Nº Série</Label><Input value={form.serial_number} onChange={e => F("serial_number", e.target.value)} /></div>
                <div><Label>Setor</Label><Input value={form.sector} onChange={e => F("sector", e.target.value)} placeholder="Hematologia / Bioquímica..." /></div>
                <div><Label>Tipo</Label><Input value={form.equipment_type} onChange={e => F("equipment_type", e.target.value)} placeholder="Analisador Hematológico..." /></div>
                <div className="md:col-span-3"><Label>Analitos / exames atendidos (separar por vírgula)</Label><Input value={form.analytes_text} onChange={e => F("analytes_text", e.target.value)} placeholder="WBC, RBC, HGB..." /></div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Situação no cliente</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><Label>Sistema atual interfaceado</Label><Input value={form.current_system} onChange={e => F("current_system", e.target.value)} placeholder="Luckmann, nenhum..." /></div>
                <div className="md:col-span-2"><Label>Situação atual</Label><Input value={form.current_situation} onChange={e => F("current_situation", e.target.value)} placeholder="Já interfaceado / Não interfaceado / Em análise..." /></div>
                <div>
                  <Label>Status homologação</Label>
                  <Select value={form.homolog_status} onValueChange={v => F("homolog_status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="em_analise">Em análise</SelectItem>
                      <SelectItem value="homologado">Homologado</SelectItem>
                      <SelectItem value="reprovado">Reprovado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status operacional</Label>
                  <Select value={form.status} onValueChange={v => F("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-6"><Switch checked={form.active} onCheckedChange={v => F("active", v)} /><Label>Ativo</Label></div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Protocolo / Mensagem</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>Protocolo</Label>
                  <Select value={form.protocol} onValueChange={v => F("protocol", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASTM">ASTM</SelectItem>
                      <SelectItem value="HL7">HL7 v2</SelectItem>
                      <SelectItem value="FHIR">FHIR</SelectItem>
                      <SelectItem value="CSV">CSV / TXT</SelectItem>
                      <SelectItem value="proprietario">Proprietário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Formato</Label><Input value={form.message_format} onChange={e => F("message_format", e.target.value)} placeholder="ASTM-E1394, HL7 ORU^R01..." /></div>
                <div>
                  <Label>Direção</Label>
                  <Select value={form.direction} onValueChange={v => F("direction", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidirecional">Unidirecional</SelectItem>
                      <SelectItem value="bidirecional">Bidirecional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Cód. Interface</Label><Input value={form.interface_code} onChange={e => F("interface_code", e.target.value)} /></div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Conexão física</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label>Tipo Conexão</Label>
                  <Select value={form.connection_type} onValueChange={v => F("connection_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serial">Serial / RS-232</SelectItem>
                      <SelectItem value="tcp">TCP/IP</SelectItem>
                      <SelectItem value="usb">USB</SelectItem>
                      <SelectItem value="arquivo">Pasta / Arquivo</SelectItem>
                      <SelectItem value="api">API HTTP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Host / IP</Label><Input value={form.host} onChange={e => F("host", e.target.value)} placeholder="192.168.1.10" /></div>
                <div><Label>Porta TCP</Label><Input value={form.port} onChange={e => F("port", e.target.value)} placeholder="5500" /></div>
                <div><Label>Porta serial / COM</Label><Input value={form.serial_port} onChange={e => F("serial_port", e.target.value)} placeholder="COM3 / /dev/ttyS0" /></div>
                <div><Label>Baud rate</Label><Input value={form.baud_rate} onChange={e => F("baud_rate", e.target.value)} /></div>
                <div><Label>Data bits</Label><Input value={form.data_bits} onChange={e => F("data_bits", e.target.value)} /></div>
                <div><Label>Stop bits</Label><Input value={form.stop_bits} onChange={e => F("stop_bits", e.target.value)} /></div>
                <div>
                  <Label>Parity</Label>
                  <Select value={form.parity} onValueChange={v => F("parity", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N">N (none)</SelectItem>
                      <SelectItem value="E">E (even)</SelectItem>
                      <SelectItem value="O">O (odd)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Handshake</Label>
                  <Select value={form.handshake} onValueChange={v => F("handshake", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">none</SelectItem>
                      <SelectItem value="xon_xoff">XON/XOFF</SelectItem>
                      <SelectItem value="rts_cts">RTS/CTS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3"><Label>Diretório de arquivos (se conexão for pasta)</Label><Input value={form.file_directory} onChange={e => F("file_directory", e.target.value)} placeholder="C:\\Lab\\In" /></div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Operacional</p>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Responsável técnico</Label><Input value={form.responsible} onChange={e => F("responsible", e.target.value)} /></div>
                <div className="col-span-2"><Label>Observações técnicas</Label><Textarea value={form.notes} onChange={e => F("notes", e.target.value)} rows={3} /></div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave}>{editingId ? "Salvar" : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
