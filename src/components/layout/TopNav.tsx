import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart, LogOut, User, ChevronDown, DoorOpen, Calendar, Users,
  ClipboardList, Microscope, BarChart3, Stethoscope, Handshake, Bell, Search,
  CalendarDays, Scissors, Printer, Settings2, UserPlus, Tag, FolderArchive,
  RotateCcw, FileText, Receipt, Scale, BedDouble, ShieldCheck, FlaskConical,
  FileBarChart, Pill, Package, Utensils, Wallet, TrendingUp, CreditCard,
  Activity, Home as HomeIcon, Siren, HeartPulse, Beaker, ShieldAlert,
  ListChecks, Radiation, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── types ── */
interface SubItem {
  label: string;
  icon: React.ElementType;
  path: string;
}
interface MenuGroup {
  heading?: string;
  items: SubItem[];
}
interface MenuItem {
  label: string;
  icon: React.ElementType;
  groups: MenuGroup[];
  columns?: 1 | 2 | 3;
}

/* ── menu config ── */
const menuConfig: MenuItem[] = [
  {
    label: "Salas",
    icon: DoorOpen,
    groups: [
      {
        items: [
          { label: "Sala de Espera", icon: DoorOpen, path: "/salas/espera" },
          { label: "Sala de Procedimentos", icon: Stethoscope, path: "/salas/procedimentos" },
        ],
      },
    ],
  },
  {
    label: "Agenda",
    icon: Calendar,
    groups: [
      {
        heading: "Operacional",
        items: [
          { label: "Calendário", icon: CalendarDays, path: "/agenda" },
          { label: "Centro Cirúrgico", icon: Scissors, path: "/agenda/centro-cirurgico" },
          { label: "Imprimir Agenda", icon: Printer, path: "/agenda/imprimir" },
        ],
      },
      {
        heading: "Administração",
        items: [
          { label: "Gestão de Agendas", icon: Settings2, path: "/agenda/admin" },
        ],
      },
    ],
  },
  {
    label: "Pacientes",
    icon: Users,
    groups: [
      {
        heading: "Cadastro",
        items: [
          { label: "Pacientes", icon: Users, path: "/patients" },
          { label: "Cadastrar Paciente", icon: UserPlus, path: "/patients?new=1" },
        ],
      },
      {
        heading: "Gestão",
        items: [
          { label: "Gerenciar Retornos", icon: RotateCcw, path: "/pacientes/retornos" },
          { label: "Tags", icon: Tag, path: "/pacientes/tags" },
          { label: "SAME", icon: FolderArchive, path: "/pacientes/same" },
        ],
      },
    ],
  },
  {
    label: "Atendimentos",
    icon: ClipboardList,
    columns: 2,
    groups: [
      {
        heading: "Recepção",
        items: [
          { label: "Abertura de Atendimento", icon: ClipboardList, path: "/atendimentos/abertura" },
          { label: "Orçamento", icon: Receipt, path: "/atendimentos/orcamento" },
          { label: "Nota Fiscal", icon: FileText, path: "/atendimentos/nf" },
        ],
      },
      {
        heading: "Operacional",
        items: [
          { label: "Leitos", icon: BedDouble, path: "/atendimentos/leitos" },
          { label: "Escalas", icon: Scale, path: "/atendimentos/escalas" },
          { label: "Portaria", icon: ShieldCheck, path: "/atendimentos/portaria" },
          { label: "Relatórios", icon: FileBarChart, path: "/atendimentos/relatorios" },
        ],
      },
    ],
  },
  {
    label: "Diagnóstico",
    icon: Microscope,
    groups: [
      {
        items: [
          { label: "Laudos", icon: FileText, path: "/diagnostico/laudos" },
          { label: "Fila de Exames", icon: ListChecks, path: "/diagnostico/fila" },
          { label: "Gerar Etiquetas", icon: Tag, path: "/diagnostico/etiquetas" },
        ],
      },
    ],
  },
  {
    label: "Gerenciamento",
    icon: BarChart3,
    columns: 3,
    groups: [
      {
        heading: "Financeiro",
        items: [
          { label: "Dashboard Financeiro", icon: Wallet, path: "/gerenciamento/financeiro" },
          { label: "Contas a Pagar", icon: TrendingUp, path: "/gerenciamento/financeiro" },
          { label: "Contas a Receber", icon: CreditCard, path: "/gerenciamento/financeiro" },
          { label: "Faturamento", icon: Receipt, path: "/gerenciamento/faturamento" },
        ],
      },
      {
        heading: "Indicadores",
        items: [
          { label: "Indicadores do Estabelecimento", icon: TrendingUp, path: "/dashboards" },
          { label: "Produtividade", icon: Activity, path: "/gerenciamento/produtividade" },
        ],
      },
      {
        heading: "Estoque",
        items: [
          { label: "Farmácia", icon: Pill, path: "/gerenciamento/estoque/farmacia" },
          { label: "Almoxarifado", icon: Package, path: "/gerenciamento/estoque/almoxarifado" },
          { label: "Laboratório", icon: Beaker, path: "/gerenciamento/estoque/laboratorio" },
          { label: "Nutrição", icon: Utensils, path: "/gerenciamento/estoque/nutricao" },
          { label: "CME", icon: FlaskConical, path: "/cme" },
        ],
      },
    ],
  },
  {
    label: "Assistencial",
    icon: HeartPulse,
    columns: 3,
    groups: [
      {
        heading: "Pacientes Admitidos",
        items: [
          { label: "Home Care", icon: HomeIcon, path: "/assistencial/homecare" },
          { label: "Internados", icon: BedDouble, path: "/assistencial/internados" },
          { label: "UTI", icon: HeartPulse, path: "/assistencial/uti" },
          { label: "Pronto Atendimento", icon: Siren, path: "/assistencial/pa" },
        ],
      },
      {
        heading: "Setores Executores",
        items: [
          { label: "Enfermagem", icon: Activity, path: "/assistencial/enfermagem" },
          { label: "Farmácia", icon: Pill, path: "/assistencial/farmacia" },
          { label: "Procedimentos", icon: Stethoscope, path: "/assistencial/procedimentos" },
          { label: "Nutrição", icon: Utensils, path: "/assistencial/nutricao" },
          { label: "CME / Expurgo", icon: FlaskConical, path: "/cme" },
        ],
      },
      {
        heading: "Especializado",
        items: [
          { label: "Laboratório", icon: FlaskConical, path: "/laboratorio" },
          { label: "SCIH", icon: ShieldAlert, path: "/assistencial/scih" },
          { label: "Triagem", icon: ListChecks, path: "/assistencial/triagem" },
          { label: "Oncologia", icon: Radiation, path: "/assistencial/oncologia" },
        ],
      },
    ],
  },
  {
    label: "Cadastros",
    icon: Settings,
    groups: [
      {
        heading: "Profissionais",
        items: [
          { label: "Solicitantes", icon: Stethoscope, path: "/cadastros/solicitantes" },
        ],
      },
    ],
  },
  {
    label: "CRM",
    icon: Handshake,
    groups: [
      {
        items: [
          { label: "Solicitações", icon: FileText, path: "/crm/solicitacoes" },
          { label: "Negociação", icon: Handshake, path: "/crm/negociacao" },
          { label: "Relacionamento", icon: Users, path: "/crm/relacionamento" },
        ],
      },
    ],
  },
];

