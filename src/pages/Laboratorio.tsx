import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3, ClipboardList, Droplets, FlaskConical, TestTubes,
  Activity, FileCheck, FileText, Cable, Clock, FileBarChart, Settings2,
  Building2, ArrowLeftRight, Send, FileDown, ScrollText, AlertTriangle, Gauge,
  ListFilter, Tag, ListChecks, RefreshCw, Siren, Package,
} from "lucide-react";
import LabDashboard from "@/components/laboratorio/LabDashboard";
import LabRequests from "@/components/laboratorio/LabRequests";
import LabCollection from "@/components/laboratorio/LabCollection";
import LabTriage from "@/components/laboratorio/LabTriage";
import LabSamples from "@/components/laboratorio/LabSamples";
import LabProcessing from "@/components/laboratorio/LabProcessing";
import LabResults from "@/components/laboratorio/LabResults";
import LabReports from "@/components/laboratorio/LabReports";
import LabInterface from "@/components/laboratorio/LabInterface";
import LabPending from "@/components/laboratorio/LabPending";
import LabModuleReports from "@/components/laboratorio/LabModuleReports";
import LabSettings from "@/components/laboratorio/LabSettings";
import LabLabels from "@/components/laboratorio/LabLabels";
import LabWorklist from "@/components/laboratorio/LabWorklist";
import LabCriticals from "@/components/laboratorio/LabCriticals";
import LabRecollection from "@/components/laboratorio/LabRecollection";
import LabIntDashboard from "@/components/laboratorio/LabIntDashboard";
import LabIntPartners from "@/components/laboratorio/LabIntPartners";
import LabIntMappings from "@/components/laboratorio/LabIntMappings";
import LabIntQueue from "@/components/laboratorio/LabIntQueue";
import LabIntOrders from "@/components/laboratorio/LabIntOrders";
import LabIntResults from "@/components/laboratorio/LabIntResults";
import LabIntLogs from "@/components/laboratorio/LabIntLogs";
import LabIntIssues from "@/components/laboratorio/LabIntIssues";
import LabIntReports from "@/components/laboratorio/LabIntReports";
import LabIntConfig from "@/components/laboratorio/LabIntConfig";
import LabIntEquipment from "@/components/laboratorio/LabIntEquipment";
import LabIntInterfacing from "@/components/laboratorio/LabIntInterfacing";
import LabIntAnalyteMap from "@/components/laboratorio/LabIntAnalyteMap";
import LabIntSimulator from "@/components/laboratorio/LabIntSimulator";
import LabExtShipments from "@/components/laboratorio/LabExtShipments";
import LabExtWorklist from "@/components/laboratorio/LabExtWorklist";
import LabExtCriticals from "@/components/laboratorio/LabExtCriticals";
import LabExtRecollection from "@/components/laboratorio/LabExtRecollection";
import LabExtReports from "@/components/laboratorio/LabExtReports";

/* ── Abas do Laboratório Interno ── */
const mainTabs = [
  { value: "dashboard", label: "Dashboard", icon: BarChart3 },
  { value: "worklist", label: "Worklist", icon: ListChecks },
  { value: "requests", label: "Solicitações", icon: ClipboardList },
  { value: "collection", label: "Coleta", icon: Droplets },
  { value: "triage", label: "Triagem", icon: FlaskConical },
  { value: "samples", label: "Amostras", icon: TestTubes },
  { value: "labels", label: "Etiquetas", icon: Tag },
  { value: "processing", label: "Bancada", icon: Activity },
  { value: "results", label: "Resultados", icon: FileCheck },
  { value: "criticals", label: "Críticos", icon: Siren },
  { value: "recollection", label: "Recoleta", icon: RefreshCw },
  { value: "reports", label: "Laudos", icon: FileText },
  { value: "interface", label: "Equipamentos", icon: Cable },
  { value: "bench-equipment", label: "Equip. Bancada", icon: Cable },
  { value: "interfacing", label: "Interfaceamento", icon: Activity },
  { value: "analyte-map", label: "Mapeamento", icon: ArrowLeftRight },
  { value: "simulator", label: "Simulador", icon: FlaskConical },
  { value: "pending", label: "Pendências", icon: Clock },
  { value: "module-reports", label: "Relatórios", icon: FileBarChart },
  { value: "settings", label: "Cadastros", icon: Settings2 },
];

