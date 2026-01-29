
export enum LeadStatus {
  ENTRADA = 'entrada',
  EM_PESQUISA = 'em_pesquisa',
  VIABILIDADE_APROVADA = 'viabilidade_aprovada',
  VIABILIDADE_REPROVADA = 'viabilidade_reprovada',
  REUNIAO_AGENDADA = 'reuniao_agendada',
  AGUARDANDO_RESPOSTA = 'aguardando_resposta',
  NAO_COMPARECEU = 'nao_compareceu',
  CONTRATO_FECHADO = 'contrato_fechado',
  RECUSOU_PROPOSTA = 'recusou_proposta',
  SEM_RESPOSTA = 'sem_resposta'
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  note?: string;
}

export interface Vendedor {
  id: string;
  nome: string;
  email: string;
  role?: 'admin' | 'vendedor';
}

export interface Lead {
  id: string;
  name: string; // nome_cliente
  whatsapp: string;
  email?: string;
  brandName: string; // nome_marca
  status: LeadStatus;
  createdAt: string;
  statusUpdatedAt?: string; // NOVO: Timestamp da última mudança de status
  vendedorId?: string; // ID do responsável
  
  // Custom technical fields from your table
  ramoAtividade?: string;
  possuiCnpj?: boolean;
  classeNice?: string;
  resumoAnalise?: string;
  linkPesquisa?: string;
  
  // Sales fields
  reunionDate?: string; // data_reuniao
  rejectionReason?: string; // motivo_perda
  observations?: string; // relatório/observações
  
  history: HistoryEntry[]; 
}

export interface ColumnDefinition {
  id: LeadStatus;
  title: string;
  description: string;
  color: string;
}
