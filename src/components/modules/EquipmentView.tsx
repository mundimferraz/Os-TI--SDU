import React, { useState } from 'react';
import { 
  HardDrive, 
  Search, 
  Plus, 
  History, 
  Wrench, 
  CheckCircle2, 
  X,
  Laptop,
  Printer,
  Radio,
  Cpu,
  Zap,
  Server,
  Monitor,
  Edit2,
  Trash2,
  Layers,
  Settings2,
  AlertCircle,
  Filter,
  Check
} from 'lucide-react';
import { db } from '../../db/store';
import { Equipment, EquipmentTypeConfig } from '../../types';
import { formatDateOnlyBR, STATUS_MAP } from '../../utils/formatters';

interface EquipmentViewProps {
  onNavigate: (view: string, orderId?: string) => void;
}

// Icon mapper helper
const AVAILABLE_ICONS = [
  { id: 'Cpu', label: 'Computador / CPU', icon: Cpu },
  { id: 'Laptop', label: 'Notebook / Portátil', icon: Laptop },
  { id: 'Printer', label: 'Impressora / Scanner', icon: Printer },
  { id: 'Monitor', label: 'Monitor / Display', icon: Monitor },
  { id: 'Zap', label: 'Nobreak / Elétrica', icon: Zap },
  { id: 'Radio', label: 'Rede / Switch / Roteador', icon: Radio },
  { id: 'Server', label: 'Servidor / Storage', icon: Server },
  { id: 'HardDrive', label: 'Periférico / Geral', icon: HardDrive },
];

