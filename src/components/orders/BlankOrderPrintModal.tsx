import React from 'react';
import { Printer, X, FileText, Download, CheckCircle, Info } from 'lucide-react';

interface BlankOrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlankOrderPrintModal: React.FC<BlankOrderPrintModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[95vh]">
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Ficha Oficial de Ordem de Serviço em Branco (A4 / PDF)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Formulário padrão impresso para atendimento de campo, triagem na bancada do CPD e preenchimento manual
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              title="Abrir caixa de impressão do navegador para imprimir ou Salvar como PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Gerar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informative Hint Banner (Hidden on Print) */}
        <div className="print:hidden px-6 py-2.5 bg-blue-50 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>
              <strong>Dica para salvar em PDF:</strong> Na janela de impressão que se abrirá, altere o <em>Destino</em> para <strong>&quot;Salvar como PDF&quot;</strong>.
            </span>
          </div>
          <span className="hidden md:inline-block font-mono text-[11px] text-blue-600 dark:text-blue-400">
            Formato: Folha A4 Padrão PMT
          </span>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-4 sm:p-8 bg-slate-200/60 dark:bg-slate-950/80 overflow-y-auto flex-1 flex justify-center">
          
          {/* THE OFFICIAL BLANK SHEET (Optimized for standard A4 Portrait) */}
          <div className="w-full max-w-[210mm] bg-white text-black p-6 sm:p-8 border border-slate-300 shadow-md font-sans text-[11px] leading-normal print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none">
            
            {/* Header: Brasão, Órgão e Título */}
            <div className="border-2 border-slate-900 pb-3 mb-3 p-3">
              <div className="flex items-center justify-between gap-4">
                
                {/* Logo / Brasão Municipal Simulado */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-slate-900 text-white rounded-md flex flex-col items-center justify-center font-bold text-center leading-none p-1 shrink-0">
                    <span className="text-[10px] tracking-wider">PMT</span>
                    <span className="text-xs font-black">SDU</span>
                    <span className="text-[9px]">LESTE</span>
                  </div>
                  <div>
                    <h1 className="text-xs font-black uppercase tracking-tight text-slate-950">
                      PREFEITURA MUNICIPAL DE TERESINA
                    </h1>
                    <h2 className="text-[11px] font-bold text-slate-900">
                      SUPERINTENDÊNCIA DE DESENVOLVIMENTO URBANO LESTE — SDU LESTE
                    </h2>
                    <p className="text-[10px] text-slate-700 font-semibold">
                      Centro de Processamento de Dados (CPD) / Setor de Tecnologia da Informação
                    </p>
                  </div>
                </div>

                {/* Número da OS e Carimbo */}
                <div className="border-2 border-dashed border-slate-900 p-2 text-center min-w-[170px] bg-slate-50">
                  <span className="text-[9px] uppercase font-bold text-slate-600 block">Nº DE CONTROLE DA OS</span>
                  <div className="h-6 flex items-center justify-center font-mono font-bold text-sm text-slate-400">
                    OS-2026-______
                  </div>
                  <span className="text-[9px] block text-slate-500 border-t border-slate-300 pt-1 mt-0.5">
                    Data: ___/___/2026 • Hora: ___:___
                  </span>
                </div>

              </div>

              <div className="text-center mt-2 pt-2 border-t border-slate-300">
                <span className="font-black text-xs uppercase tracking-widest text-slate-900">
                  ORDEM DE SERVIÇO DE MANUTENÇÃO E SUPORTE TÉCNICO
                </span>
              </div>
            </div>

            {/* SEÇÃO 1: DADOS DO SOLICITANTE */}
            <div className="border border-slate-900 mb-3">
              <div className="bg-slate-200 px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider border-b border-slate-900 flex justify-between items-center">
                <span>1. Dados do Solicitante e Lotação</span>
                <span className="text-[9px] font-normal text-slate-600">Preenchimento pelo Setor Solicitante</span>
              </div>
              <div className="p-2.5 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 border-b border-dotted border-slate-500 pb-1">
                    <span className="font-semibold text-[10px] text-slate-700">Nome do Solicitante / Servidor:</span>
                  </div>
                  <div className="border-b border-dotted border-slate-500 pb-1">
                    <span className="font-semibold text-[10px] text-slate-700">Matrícula PMT:</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="border-b border-dotted border-slate-500 pb-1">
                    <span className="font-semibold text-[10px] text-slate-700">Gerência / Setor:</span>
                  </div>
                  <div className="border-b border-dotted border-slate-500 pb-1">
                    <span className="font-semibold text-[10px] text-slate-700">Ramal / Telefone:</span>
                  </div>
                  <div className="border-b border-dotted border-slate-500 pb-1">
                    <span className="font-semibold text-[10px] text-slate-700">Local (Sala / Bloco):</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: IDENTIFICAÇÃO DO EQUIPAMENTO */}
            <div className="border border-slate-900 mb-3">
              <div className="bg-slate-200 px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider border-b border-slate-900 flex justify-between items-center">
                <span>2. Identificação do Equipamento e Acessórios</span>
                <span className="text-[9px] font-normal text-slate-600">Patrimônio da SDU Leste</span>
              </div>
              <div className="p-2.5 space-y-2.5">
                
                {/* Tipo de Equipamento */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
                  <span className="font-bold text-slate-900">Tipo:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="w-3.5 h-3.5 border border-slate-800 inline-block"></span>
                    <span>Computador / Desktop</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="w-3.5 h-3.5 border border-slate-800 inline-block"></span>
                    <span>Notebook</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="w-3.5 h-3.5 border border-slate-800 inline-block"></span>
                    <span>Impressora / Scanner</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="w-3.5 h-3.5 border border-slate-800 inline-block"></span>
                    <span>Nobreak / Estabilizador</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="w-3.5 h-3.5 border border-slate-800 inline-block"></span>
                    <span>Outro: __________________</span>
                  </label>
                </div>

                {/* Marca, Modelo, Tombamento e Série */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="border-b border-dotted border-slate-500 pb-1">
                    <span className="font-semibold text-[10px] text-slate-700">Marca / Fabricante:</span>
                  </div>
                  <div className="border-b border-dotted border-slate-500 pb-1">
                    <span className="font-semibold text-[10px] text-slate-700">Modelo:</span>
                  </div>
                  <div className="border-b border-dotted border-slate-500 pb-1 bg-slate-50">
                    <span className="font-black text-[10px] text-slate-900">Nº Tombamento PMT:</span>
                  </div>
                  <div className="border-b border-dotted border-slate-500 pb-1">
                    <span className="font-semibold text-[10px] text-slate-700">Nº de Série (S/N):</span>
                  </div>
                </div>

                {/* Acessórios entregues */}
                <div className="pt-1">
                  <span className="font-bold text-[10px] text-slate-800 block mb-1">
                    Acessórios / Cabos que acompanham o equipamento entregue no CPD:
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-700 inline-block"></span> Cabo Força</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-700 inline-block"></span> Fonte / Carregador</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-700 inline-block"></span> Teclado</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-700 inline-block"></span> Mouse</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-700 inline-block"></span> Cabo Vídeo (HDMI/VGA)</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-700 inline-block"></span> Outros</span>
                  </div>
                </div>

              </div>
            </div>

            {/* SEÇÃO 3: DESCRIÇÃO DO PROBLEMA */}
            <div className="border border-slate-900 mb-3">
              <div className="bg-slate-200 px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider border-b border-slate-900">
                3. Descrição do Defeito Apresentado / Solicitação do Usuário
              </div>
              <div className="p-2.5 space-y-2">
                <div className="border-b border-slate-300 h-5"></div>
                <div className="border-b border-slate-300 h-5"></div>
                <div className="border-b border-slate-300 h-5"></div>
                <div className="border-b border-slate-300 h-5"></div>

                <div className="pt-2 flex items-center justify-between text-[10px] text-slate-600">
                  <span>Data da Entrega no CPD: ____/____/2026</span>
                  <span>Assinatura do Solicitante: __________________________________________________</span>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: USO EXCLUSIVO DO CPD */}
            <div className="border-2 border-slate-900 mb-3 bg-slate-50/40">
              <div className="bg-slate-900 text-white px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider flex justify-between items-center">
                <span>4. Atendimento Técnico & Laudo do CPD (Uso Exclusivo TI)</span>
                <span className="text-[9px] font-normal text-slate-300">Equipe de Informática SDU Leste</span>
              </div>
              
              <div className="p-2.5 space-y-2">
                
                {/* Triagem e Classificação */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] border-b border-slate-300 pb-2">
                  <div className="border-b border-dotted border-slate-400 pb-0.5">
                    <span className="font-semibold text-slate-700">Técnico Responsável:</span>
                  </div>
                  <div className="border-b border-dotted border-slate-400 pb-0.5">
                    <span className="font-semibold text-slate-700">Matrícula CPD:</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">Prioridade:</span>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block"></span> Baixa</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block"></span> Média</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block"></span> Alta</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block"></span> Urg.</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">Categoria:</span>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block"></span> Hardw.</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block"></span> Softw.</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 border border-slate-700 inline-block"></span> Rede</span>
                    </div>
                  </div>
                </div>

                {/* Diagnóstico Técnico e Laudo */}
                <div>
                  <span className="font-bold text-[10px] text-slate-900 block mb-1">
                    Diagnóstico Técnico / Serviços Executados / Peças Substituídas:
                  </span>
                  <div className="border-b border-slate-300 h-5"></div>
                  <div className="border-b border-slate-300 h-5"></div>
                  <div className="border-b border-slate-300 h-5"></div>
                  <div className="border-b border-slate-300 h-5"></div>
                </div>

                {/* Checklist de Qualidade */}
                <div className="border border-slate-300 p-2 bg-white rounded-xs">
                  <span className="font-bold text-[10px] text-slate-800 block mb-1">
                    Checklist de Verificação & Testes de Bancada:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px]">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-800 inline-block"></span> Inicialização / POST</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-800 inline-block"></span> Conexão de Rede/Internet</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-800 inline-block"></span> Portas USB e Vídeo</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-800 inline-block"></span> Limpeza Interna/Térmica</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-800 inline-block"></span> Teste de Carga/Impressão</span>
                  </div>
                </div>

                {/* Parecer Final e Conclusão */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-300 text-[10px]">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">Parecer:</span>
                    <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-800 inline-block"></span> Consertado / Operacional</label>
                    <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-800 inline-block"></span> Sem Reparo (Sucateamento)</label>
                    <label className="flex items-center gap-1"><span className="w-3 h-3 border border-slate-800 inline-block"></span> Assistência Externa</label>
                  </div>
                  <div className="text-right">
                    <span>Data Conclusão: ____/____/2026 • Assinatura do Técnico: _______________________</span>
                  </div>
                </div>

              </div>
            </div>

            {/* SEÇÃO 5: TERMO DE RECEBIMENTO E DEVOLUÇÃO */}
            <div className="border border-slate-900">
              <div className="bg-slate-200 px-2.5 py-1 font-bold text-[10px] uppercase tracking-wider border-b border-slate-900">
                5. Termo de Devolução e Recebimento pelo Setor Solicitante
              </div>
              <div className="p-2.5 text-[10px]">
                <p className="text-slate-800 mb-2 italic text-[9.5px]">
                  &quot;Declaro para os devidos fins que recebi o equipamento acima especificado devidamente reparado e testado pelo Setor de TI / CPD da SDU Leste, encontrando-se em perfeitas condições operacionais de uso no setor.&quot;
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  <div className="border-b border-dotted border-slate-500 pb-0.5 sm:col-span-2">
                    <span className="font-semibold text-slate-700">Recebido por (Nome Legível):</span>
                  </div>
                  <div className="border-b border-dotted border-slate-500 pb-0.5">
                    <span className="font-semibold text-slate-700">Matrícula / Cargo:</span>
                  </div>
                  <div className="border-b border-dotted border-slate-500 pb-0.5">
                    <span className="font-semibold text-slate-700">Data: ____/____/2026</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-center border-t border-slate-300">
                  <div className="inline-block w-72 border-b border-slate-800 mb-1"></div>
                  <span className="block font-semibold text-[9px] text-slate-600">Assinatura do Recebedor</span>
                </div>
              </div>
            </div>

            {/* Rodapé Oficial */}
            <div className="mt-2 pt-1 text-center text-[8.5px] text-slate-500 border-t border-slate-200 flex justify-between">
              <span>Superintendência de Ações Administrativas Descentralizadas Leste — SDU Leste</span>
              <span>Setor de TI / CPD • Telefone: (86) 3215-7510</span>
              <span>Prefeitura de Teresina</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
