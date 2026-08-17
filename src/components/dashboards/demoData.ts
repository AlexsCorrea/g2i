// Dados demonstrativos (mock) para dashboards de gestão.
// Não representam dados reais do banco — uso para apresentação/planejamento.

export const DEMO_BADGE = "Dados demonstrativos";

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago"];

// ── Faturamento ──
export const faturamentoMensal = meses.map((mes, i) => ({
  mes,
  faturado: 780000 + i * 42000 + (i % 3) * 25000,
  glosado: 48000 - i * 1200 + (i % 2) * 9000,
  recebido: 690000 + i * 39000 + (i % 4) * 18000,
}));

export const faturamentoPorConvenio = [
  { nome: "SUS", valor: 1420000, contas: 3120, glosa: 4.1 },
  { nome: "Unimed", valor: 1180000, contas: 1840, glosa: 6.8 },
  { nome: "Bradesco Saúde", valor: 640000, contas: 910, glosa: 8.2 },
  { nome: "Amil", valor: 430000, contas: 620, glosa: 7.4 },
  { nome: "Particular", valor: 310000, contas: 540, glosa: 0.9 },
];

export const contasPorStatus = [
  { status: "Em aberto", qtd: 412, valor: 486000, color: "hsl(210, 85%, 45%)" },
  { status: "Em análise", qtd: 168, valor: 214000, color: "hsl(38, 92%, 50%)" },
  { status: "Faturado", qtd: 903, valor: 1240000, color: "hsl(160, 70%, 38%)" },
  { status: "Glosado", qtd: 97, valor: 132000, color: "hsl(0, 72%, 51%)" },
];

export const topProcedimentosFaturados = [
  { nome: "Facectomia com LIO", qtd: 214, ticket: 3800 },
  { nome: "Consulta especializada", qtd: 1860, ticket: 190 },
  { nome: "Colecistectomia VL", qtd: 78, ticket: 6200 },
  { nome: "Tomografia computadorizada", qtd: 342, ticket: 640 },
  { nome: "Hemograma completo", qtd: 2410, ticket: 28 },
];

// ── Closers / Comercial ──
export const closers = [
  { nome: "Ana Rodrigues", leads: 182, convertidos: 96, receita: 412000, meta: 380000 },
  { nome: "Carlos Menezes", leads: 164, convertidos: 71, receita: 318000, meta: 350000 },
  { nome: "Juliana Prado", leads: 148, convertidos: 83, receita: 366000, meta: 340000 },
  { nome: "Rafael Lima", leads: 131, convertidos: 52, receita: 221000, meta: 300000 },
  { nome: "Bianca Souza", leads: 118, convertidos: 61, receita: 268000, meta: 250000 },
];

export const funilComercial = [
  { etapa: "Leads recebidos", valor: 743 },
  { etapa: "Contato efetivo", valor: 588 },
  { etapa: "Orçamento enviado", valor: 401 },
  { etapa: "Negociação", valor: 262 },
  { etapa: "Procedimento agendado", valor: 363 },
];

export const origemLeads = [
  { nome: "Indicação médica", valor: 32, color: "hsl(210, 85%, 45%)" },
  { nome: "Google / Ads", valor: 26, color: "hsl(160, 70%, 38%)" },
  { nome: "Redes sociais", valor: 21, color: "hsl(38, 92%, 50%)" },
  { nome: "Convênio", valor: 14, color: "hsl(280, 60%, 55%)" },
  { nome: "Retorno / base", valor: 7, color: "hsl(0, 72%, 51%)" },
];

// ── Financeiro ──
export const fluxoCaixa = meses.map((mes, i) => ({
  mes,
  entradas: 720000 + i * 36000,
  saidas: 610000 + i * 27000 + (i % 3) * 22000,
  saldo: 110000 + i * 9000 - (i % 3) * 12000,
}));

export const despesasPorCategoria = [
  { nome: "Pessoal e encargos", valor: 2140000, color: "hsl(210, 85%, 45%)" },
  { nome: "Materiais e medicamentos", valor: 980000, color: "hsl(160, 70%, 38%)" },
  { nome: "Serviços terceirizados", valor: 520000, color: "hsl(38, 92%, 50%)" },
  { nome: "Infraestrutura", valor: 380000, color: "hsl(280, 60%, 55%)" },
  { nome: "Impostos e taxas", valor: 296000, color: "hsl(0, 72%, 51%)" },
];

export const inadimplencia = meses.map((mes, i) => ({
  mes,
  percentual: Number((6.4 - i * 0.32 + (i % 3) * 0.7).toFixed(1)),
}));

