import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Printer, 
  Clock, 
  User, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Plus, 
  History, 
  FileCheck, 
  Star, 
  UserCheck, 
  Send,
  Save,
  Tag
} from 'lucide-react';
import { db } from '../../db/store';
import { ServiceOrder, OSStatus, User as UserType, Checklist } from '../../types';
import { STATUS_MAP, PRIORITY_MAP, formatDateBR, evaluateSLA } from '../../utils/formatters';

interface OrderDetailViewProps {
  orderId: string;
  currentUser: UserType;
  onNavigate: (view: string, id?: string) => void;
  onPrintOrder: (order: ServiceOrder) => void;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
  orderId,
  currentUser,
  onNavigate,
  onPrintOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'timeline' | 'delivery' | 'rating'>('overview');
  
  // Local state for technical actions
  const [newActionText, setNewActionText] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialQty, setMaterialQty] = useState(1);
  const [materialUnit, setMaterialUnit] = useState('un');

  // Delivery form state
  const [receiverName, setReceiverName] = useState('');
  const [receiverReg, setReceiverReg] = useState('');
  const [receiverSector, setReceiverSector] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Rating state
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const order = db.getOrderById(orderId);
  const technicians = db.getTechnicians();

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Ordem de Serviço não encontrada</h2>
        <p className="text-xs text-slate-500 mt-1">A OS solicitada não existe ou foi removida.</p>
        <button
          onClick={() => onNavigate('orders')}
          className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status];
  const priorityInfo = PRIORITY_MAP[order.priority];
  const sla = evaluateSLA(order.createdAt, order.slaDeadline, order.status);

  // Status Change Handler
  const handleStatusChange = (newStatus: OSStatus) => {
    db.updateOrderStatus(order.id, newStatus);
  };

  // Technician Assign Handler
  const handleAssignTech = (techId: string) => {
    db.assignTechnician(order.id, techId);
  };

  // Add Action Handler
  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim()) return;
    db.addActionTaken(order.id, newActionText.trim());
    setNewActionText('');
  };

  // Save Diagnosis
  const handleSaveDiagnosis = () => {
    db.updateTechnicalDetails(order.id, {
      technicalDiagnosis: newDiagnosis.trim() || order.technicalDiagnosis,
    });
    alert('Diagnóstico técnico atualizado com sucesso!');
  };

  // Add Material
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialName.trim()) return;
    db.addMaterial(order.id, {
      name: materialName.trim(),
      quantity: Number(materialQty) || 1,
      unit: materialUnit,
    });
    setMaterialName('');
    setMaterialQty(1);
  };

  // Toggle Checklist
  const handleToggleChecklist = (key: keyof Checklist) => {
    const current = order.checklist || {
      startupTest: false,
      networkTest: false,
      peripheralTest: false,
      internalCleaning: false,
      stressPrintTest: false,
    };
    const updated = {
      ...current,
      [key]: !current[key],
    };
    db.updateTechnicalDetails(order.id, { checklist: updated });
  };

  // Signature Canvas Helpers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiverName.trim()) {
      alert('Informe o nome de quem está recebendo o equipamento.');
      return;
    }

    const canvas = canvasRef.current;
    const signatureDataUrl = canvas ? canvas.toDataURL() : undefined;

    db.confirmDelivery(order.id, {
      receivedBy: receiverName.trim(),
      receiverRegistration: receiverReg.trim() || 'Servidor PMT',
      receiverSector: receiverSector.trim() || order.requester.sector,
      date: new Date().toISOString(),
      confirmationNotes: deliveryNotes.trim(),
      signatureDataUrl,
    });

    alert('Equipamento entregue e recibo homologado!');
    setActiveTab('overview');
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    db.submitRating(order.id, {
      stars: ratingStars,
      comment: ratingComment.trim(),
      date: new Date().toISOString(),
      ratedBy: currentUser.name,
    });
    alert('Obrigado pela sua avaliação!');
    setActiveTab('overview');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('orders')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Voltar para ordens de serviço"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {order.id}
              </h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${statusInfo.dotClass}`} />
                {statusInfo.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 uppercase font-semibold">
                {priorityInfo.label}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Abertura: {formatDateBR(order.createdAt)} • Setor: {order.requester.sector}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPrintOrder(order)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir A4 / Etiqueta</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Status Selector & Technician Assignment */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        
        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Alterar Status:</span>
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(e.target.value as OSStatus)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="aberta">Aberta</option>
            <option value="triagem">Em Triagem</option>
            <option value="atribuida">Atribuída</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="aguardando_peca">Aguardando Peça</option>
            <option value="resolvida">Resolvida</option>
            <option value="entregue">Entregue</option>
            <option value="fechada">Fechada / Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        {/* Technician Assignment */}
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-500 dark:text-slate-400">Técnico Responsável:</span>
          <select
            value={order.technician?.id || ''}
            onChange={(e) => handleAssignTech(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Aguardando atribuição...</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.role === 'admin' ? 'Gestor' : 'Técnico'})
              </option>
            ))}
          </select>
        </div>

        {/* SLA Status Widget */}
        <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${sla.badgeClass}`}>
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{sla.remainingText}</span>
        </div>
      </div>

      {/* Detail Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Visão Geral & Solicitação', icon: User },
          { id: 'tech', label: 'Atendimento & Laudo Técnico', icon: Wrench },
          { id: 'timeline', label: `Histórico & Linha do Tempo (${order.timeline.length})`, icon: History },
          { id: 'delivery', label: 'Termo de Entrega & Recibo', icon: FileCheck },
          { id: 'rating', label: 'Avaliação do Usuário', icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: VISÃO GERAL */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Col 1 & 2: Descrição do Chamado & Equipamento */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Relato do Solicitante */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                Descrição do Problema (Relato do Servidor)
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-line">
                {order.issueDescription}
              </p>
            </div>

            {/* Identificação do Equipamento */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-emerald-600" />
                <span>Dados do Equipamento & Patrimônio</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tipo de Máquina:</span>
                  <span className="font-semibold text-slate-900 dark:text-white capitalize">{order.equipment.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Marca / Fabricante:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{order.equipment.brand}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Modelo:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{order.equipment.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Tombamento (Patrimônio):</span>
                  <span className="font-black text-blue-600 dark:text-blue-400 font-mono text-sm">
                    {order.equipment.assetNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Número de Série:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{order.equipment.serialNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Localização / Sala:</span>
                  <span className="text-slate-700 dark:text-slate-300">{order.locationDetails || 'Setor solicitante'}</span>
                </div>
              </div>

              {/* Acessórios */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[11px] block mb-1.5">Acessórios Entregues:</span>
                <div className="flex flex-wrap gap-1.5">
                  {order.equipment.accessories && order.equipment.accessories.length > 0 ? (
                    order.equipment.accessories.map((acc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {acc}
                      </span>
                    ))
                  ) : (
                    <span className="italic text-slate-400">Nenhum acessório entregue.</span>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Col 3: Solicitante & Status do Atendimento */}
          <div className="space-y-6">
            
            {/* Solicitante Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <span>Dados do Solicitante</span>
              </h3>

              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{order.requester.name}</p>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">{order.requester.sector}</p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Matrícula:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{order.requester.registration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telefone / Ramal:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{order.requester.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">E-mail:</span>
                  <span className="truncate max-w-[160px] text-slate-700 dark:text-slate-200">{order.requester.email}</span>
                </div>
              </div>
            </div>

            {/* Quick Status Guide */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                Ciclo do Chamado
              </h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Utilize as abas acima para registrar laudo técnico, apontamento de peças, checklist e homologação de entrega.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: ATENDIMENTO & LAUDO TÉCNICO */}
      {activeTab === 'tech' && (
        <div className="space-y-6 text-xs">
          
          {/* Diagnóstico Técnico Inicial */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>Laudo & Diagnóstico Técnico do CPD</span>
              </h3>
              <button
                onClick={handleSaveDiagnosis}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Laudo</span>
              </button>
            </div>

            <textarea
              rows={3}
              defaultValue={order.technicalDiagnosis || ''}
              onChange={(e) => setNewDiagnosis(e.target.value)}
              placeholder="Descreva a causa raiz identificada (ex: curto-circuito na fonte de alimentação, bad blocks no disco rígido, cabo flat danificado)..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Procedimentos e Ações Executadas */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Procedimentos e Serviços Executados
            </h3>

            {/* Input to add action */}
            <form onSubmit={handleAddAction} className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Realizada troca de pasta térmica e limpeza de ventoinha..."
                value={newActionText}
                onChange={(e) => setNewActionText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar</span>
              </button>
            </form>

            {/* List of actions */}
            <div className="space-y-2">
              {order.actionsTaken && order.actionsTaken.length > 0 ? (
                order.actionsTaken.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-slate-800 dark:text-slate-200">{act}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic py-2">Nenhum procedimento registrado ainda.</p>
              )}
            </div>
          </div>

          {/* Peças e Materiais Utilizados */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Peças e Peças de Reposição Aplicadas
            </h3>

            <form onSubmit={handleAddMaterial} className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <input
                type="text"
                placeholder="Nome da peça (ex: SSD Kingston 500GB NVMe)..."
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                className="sm:col-span-6 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="number"
                min="1"
                placeholder="Qtd"
                value={materialQty}
                onChange={(e) => setMaterialQty(Number(e.target.value))}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Unidade (un, m, kit)"
                value={materialUnit}
                onChange={(e) => setMaterialUnit(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="sm:col-span-2 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
              >
                <Plus className="w-4 h-4" />
                <span>Inserir</span>
              </button>
            </form>

            <div className="space-y-2">
              {order.materialsUsed && order.materialsUsed.length > 0 ? (
                order.materialsUsed.map((mat) => (
                  <div key={mat.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{mat.name}</span>
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold rounded-lg border border-blue-200 dark:border-blue-900">
                      {mat.quantity} {mat.unit}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic py-2">Nenhuma peça substituída.</p>
              )}
            </div>
          </div>

          {/* Checklist de Controle de Qualidade */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Checklist de Testes de Bancada & Liberação
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { key: 'startupTest', label: '1. Teste de Inicialização e BIOS' },
                { key: 'networkTest', label: '2. Teste de Rede / Conectividade' },
                { key: 'peripheralTest', label: '3. Teste de Portas & Periféricos' },
                { key: 'internalCleaning', label: '4. Limpeza Interna e Lubrificação' },
                { key: 'stressPrintTest', label: '5. Teste de Carga / Impressão Contínua' },
              ].map((item) => {
                const checked = !!order.checklist?.[item.key as keyof Checklist];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleToggleChecklist(item.key as keyof Checklist)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                      checked
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span className="font-semibold">{item.label}</span>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                      checked ? 'bg-emerald-600 text-white' : 'border border-slate-300 dark:border-slate-600'
                    }`}>
                      {checked ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: LINHA DO TEMPO / TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-6">
            Histórico Cronológico e Auditoria da Ordem de Serviço
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {order.timeline.map((event) => (
              <div key={event.id} className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-4 ring-white dark:ring-slate-900">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">{event.action}</span>
                    <span className="text-[11px] text-slate-400">{formatDateBR(event.timestamp)}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Registrado por: <strong className="text-slate-700 dark:text-slate-300">{event.authorName}</strong> ({event.authorRole})
                  </p>
                  {event.notes && (
                    <p className="text-slate-600 dark:text-slate-300 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 italic">
                      &quot;{event.notes}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TERMO DE ENTREGA & RECEBIMENTO */}
      {activeTab === 'delivery' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6 text-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Termo Oficial de Devolução & Recebimento do Equipamento
            </h3>
            <p className="text-slate-500">
              Registra formalmente a entrega do equipamento ao setor solicitante, com assinatura digital.
            </p>
          </div>

          {order.delivery ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-4">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Equipamento Entregue com Recibo Assinado</span>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Recebido Por:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{order.delivery.receivedBy}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Matrícula / Cargo:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{order.delivery.receiverRegistration}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Setor de Destino:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{order.delivery.receiverSector}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Data da Entrega:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{formatDateBR(order.delivery.date)}</span>
                </div>
              </div>

              {order.delivery.signatureDataUrl && (
                <div className="mt-4 pt-4 border-t border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-slate-500 block mb-2 font-semibold">Assinatura Digital Capturada:</span>
                  <div className="bg-white p-2 border border-slate-300 rounded-xl inline-block">
                    <img src={order.delivery.signatureDataUrl} alt="Assinatura Digital" className="h-16 object-contain" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleConfirmDelivery} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nome do Servidor Recebedor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome de quem está retirando"
                    value={receiverName || order.requester.name}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Matrícula do Recebedor
                  </label>
                  <input
                    type="text"
                    placeholder="Matrícula PMT"
                    value={receiverReg || order.requester.registration}
                    onChange={(e) => setReceiverReg(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              {/* Signature canvas */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Assinatura Digital na Tela (Mouse ou Toque)
                  </label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-blue-600 hover:underline text-[11px]"
                  >
                    Limpar assinatura
                  </button>
                </div>
                
                <div className="border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-white">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={140}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full touch-none cursor-crosshair"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  O servidor pode assinar diretamente na tela usando o dedo no tablet/smartphone ou com o mouse no computador.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Observações da Entrega
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ex: Equipamento testado na presença do solicitante, cabo de energia devolvido..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition-colors"
              >
                <FileCheck className="w-4 h-4" />
                <span>Confirmar Entrega & Homologar Recibo</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 5: AVALIAÇÃO DO USUÁRIO */}
      {activeTab === 'rating' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl text-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Avaliação de Satisfação do Usuário
          </h3>
          <p className="text-slate-500">
            Sua opinião é fundamental para aprimorar o atendimento do Setor de TI da SDU Leste.
          </p>

          {order.rating ? (
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < order.rating!.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                  />
                ))}
                <span className="font-bold text-slate-800 dark:text-slate-200 ml-2">
                  {order.rating.stars} de 5 estrelas
                </span>
              </div>
              <p className="text-slate-700 dark:text-slate-300 italic pt-1">
                &quot;{order.rating.comment || 'Sem comentários adicionais'}&quot;
              </p>
              <span className="text-[10px] text-slate-400 block">
                Avaliado por {order.rating.ratedBy} em {formatDateBR(order.rating.date)}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nota do Atendimento:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingStars(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-200 ml-2">
                    {ratingStars} estrelas
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Comentário / Sugestão:
                </label>
                <textarea
                  rows={3}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  placeholder="Escreva como foi a experiência com a equipe de suporte..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Avaliação</span>
              </button>
            </form>
          )}
        </div>
      )}

    </div>
  );
};
