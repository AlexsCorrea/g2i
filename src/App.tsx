import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Patients from "./pages/Patients";
import Prontuario from "./pages/Prontuario";
import Agenda from "./pages/Agenda";
import AgendaAdmin from "./pages/AgendaAdmin";
import AgendaCentroCirurgico from "./pages/AgendaCentroCirurgico";
import AgendaPrint from "./pages/AgendaPrint";
import AgendaReports from "./pages/AgendaReports";
import Autoagendamento from "./pages/Autoagendamento";
import Dashboards from "./pages/Dashboards";
import Kiosk from "./pages/Kiosk";
import KioskSelect from "./pages/KioskSelect";
import QueueMobile from "./pages/QueueMobile";
import QueuePanel from "./pages/QueuePanel";
import QueueTV from "./pages/QueueTV";
import Portal from "./pages/Portal";
import CME from "./pages/CME";
import AdminAutoatendimento from "./pages/AdminAutoatendimento";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import SalaEspera from "./pages/SalaEspera";

// Functional module pages
import AtendimentosAbertura from "./pages/AtendimentosAbertura";
import Leitos from "./pages/Leitos";
import Portaria from "./pages/Portaria";
import Financeiro from "./pages/Financeiro";
import Faturamento from "./pages/Faturamento";
import ProtocoloDocumentos from "./pages/ProtocoloDocumentos";
import ProtocoloDocumentosAdmin from "./pages/ProtocoloDocumentosAdmin";
import Estoque from "./pages/Estoque";
import Diagnostico from "./pages/Diagnostico";
import Escalas from "./pages/Escalas";
import Assistencial from "./pages/Assistencial";
import Laboratorio from "./pages/Laboratorio";
import Solicitantes from "./pages/Solicitantes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <MainLayout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Index />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/kiosk" element={<Kiosk />} />
                <Route path="/fila" element={<QueueMobile />} />
                <Route path="/portal" element={<Portal />} />
                <Route path="/painel" element={<QueuePanel />} />
                <Route path="/painel-tv" element={<QueueTV />} />
                <Route path="/autoagendamento" element={<Autoagendamento />} />

                {/* Protected routes */}
                <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
                <Route path="/prontuario/:id" element={<ProtectedRoute><Prontuario /></ProtectedRoute>} />
                <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
                <Route path="/agenda/admin" element={<ProtectedRoute><AgendaAdmin /></ProtectedRoute>} />
                <Route path="/dashboards" element={<ProtectedRoute><Dashboards /></ProtectedRoute>} />
                <Route path="/cme" element={<ProtectedRoute><CME /></ProtectedRoute>} />
                <Route path="/admin-autoatendimento" element={<ProtectedRoute><AdminAutoatendimento /></ProtectedRoute>} />
                <Route path="/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

                {/* Functional modules */}
                <Route path="/atendimentos/abertura" element={<ProtectedRoute><AtendimentosAbertura /></ProtectedRoute>} />
                <Route path="/atendimentos/leitos" element={<ProtectedRoute><Leitos /></ProtectedRoute>} />
                <Route path="/atendimentos/portaria" element={<ProtectedRoute><Portaria /></ProtectedRoute>} />
                <Route path="/atendimentos/escalas" element={<ProtectedRoute><Escalas /></ProtectedRoute>} />
                <Route path="/atendimentos/orcamento" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/atendimentos/nf" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/atendimentos/relatorios" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                <Route path="/gerenciamento/financeiro" element={<ProtectedRoute><Financeiro /></ProtectedRoute>} />
                <Route path="/gerenciamento/faturamento" element={<ProtectedRoute><Faturamento /></ProtectedRoute>} />
                <Route path="/gerenciamento/faturamento/protocolo" element={<ProtectedRoute><ProtocoloDocumentos /></ProtectedRoute>} />
                <Route path="/gerenciamento/faturamento/protocolo/admin" element={<ProtectedRoute><ProtocoloDocumentosAdmin /></ProtectedRoute>} />
                <Route path="/gerenciamento/produtividade" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/gerenciamento/caixa" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/gerenciamento/estoque/farmacia" element={<ProtectedRoute><Estoque stockType="farmacia" /></ProtectedRoute>} />
                <Route path="/gerenciamento/estoque/almoxarifado" element={<ProtectedRoute><Estoque stockType="almoxarifado" /></ProtectedRoute>} />
                <Route path="/gerenciamento/estoque/laboratorio" element={<ProtectedRoute><Estoque stockType="laboratorio" /></ProtectedRoute>} />
                <Route path="/gerenciamento/estoque/nutricao" element={<ProtectedRoute><Estoque stockType="nutricao" /></ProtectedRoute>} />

                <Route path="/diagnostico/laudos" element={<ProtectedRoute><Diagnostico /></ProtectedRoute>} />
                <Route path="/diagnostico/fila" element={<ProtectedRoute><Diagnostico /></ProtectedRoute>} />
                <Route path="/diagnostico/etiquetas" element={<ProtectedRoute><Diagnostico /></ProtectedRoute>} />

                {/* Laboratório */}
                <Route path="/laboratorio" element={<ProtectedRoute><Laboratorio /></ProtectedRoute>} />

                {/* Cadastros */}
                <Route path="/cadastros/solicitantes" element={<ProtectedRoute><Solicitantes /></ProtectedRoute>} />

                {/* Assistencial */}
                <Route path="/assistencial/homecare" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/internados" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/uti" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/pa" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/enfermagem" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/laboratorio" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/scih" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/farmacia" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/procedimentos" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/nutricao" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/triagem" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />
                <Route path="/assistencial/oncologia" element={<ProtectedRoute><Assistencial /></ProtectedRoute>} />

                {/* Salas */}
                <Route path="/salas/espera" element={<ProtectedRoute><SalaEspera /></ProtectedRoute>} />
                <Route path="/salas/procedimentos" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                {/* Agenda extras */}
                <Route path="/agenda/centro-cirurgico" element={<ProtectedRoute><AgendaCentroCirurgico /></ProtectedRoute>} />
                <Route path="/agenda/imprimir" element={<ProtectedRoute><AgendaPrint /></ProtectedRoute>} />
                <Route path="/agenda/relatorios" element={<ProtectedRoute><AgendaReports /></ProtectedRoute>} />

                {/* Pacientes extras */}
                <Route path="/pacientes/retornos" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/pacientes/tags" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/pacientes/same" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                {/* CRM */}
                <Route path="/crm/solicitacoes" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/crm/negociacao" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />
                <Route path="/crm/relacionamento" element={<ProtectedRoute><PlaceholderPage /></ProtectedRoute>} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
