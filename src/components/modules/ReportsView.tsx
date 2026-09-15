import React, { useState } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  User, 
  Calendar,
  Award
} from 'lucide-react';
import { db } from '../../db/store';
import { STATUS_MAP, PRIORITY_MAP, formatDateBR, evaluateSLA } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const orders = db.getOrders();
  const technicians = db.getTechnicians();
  const stats = db.getStats();

  // Tech productivity ranking
  const techRanking = technicians.map((tech) => {
    const techOrders = orders.filter((o) => o.technician?.id === tech.id);
    const completed = techOrders.filter((o) => ['resolvida', 'entregue', 'fechada'].includes(o.status)).length;
    const inProgress = techOrders.filter((o) => ['atribuida', 'em_andamento', 'aguardando_peca'].includes(o.status)).length;
    return {
      tech,
      total: techOrders.length,
      completed,
      inProgress,
    };
  }).sort((a, b) => b.completed - a.completed);

  // Categories distribution
  const categoryStats: Record<string, number> = {};
  orders.forEach((o) => {
    categoryStats[o.category] = (categoryStats[o.category] || 0) + 1;
  });

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Relatórios Estatísticos & Indicadores de SLA
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Métricas de desempenho operacional do Setor de TI / CPD — SDU Leste
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
          >
            <option value="month">Mês Atual (Março 2026)</option>
            <option value="quarter">1º Trimestre 2026</option>
            <option value="year">Ano de 2026 Completo</option>
          </select>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* SLA Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 font-semibold block">Cumprimento de SLA</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-emerald-600">{stats.slaComplianceRate}%</span>
            <span className="text-slate-400">dentro do prazo</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Meta municipal: &gt; 90%</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 font-semibold block">Tempo Médio de Atendimento</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-blue-600">6.4h</span>
            <span className="text-slate-400">por chamado</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Baseado em chamados concluídos
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 font-semibold block">Satisfação do Servidor</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-amber-500">{stats.avgRating} ★</span>
            <span className="text-slate-400">de 5.0</span>
          </div>
          <p className="text-[11px] text-amber-600 mt-2">
            {stats.ratedCount} avaliações recebidas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-slate-500 font-semibold block">Chamados Fora do Prazo</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-rose-600">{stats.overdue}</span>
            <span className="text-slate-400">estourados</span>
          </div>
          <p className="text-[11px] text-rose-500 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Gargalo em peças externas</span>
          </p>
        </div>
      </div>

      {/* Grid: Technician Performance & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        
        {/* Desempenho dos Técnicos */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Produtividade da Equipe Técnica</span>
            </h3>
            <span className="text-slate-400 text-[11px]">CPD Leste</span>
          </div>

          <div className="space-y-3">
            {techRanking.map((item, idx) => (
              <div key={item.tech.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{item.tech.name}</p>
                    <p className="text-[11px] text-slate-400">Matrícula: {item.tech.registration}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-emerald-600 text-sm">{item.completed} resolvidos</span>
                  <span className="block text-[11px] text-slate-400">{item.inProgress} em andamento</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tipos de Ocorrências Mais Frequentes */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Chamados por Categoria Técnica</span>
            </h3>
            <span className="text-slate-400 text-[11px]">Volume</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(categoryStats).map(([cat, count]) => {
              const percent = Math.round((count / orders.length) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                      {cat === 'hardware' ? 'Hardware & Peças' : cat === 'rede' ? 'Rede & Internet' : cat === 'impressora' ? 'Impressoras' : cat === 'software' ? 'Sistemas PMT' : cat}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{count} OS ({percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-600 to-emerald-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
