import { useState } from "react";
import { DoctorDayHome } from "@/components/dashboard/DoctorDayHome";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TodayAgenda } from "@/components/dashboard/TodayAgenda";
import { RecentPatientsCard } from "@/components/dashboard/RecentPatientsCard";
import { useDashboardStats, useTodayAppointments, useRecentPatients } from "@/hooks/useDashboardStats";
import WhatsNewModal from "@/components/WhatsNewModal";
import {
  DoorOpen, Calendar, Users, ClipboardList, Stethoscope,
  BedDouble, Pill, FileText, AlertTriangle, ArrowRight,
  UserPlus, Bell, Microscope, HeartPulse, Settings2,
  Scissors, TrendingUp, BarChart3, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── role-based widget config ── */
type WidgetKey = "stats" | "agenda" | "alerts" | "patients" | "quickAccess";

const roleWidgets: Record<string, WidgetKey[]> = {
  medico: ["stats", "agenda", "alerts", "patients"],
  enfermeiro: ["stats", "agenda", "alerts"],
  recepcionista: ["agenda", "quickAccess", "alerts"],
  farmaceutico: ["alerts", "quickAccess"],
  administrador: ["stats", "agenda", "alerts", "patients", "quickAccess"],
  default: ["stats", "agenda", "alerts", "patients", "quickAccess"],
};

/* ── quick access items ── */
const quickItems = [
  { label: "Sala de Espera", icon: DoorOpen, path: "/salas/espera", badge: 5 },
  { label: "Agenda", icon: Calendar, path: "/agenda" },
  { label: "Pacientes", icon: Users, path: "/patients" },
  { label: "Abertura", icon: ClipboardList, path: "/atendimentos/abertura" },
  { label: "Laudos", icon: Microscope, path: "/diagnostico/laudos", badge: 4 },
  { label: "Farmácia", icon: Pill, path: "/assistencial/farmacia", badge: 8 },
  { label: "Internados", icon: BedDouble, path: "/assistencial/internados" },
  { label: "Enfermagem", icon: HeartPulse, path: "/assistencial/enfermagem" },
  { label: "Centro Cirúrgico", icon: Scissors, path: "/agenda/centro-cirurgico" },
  { label: "Faturamento", icon: CreditCard, path: "/gerenciamento/faturamento" },
  { label: "Dashboards", icon: BarChart3, path: "/dashboards" },
  { label: "Gestão Agendas", icon: Settings2, path: "/agenda/admin" },
];

/* ── alerts mock ── */
const alerts = [
  { text: "8 prescrições pendentes de dispensação", path: "/assistencial/farmacia", module: "Farmácia" },
  { text: "4 laudos aguardando assinatura", path: "/diagnostico/laudos", module: "Diagnóstico" },
  { text: "2 pacientes na triagem sem classificação", path: "/assistencial/triagem", module: "Triagem" },
  { text: "3 retornos agendados sem confirmação", path: "/pacientes/retornos", module: "Pacientes" },
];

export default function OperationalHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: stats, isLoading: loadingStats } = useDashboardStats();
  const { data: appointments, isLoading: loadingAppts } = useTodayAppointments();
  const { data: recentPatients, isLoading: loadingPatients } = useRecentPatients();

  const [view, setView] = useState("meu-dia");
  const userRole = profile?.role || "default";
  const activeWidgets = roleWidgets[userRole] || roleWidgets.default;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Painel inicial</h1>
          <p className="text-sm text-muted-foreground">
            Resumo do seu dia, agenda e pendências em um só lugar
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/patients?new=1")} size="sm" variant="outline" className="gap-1.5 text-xs">
            <UserPlus className="h-3.5 w-3.5" />
            Novo Paciente
          </Button>
          <Button onClick={() => navigate("/atendimentos/abertura")} size="sm" className="gap-1.5 text-xs">
            <ClipboardList className="h-3.5 w-3.5" />
            Abrir Atendimento
          </Button>
        </div>
      </div>

      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="meu-dia" className="gap-1.5 text-xs">
            <Stethoscope className="h-3.5 w-3.5" /> Meu Dia
          </TabsTrigger>
          <TabsTrigger value="operacional" className="gap-1.5 text-xs">
            <TrendingUp className="h-3.5 w-3.5" /> Visão Operacional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meu-dia" className="mt-4">
          <DoctorDayHome
            appointments={appointments}
            loadingAppointments={loadingAppts}
            patients={recentPatients}
            doctorName={profile?.full_name || "Profissional"}
          />
        </TabsContent>

        <TabsContent value="operacional" className="mt-4 space-y-5">
      {/* Stats */}
      {activeWidgets.includes("stats") && (
        <StatsCards stats={stats} isLoading={loadingStats} />
      )}


      {/* Quick Access Grid */}
      {activeWidgets.includes("quickAccess") && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {quickItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-1 p-2.5 rounded-lg border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-center"
            >
              <item.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-[11px] font-medium text-foreground leading-tight">{item.label}</span>
              {item.badge && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] bg-destructive text-destructive-foreground">
                  {item.badge}
                </Badge>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {activeWidgets.includes("agenda") && (
            <TodayAgenda appointments={appointments} isLoading={loadingAppts} />
          )}

          {activeWidgets.includes("alerts") && alerts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bell className="h-3.5 w-3.5 text-warning" />
                  Pendências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {alerts.map((alert, i) => (
                  <button
                    key={i}
                    onClick={() => navigate(alert.path)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/60 transition-colors text-left"
                  >
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-warning" />
                    <span className="text-xs text-foreground flex-1">{alert.text}</span>
                    <Badge variant="outline" className="text-[9px] shrink-0">{alert.module}</Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  </button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        {activeWidgets.includes("patients") && (
          <RecentPatientsCard patients={recentPatients} isLoading={loadingPatients} />
        )}
      </div>
        </TabsContent>
      </Tabs>

      <WhatsNewModal />
    </div>
  );
}