/* ── Abas do Apoio Externo ── */
const extTabs = [
  { value: "ext-dashboard", label: "Dashboard", icon: Gauge },
  { value: "ext-worklist", label: "Worklist Apoio", icon: ListChecks },
  { value: "ext-orders", label: "Pedidos Enviados", icon: Send },
  { value: "ext-shipments", label: "Remessas", icon: Package },
  { value: "ext-results", label: "Resultados do Apoio", icon: FileDown },
  { value: "ext-ext-reports", label: "Laudos do Apoio", icon: FileText },
  { value: "ext-criticals", label: "Críticos do Apoio", icon: Siren },
  { value: "ext-recollection", label: "Recoletas do Apoio", icon: RefreshCw },
  { value: "ext-pending", label: "Pendências", icon: AlertTriangle },
  { value: "ext-queue", label: "Fila de Integração", icon: ListFilter },
  { value: "ext-logs", label: "Logs", icon: ScrollText },
  { value: "ext-reports", label: "Relatórios", icon: FileBarChart },
  { value: "ext-partners", label: "Parceiros", icon: Building2 },
  { value: "ext-equipment", label: "Equipamentos", icon: Cable },
  { value: "ext-mappings", label: "Mapeamentos", icon: ArrowLeftRight },
  { value: "ext-config", label: "Configurações", icon: Settings2 },
];

export default function Laboratorio() {
  const [section, setSection] = useState<"lab" | "ext">("lab");
  const [labTab, setLabTab] = useState("dashboard");
  const [extTab, setExtTab] = useState("ext-dashboard");

  const handleSectionChange = (s: "lab" | "ext") => {
    setSection(s);
    if (s === "lab") setLabTab("dashboard");
    else setExtTab("ext-dashboard");
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Laboratório</h1>
          <p className="text-sm text-muted-foreground">
            {section === "lab"
              ? "Fluxo interno — fases pré-analítica, analítica e pós-analítica"
              : "Apoio externo — laboratórios parceiros, remessas e integração"}
          </p>
        </div>
        <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
          <button
            onClick={() => handleSectionChange("lab")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${section === "lab" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Interno
          </button>
          <button
            onClick={() => handleSectionChange("ext")}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${section === "ext" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Apoio Externo
          </button>
        </div>
      </div>

      {section === "lab" ? (
        <Tabs value={labTab} onValueChange={setLabTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {mainTabs.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs gap-1.5 data-[state=active]:bg-background">
                <t.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="dashboard"><LabDashboard /></TabsContent>
          <TabsContent value="worklist"><LabWorklist /></TabsContent>
          <TabsContent value="requests"><LabRequests /></TabsContent>
          <TabsContent value="collection"><LabCollection /></TabsContent>
          <TabsContent value="triage"><LabTriage /></TabsContent>
          <TabsContent value="samples"><LabSamples /></TabsContent>
          <TabsContent value="labels"><LabLabels /></TabsContent>
          <TabsContent value="processing"><LabProcessing /></TabsContent>
          <TabsContent value="results"><LabResults /></TabsContent>
          <TabsContent value="criticals"><LabCriticals /></TabsContent>
          <TabsContent value="recollection"><LabRecollection /></TabsContent>
          <TabsContent value="reports"><LabReports /></TabsContent>
          <TabsContent value="interface"><LabInterface /></TabsContent>
          <TabsContent value="bench-equipment"><LabIntEquipment /></TabsContent>
          <TabsContent value="interfacing"><LabIntInterfacing /></TabsContent>
          <TabsContent value="analyte-map"><LabIntAnalyteMap /></TabsContent>
          <TabsContent value="simulator"><LabIntSimulator /></TabsContent>
          <TabsContent value="pending"><LabPending /></TabsContent>
          <TabsContent value="module-reports"><LabModuleReports /></TabsContent>
          <TabsContent value="settings"><LabSettings /></TabsContent>
        </Tabs>
      ) : (
        <Tabs value={extTab} onValueChange={setExtTab} className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
            {extTabs.map(t => (
              <TabsTrigger key={t.value} value={t.value} className="text-xs gap-1.5 data-[state=active]:bg-background">
                <t.icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="ext-dashboard"><LabIntDashboard /></TabsContent>
          <TabsContent value="ext-worklist"><LabExtWorklist /></TabsContent>
          <TabsContent value="ext-orders"><LabIntOrders /></TabsContent>
          <TabsContent value="ext-shipments"><LabExtShipments /></TabsContent>
          <TabsContent value="ext-results"><LabIntResults /></TabsContent>
          <TabsContent value="ext-ext-reports"><LabExtReports /></TabsContent>
          <TabsContent value="ext-criticals"><LabExtCriticals /></TabsContent>
          <TabsContent value="ext-recollection"><LabExtRecollection /></TabsContent>
          <TabsContent value="ext-pending"><LabIntIssues /></TabsContent>
          <TabsContent value="ext-queue"><LabIntQueue /></TabsContent>
          <TabsContent value="ext-logs"><LabIntLogs /></TabsContent>
          <TabsContent value="ext-reports"><LabIntReports /></TabsContent>
          <TabsContent value="ext-partners"><LabIntPartners /></TabsContent>
          <TabsContent value="ext-equipment"><LabIntEquipment /></TabsContent>
          <TabsContent value="ext-mappings"><LabIntMappings /></TabsContent>
          <TabsContent value="ext-config"><LabIntConfig /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
