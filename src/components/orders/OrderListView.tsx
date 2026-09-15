import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Printer, 
  FileSpreadsheet, 
  ArrowUpDown, 
  ChevronRight, 
  Tag, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { db } from '../../db/store';
import { ServiceOrder, OSStatus, OSPriority, Category } from '../../types';
import { STATUS_MAP, PRIORITY_MAP, formatDateBR, evaluateSLA } from '../../utils/formatters';

interface OrderListViewProps {
  onNavigate: (view: string, orderId?: string) => void;
  onPrintOrder: (order: ServiceOrder) => void;
}

export const OrderListView: React.FC<OrderListViewProps> = ({
  onNavigate,
  onPrintOrder,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'createdAt' | 'id' | 'priority'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const orders = db.getOrders();
  const sectors = db.getSectors();

  // Export to CSV helper
  const handleExportCSV = () => {
    const headers = ['Número da OS', 'Data de Abertura', 'Status', 'Prioridade', 'Solicitante', 'Setor', 'Equipamento', 'Tombamento', 'Técnico', 'Descrição'];
    const rows = filteredOrders.map((o) => [
      o.id,
      formatDateBR(o.createdAt),
      STATUS_MAP[o.status].label,
      PRIORITY_MAP[o.priority].label,
      `"${o.requester.name}"`,
      `"${o.requester.sector}"`,
      `"${o.equipment.brand} ${o.equipment.model}"`,
      o.equipment.assetNumber,
      o.technician?.name || 'Não atribuído',
      `"${o.issueDescription.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Relatorio_OS_SDU_Leste_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Status filter
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;
        // Priority filter
        if (priorityFilter !== 'all' && o.priority !== priorityFilter) return false;
        // Sector filter
        if (sectorFilter !== 'all' && !o.requester.sector.includes(sectorFilter)) return false;
        // Search term
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const match =
            o.id.toLowerCase().includes(q) ||
            o.requester.name.toLowerCase().includes(q) ||
            o.requester.sector.toLowerCase().includes(q) ||
            o.equipment.assetNumber.toLowerCase().includes(q) ||
            o.equipment.brand.toLowerCase().includes(q) ||
            o.equipment.model.toLowerCase().includes(q) ||
            o.issueDescription.toLowerCase().includes(q) ||
            (o.technician?.name.toLowerCase().includes(q) ?? false);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];
        if (sortField === 'createdAt') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }
        if (sortDirection === 'asc') {
          return valA > valB ? 1 : -1;
        }
        return valA < valB ? 1 : -1;
      });
  }, [orders, statusFilter, priorityFilter, sectorFilter, searchTerm, sortField, sortDirection]);

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Gerenciamento de Ordens de Serviço
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle de chamados de informática da SDU Leste — Prefeitura de Teresina
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            title="Exportar planilha"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => onNavigate('new-order')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Ordem de Serviço</span>
          </button>
        </div>
      </div>

      {/* Status Pills / Quick Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { id: 'all', label: 'Todas as OS' },
          { id: 'aberta', label: 'Abertas' },
          { id: 'triagem', label: 'Em Triagem' },
          { id: 'atribuida', label: 'Atribuídas' },
          { id: 'em_andamento', label: 'Em Andamento' },
          { id: 'aguardando_peca', label: 'Aguardando Peça' },
          { id: 'resolvida', label: 'Resolvidas' },
          { id: 'entregue', label: 'Entregues' },
          { id: 'fechada', label: 'Fechadas' },
        ].map((item) => {
          const isActive = statusFilter === item.id;
          const count = statusCounts[item.id] || 0;
          return (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <span>{item.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Main search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por OS, solicitante, tombamento, técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority filter */}
          <div className="sm:col-span-3">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="urgente">Urgente (4h)</option>
              <option value="alta">Alta (8h)</option>
              <option value="media">Média (24h)</option>
              <option value="baixa">Baixa (48h)</option>
            </select>
          </div>

          {/* Sector filter */}
          <div className="sm:col-span-3">
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Setores (SDU Leste)</option>
              {sectors.map((sec) => (
                <option key={sec.id} value={sec.abbreviation}>
                  {sec.abbreviation} — {sec.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">
                  <button 
                    onClick={() => {
                      setSortField('id');
                      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                    }}
                    className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
                  >
                    <span>Nº OS / Data</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4 font-semibold">Solicitante & Gerência</th>
                <th className="py-3 px-4 font-semibold">Equipamento & Tombamento</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">SLA / Prazo</th>
                <th className="py-3 px-4 font-semibold">Técnico Resp.</th>
                <th className="py-3 px-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <p className="font-semibold text-sm">Nenhuma Ordem de Serviço encontrada</p>
                    <p className="text-xs mt-1">Ajuste os filtros de busca ou abra uma nova solicitação.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status];
                  const priorityInfo = PRIORITY_MAP[order.priority];
                  const sla = evaluateSLA(order.createdAt, order.slaDeadline, order.status);

                  return (
                    <tr 
                      key={order.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* OS ID & Date */}
                      <td className="py-3.5 px-4">
                        <span 
                          onClick={() => onNavigate('order-detail', order.id)}
                          className="font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          {order.id}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateBR(order.createdAt)}</span>
                        </div>
                      </td>

                      {/* Requester & Sector */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                          {order.requester.name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                          {order.requester.sector}
                        </p>
                      </td>

                      {/* Equipment */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                            {order.equipment.brand} {order.equipment.model}
                          </span>
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-slate-600 dark:text-slate-300">
                          {order.equipment.assetNumber}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusInfo.dotClass}`} />
                          {statusInfo.label}
                        </span>
                        <span className={`block mt-1 text-[9px] font-semibold uppercase tracking-wider ${
                          order.priority === 'urgente' ? 'text-rose-600' : 'text-slate-400'
                        }`}>
                          {priorityInfo.label}
                        </span>
                      </td>

                      {/* SLA Evaluation */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border ${sla.badgeClass}`}>
                          {sla.remainingText}
                        </span>
                      </td>

                      {/* Technician */}
                      <td className="py-3.5 px-4">
                        {order.technician ? (
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {order.technician.name.split(' ')[0]} {order.technician.name.split(' ')[1] || ''}
                          </span>
                        ) : (
                          <span className="italic text-slate-400 text-[11px]">
                            Aguardando
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPrintOrder(order)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Imprimir Espelho / Etiqueta"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => onNavigate('order-detail', order.id)}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 text-xs transition-colors"
                          >
                            Atender
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Exibindo {filteredOrders.length} de {orders.length} ordens de serviço</span>
          <span>Setor de TI / CPD — SDU Leste</span>
        </div>
      </div>

    </div>
  );
};
