import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  FileText, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { db } from '../../db/store';
import { ServiceOrder } from '../../types';
import { STATUS_MAP, formatDateBR, evaluateSLA } from '../../utils/formatters';

interface PublicConsultationViewProps {
  onNavigateToDetail?: (orderId: string) => void;
}

export const PublicConsultationView: React.FC<PublicConsultationViewProps> = ({ onNavigateToDetail }) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<ServiceOrder | null>(null);

  const orders = db.getOrders();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return;

    setSearched(true);
    const order = orders.find(
      (o) =>
        o.id.toLowerCase() === cleanQuery ||
        o.id.toLowerCase().replace(/-/g, '') === cleanQuery ||
        o.equipment.assetNumber.toLowerCase() === cleanQuery ||
        o.equipment.assetNumber.toLowerCase().includes(cleanQuery)
    );

    setFoundOrder(order || null);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      
      {/* Institutional Hero Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 text-xs font-semibold">
          <Building2 className="w-3.5 h-3.5" />
          <span>SDU Leste — Portal de Atendimento ao Servidor</span>
        </div>
        
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Consulta Pública de Ordem de Serviço
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Acompanhe em tempo real o andamento da manutenção do seu computador, impressora ou chamado de TI sem necessidade de login.
        </p>
      </div>

      {/* Search Box */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Digite o número da OS (ex: OS-2026-0001) ou o Tombamento (ex: PMT-SDUL-04821)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0"
          >
            <span>Consultar Chamado</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Examples */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-slate-400">
          <span>Exemplos para testar:</span>
          {['OS-2026-0001', 'OS-2026-0002', 'PMT-SDUL-04821', 'PMT-SDUL-03190'].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex);
              }}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono hover:bg-slate-200"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      {/* Result Card */}
      {searched && (
        foundOrder ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-xs">
            
            {/* Header of Found Order */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ordem de Serviço Oficial</span>
                <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 font-mono">
                  {foundOrder.id}
                </h3>
                <span className="text-slate-500">Aberta em: {formatDateBR(foundOrder.createdAt)}</span>
              </div>

              <div className="text-left sm:text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${STATUS_MAP[foundOrder.status].badgeClass}`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${STATUS_MAP[foundOrder.status].dotClass}`} />
                  {STATUS_MAP[foundOrder.status].label}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  {STATUS_MAP[foundOrder.status].description}
                </p>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-6 space-y-6">
              
              {/* Grid with main info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[11px]">Solicitante & Setor:</span>
                  <p className="font-bold text-slate-900 dark:text-white">{foundOrder.requester.name}</p>
                  <p className="text-slate-500 text-[11px]">{foundOrder.requester.sector}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Equipamento / Tombamento:</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {foundOrder.equipment.brand} {foundOrder.equipment.model}
                  </p>
                  <p className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{foundOrder.equipment.assetNumber}</p>
                </div>

                <div>
                  <span className="text-slate-400 block text-[11px]">Técnico Designado:</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {foundOrder.technician ? foundOrder.technician.name : 'Em triagem pelo CPD'}
                  </p>
                  <span className="text-emerald-600 font-semibold text-[11px]">
                    {evaluateSLA(foundOrder.createdAt, foundOrder.slaDeadline, foundOrder.status).remainingText}
                  </span>
                </div>
              </div>

              {/* Progress Steps Visual */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-3">
                  Etapas do Atendimento
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: '1. Abertura', done: true },
                    { label: '2. Triagem / Atribuição', done: !['aberta'].includes(foundOrder.status) },
                    { label: '3. Manutenção Bancada', done: ['em_andamento', 'aguardando_peca', 'resolvida', 'entregue', 'fechada'].includes(foundOrder.status) },
                    { label: '4. Pronto / Entregue', done: ['resolvida', 'entregue', 'fechada'].includes(foundOrder.status) },
                  ].map((step, idx) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-xl border text-center transition-colors ${
                        step.done
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        {step.done ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-slate-400" />}
                      </div>
                      <span>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solicitante note */}
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Retirada de Equipamentos:</p>
                  <p className="text-[11px] mt-0.5">
                    Quando o status estiver como <strong>Resolvida</strong>, o equipamento já pode ser retirado no balcão do CPD Leste pelo solicitante ou servidor autorizado, portando a matrícula.
                  </p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Nenhum chamado localizado</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Não encontramos nenhuma Ordem de Serviço com o termo informado (&quot;{query}&quot;). Verifique o número digitado ou contate o CPD no ramal 3215-7510.
            </p>
          </div>
        )
      )}

    </div>
  );
};
