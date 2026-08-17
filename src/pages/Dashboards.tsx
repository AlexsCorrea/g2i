import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Activity, HeartPulse, TrendingUp, Gauge, RefreshCw, Receipt, Banknote, Boxes, Route, Handshake } from "lucide-react";
import { OperationalDashboard } from "@/components/dashboards/OperationalDashboard";
import { ClinicalDashboard } from "@/components/dashboards/ClinicalDashboard";
import { ProductionDashboard } from "@/components/dashboards/ProductionDashboard";
import { PerformanceDashboard } from "@/components/dashboards/PerformanceDashboard";
import { BillingDashboard } from "@/components/dashboards/BillingDashboard";
import { FinanceDashboard } from "@/components/dashboards/FinanceDashboard";
import { InventoryDashboard } from "@/components/dashboards/InventoryDashboard";
import { CommercialDashboard } from "@/components/dashboards/CommercialDashboard";
import { JourneyCostDashboard } from "@/components/dashboards/JourneyCostDashboard";
import { useQueryClient } from "@tanstack/react-query";

const Dashboards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("operacional");

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard-operational"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-clinical"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-production"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-performance"] });
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Dashboards Hospitalares</h1>
              <p className="text-xs text-muted-foreground">Gestão e indicadores em tempo real</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 mb-6">
            <TabsTrigger value="operacional" className="gap-2 text-xs">
              <Activity className="h-4 w-4" /> Operacional
            </TabsTrigger>
            <TabsTrigger value="clinico" className="gap-2 text-xs">
              <HeartPulse className="h-4 w-4" /> Clínico
            </TabsTrigger>
            <TabsTrigger value="producao" className="gap-2 text-xs">
              <TrendingUp className="h-4 w-4" /> Produção
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2 text-xs">
              <Gauge className="h-4 w-4" /> Performance
            </TabsTrigger>
          </TabsList>

            <TabsTrigger value="faturamento" className="gap-2 text-xs">
              <Receipt className="h-4 w-4" /> Faturamento
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="gap-2 text-xs">
              <Banknote className="h-4 w-4" /> Financeiro
            </TabsTrigger>
            <TabsTrigger value="comercial" className="gap-2 text-xs">
              <Handshake className="h-4 w-4" /> Comercial
            </TabsTrigger>
            <TabsTrigger value="estoque" className="gap-2 text-xs">
              <Boxes className="h-4 w-4" /> Estoque
            </TabsTrigger>
            <TabsTrigger value="jornada" className="gap-2 text-xs">
              <Route className="h-4 w-4" /> Jornada e Custos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="operacional"><OperationalDashboard /></TabsContent>
          <TabsContent value="clinico"><ClinicalDashboard /></TabsContent>
          <TabsContent value="producao"><ProductionDashboard /></TabsContent>
          <TabsContent value="performance"><PerformanceDashboard /></TabsContent>
          <TabsContent value="faturamento"><BillingDashboard /></TabsContent>
          <TabsContent value="financeiro"><FinanceDashboard /></TabsContent>
          <TabsContent value="comercial"><CommercialDashboard /></TabsContent>
          <TabsContent value="estoque"><InventoryDashboard /></TabsContent>
          <TabsContent value="jornada"><JourneyCostDashboard /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboards;
