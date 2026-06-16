import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useLabEquipment } from "@/hooks/useLabIntegration";
import { useEquipmentMessages, useAnalyteMap } from "@/hooks/useLabEquipmentBench";
import { autoParse, SAMPLE_PAYLOADS } from "@/lib/equipmentParsers";
import { FlaskConical, Play, Send, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function LabIntSimulator() {
  const { list: eqList } = useLabEquipment();
  const { create: createMsg } = useEquipmentMessages();
  const { list: allMaps } = useAnalyteMap();
  const [equipmentId, setEquipmentId] = useState<string>("");
  const [raw, setRaw] = useState<string>("");
  const [parsed, setParsed] = useState<any>(null);

  const eqs = eqList.data ?? [];
  const selectedEq = eqs.find((e: any) => e.id === equipmentId);

  const loadTemplate = (key: keyof typeof SAMPLE_PAYLOADS) => {
    setRaw(SAMPLE_PAYLOADS[key]);
    setParsed(null);
    // Auto-pick matching equipment
    const map: Record<string, string> = { sysmexXn350: "XN-350", cobasC111: "c111", avl9180: "9180" };
    const m = map[key];
    const match = eqs.find((e: any) => e.model?.includes(m) || e.name?.includes(m));
    if (match) setEquipmentId(match.id);
  };

  const runParser = () => {
    if (!raw.trim()) { toast.error("Cole ou carregue uma mensagem primeiro"); return; }
    const p = autoParse(raw, selectedEq?.message_format);
    setParsed(p);
    if (!p.ok) toast.error("Erro no parser: " + (p.parse_error ?? "desconhecido"));
    else toast.success(`Parseado: ${p.results.length} resultados`);
  };

  const sendToBench = async () => {
    if (!equipmentId) { toast.error("Selecione o equipamento"); return; }
    if (!raw.trim()) { toast.error("Sem payload"); return; }
    const p = parsed ?? autoParse(raw, selectedEq?.message_format);
    await createMsg.mutateAsync({
      equipment_id: equipmentId,
      direction: "in",
      protocol: selectedEq?.protocol ?? "ASTM",
      raw_payload: raw,
      parsed_payload: p,
      sample_barcode: p.sampleBarcode ?? null,
      status: p.ok ? "parseado" : "erro",
      parse_error: p.parse_error ?? null,
      processed_at: new Date().toISOString(),
    });
    // Update equipment last_communication
    await (supabase as any).from("lab_equipment").update({
      last_communication_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      connection_status: "online",
    }).eq("id", equipmentId);
    toast.success("Mensagem enviada para o pipeline de interfaceamento");
  };

  // Resolve mapping for preview
  const previewWithMap = parsed?.results?.map((r: any) => {
    const map = (allMaps.data ?? []).find((m: any) => m.equipment_id === equipmentId && m.equipment_code === r.code);
    return { ...r, mapped: map?.analyte_name, mappedUnit: map?.unit, mapMissing: !map };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FlaskConical className="h-5 w-5" />
        <span className="text-sm">Simulador / Homologação — envie mensagens de teste e veja o parser em ação</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="cursor-pointer hover:border-primary transition" onClick={() => loadTemplate("sysmexXn350")}>
          <CardContent className="p-3">
            <p className="font-medium text-sm">Sysmex XN-350</p>
            <p className="text-xs text-muted-foreground">Hemograma ASTM E1394 — 8 analitos</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition" onClick={() => loadTemplate("cobasC111")}>
          <CardContent className="p-3">
            <p className="font-medium text-sm">Roche cobas c111</p>
            <p className="text-xs text-muted-foreground">Bioquímica ASTM — 7 analitos</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary transition" onClick={() => loadTemplate("avl9180")}>
          <CardContent className="p-3">
            <p className="font-medium text-sm">Roche AVL 9180</p>
            <p className="text-xs text-muted-foreground">Eletrólitos TXT — Na, K, Ca</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Mensagem do equipamento</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Equipamento de origem</Label>
              <Select value={equipmentId} onValueChange={setEquipmentId}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>{eqs.map((e: any) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={runParser} variant="outline" size="sm"><Play className="h-4 w-4 mr-1" />Rodar parser</Button>
              <Button onClick={sendToBench} size="sm"><Send className="h-4 w-4 mr-1" />Enviar para o pipeline</Button>
            </div>
          </div>
          <div>
            <Label>Payload bruto</Label>
            <Textarea value={raw} onChange={e => setRaw(e.target.value)} rows={10} className="font-mono text-xs" placeholder="Cole aqui a mensagem ASTM/HL7/TXT recebida do equipamento, ou clique em um dos templates acima." />
          </div>
        </CardContent>
      </Card>

      {parsed && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCheck className="h-4 w-4" /> Resultado do parser
              <Badge variant={parsed.ok ? "default" : "destructive"} className="text-xs">{parsed.protocol}</Badge>
              {parsed.sampleBarcode && <Badge variant="outline" className="text-xs font-mono">amostra: {parsed.sampleBarcode}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {parsed.parse_error ? (
              <div className="text-sm text-red-700 bg-red-50 p-3 rounded border border-red-200">{parsed.parse_error}</div>
            ) : (
              <div className="space-y-2">
                {previewWithMap?.length === 0 && <p className="text-sm text-muted-foreground">Nenhum resultado extraído.</p>}
                {previewWithMap?.map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2 border rounded text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{r.code}</span>
                      <span className="font-medium">{r.value}</span>
                      <span className="text-xs text-muted-foreground">{r.unit ?? r.mappedUnit}</span>
                      {r.flag && <Badge variant="outline" className="text-xs">{r.flag}</Badge>}
                    </div>
                    <div className="text-xs">
                      {r.mapped ? (
                        <span className="text-green-700">→ {r.mapped}</span>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Sem mapeamento</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
