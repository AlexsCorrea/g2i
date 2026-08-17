import { useState } from "react";
import {
  LayoutDashboard, Stethoscope, Heart, Activity, Apple, Brain, Pill, Eye, Ear,
  FileText, Scale, ClipboardList, Shield, Users, Scissors, Zap, Link2,
  ChevronDown, ChevronRight, BedDouble, Syringe, Thermometer, FlaskConical,
  HeartPulse, Droplets, Hand, Smile, ShieldCheck, Bug, Archive, History,
  LogOut, PanelLeftClose, PanelLeftOpen, UserCog, BarChart2, Baby, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface SidebarSection {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  children?: { id: string; label: string; icon?: React.ElementType }[];
}

const sections: SidebarSection[] = [
  { id: "resumo", label: "Resumo", icon: LayoutDashboard },
  {
    id: "episodio",
    label: "Episódio Assistencial",
    icon: ClipboardList,
    children: [
      { id: "atendimento", label: "Atendimento Atual", icon: ClipboardList },
      { id: "admissao", label: "Admissão / Internação", icon: BedDouble },
      { id: "transferencias", label: "Transferências", icon: BedDouble },
      { id: "alta-desfecho", label: "Alta e Desfecho", icon: LogOut },
    ],
  },
  {
    id: "area-medica",
    label: "Área Médica",
    icon: Stethoscope,
    children: [
      { id: "evolucao-medica", label: "Evolução Médica", icon: ClipboardList },
      { id: "admissao-diagnostico", label: "Diagnósticos (CID)", icon: FileText },
    ],
  },
  {
    id: "prescricao",
    label: "Prescrição Integrada",
    icon: Pill,
    children: [
      { id: "prescricoes", label: "Prescrição Médica", icon: Pill },
      { id: "checagem-enfermagem", label: "Checagem / Aprazamento", icon: Heart },
      { id: "historico-prescricao", label: "Histórico de Prescrições", icon: History },
    ],
  },
  {
    id: "area-enfermagem",
    label: "Área Enfermagem",
    icon: Heart,
    children: [
      { id: "evolucao-enfermagem", label: "Evolução Enfermagem", icon: ClipboardList },
      { id: "sinais-vitais", label: "Sinais Vitais", icon: Activity },
      { id: "escalas", label: "Escalas de Risco", icon: Scale },
      { id: "balanco-hidrico", label: "Balanço Hídrico", icon: Droplets },
    ],
  },
  {
    id: "area-farmacia",
    label: "Farmácia Hospitalar",
    icon: FlaskConical,
    children: [
      { id: "dispensacao", label: "Dispensação", icon: Pill },
      { id: "interacoes", label: "Interações Medicamentosas", icon: Shield },
      { id: "estoque-paciente", label: "Estoque por Paciente", icon: Archive },
    ],
  },
  {
    id: "exames",
    label: "Exames e Diagnóstico",
    icon: FlaskConical,
    children: [
      { id: "pedidos-exames", label: "Solicitação de Exames", icon: FileText },
      { id: "resultados-exames", label: "Resultados", icon: FileText },
      { id: "imagens", label: "Exames de Imagem", icon: Eye },
      { id: "galeria-exames", label: "Galeria de Exames", icon: Eye },
    ],
  },
  {
    id: "centro-cirurgico",
    label: "Centro Cirúrgico",
    icon: Scissors,
    children: [
      { id: "bloco-cirurgico", label: "Agenda / Descrição", icon: Scissors },
      { id: "anestesia", label: "Anestesia", icon: Syringe },
      { id: "checklist-cirurgico", label: "Checklist de Segurança", icon: ShieldCheck },
    ],
  },
  {
    id: "uti",
    label: "UTI / Terapia Intensiva",
    icon: HeartPulse,
    children: [
      { id: "evolucao-uti", label: "Evolução UTI", icon: ClipboardList },
      { id: "ventilacao", label: "Ventilação Mecânica", icon: Activity },
      { id: "drogas-vasoativas", label: "Drogas Vasoativas", icon: Thermometer },
    ],
  },
  {
    id: "hemodinamica-area",
    label: "Hemodinâmica",
    icon: Zap,
    children: [
      { id: "hemodinamica", label: "Procedimentos", icon: Zap },
    ],
  },
  {
    id: "multidisciplinar",
    label: "Equipe Multidisciplinar",
    icon: Users,
    children: [
      { id: "evolucao-nutricao", label: "Nutrição", icon: Apple },
      { id: "dieta", label: "Dieta Prescrita", icon: Apple },
      { id: "evolucao-fisioterapia", label: "Fisioterapia", icon: Activity },
      { id: "evolucao-psicologia", label: "Psicologia", icon: Brain },
      { id: "evolucao-fono", label: "Fonoaudiologia", icon: Ear },
      { id: "evolucao-social", label: "Serviço Social", icon: Users },
      { id: "terapia-ocupacional", label: "Terapia Ocupacional", icon: Hand },
    ],
  },
  {
    id: "odontologia-area",
    label: "Odontologia Hospitalar",
    icon: Smile,
    children: [
      { id: "odontologia", label: "Evolução / Atendimento", icon: ClipboardList },
      { id: "odontograma", label: "Odontograma", icon: Smile },
      { id: "periograma", label: "Periograma", icon: Smile },
    ],
  },
  {
    id: "seguranca",
    label: "Segurança e Qualidade",
    icon: ShieldCheck,
    children: [
      { id: "seguranca-paciente", label: "Segurança do Paciente", icon: ShieldCheck },
      { id: "ccih", label: "Controle de Infecção", icon: Bug },
    ],
  },
  {
    id: "documentos",
    label: "Documentos e Anexos",
    icon: FileText,
    children: [
      { id: "termos", label: "Termos de Consentimento", icon: FileText },
      { id: "anexos", label: "Anexos e Arquivos", icon: Link2 },
    ],
  },
  {
    id: "analise-clinica",
    label: "Análise Clínica",
    icon: BarChart2,
    children: [
      { id: "analise-geral", label: "Painel Geral", icon: BarChart2 },
      { id: "analise-pediatria", label: "Pediatria", icon: Baby },
      { id: "analise-cardiologia", label: "Cardiologia", icon: HeartPulse },
      { id: "analise-uti", label: "UTI / Críticos", icon: HeartPulse },
      { id: "analise-tendencias", label: "Tendências", icon: TrendingUp },
      { id: "painel-boards", label: "Painéis (Boards)", icon: BarChart2 },
      { id: "formularios-paciente", label: "Formulários do Paciente", icon: ClipboardList },
    ],
  },

  {
    id: "auditoria-geral",
    label: "Auditoria e Histórico",
    icon: History,
    children: [
      { id: "auditoria", label: "Log de Auditoria", icon: History },
      { id: "timeline-clinica", label: "Timeline Clínica", icon: Activity },
    ],
  },
];

interface ProntuarioSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  allergiesCount?: number;
  documentsCount?: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ProntuarioSidebar({
  activeSection,
  onSectionChange,
  allergiesCount,
  documentsCount,
  collapsed = false,
  onToggleCollapse,
}: ProntuarioSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleExpand = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((s) => s !== sectionId) : [...prev, sectionId]
    );
  };

  const handleClick = (section: SidebarSection) => {
    if (collapsed && section.children) {
      onToggleCollapse?.();
      setExpandedSections((prev) => [...prev, section.id]);
      return;
    }
    if (section.children) {
      toggleExpand(section.id);
    } else {
      onSectionChange(section.id);
    }
  };

  const getBadge = (id: string) => {
    if (id === "documentos" && documentsCount) return documentsCount;
    return undefined;
  };

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-2 gap-0.5">
        <Button variant="ghost" size="icon" className="mb-2 h-8 w-8" onClick={onToggleCollapse}>
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id || section.children?.some((c) => c.id === activeSection);
          return (
            <Tooltip key={section.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleClick(section)}
                  className={cn(
                    "w-9 h-9 flex items-center justify-center rounded-lg transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">{section.label}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between px-3 py-2 mb-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Prontuário</span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleCollapse}>
          <PanelLeftClose className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-320px)]">
        <nav className="pr-2 space-y-0.5">
          {sections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections.includes(section.id);
            const isActive = activeSection === section.id;
            const hasActiveChild = section.children?.some((c) => c.id === activeSection);
            const badge = getBadge(section.id);

            return (
              <div key={section.id}>
                <button
                  onClick={() => handleClick(section)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors",
                    isActive || hasActiveChild
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">{section.label}</span>
                  {badge && (
                    <Badge variant="destructive" className="text-[9px] h-4 min-w-4 px-1">
                      {badge}
                    </Badge>
                  )}
                  {section.children &&
                    (isExpanded ? (
                      <ChevronDown className="h-3 w-3 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-3 w-3 flex-shrink-0" />
                    ))}
                </button>

                {section.children && isExpanded && (
                  <div className="ml-4 pl-2.5 border-l border-border space-y-0.5 mt-0.5">
                    {section.children.map((child) => {
                      const ChildIcon = child.icon || FileText;
                      const isChildActive = activeSection === child.id;

                      return (
                        <button
                          key={child.id}
                          onClick={() => onSectionChange(child.id)}
                          className={cn(
                            "w-full flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] transition-colors",
                            isChildActive
                              ? "bg-primary/10 text-primary font-semibold"
                              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                          )}
                        >
                          <ChildIcon className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