export const EquipmentView: React.FC<EquipmentViewProps> = ({ onNavigate }) => {
  // Navigation tabs inside Equipment module
  const [activeTab, setActiveTab] = useState<'inventory' | 'types'>('inventory');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | Equipment['status']>('all');

  // Modals state
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentModalMode, setEquipmentModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState<string | null>(null);

  // Type modal state
  const [typeModalMode, setTypeModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);

  // Feedback message
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for Equipment
  const [eqAssetNumber, setEqAssetNumber] = useState('');
  const [eqBrand, setEqBrand] = useState('Dell');
  const [eqModel, setEqModel] = useState('');
  const [eqType, setEqType] = useState('desktop');
  const [eqSerial, setEqSerial] = useState('');
  const [eqSector, setEqSector] = useState('');
  const [eqLocationDetails, setEqLocationDetails] = useState('');
  const [eqStatus, setEqStatus] = useState<Equipment['status']>('operacional');
  const [eqPurchaseYear, setEqPurchaseYear] = useState<number>(new Date().getFullYear());
  const [eqNotes, setEqNotes] = useState('');

  // Form state for Equipment Type
  const [typeName, setTypeName] = useState('');
  const [typeIconName, setTypeIconName] = useState('HardDrive');
  const [typeDescription, setTypeDescription] = useState('');

  // Data from store
  const equipments = db.getEquipments();
  const equipmentTypes = db.getEquipmentTypes();
  const sectors = db.getSectors();
  const allOrders = db.getOrders();

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ type, text });
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  // Helper for dynamic equipment icon
  const getEquipmentIconComponent = (typeId: string) => {
    const config = equipmentTypes.find((t) => t.id.toLowerCase() === typeId.toLowerCase());
    const iconKey = config?.iconName || 'HardDrive';
    const found = AVAILABLE_ICONS.find((i) => i.id.toLowerCase() === iconKey.toLowerCase());
    return found ? found.icon : HardDrive;
  };

  const getTypeName = (typeId: string) => {
    const config = equipmentTypes.find((t) => t.id.toLowerCase() === typeId.toLowerCase());
    return config ? config.name : typeId;
  };

  // Filtered equipments
  const filteredEquipments = equipments.filter((eq) => {
    if (typeFilter !== 'all' && eq.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (statusFilter !== 'all' && eq.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        eq.assetNumber.toLowerCase().includes(q) ||
        eq.brand.toLowerCase().includes(q) ||
        eq.model.toLowerCase().includes(q) ||
        eq.sector.toLowerCase().includes(q) ||
        (eq.serialNumber && eq.serialNumber.toLowerCase().includes(q)) ||
        (eq.locationDetails && eq.locationDetails.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // --- Equipment Handlers ---

  const handleOpenCreateEquipment = () => {
    setEqAssetNumber('');
    setEqBrand('Dell');
    setEqModel('');
    setEqType(equipmentTypes[0]?.id || 'desktop');
    setEqSerial('');
    setEqSector(sectors[0]?.name ? `${sectors[0].name} (${sectors[0].abbreviation})` : 'Setor de TI / CPD');
    setEqLocationDetails('');
    setEqStatus('operacional');
    setEqPurchaseYear(new Date().getFullYear());
    setEqNotes('');
    setEditingEquipmentId(null);
    setEquipmentModalMode('create');
  };

  const handleOpenEditEquipment = (eq: Equipment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingEquipmentId(eq.id);
    setEqAssetNumber(eq.assetNumber);
    setEqBrand(eq.brand);
    setEqModel(eq.model);
    setEqType(eq.type);
    setEqSerial(eq.serialNumber || '');
    setEqSector(eq.sector);
    setEqLocationDetails(eq.locationDetails || '');
    setEqStatus(eq.status);
    setEqPurchaseYear(eq.purchaseYear || new Date().getFullYear());
    setEqNotes(eq.notes || '');
    setEquipmentModalMode('edit');
  };

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqAssetNumber.trim()) {
      showFeedback('Por favor, informe o número de tombamento patrimonial da Prefeitura.', 'error');
      return;
    }

    const trimmedAsset = eqAssetNumber.trim().toUpperCase();

    // Check asset number uniqueness if creating or if changed during edit
    const existingSameAsset = equipments.find(
      (eq) => eq.assetNumber.toUpperCase() === trimmedAsset && eq.id !== editingEquipmentId
    );
    if (existingSameAsset) {
      showFeedback(`Já existe um equipamento cadastrado com o tombamento ${trimmedAsset}.`, 'error');
      return;
    }

    if (equipmentModalMode === 'create') {
      db.createEquipment({
        assetNumber: trimmedAsset,
        brand: eqBrand.trim() || 'Genérico',
        model: eqModel.trim() || 'Padrão PMT',
        type: eqType,
        serialNumber: eqSerial.trim() || 'S/N',
        sector: eqSector || (sectors[0] ? `${sectors[0].name} (${sectors[0].abbreviation})` : 'Gabinete'),
        locationDetails: eqLocationDetails.trim(),
        status: eqStatus,
        purchaseYear: Number(eqPurchaseYear) || new Date().getFullYear(),
        notes: eqNotes.trim(),
        lastMaintenanceDate: new Date().toISOString(),
      });
      showFeedback(`Equipamento ${trimmedAsset} cadastrado com sucesso!`);
    } else if (equipmentModalMode === 'edit' && editingEquipmentId) {
      db.updateEquipment(editingEquipmentId, {
        assetNumber: trimmedAsset,
        brand: eqBrand.trim() || 'Genérico',
        model: eqModel.trim() || 'Padrão PMT',
        type: eqType,
        serialNumber: eqSerial.trim() || 'S/N',
        sector: eqSector,
        locationDetails: eqLocationDetails.trim(),
        status: eqStatus,
        purchaseYear: Number(eqPurchaseYear) || new Date().getFullYear(),
        notes: eqNotes.trim(),
      });
      showFeedback(`Equipamento ${trimmedAsset} atualizado com sucesso!`);
      
      // Update selected equipment preview if it's currently open
      if (selectedEquipment && selectedEquipment.id === editingEquipmentId) {
        setSelectedEquipment(db.getEquipmentById(editingEquipmentId) || null);
      }
    }

    setEquipmentModalMode(null);
  };

  const handleDeleteEquipment = (eq: Equipment, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Confirma a exclusão do equipamento ${eq.brand} ${eq.model} (Tombamento: ${eq.assetNumber})?`)) {
      return;
    }

    const result = db.deleteEquipment(eq.id);
    if (result.success) {
      showFeedback(`Equipamento ${eq.assetNumber} removido com sucesso.`);
      if (selectedEquipment?.id === eq.id) {
        setSelectedEquipment(null);
      }
    } else {
      showFeedback(result.message || 'Erro ao excluir o equipamento.', 'error');
    }
  };

  // --- Equipment Types Handlers ---

  const handleOpenCreateType = () => {
    setTypeName('');
    setTypeIconName('HardDrive');
    setTypeDescription('');
    setEditingTypeId(null);
    setTypeModalMode('create');
  };

  const handleOpenEditType = (type: EquipmentTypeConfig) => {
    setEditingTypeId(type.id);
    setTypeName(type.name);
    setTypeIconName(type.iconName || 'HardDrive');
    setTypeDescription(type.description || '');
    setTypeModalMode('edit');
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeName.trim()) {
      showFeedback('Informe o nome descritivo do tipo de equipamento.', 'error');
      return;
    }

    if (typeModalMode === 'create') {
      const created = db.createEquipmentType({
        name: typeName.trim(),
        iconName: typeIconName,
        description: typeDescription.trim(),
      });
      showFeedback(`Tipo "${created.name}" cadastrado com sucesso!`);
    } else if (typeModalMode === 'edit' && editingTypeId) {
      db.updateEquipmentType(editingTypeId, {
        name: typeName.trim(),
        iconName: typeIconName,
        description: typeDescription.trim(),
      });
      showFeedback(`Tipo "${typeName.trim()}" atualizado com sucesso!`);
    }

    setTypeModalMode(null);
  };

  const handleDeleteType = (type: EquipmentTypeConfig) => {
    if (!window.confirm(`Confirma a remoção do tipo de equipamento "${type.name}"?`)) {
      return;
    }

    const result = db.deleteEquipmentType(type.id);
    if (result.success) {
      showFeedback(`Tipo "${type.name}" excluído com sucesso.`);
    } else {
      showFeedback(result.message || 'Não foi possível excluir o tipo.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div className={`p-4 rounded-2xl shadow-lg border text-xs font-semibold flex items-center justify-between transition-all ${
          feedbackMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button 
            onClick={() => setFeedbackMessage(null)}
            className="p-1 hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Parque Tecnológico & Inventário</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gerenciamento completo de computadores, impressoras, periféricos e tipos de equipamentos da SDU Leste
          </p>
        </div>

        {/* Action Buttons based on Active Tab */}
        <div className="flex items-center gap-2.5">
          {activeTab === 'inventory' ? (
            <button
              onClick={handleOpenCreateEquipment}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Equipamento</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateType}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Tipo de Equipamento</span>
            </button>
          )}
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Equipamentos Cadastrados ({equipments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('types')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'types'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tipos de Equipamento ({equipmentTypes.length})</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY LIST & MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          
          {/* Filter and Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar tombamento PMT, modelo, marca, setor ou sala..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Type Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Tipo:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">Todos os tipos ({equipments.length})</option>
                  {equipmentTypes.map((type) => {
                    const count = equipments.filter((e) => e.type.toLowerCase() === type.id.toLowerCase()).length;
                    return (
                      <option key={type.id} value={type.id}>
                        {type.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">Todos os status</option>
                  <option value="operacional">Operacional</option>
                  <option value="em_manutencao">Em Manutenção</option>
                  <option value="reserva">Reserva Técnica</option>
                  <option value="desativado">Desativado</option>
                </select>
              </div>
            </div>
          </div>

          {/* Equipments Grid */}
          {filteredEquipments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <HardDrive className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nenhum equipamento encontrado com os filtros selecionados.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {filteredEquipments.map((eq) => {
                const Icon = getEquipmentIconComponent(eq.type);
                const typeName = getTypeName(eq.type);
                const eqOrders = allOrders.filter(
                  (o) => o.equipment.assetNumber.toLowerCase() === eq.assetNumber.toLowerCase()
                );

                return (
                  <div
                    key={eq.id}
                    onClick={() => setSelectedEquipment(eq)}
                    className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 cursor-pointer transition-all space-y-3 group relative flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm block">
                              {eq.assetNumber}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {typeName} • {eq.brand}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          eq.status === 'operacional'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : eq.status === 'em_manutencao'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : eq.status === 'reserva'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {eq.status === 'operacional' && 'Operacional'}
                          {eq.status === 'em_manutencao' && 'Em Manutenção'}
                          {eq.status === 'reserva' && 'Reserva Técnica'}
                          {eq.status === 'desativado' && 'Desativado'}
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                          {eq.model}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {eq.sector}
                        </p>
                        {eq.locationDetails && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5 line-clamp-1">
                            {eq.locationDetails}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">
                        Histórico: <strong className="text-slate-700 dark:text-slate-300">{eqOrders.length} OSs</strong>
                      </span>

                      {/* Quick Edit and Delete buttons */}
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleOpenEditEquipment(eq, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                          title="Editar este equipamento"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteEquipment(eq, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                          title="Excluir este equipamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: EQUIPMENT TYPES MANAGEMENT */}
      {activeTab === 'types' && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-2xl border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <Settings2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Autonomia Completa de Categorização de Equipamentos</p>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-0.5">
                Aqui você pode criar novos tipos de equipamentos (como Scanners, Nobreaks, Estações de Trabalho, Servidores), alterar nomes e ícones de exibição, ou excluir tipos não mais utilizados. Os tipos cadastrados aparecem instantaneamente na abertura de OS e no inventário.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {equipmentTypes.map((type) => {
              const Icon = getEquipmentIconComponent(type.id);
              const count = equipments.filter((e) => e.type.toLowerCase() === type.id.toLowerCase()).length;

              return (
                <div
                  key={type.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                            {type.name}
                          </h4>
                          <span className="font-mono text-[10px] text-slate-400">
                            ID: {type.id}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {count} no parque
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 min-h-[32px]">
                      {type.description || 'Tipo de equipamento de informática padronizado para suporte e ordens de serviço da SDU Leste.'}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {type.isSystem ? 'Padrão do Sistema' : 'Personalizado'}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditType(type)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                        title="Editar nome ou ícone deste tipo"
                      >
                        <Edit2 className="w-3 h-3 text-blue-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDeleteType(type)}
                        disabled={count > 0}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          count > 0
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                            : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:hover:bg-rose-900 text-rose-600 dark:text-rose-300'
                        }`}
                        title={count > 0 ? `Não pode excluir: ${count} equipamento(s) usam este tipo` : 'Excluir este tipo de equipamento'}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL 1: VIEW EQUIPMENT DETAILS & OS HISTORY */}
      {selectedEquipment && !equipmentModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Patrimônio SDU Leste</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {selectedEquipment.assetNumber}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditEquipment(selectedEquipment)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 text-xs font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar Dados</span>
                </button>
                <button
                  onClick={() => setSelectedEquipment(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block">Tipo:</span>
                <span className="font-semibold">{getTypeName(selectedEquipment.type)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Marca / Modelo:</span>
                <span className="font-semibold">{selectedEquipment.brand} {selectedEquipment.model}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Número de Série:</span>
                <span className="font-mono">{selectedEquipment.serialNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Setor Alocado:</span>
                <span className="font-semibold">{selectedEquipment.sector}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Sala / Detalhes:</span>
                <span>{selectedEquipment.locationDetails || 'Geral do Setor'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status Atual:</span>
                <span className={`font-bold capitalize ${
                  selectedEquipment.status === 'operacional' ? 'text-emerald-600' : 'text-amber-600'
                }`}>
                  {selectedEquipment.status.replace('_', ' ')}
                </span>
              </div>
              {selectedEquipment.notes && (
                <div className="col-span-2 sm:col-span-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 block">Observações Técnicas:</span>
                  <span className="text-slate-700 dark:text-slate-300 italic">{selectedEquipment.notes}</span>
                </div>
              )}
            </div>

            {/* List of OS for this equipment */}
            <div>
              <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-blue-600" />
                <span>Histórico de Ordens de Serviço Deste Equipamento</span>
              </h4>

              {(() => {
                const eqOrders = allOrders.filter(
                  (o) => o.equipment.assetNumber.toLowerCase() === selectedEquipment.assetNumber.toLowerCase()
                );

                if (eqOrders.length === 0) {
                  return (
                    <p className="text-xs text-slate-400 italic py-4 text-center">
                      Nenhuma manutenção registrada para este patrimônio até o momento.
                    </p>
                  );
                }

                return (
                  <div className="space-y-2">
                    {eqOrders.map((ord) => (
                      <div
                        key={ord.id}
                        onClick={() => {
                          setSelectedEquipment(null);
                          onNavigate('order-detail', ord.id);
                        }}
                        className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 cursor-pointer transition-colors flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-blue-600">{ord.id}</span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-semibold border ${STATUS_MAP[ord.status].badgeClass}`}>
                              {STATUS_MAP[ord.status].label}
                            </span>
                            <span className="text-[11px] text-slate-400">{formatDateOnlyBR(ord.createdAt)}</span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 mt-0.5 truncate max-w-md">
                            {ord.issueDescription}
                          </p>
                        </div>
                        <span className="text-blue-600 hover:underline font-semibold">Abrir OS →</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT EQUIPMENT */}
      {equipmentModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {equipmentModalMode === 'create' ? 'Cadastrar Novo Equipamento' : 'Editar Equipamento'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {equipmentModalMode === 'create'
                    ? 'Adicione um equipamento ao inventário de TI da SDU Leste'
                    : 'Modifique os dados do patrimônio, tipo ou setor de alocação'}
                </p>
              </div>
              <button onClick={() => setEquipmentModalMode(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3.5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tombamento / Patrimônio PMT *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: PMT-SDUL-04821"
                    value={eqAssetNumber}
                    onChange={(e) => setEqAssetNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Equipamento *
                  </label>
                  <select
                    value={eqType}
                    onChange={(e) => setEqType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {equipmentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Marca / Fabricante *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dell, HP, Lenovo, Brother..."
                    value={eqBrand}
                    onChange={(e) => setEqBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Modelo / Especificação *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: OptiPlex 3080 SFF, Laser 107w..."
                    value={eqModel}
                    onChange={(e) => setEqModel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Número de Série (S/N)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: BR54921X ou S/N"
                    value={eqSerial}
                    onChange={(e) => setEqSerial(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Status Operacional *
                  </label>
                  <select
                    value={eqStatus}
                    onChange={(e) => setEqStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="operacional">Operacional (Em uso)</option>
                    <option value="em_manutencao">Em Manutenção (No CPD)</option>
                    <option value="reserva">Reserva Técnica (Estoque)</option>
                    <option value="desativado">Desativado (Baixa Patrimonial)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Gerência / Setor Alocado *
                  </label>
                  <select
                    value={eqSector}
                    onChange={(e) => setEqSector(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {sectors.map((sec) => (
                      <option key={sec.id} value={`${sec.name} (${sec.abbreviation})`}>
                        {sec.name} ({sec.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sala / Detalhes de Localização
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Bloco A - Sala 04, Mesa 2"
                    value={eqLocationDetails}
                    onChange={(e) => setEqLocationDetails(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ano de Aquisição
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2030"
                    value={eqPurchaseYear}
                    onChange={(e) => setEqPurchaseYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Observações / Configurações
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 16GB RAM, SSD 512GB, IP fixo..."
                    value={eqNotes}
                    onChange={(e) => setEqNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEquipmentModalMode(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {equipmentModalMode === 'create' ? 'Cadastrar Equipamento' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE / EDIT EQUIPMENT TYPE */}
      {typeModalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {typeModalMode === 'create' ? 'Novo Tipo de Equipamento' : 'Editar Tipo de Equipamento'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configure uma categoria personalizada de hardware para a SDU Leste
                </p>
              </div>
              <button onClick={() => setTypeModalMode(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveType} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Tipo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Scanner de Mesa, Projetor Multimídia, Servidor Rack..."
                  value={typeName}
                  onChange={(e) => setTypeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Ícone Representativo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {AVAILABLE_ICONS.map((item) => {
                    const ItemIcon = item.icon;
                    const isSelected = typeIconName.toLowerCase() === item.id.toLowerCase();
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTypeIconName(item.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
                        <span className="text-[9px] truncate w-full">{item.label.split('/')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descrição Operacional
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Equipamento destinado a digitalização de projetos de engenharia e processos administrativos da superintendência."
                  value={typeDescription}
                  onChange={(e) => setTypeDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTypeModalMode(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors"
                >
                  {typeModalMode === 'create' ? 'Cadastrar Tipo' : 'Salvar Tipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
