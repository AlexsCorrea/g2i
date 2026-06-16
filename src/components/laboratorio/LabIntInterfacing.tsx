import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLabEquipment } from "@/hooks/useLabIntegration";
import { useEquipmentAgents, useEquipmentMessages } from "@/hooks/useLabEquipmentBench";
import { autoParse } from "@/lib/equipmentParsers";
import { Activity, Cable, Wifi, WifiOff, AlertTriangle, RefreshCw, Eye, Server } from "lucide-react";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  recebido: "bg-blue-100 text-blue-800",
  parseado: "bg-indigo-100 text-indigo-800",
  importado: "bg-green-100 text-green-800",
  erro: "bg-red-100 text-red-800",
  pendente: "bg-amber-100 text-amber-800",
};

export default function LabIntInterfacing() {
  const { list: equipList } = useLabEquipment();
  const { list: agents } = useEquipmentAgents();
  const { list: messages, update: updateMsg } = useEquipmentMessages();
  const [showRaw, setShowRaw] = useState<any>(null);

  const eqs = equipList.data ?? [];
  const onlineCount = eqs.filter((e: any) => e.connection_status === "online").length;
  const lastMsg = (eqId: string) => messages.data?.find((m: any) => m.equipment_id === eqId);
  const errorCount = messages.data?.filter((m: any) => m.status === "erro").length ?? 0;

  const reprocess = async (msg: any) => {
    const parsed = autoParse(msg.raw_payload, msg.protocol);
    await updateMsg.mutateAsync({
      id: msg.id,
      parsed_payload: parsed,
      sample_barcode: parsed.sampleBarcode ?? msg.sample_barcode,
      status: parsed.ok ? "parseado" : "erro",
      parse_error: parsed.parse_error ?? null,
      reprocessed_count: (msg.reprocessed_count ?? 0) + 1,
      processed_at: new Date().toISOString(),
    });
    toast.success(parsed.ok ? "Reprocessado com sucesso" : "Erro no parser");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Activity className="h-5 w-5" />
        <span className="text-sm">Camada de interfaceamento — equipamentos, agentes, mensagens brutas e logs técnicos</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-3 flex items-center gap-2">
          <Cable className="h-4 w-4 text-muted-foreground" />
          <div><p className="text-lg font-bold">{eqs.length}</p><p className="text-xs text-muted-foreground">Equipamentos</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-2">
          <Wifi className="h-4 w-4 text-green-500" />
          <div><p className="text-lg font-bold">{onlineCount}</p><p className="text-xs text-muted-foreground">Online</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-2">
          <Server className="h-4 w-4 text-indigo-500" />
          <div><p className="text-lg font-bold">{agents.data?.filter((a: any) => a.status === "online").length ?? 0}</p><p className="text-xs text-muted-foreground">Agentes ativos</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <div><p className="text-lg font-bold">{errorCount}</p><p className="text-xs text-muted-foreground">Mensagens c/ erro</p></div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="equipamentos" className="space-y-3">
        <TabsList>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="agentes">Agentes Locais</TabsTrigger>
          <TabsTrigger value="mensagens">Mensagens Brutas</TabsTrigger>
        </TabsList>

        <TabsContent value="equipamentos">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Equipamento</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última comunicação</TableHead>
                <TableHead>Última mensagem</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {eqs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Nenhum equipamento</TableCell></TableRow>
                ) : eqs.map((eq: any) => {
                  const last = lastMsg(eq.id);
                  const online = eq.connection_status === "online";
                  return (
                    <TableRow key={eq.id}>
                      <TableCell className="font-medium">{eq.name}<div className="text-xs text-muted-foreground">{eq.manufacturer} {eq.model}</div></TableCell>
                      <TableCell>{eq.sector ?? "—"}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-xs">{eq.protocol}</Badge></TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${online ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                          {online ? <Wifi className="h-3 w-3 inline mr-1" /> : <WifiOff className="h-3 w-3 inline mr-1" />}
                          {eq.connection_status ?? "offline"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{eq.last_communication_at ? new Date(eq.last_communication_at).toLocaleString("pt-BR") : "—"}</TableCell>
                      <TableCell className="text-xs">
                        {last ? (
                          <div>
                            <Badge className={`text-xs ${statusColor[last.status] || ""}`}>{last.status}</Badge>
                            <span className="ml-1 text-muted-foreground">{new Date(last.received_at).toLocaleTimeString("pt-BR")}</span>
                          </div>
                        ) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="agentes">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Agentes locais / bridges</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Agente</TableHead>
                  <TableHead>Equipamento</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Versão</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última comunicação</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {agents.data?.length === 0 || !agents.data ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Nenhum agente cadastrado. Use a aba Cadastros do interfaceamento para adicionar um agente local responsável por ler porta serial/TCP/arquivo.</TableCell></TableRow>
                  ) : agents.data.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell>{a.lab_equipment?.name ?? "—"}</TableCell>
                      <TableCell className="font-mono text-xs">{a.host_machine ?? "—"}</TableCell>
                      <TableCell className="text-xs">{a.agent_version ?? "—"}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${a.status === "online" ? "bg-green-100 text-green-800" : "bg-muted"}`}>
                          {a.status === "online" ? <Wifi className="h-3 w-3 inline mr-1" /> : <WifiOff className="h-3 w-3 inline mr-1" />}
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{a.last_seen_at ? new Date(a.last_seen_at).toLocaleString("pt-BR") : "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mensagens">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Recebida</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead>Protocolo</TableHead>
                <TableHead>Amostra</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reproc.</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {messages.isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Carregando...</TableCell></TableRow>
                ) : messages.data?.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Nenhuma mensagem recebida. Use o Simulador para enviar mensagens de teste.</TableCell></TableRow>
                ) : messages.data?.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs">{new Date(m.received_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-sm">{m.lab_equipment?.name ?? "—"}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-xs">{m.protocol ?? "—"}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{m.sample_barcode ?? "—"}</TableCell>
                    <TableCell><Badge className={`text-xs ${statusColor[m.status] || ""}`}>{m.status}</Badge></TableCell>
                    <TableCell className="text-xs">{m.reprocessed_count ?? 0}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setShowRaw(m)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => reprocess(m)}><RefreshCw className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!showRaw} onOpenChange={() => setShowRaw(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mensagem do equipamento</DialogTitle>
            <DialogDescription>{showRaw?.lab_equipment?.name} · {showRaw && new Date(showRaw.received_at).toLocaleString("pt-BR")}</DialogDescription>
          </DialogHeader>
          {showRaw && (
            <div className="space-y-3">
              <div className="text-xs grid grid-cols-3 gap-2">
                <div><span className="text-muted-foreground">Protocolo:</span> {showRaw.protocol}</div>
                <div><span className="text-muted-foreground">Status:</span> {showRaw.status}</div>
                <div><span className="text-muted-foreground">Amostra:</span> <span className="font-mono">{showRaw.sample_barcode ?? "—"}</span></div>
              </div>
              {showRaw.parse_error && (
                <div className="text-xs p-2 rounded bg-red-50 text-red-800 border border-red-200">{showRaw.parse_error}</div>
              )}
              <div>
                <p className="text-xs font-semibold mb-1">Payload bruto</p>
                <pre className="text-[11px] bg-muted/40 p-3 rounded font-mono whitespace-pre-wrap break-all max-h-60 overflow-auto">{showRaw.raw_payload}</pre>
              </div>
              {showRaw.parsed_payload && (
                <div>
                  <p className="text-xs font-semibold mb-1">Payload parseado</p>
                  <pre className="text-[11px] bg-muted/40 p-3 rounded font-mono whitespace-pre-wrap max-h-60 overflow-auto">{JSON.stringify(showRaw.parsed_payload, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