export const contasCriticas = [
  { descricao: "Fornecedor de OPME", vencimento: "20/08", valor: 184000, tipo: "pagar" as const },
  { descricao: "Unimed — repasse competência 07", vencimento: "22/08", valor: 412000, tipo: "receber" as const },
  { descricao: "Folha de pagamento", vencimento: "30/08", valor: 786000, tipo: "pagar" as const },
  { descricao: "SUS — produção AIH", vencimento: "05/09", valor: 268000, tipo: "receber" as const },
];

// ── Estoque ──
export const estoqueCurvaABC = [
  { classe: "A", itens: 84, valor: 1180000, participacao: 71 },
  { classe: "B", itens: 196, valor: 320000, participacao: 19 },
  { classe: "C", itens: 512, valor: 164000, participacao: 10 },
];

export const consumoPorSetor = [
  { setor: "Centro Cirúrgico", valor: 386000 },
  { setor: "UTI", valor: 274000 },
  { setor: "Internação", valor: 198000 },
  { setor: "Ambulatório", valor: 121000 },
  { setor: "Laboratório", valor: 96000 },
  { setor: "CME", valor: 58000 },
];

export const itensCriticos = [
  { item: "Lente intraocular dobrável", saldo: 12, minimo: 40, validade: "12/2027", status: "critico" as const },
  { item: "Fio de sutura 5-0", saldo: 38, minimo: 60, validade: "05/2027", status: "atencao" as const },
  { item: "Dipirona 500mg ampola", saldo: 210, minimo: 150, validade: "02/2027", status: "ok" as const },
  { item: "Luva cirúrgica 7,5", saldo: 22, minimo: 80, validade: "09/2026", status: "critico" as const },
  { item: "Soro fisiológico 500ml", saldo: 340, minimo: 200, validade: "11/2026", status: "ok" as const },
  { item: "Cateter venoso 20G", saldo: 54, minimo: 70, validade: "01/2027", status: "atencao" as const },
];

export const giroEstoque = meses.map((mes, i) => ({
  mes,
  giro: Number((3.1 + i * 0.14 + (i % 3) * 0.2).toFixed(2)),
  ruptura: Number((4.8 - i * 0.28 + (i % 2) * 0.6).toFixed(1)),
}));

// ── Jornada do paciente ──
export const jornadaEtapas = [
  { etapa: "Agendamento", pacientes: 1240, tempoMedio: 0, sla: 100 },
  { etapa: "Check-in / Totem", pacientes: 1182, tempoMedio: 3, sla: 96 },
  { etapa: "Sala de espera", pacientes: 1160, tempoMedio: 18, sla: 78 },
  { etapa: "Triagem", pacientes: 1104, tempoMedio: 7, sla: 91 },
  { etapa: "Atendimento", pacientes: 1082, tempoMedio: 22, sla: 88 },
  { etapa: "Exames / apoio", pacientes: 612, tempoMedio: 41, sla: 69 },
  { etapa: "Desfecho / alta", pacientes: 1058, tempoMedio: 12, sla: 93 },
];

export const jornadaTempoTotal = meses.map((mes, i) => ({
  mes,
  minutos: 118 - i * 3 + (i % 3) * 6,
  nps: 62 + i * 2 + (i % 2) * 3,
}));

export const motivosAbandono = [
  { motivo: "Espera excessiva", valor: 38, color: "hsl(0, 72%, 51%)" },
  { motivo: "Falta de documentação", valor: 24, color: "hsl(38, 92%, 50%)" },
  { motivo: "Desistência pessoal", valor: 21, color: "hsl(210, 85%, 45%)" },
  { motivo: "Convênio não autorizado", valor: 17, color: "hsl(280, 60%, 55%)" },
];

// ── Custos ──
export const custoPorLinha = [
  { linha: "Oftalmologia", receita: 1420000, custo: 902000 },
  { linha: "Clínica médica", receita: 980000, custo: 741000 },
  { linha: "Cirurgia geral", receita: 1180000, custo: 864000 },
  { linha: "Pediatria", receita: 520000, custo: 448000 },
  { linha: "Laboratório", receita: 640000, custo: 372000 },
];

export const custoPorPaciente = meses.map((mes, i) => ({
  mes,
  custoMedio: 1420 - i * 24 + (i % 3) * 60,
  receitaMedia: 1980 - i * 12 + (i % 4) * 70,
}));

export const custoEstruturaTipo = [
  { nome: "Custo fixo", valor: 58, color: "hsl(210, 85%, 45%)" },
  { nome: "Custo variável", valor: 31, color: "hsl(160, 70%, 38%)" },
  { nome: "Custo indireto", valor: 11, color: "hsl(38, 92%, 50%)" },
];
