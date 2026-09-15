import { OSStatus, OSPriority, Category } from '../types';

export function formatDateBR(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateOnlyBR(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export const STATUS_MAP: Record<OSStatus, { label: string; badgeClass: string; dotClass: string; description: string }> = {
  aberta: {
    label: 'Aberta',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dotClass: 'bg-amber-500',
    description: 'Aguardando triagem pelo setor de TI/CPD',
  },
  triagem: {
    label: 'Em Triagem',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
    dotClass: 'bg-sky-500',
    description: 'Sob avaliação técnica para direcionamento',
  },
  atribuida: {
    label: 'Atribuída',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    dotClass: 'bg-indigo-500',
    description: 'Designada a um técnico responsável',
  },
  em_andamento: {
    label: 'Em Andamento',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800 animate-pulse',
    dotClass: 'bg-blue-500',
    description: 'Técnico trabalhando na resolução',
  },
  aguardando_peca: {
    label: 'Aguardando Peça',
    badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    dotClass: 'bg-orange-500',
    description: 'Pendente de insumo, peça ou aquisição',
  },
  resolvida: {
    label: 'Resolvida',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    dotClass: 'bg-teal-500',
    description: 'Problema sanado, pronta para entrega',
  },
  entregue: {
    label: 'Entregue',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
    description: 'Devolvida ao setor com recibo formal',
  },
  fechada: {
    label: 'Fechada',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    dotClass: 'bg-slate-500',
    description: 'Ordem de serviço finalizada e arquivada',
  },
  cancelada: {
    label: 'Cancelada',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dotClass: 'bg-rose-500',
    description: 'Cancelada ou duplicada',
  },
};

export const PRIORITY_MAP: Record<OSPriority, { label: string; badgeClass: string; hours: number }> = {
  baixa: {
    label: 'Baixa (48h)',
    badgeClass: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    hours: 48,
  },
  media: {
    label: 'Média (24h)',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    hours: 24,
  },
  alta: {
    label: 'Alta (8h)',
    badgeClass: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    hours: 8,
  },
  urgente: {
    label: 'Urgente (4h)',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold',
    hours: 4,
  },
};

export const CATEGORY_MAP: Record<Category, { label: string; icon: string }> = {
  hardware: { label: 'Hardware / Manutenção Física', icon: 'Cpu' },
  software: { label: 'Software / Sistemas e-Teresina', icon: 'AppWindow' },
  rede: { label: 'Rede Local & Internet', icon: 'Network' },
  impressora: { label: 'Impressoras & Multifuncionais', icon: 'Printer' },
  telefonia: { label: 'Telefonia & Ramais', icon: 'Phone' },
  apoio: { label: 'Apoio ao Usuário / Treinamento', icon: 'HelpCircle' },
  instalacao: { label: 'Instalação & Remanejamento', icon: 'Wrench' },
};

export interface SLAEvaluation {
  isCompleted: boolean;
  isOverdue: boolean;
  isCloseToOverdue: boolean; // Menos de 2h
  remainingText: string;
  badgeClass: string;
}

export function evaluateSLA(createdAt: string, slaDeadline: string, status: OSStatus): SLAEvaluation {
  const isCompleted = ['resolvida', 'entregue', 'fechada'].includes(status);
  const now = new Date().getTime();
  const deadline = new Date(slaDeadline).getTime();
  const diffMs = deadline - now;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (isCompleted) {
    return {
      isCompleted: true,
      isOverdue: false,
      isCloseToOverdue: false,
      remainingText: 'Atendimento Concluído',
      badgeClass: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    };
  }

  if (diffMs <= 0) {
    const overdueHours = Math.abs(Math.round(diffHours));
    return {
      isCompleted: false,
      isOverdue: true,
      isCloseToOverdue: false,
      remainingText: `SLA Estourado (+${overdueHours}h)`,
      badgeClass: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 animate-pulse font-medium',
    };
  }

  if (diffHours < 2) {
    const minutes = Math.round(diffMs / (1000 * 60));
    return {
      isCompleted: false,
      isOverdue: false,
      isCloseToOverdue: true,
      remainingText: `Atenção: resta ${minutes}min`,
      badgeClass: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 font-medium',
    };
  }

  const hours = Math.floor(diffHours);
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return {
    isCompleted: false,
    isOverdue: false,
    isCloseToOverdue: false,
    remainingText: `Dentro do prazo (${hours}h ${mins}m restantes)`,
    badgeClass: 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  };
}
