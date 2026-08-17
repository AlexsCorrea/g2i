export type FormFieldType = "text" | "textarea" | "number" | "date" | "select" | "radio" | "checkbox" | "scale";

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface PatientFormTemplate {
  id: string;
  title: string;
  description: string;
  category: "pre_consulta" | "triagem" | "satisfacao" | "consentimento" | "acompanhamento";
  estimatedMinutes: number;
  sections: FormSection[];
}

export const FORM_CATEGORY_LABEL: Record<PatientFormTemplate["category"], string> = {
  pre_consulta: "Pré-consulta",
  triagem: "Triagem",
  satisfacao: "Satisfação",
  consentimento: "Consentimento",
  acompanhamento: "Acompanhamento",
};

export const patientFormTemplates: PatientFormTemplate[] = [
  {
    id: "anamnese-pre-consulta",
    title: "Anamnese Pré-Consulta",
    description: "Questionário respondido pelo paciente antes do atendimento, alimentando a anamnese do prontuário.",
    category: "pre_consulta",
    estimatedMinutes: 6,
    sections: [
      {
        title: "Queixa e história atual",
        fields: [
          { id: "queixa", label: "Qual o principal motivo da consulta?", type: "textarea", required: true, placeholder: "Descreva o que está sentindo" },
          { id: "inicio", label: "Há quanto tempo começou?", type: "select", required: true, options: ["Menos de 24h", "1 a 7 dias", "1 a 4 semanas", "Mais de 1 mês", "Mais de 6 meses"] },
          { id: "intensidade", label: "Intensidade dos sintomas (0 a 10)", type: "scale", required: true },
          { id: "fatores", label: "O que melhora ou piora os sintomas?", type: "textarea" },
        ],
      },
      {
        title: "Antecedentes",
        fields: [
          { id: "doencas", label: "Doenças já diagnosticadas", type: "checkbox", options: ["Hipertensão", "Diabetes", "Asma", "Cardiopatia", "Doença renal", "Depressão/Ansiedade", "Nenhuma"] },
          { id: "cirurgias", label: "Cirurgias anteriores", type: "textarea", placeholder: "Tipo e ano" },
          { id: "medicamentos", label: "Medicamentos em uso contínuo", type: "textarea", placeholder: "Nome, dose e frequência" },
          { id: "alergias", label: "Alergias conhecidas", type: "textarea", placeholder: "Medicamentos, alimentos, látex..." },
        ],
      },
      {
        title: "Hábitos de vida",
        fields: [
          { id: "tabagismo", label: "Tabagismo", type: "radio", options: ["Nunca fumei", "Ex-fumante", "Fumante"] },
          { id: "alcool", label: "Consumo de álcool", type: "radio", options: ["Não consumo", "Social", "Frequente"] },
          { id: "atividade", label: "Atividade física por semana", type: "select", options: ["Nenhuma", "1 a 2 vezes", "3 a 4 vezes", "5 ou mais"] },
        ],
      },
    ],
  },
  {
    id: "triagem-sintomas",
    title: "Triagem de Sintomas / Risco",
    description: "Checagem rápida de sinais de alerta antes da chegada à unidade.",
    category: "triagem",
    estimatedMinutes: 3,
    sections: [
      {
        title: "Sinais de alerta",
        fields: [
          { id: "febre", label: "Apresentou febre nas últimas 48h?", type: "radio", required: true, options: ["Não", "Sim, até 38°C", "Sim, acima de 38°C"] },
          { id: "dispneia", label: "Falta de ar", type: "radio", required: true, options: ["Não", "Aos esforços", "Em repouso"] },
          { id: "dor_toracica", label: "Dor no peito", type: "radio", required: true, options: ["Não", "Leve", "Intensa"] },
          { id: "sintomas", label: "Outros sintomas presentes", type: "checkbox", options: ["Tosse", "Vômitos", "Diarreia", "Tontura", "Desmaio", "Sangramento"] },
          { id: "observacao", label: "Observações", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "satisfacao-atendimento",
    title: "Pesquisa de Satisfação (NPS)",
    description: "Avaliação da experiência do paciente após o atendimento.",
    category: "satisfacao",
    estimatedMinutes: 2,
    sections: [
      {
        title: "Sua experiência",
        fields: [
          { id: "nps", label: "De 0 a 10, quanto você recomendaria nossa instituição?", type: "scale", required: true },
          { id: "recepcao", label: "Atendimento da recepção", type: "radio", required: true, options: ["Ótimo", "Bom", "Regular", "Ruim"] },
          { id: "equipe", label: "Atendimento da equipe assistencial", type: "radio", required: true, options: ["Ótimo", "Bom", "Regular", "Ruim"] },
          { id: "espera", label: "Tempo de espera", type: "radio", options: ["Ótimo", "Bom", "Regular", "Ruim"] },
          { id: "comentario", label: "Deixe um comentário", type: "textarea" },
        ],
      },
    ],
  },
  {
    id: "consentimento-procedimento",
    title: "Termo de Consentimento Informado",
    description: "Ciência e autorização do paciente para realização de procedimento.",
    category: "consentimento",
    estimatedMinutes: 4,
    sections: [
      {
        title: "Identificação e ciência",
        fields: [
          { id: "procedimento", label: "Procedimento proposto", type: "text", required: true },
          { id: "responsavel", label: "Nome do responsável legal (se aplicável)", type: "text" },
          { id: "ciente_riscos", label: "Declaro estar ciente dos riscos, benefícios e alternativas", type: "radio", required: true, options: ["Sim, estou ciente", "Não concordo"] },
          { id: "duvidas", label: "Dúvidas registradas", type: "textarea" },
          { id: "assinatura", label: "Assinatura digital (nome completo)", type: "text", required: true, help: "Ao digitar seu nome completo você confirma o aceite eletrônico." },
        ],
      },
    ],
  },
  {
    id: "acompanhamento-pos-alta",
    title: "Acompanhamento Pós-Alta (7 dias)",
    description: "Monitoramento remoto do paciente após a alta hospitalar.",
    category: "acompanhamento",
    estimatedMinutes: 3,
    sections: [
      {
        title: "Como você está",
        fields: [
          { id: "estado", label: "Como se sente comparado à alta?", type: "radio", required: true, options: ["Melhor", "Igual", "Pior"] },
          { id: "dor", label: "Nível de dor atual (0 a 10)", type: "scale", required: true },
          { id: "medicacao", label: "Está tomando as medicações prescritas?", type: "radio", required: true, options: ["Sim, todas", "Parcialmente", "Não"] },
          { id: "retorno", label: "Precisou procurar atendimento de urgência?", type: "radio", options: ["Não", "Sim, pronto-socorro", "Sim, reinternação"] },
          { id: "relato", label: "Relato livre", type: "textarea" },
        ],
      },
    ],
  },
];

export interface FormLinkPayload {
  formId: string;
  patientId: string;
  patientName: string;
  createdAt: string;
}

export function encodeFormToken(payload: FormLinkPayload): string {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}

export function decodeFormToken(token: string): FormLinkPayload | null {
  try {
    return JSON.parse(decodeURIComponent(atob(token))) as FormLinkPayload;
  } catch {
    return null;
  }
}

const RESPONSES_KEY = "zurich_form_responses";

export interface StoredFormResponse {
  id: string;
  formId: string;
  patientId: string;
  patientName: string;
  answers: Record<string, unknown>;
  submittedAt: string;
}

export function loadFormResponses(patientId?: string): StoredFormResponse[] {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY);
    const all = raw ? (JSON.parse(raw) as StoredFormResponse[]) : [];
    return patientId ? all.filter((r) => r.patientId === patientId) : all;
  } catch {
    return [];
  }
}

export function saveFormResponse(response: StoredFormResponse) {
  const all = loadFormResponses();
  all.unshift(response);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(all.slice(0, 200)));
}
