import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  HardDrive, 
  ChevronRight, 
  Printer,
  ShieldCheck,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { db } from '../../db/store';
import { User, ServiceOrder } from '../../types';
import { STATUS_MAP, PRIORITY_MAP, formatDateBR, evaluateSLA } from '../../utils/formatters';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (view: string, orderId?: string) => void;
  onPrintOrder: (order: ServiceOrder) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  onPrintOrder,
}) => {
  const stats = db.getStats();
  const orders = db.getOrders();
  const sectors = db.getSectors();

  // Filter orders for technician if user is technician
  const myAssignedOrders = currentUser.role === 'tecnico'
    ? orders.filter((o) => o.technician?.id === currentUser.id && !['fechada', 'cancelada'].includes(o.status))
    : [];

  const urgentOrders = orders.filter((o) => {
    if (['resolvida', 'entregue', 'fechada', 'cancelada'].includes(o.status)) return false;
    const sla = evaluateSLA(o.createdAt, o.slaDeadline, o.status);
    return sla.isOverdue || sla.isCloseToOverdue || o.priority === 'urgente';
  });

  // Calculate sector distribution
  const sectorCounts = sectors.map((sec) => {
    const count = orders.filter((o) => o.requester.sector.includes(sec.abbreviation) || o.requester.sector.includes(sec.name)).length;
    return { name: sec.abbreviation, fullName: sec.name, count };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Painel de Controle — CPD / TI
            </h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              SDU Leste
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Bem-vindo(a), <span className="font-semibold text-slate-700 dark:text-slate-200">{currentUser.name}</span>. 
            Controle de Ordens de Serviço e suporte técnico da Prefeitura de Teresina.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="dash-btn-public-consult"
            onClick={() => onNavigate('public-consult')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Consulta Pública</span>
          </button>

          <button
            id="dash-btn-new-order"
            onClick={() => onNavigate('new-order')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Abrir Nova OS</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Card 1: Total */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total de OS</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</span>
            <span className="text-[11px] text-slate-400">registros</span>
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
            Ano 2026
          </p>
        </div>

        {/* Card 2: Abertas / Triagem */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 dark:hover:border-amber-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Abertas / Fila</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.open}</span>
            <span className="text-[11px] text-slate-400">aguardando</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Pendente triagem
          </p>
        </div>

        {/* Card 3: Em Atendimento */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Em Atendimento</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{stats.inProgress}</span>
            <span className="text-[11px] text-slate-400">em bancada</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Técnicos alocados
          </p>
        </div>

        {/* Card 4: Concluídas / Entregues */}
        <div 
          onClick={() => onNavigate('orders')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 dark:hover:border-emerald-700 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Concluídas</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.resolved}</span>
            <span className="text-[11px] text-slate-400">finalizadas</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Nota média: {stats.avgRating} ★
          </p>
        </div>

        {/* Card 5: Índice SLA */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 lg:col-span-1 cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold">Índice de SLA</span>
            <div className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400">{stats.slaComplianceRate}%</span>
            <span className="text-[11px] text-slate-400">cumprido</span>
          </div>
          <p className="text-[11px] text-rose-500 font-medium mt-1">
            {stats.overdue} fora do prazo
          </p>
        </div>

      </div>

      {/* Urgent Orders Alert Banner if any */}
      {urgentOrders.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4" />
            <span>Chamados em Alerta de SLA ou Urgentes ({urgentOrders.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {urgentOrders.map((ord) => {
              const sla = evaluateSLA(ord.createdAt, ord.slaDeadline, ord.status);
              return (
                <div
                  key={ord.id}
                  onClick={() => onNavigate('order-detail', ord.id)}
                  className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900 shadow-xs cursor-pointer hover:border-rose-400 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-rose-600 dark:text-rose-400">{ord.id}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${sla.badgeClass}`}>
                      {sla.remainingText}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                    {ord.equipment.brand} {ord.equipment.model}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {ord.requester.sector} • {ord.requester.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid: Technician Assigned Work (if tech) + Sector Breakdown */}
      {currentUser.role === 'tecnico' && myAssignedOrders.length > 0 && (
        <div className="bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-blue-950 dark:text-blue-200">
                Minha Fila de Atendimento ({myAssignedOrders.length})
              </h3>
            </div>
            <span className="text-xs text-blue-600 dark:text-blue-400">Atribuídas a você</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {myAssignedOrders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => onNavigate('order-detail', ord.id)}
                className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-slate-800 shadow-xs hover:border-blue-400 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-blue-600">{ord.id}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_MAP[ord.status].badgeClass}`}>
                    {STATUS_MAP[ord.status].label}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-900 dark:text-white line-clamp-2">
                  {ord.issueDescription}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>{ord.requester.sector.split(' ')[0]}</span>
                  <span>Tombo: {ord.equipment.assetNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Split: Recent Orders Table & Demand by Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left (2 cols): Chamados Recentes */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ordens de Serviço Recentes
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Últimas movimentações registradas pelo setor de TI
              </p>
            </div>
            
            <button
              onClick={() => onNavigate('orders')}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <span>Ver todas ({orders.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">OS / Data</th>
                  <th className="py-2.5 px-3">Solicitante & Setor</th>
                  <th className="py-2.5 px-3">Equipamento</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.slice(0, 5).map((order) => {
                  const statusInfo = STATUS_MAP[order.status];
                  const priorityInfo = PRIORITY_MAP[order.priority];
                  return (
                    <tr 
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <span 
                          onClick={() => onNavigate('order-detail', order.id)}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          {order.id}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {formatDateBR(order.createdAt).split(' ')[0]}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                          {order.requester.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                          {order.requester.sector}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {order.equipment.brand} {order.equipment.model}
                        </span>
                        <span className="block text-[10px] font-mono text-slate-400">
                          {order.equipment.assetNumber}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusInfo.dotClass}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPrintOrder(order)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Imprimir Espelho A4"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigate('order-detail', order.id)}
                            className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[11px] font-semibold hover:bg-blue-100 transition-colors"
                          >
                            Detalhes
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right (1 col): Demand by Sector & Tech Team */}
        <div className="space-y-6">
          
          {/* Demand by SDU Leste Sectors */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Demandas por Gerência</span>
              </h3>
              <span className="text-[11px] text-slate-400">SDU Leste</span>
            </div>

            <div className="space-y-2.5">
              {sectorCounts.slice(0, 5).map((sec) => {
                const totalOrders = orders.length || 1;
                const percent = Math.round((sec.count / totalOrders) * 100);
                return (
                  <div key={sec.name}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {sec.name} <span className="font-normal text-slate-400 text-[10px]">({sec.fullName.slice(0, 20)}...)</span>
                      </span>
                      <span className="text-slate-500 font-bold">{sec.count} OS ({percent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Support Guidelines / Tips */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Procedimento Operacional
              </span>
              <h4 className="font-bold text-sm mt-1">
                Termo de Entrega Obrigatório
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Todo equipamento consertado deve ser entregue com a assinatura digital do solicitante ou do chefe do setor para baixa oficial no CPD.
              </p>
              <button
                onClick={() => onNavigate('orders')}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:underline"
              >
                <span>Acessar fila de entrega</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
