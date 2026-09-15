import React, { useState } from 'react';
import { Printer, X, Tag, FileText, CheckCircle2 } from 'lucide-react';
import { ServiceOrder } from '../../types';
import { formatDateBR, formatDateOnlyBR, STATUS_MAP, PRIORITY_MAP, CATEGORY_MAP } from '../../utils/formatters';

interface OrderPrintModalProps {
  order: ServiceOrder;
  onClose: () => void;
}

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({ order, onClose }) => {
  const [printMode, setPrintMode] = useState<'sheet' | 'tag'>('sheet');

  const handlePrint = () => {
    window.print();
  };

  const statusInfo = STATUS_MAP[order.status];
  const priorityInfo = PRIORITY_MAP[order.priority];
  const categoryInfo = CATEGORY_MAP[order.category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto">
        
        {/* Modal Toolbar (hidden in print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-3.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrintMode('sheet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                printMode === 'sheet'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Espelho Oficial A4</span>
            </button>
            <button
              onClick={() => setPrintMode('tag')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                printMode === 'tag'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Etiqueta de Equipamento</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Gerar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Area */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 overflow-y-auto max-h-[82vh]">
          
          {/* MODE 1: ESPELHO OFICIAL A4 */}
          {printMode === 'sheet' && (
            <div className="border border-slate-400 p-6 sm:p-8 rounded-none max-w-3xl mx-auto text-xs leading-normal bg-white text-black font-sans">
              
              {/* Header Oficial Prefeitura */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-md flex flex-col items-center justify-center font-bold text-center leading-none p-1">
                    <span className="text-[10px] tracking-wider">PMT</span>
                    <span className="text-xs">SDU</span>
                    <span className="text-[9px]">LESTE</span>
                  </div>
                  <div>
                    <h1 className="text-sm font-black uppercase tracking-tight">Prefeitura Municipal de Teresina</h1>
                    <h2 className="text-xs font-bold text-slate-800">Superintendência de Desenvolvimento Urbano Leste – SDU Leste</h2>
                    <p className="text-[11px] text-slate-600">Setor de Controle de Processamento de Dados (CPD) / Informática</p>
                  </div>
                </div>

                <div className="text-right border-l border-slate-300 pl-4">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Ordem de Serviço</span>
                  <span className="text-lg font-black tracking-tight text-blue-900">{order.id}</span>
                  <span className="text-[10px] block text-slate-600">Abertura: {formatDateBR(order.createdAt)}</span>
                </div>
              </div>

              {/* Grid: Dados do Solicitante & Setor */}
              <div className="mb-4">
                <div className="bg-slate-200 px-2 py-1 font-bold text-[11px] uppercase tracking-wide border-t border-b border-slate-400">
                  1. Dados do Solicitante e Localização
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 border border-t-0 border-slate-300">
                  <div>
                    <span className="font-semibold text-slate-600 block text-[10px]">Solicitante:</span>
                    <span className="font-bold">{order.requester.name}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block text-[10px]">Matrícula / Cargo:</span>
                    <span>{order.requester.registration || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block text-[10px]">Gerência / Setor:</span>
                    <span className="font-bold">{order.requester.sector}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block text-[10px]">Telefone / Ramal:</span>
                    <span>{order.requester.phone || 'Ramal CPD'}</span>
                  </div>
                </div>
              </div>

              {/* Grid: Identificação do Equipamento */}
              <div className="mb-4">
                <div className="bg-slate-200 px-2 py-1 font-bold text-[11px] uppercase tracking-wide border-t border-b border-slate-400">
                  2. Identificação do Equipamento & Patrimônio
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 border border-t-0 border-slate-300">
                  <div>
                    <span className="font-semibold text-slate-600 block text-[10px]">Tipo de Equipamento:</span>
                    <span className="capitalize font-semibold">{order.equipment.type}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block text-[10px]">Marca / Modelo:</span>
                    <span>{order.equipment.brand} {order.equipment.model}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block text-[10px]">Tombamento (Patrimônio):</span>
                    <span className="font-black text-blue-900 bg-blue-50 px-1 py-0.5 border border-blue-200 inline-block">
                      {order.equipment.assetNumber || 'S/ TOMBO'}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-600 block text-[10px]">Nº de Série:</span>
                    <span>{order.equipment.serialNumber || 'N/A'}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-4 mt-1 pt-1 border-t border-slate-200">
                    <span className="font-semibold text-slate-600 text-[10px]">Acessórios Recebidos: </span>
                    <span>
                      {order.equipment.accessories && order.equipment.accessories.length > 0
                        ? order.equipment.accessories.join(', ')
                        : 'Nenhum acessório entregue junto.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Relato do Solicitante / Problema */}
              <div className="mb-4">
                <div className="bg-slate-200 px-2 py-1 font-bold text-[11px] uppercase tracking-wide border-t border-b border-slate-400">
                  3. Descrição da Falha / Problema Apresentado
                </div>
                <div className="p-2 border border-t-0 border-slate-300 min-h-14">
                  <p className="whitespace-pre-line">{order.issueDescription}</p>
                </div>
              </div>

              {/* Parecer Técnico do CPD */}
              <div className="mb-4">
                <div className="bg-slate-200 px-2 py-1 font-bold text-[11px] uppercase tracking-wide border-t border-b border-slate-400 flex items-center justify-between">
                  <span>4. Laudo Técnico & Diagnóstico (CPD / TI)</span>
                  <span className="text-[10px] lowercase font-normal">
                    Técnico Resp: {order.technician ? order.technician.name : 'Aguardando atribuição'}
                  </span>
                </div>
                <div className="p-2 border border-t-0 border-slate-300 space-y-2">
                  <div>
                    <span className="font-semibold text-[10px] text-slate-600 block">Diagnóstico Técnico:</span>
                    <p className="italic text-slate-800">
                      {order.technicalDiagnosis || 'Diagnóstico em elaboração na bancada de manutenção.'}
                    </p>
                  </div>

                  {order.actionsTaken && order.actionsTaken.length > 0 && (
                    <div>
                      <span className="font-semibold text-[10px] text-slate-600 block">Serviços Executados:</span>
                      <ul className="list-disc list-inside space-y-0.5 mt-0.5 text-slate-800">
                        {order.actionsTaken.map((act, idx) => (
                          <li key={idx}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {order.materialsUsed && order.materialsUsed.length > 0 && (
                    <div className="pt-1 border-t border-slate-200">
                      <span className="font-semibold text-[10px] text-slate-600 block">Peças e Peças Aplicadas:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {order.materialsUsed.map((m) => (
                          <span key={m.id} className="bg-slate-100 px-2 py-0.5 border border-slate-300 text-[10px]">
                            {m.name} ({m.quantity} {m.unit})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist de Testes */}
              <div className="mb-4">
                <div className="bg-slate-200 px-2 py-1 font-bold text-[11px] uppercase tracking-wide border-t border-b border-slate-400">
                  5. Checklist de Controle de Qualidade & Testes
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-2 border border-t-0 border-slate-300 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 border rounded-xs flex items-center justify-center ${order.checklist?.startupTest ? 'bg-black text-white' : ''}`}>
                      {order.checklist?.startupTest ? '✓' : ''}
                    </span>
                    <span>Inicialização</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 border rounded-xs flex items-center justify-center ${order.checklist?.networkTest ? 'bg-black text-white' : ''}`}>
                      {order.checklist?.networkTest ? '✓' : ''}
                    </span>
                    <span>Rede / Internet</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 border rounded-xs flex items-center justify-center ${order.checklist?.peripheralTest ? 'bg-black text-white' : ''}`}>
                      {order.checklist?.peripheralTest ? '✓' : ''}
                    </span>
                    <span>Periféricos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 border rounded-xs flex items-center justify-center ${order.checklist?.internalCleaning ? 'bg-black text-white' : ''}`}>
                      {order.checklist?.internalCleaning ? '✓' : ''}
                    </span>
                    <span>Limpeza Interna</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-3.5 h-3.5 border rounded-xs flex items-center justify-center ${order.checklist?.stressPrintTest ? 'bg-black text-white' : ''}`}>
                      {order.checklist?.stressPrintTest ? '✓' : ''}
                    </span>
                    <span>Carga / Impressão</span>
                  </div>
                </div>
              </div>

              {/* Termo de Entrega e Assinaturas */}
              <div className="mt-8 pt-4 border-t-2 border-slate-800">
                <p className="text-[10px] text-slate-600 text-center mb-6">
                  Declaro que recebi o equipamento acima especificado em perfeitas condições de funcionamento e com todos os dados/acessórios conferidos.
                </p>

                <div className="grid grid-cols-2 gap-8 text-center pt-2">
                  <div>
                    <div className="border-t border-slate-800 pt-1 mx-6 font-semibold text-xs">
                      {order.technician?.name || 'Técnico Responsável - CPD'}
                    </div>
                    <span className="text-[10px] text-slate-500 block">Setor de TI / SDU Leste</span>
                  </div>
                  <div>
                    <div className="border-t border-slate-800 pt-1 mx-6 font-semibold text-xs">
                      {order.delivery?.receivedBy || order.requester.name}
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Assinatura do Recebedor (Setor Solicitante)
                    </span>
                  </div>
                </div>
              </div>

              {/* Rodapé institucional */}
              <div className="mt-8 text-center text-[9px] text-slate-400 border-t border-slate-200 pt-2">
                SDU Leste - Av. Zequinha Freire, S/N - Teresina - PI | Telefone CPD: (86) 3215-7510 | Sistema Oficial de Gestão de Ordens de Serviço
              </div>
            </div>
          )}

          {/* MODE 2: ETIQUETA ADESIVA DE EQUIPAMENTO (TAG COMPACTA) */}
          {printMode === 'tag' && (
            <div className="max-w-md mx-auto p-4 border-2 border-dashed border-slate-400 bg-white text-black font-sans">
              <div className="border-2 border-slate-900 p-3 rounded-lg">
                <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-900 text-white rounded font-bold text-xs flex items-center justify-center">
                      SDU
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase leading-tight">SDU LESTE - TI / CPD</h4>
                      <p className="text-[9px] text-slate-600">ETIQUETA DE MANUTENÇÃO</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-blue-900 block">{order.id}</span>
                    <span className="text-[9px] font-semibold text-slate-500">{formatDateOnlyBR(order.createdAt)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">TOMBAMENTO:</span>
                    <span className="font-black text-slate-900">{order.equipment.assetNumber || 'SEM PATRIMÔNIO'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">EQUIPAMENTO:</span>
                    <span className="font-bold truncate max-w-[200px]">{order.equipment.brand} {order.equipment.model}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">SETOR / GERÊNCIA:</span>
                    <span className="font-bold truncate max-w-[200px]">{order.requester.sector}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1">
                    <span className="text-slate-500">SOLICITANTE:</span>
                    <span className="truncate max-w-[200px]">{order.requester.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TÉCNICO CPD:</span>
                    <span className="font-semibold">{order.technician ? order.technician.name.split(' ')[0] : 'Triagem'}</span>
                  </div>
                </div>

                {/* Código de barras visual simulado */}
                <div className="mt-3 pt-2 border-t border-slate-300 text-center">
                  <div className="flex justify-center items-center gap-[2px] h-8 overflow-hidden px-4">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <span 
                        key={i} 
                        className={`inline-block h-full bg-slate-900 ${i % 3 === 0 ? 'w-[3px]' : i % 5 === 0 ? 'w-[4px]' : 'w-[1px]'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono tracking-widest text-slate-600 block mt-1">
                    *{order.id.replace(/-/g, '')}*
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-center text-slate-500 mt-2">
                Fixar no gabinete da CPU ou carcaça superior da impressora
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
