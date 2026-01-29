
import React from 'react';
import { LeadStatus, ColumnDefinition } from './types';

export const COLUMNS: ColumnDefinition[] = [
  {
    id: LeadStatus.ENTRADA,
    title: 'Entrada',
    description: 'Leads vindos do formulário',
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    id: LeadStatus.EM_PESQUISA,
    title: 'Em Pesquisa',
    description: 'Execução técnica de consulta ao INPI',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700'
  },
  {
    id: LeadStatus.VIABILIDADE_APROVADA,
    title: 'Viabilidade Aprovada',
    description: 'Caminho livre. Agendar reunião.',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  },
  {
    id: LeadStatus.VIABILIDADE_REPROVADA,
    title: 'Viabilidade Reprovada',
    description: 'Preparar solução e Agendar reunião.',
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  },
  {
    id: LeadStatus.REUNIAO_AGENDADA,
    title: 'Reunião Agendada',
    description: 'Adicionar data e hora no Google Agenda',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700'
  },
  {
    id: LeadStatus.AGUARDANDO_RESPOSTA,
    title: 'Aguardando Resposta',
    description: 'Follow-up de propostas feitas',
    color: 'bg-slate-50 border-slate-200 text-slate-700'
  },
  {
    id: LeadStatus.NAO_COMPARECEU,
    title: 'Não Compareceu',
    description: 'Recuperação de leads ausentes',
    color: 'bg-rose-50 border-rose-200 text-rose-700'
  },
  {
    id: LeadStatus.CONTRATO_FECHADO,
    title: 'Contrato Fechado',
    description: 'Sucesso comercial. Operacional iniciado.',
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    id: LeadStatus.RECUSOU_PROPOSTA,
    title: 'Proposta Recusada',
    description: 'Perda comercial ou adiamento.',
    color: 'bg-red-50 border-red-200 text-red-700'
  },
  {
    id: LeadStatus.SEM_RESPOSTA,
    title: 'Sem Resposta',
    description: 'Leads que pararam de interagir.',
    color: 'bg-zinc-100 border-zinc-300 text-zinc-600'
  }
];

export const REJECTION_REASONS = [
  "Preço / Investimento alto",
  "Já registrou com outro",
  "Desistiu do negócio/marca",
  "Sem verba no momento",
  "Não viu valor no registro",
  "Achou o processo demorado",
  "Problemas de comunicação",
  "Outros"
];

export const SISV_LOGO_URL = 'https://www.semissosemvendas.com.br/wp-content/uploads/2022/02/favicon.png';