/* ── component ── */
export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  const handleLeave = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 150);
  };

  useEffect(() => { setOpenMenu(null); }, [location.pathname]);

  if (!user) return null;

  const roleName = profile?.role
    ? profile.role.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "Profissional";

  return (
    <header className="sticky top-0 z-[60] border-b border-border bg-card shadow-sm isolate">
      <div className="max-w-[1920px] mx-auto flex items-center h-12 px-4">
        {/* Brand */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 mr-4 shrink-0 hover:opacity-80 transition-opacity"
        >
          <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
            <Heart className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="font-semibold text-sm text-foreground hidden lg:inline">Zurich</span>
        </button>

        {/* Menu items */}
        <nav className="flex items-center flex-1">
          {menuConfig.map((menu) => {
            const isOpen = openMenu === menu.label;
            const cols = menu.columns ?? 1;

            return (
              <div
                key={menu.label}
                className="relative"
                onMouseEnter={() => handleEnter(menu.label)}
                onMouseLeave={handleLeave}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-2.5 py-1.5 rounded text-[13px] font-medium transition-colors whitespace-nowrap",
                    isOpen
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <menu.icon className="h-3.5 w-3.5" />
                  <span className="hidden xl:inline">{menu.label}</span>
                  <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
                </button>

                {/* Dropdown — opens downward, no scroll */}
                {isOpen && (
                  <div
                    className={cn(
                      "absolute top-full left-0 mt-0.5 bg-popover border border-border rounded-lg shadow-lg py-1.5 z-50",
                      cols === 3 && "flex",
                      cols === 2 && "flex",
                      cols === 1 && "min-w-[220px]",
                    )}
                    onMouseEnter={() => handleEnter(menu.label)}
                    onMouseLeave={handleLeave}
                  >
                    {menu.groups.map((group, gi) => (
                      <div
                        key={gi}
                        className={cn(
                          "min-w-[200px]",
                          cols > 1 && gi > 0 && "border-l border-border",
                          "px-1",
                        )}
                      >
                        {group.heading && (
                          <div className="px-2.5 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {group.heading}
                          </div>
                        )}
                        {group.items.map((item) => (
                          <button
                            key={item.path + item.label}
                            onClick={() => navigate(item.path)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left text-[13px] transition-colors",
                              "hover:bg-muted/60",
                              location.pathname === item.path
                                ? "text-primary font-medium bg-primary/5"
                                : "text-foreground",
                            )}
                          >
                            <item.icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-1 ml-2 shrink-0">
          <button
            onClick={() => navigate("/patients")}
            className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Buscar paciente"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
          <button
            className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors relative"
            title="Notificações"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-destructive" />
          </button>
          <button
            onClick={() => navigate("/configuracoes")}
            className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            title="Configurações"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          {/* User */}
          <div className="relative group ml-1">
            <button className="flex items-center gap-2 px-2 py-1 rounded hover:bg-muted/60 transition-colors">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-3 w-3 text-primary" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-medium text-foreground leading-tight truncate max-w-[120px]">
                  {profile?.full_name || user.email?.split("@")[0]}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">{roleName}</div>
              </div>
            </button>
            <div className="absolute top-full right-0 mt-0.5 w-44 bg-popover border border-border rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => navigate("/configuracoes")}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-foreground hover:bg-muted/60 transition-colors"
              >
                <Settings className="h-3.5 w-3.5" />
                Configurações
              </button>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
