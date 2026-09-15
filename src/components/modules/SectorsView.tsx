import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  UserCheck, 
  HardDrive, 
  ClipboardList, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { db } from '../../db/store';
import { SectorConfig, ServiceOrder, Equipment } from '../../types';

interface SectorsViewProps {
  onNavigate: (view: string, orderId?: string) => void;
}

export const SectorsView: React.FC<SectorsViewProps> = ({ onNavigate }) => {
  const sectors = db.getSectors();
  const allOrders = db.getOrders();
  const allEquipments = db.getEquipments();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'with_orders' | 'with_equipment'>('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<SectorConfig | null>(null);
  const [viewingSector, setViewingSector] = useState<SectorConfig | null>(null);
  const [deletingSector, setDeletingSector] = useState<SectorConfig | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    headName: '',
    phone: '',
    email: '',
    location: '',
    description: '',
  });

  // Calculate sector statistics
  const sectorStats = useMemo(() => {
    return sectors.map((sec) => {
      const orders = allOrders.filter(
        (o) =>
          o.requester.sector.toLowerCase().includes(sec.abbreviation.toLowerCase()) ||
          o.requester.sector.toLowerCase().includes(sec.name.toLowerCase())
      );
      const activeOrders = orders.filter(
        (o) => !['resolvida', 'entregue', 'fechada', 'cancelada'].includes(o.status)
      );
      const equipments = allEquipments.filter(
        (e) =>
          e.sector.toLowerCase().includes(sec.abbreviation.toLowerCase()) ||
          e.sector.toLowerCase().includes(sec.name.toLowerCase())
      );

      return {
        sector: sec,
        totalOrders: orders.length,
        activeOrders: activeOrders.length,
        equipmentCount: equipments.length,
      };
    });
  }, [sectors, allOrders, allEquipments]);

  // Filtered list
  const filteredList = useMemo(() => {
    return sectorStats.filter((item) => {
      const s = item.sector;
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.headName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone.includes(searchTerm) ||
        (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterMode === 'with_orders') {
        return item.activeOrders > 0;
      }
      if (filterMode === 'with_equipment') {
        return item.equipmentCount > 0;
      }
      return true;
    });
  }, [sectorStats, searchTerm, filterMode]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingSector(null);
    setFormData({
      name: '',
      abbreviation: '',
      headName: '',
      phone: '',
      email: '',
      location: '',
      description: '',
    });
    setErrorMessage('');
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (sec: SectorConfig) => {
    setEditingSector(sec);
    setFormData({
      name: sec.name,
      abbreviation: sec.abbreviation,
      headName: sec.headName,
      phone: sec.phone,
      email: sec.email || '',
      location: sec.location || '',
      description: sec.description || '',
    });
    setErrorMessage('');
    setIsFormOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.abbreviation.trim() || !formData.headName.trim()) {
      setErrorMessage('Por favor, preencha o nome da gerência, sigla e responsável.');
      return;
    }

    const cleanData = {
      name: formData.name.trim(),
      abbreviation: formData.abbreviation.trim().toUpperCase(),
      headName: formData.headName.trim(),
      phone: formData.phone.trim() || '(86) 3215-7500',
      email: formData.email.trim() || undefined,
      location: formData.location.trim() || undefined,
      description: formData.description.trim() || undefined,
    };

    if (editingSector) {
      db.updateSector(editingSector.id, cleanData);
      setSuccessNotice(`Gerência "${cleanData.abbreviation}" atualizada com sucesso!`);
    } else {
      // Check duplicate abbreviation
      const exists = sectors.some(
        (s) => s.abbreviation.toLowerCase() === cleanData.abbreviation.toLowerCase()
      );
      if (exists) {
        setErrorMessage(`Já existe uma gerência cadastrada com a sigla "${cleanData.abbreviation}".`);
        return;
      }
      db.createSector(cleanData);
      setSuccessNotice(`Gerência "${cleanData.abbreviation}" cadastrada com sucesso!`);
    }

    setIsFormOpen(false);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingSector) return;
    const res = db.deleteSector(deletingSector.id);
    if (!res.success) {
      setErrorMessage(res.message || 'Erro ao excluir gerência.');
      return;
    }

    setSuccessNotice(`Gerência "${deletingSector.abbreviation}" excluída com sucesso!`);
    setDeletingSector(null);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Get active orders for details modal
  const viewingOrders = useMemo(() => {
    if (!viewingSector) return [];
    return allOrders.filter(
      (o) =>
        o.requester.sector.toLowerCase().includes(viewingSector.abbreviation.toLowerCase()) ||
        o.requester.sector.toLowerCase().includes(viewingSector.name.toLowerCase())
    );
  }, [viewingSector, allOrders]);

  // Get equipment for details modal
  const viewingEquipments = useMemo(() => {
    if (!viewingSector) return [];
    return allEquipments.filter(
      (e) =>
        e.sector.toLowerCase().includes(viewingSector.abbreviation.toLowerCase()) ||
        e.sector.toLowerCase().includes(viewingSector.name.toLowerCase())
    );
  }, [viewingSector, allEquipments]);

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Estrutura Organizacional
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">SDU Leste</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Building2 className="w-6 h-6 text-blue-600" />
            <span>Gestão de Gerências & Setores</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cadastro, lotação, responsáveis institucionais e vínculos de equipamentos atendidos pelo CPD
          </p>
        </div>

        <button
          id="btn-new-sector"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Gerência</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {successNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} className="text-emerald-700 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total de Gerências
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">
            {sectors.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Setores cadastrados na SDU
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            Com Demandas Ativas
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block mt-1">
            {sectorStats.filter((s) => s.activeOrders > 0).length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Gerências com OS em aberto
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Total Equipamentos
          </span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1">
            {allEquipments.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Distribuídos nas gerências
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Chamados Registrados
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
            {allOrders.length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Histórico total do CPD
          </span>
        </div>
      </div>

      {/* Action Bar: Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, sigla (ex: GOSP), responsável ou sala..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Todas ({sectorStats.length})
          </button>
          <button
            onClick={() => setFilterMode('with_orders')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'with_orders'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Com Chamados Ativos ({sectorStats.filter((s) => s.activeOrders > 0).length})
          </button>
          <button
            onClick={() => setFilterMode('with_equipment')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterMode === 'with_equipment'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Com Equipamentos ({sectorStats.filter((s) => s.equipmentCount > 0).length})
          </button>
        </div>

      </div>

      {/* Sectors Grid */}
      {filteredList.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            Nenhuma gerência encontrada
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tente alterar o filtro de busca ou adicione uma nova gerência institucional ao sistema.
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
          >
            Cadastrar Gerência
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map(({ sector, totalOrders, activeOrders, equipmentCount }) => (
            <div
              key={sector.id}
              id={`sector-card-${sector.id}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400/60 dark:hover:border-blue-700/60 transition-all flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5 space-y-3.5">
                
                {/* Header with Sigla and Badges */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-600/10 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm tracking-wider uppercase shrink-0 group-hover:scale-105 transition-transform">
                      {sector.abbreviation}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Gerência / Setor
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2">
                        {sector.name}
                      </h3>
                    </div>
                  </div>

                  {activeOrders > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/40 shrink-0">
                      {activeOrders} OS Ativa{activeOrders > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Description if present */}
                {sector.description && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {sector.description}
                  </p>
                )}

                {/* Info List */}
                <div className="space-y-1.5 pt-1 text-xs border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 text-[11px]">Gerente:</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                      {sector.headName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 text-[11px]">Ramal:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {sector.phone}
                    </span>
                  </div>

                  {sector.email && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500 text-[11px]">E-mail:</span>
                      <span className="truncate text-blue-600 dark:text-blue-400 text-[11px]">
                        {sector.email}
                      </span>
                    </div>
                  )}

                  {sector.location && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-500 text-[11px]">Local:</span>
                      <span className="truncate text-slate-700 dark:text-slate-300 text-[11px]">
                        {sector.location}
                      </span>
                    </div>
                  )}
                </div>

                {/* Counts pills */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Equipamentos
                    </span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {equipmentCount}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Total de OS
                    </span>
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {totalOrders}
                    </span>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  onClick={() => setViewingSector(sector)}
                  className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Ver Detalhes</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(sector)}
                    className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Editar Gerência"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingSector(sector);
                      setErrorMessage('');
                    }}
                    className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Excluir Gerência"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT GERÊNCIA ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {editingSector ? 'Editar Gerência' : 'Nova Gerência da SDU Leste'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingSector ? `Atualizando informações de ${editingSector.abbreviation}` : 'Preencha os dados institucionais do novo setor'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              
              {errorMessage && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Nome Completo da Gerência *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gerência de Obras e Serviços Públicos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Sigla *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="Ex: GOSP"
                    value={formData.abbreviation}
                    onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 uppercase font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Gerente / Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Eng. Roberto Alencar"
                    value={formData.headName}
                    onChange={(e) => setFormData({ ...formData, headName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Telefone / Ramal *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: (86) 3215-7530"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: gosp.sdul@teresina.pi.gov.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Localização / Sala
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Bloco A - Térreo, Sala 102"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Atribuições / Competência
                </label>
                <textarea
                  rows={2}
                  placeholder="Breve resumo das atividades e competências desta gerência..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-xs"
                >
                  {editingSector ? 'Salvar Alterações' : 'Cadastrar Gerência'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: DETAILS OF GERÊNCIA ================= */}
      {viewingSector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-base shadow-xs">
                  {viewingSector.abbreviation}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {viewingSector.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Responsável: {viewingSector.headName} • Tel: {viewingSector.phone}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingSector(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              
              {/* Institutional Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Localização</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {viewingSector.location || 'Prédio Central da SDU Leste'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">E-mail Institucional</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5 block truncate">
                    {viewingSector.email || 'Não informado'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block">Total de Ativos / OS</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {viewingEquipments.length} Máquinas • {viewingOrders.length} Chamados
                  </span>
                </div>
              </div>

              {viewingSector.description && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                    Atribuições do Setor
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    {viewingSector.description}
                  </p>
                </div>
              )}

              {/* Linked Service Orders */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-blue-600" />
                    <span>Ordens de Serviço Desta Gerência ({viewingOrders.length})</span>
                  </h4>
                  <button
                    onClick={() => {
                      setViewingSector(null);
                      onNavigate('orders');
                    }}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Ver todas no painel</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {viewingOrders.length === 0 ? (
                  <p className="text-slate-400 italic p-3 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                    Nenhuma ordem de serviço registrada por esta gerência até o momento.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {viewingOrders.slice(0, 5).map((order) => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setViewingSector(null);
                          onNavigate('order-detail', order.id);
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 cursor-pointer flex items-center justify-between transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.id}</span>
                            <span className="text-slate-800 dark:text-slate-200 font-semibold">
                              {order.equipment.type} ({order.equipment.assetNumber})
                            </span>
                          </div>
                          <p className="text-slate-500 text-[11px] truncate max-w-md mt-0.5">
                            {order.issueDescription}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Equipment */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-2">
                  <HardDrive className="w-4 h-4 text-emerald-600" />
                  <span>Equipamentos Alocados Neste Setor ({viewingEquipments.length})</span>
                </h4>

                {viewingEquipments.length === 0 ? (
                  <p className="text-slate-400 italic p-3 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                    Nenhum equipamento catalogado neste setor no inventário.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewingEquipments.map((eq) => (
                      <div
                        key={eq.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {eq.assetNumber}
                          </span>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            {eq.type}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-[11px] font-medium mt-1">
                          {eq.brand} {eq.model}
                        </p>
                        {eq.locationDetails && (
                          <p className="text-slate-400 text-[10px] mt-0.5 truncate">
                            {eq.locationDetails}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  const sec = viewingSector;
                  setViewingSector(null);
                  handleOpenEdit(sec);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
              >
                Editar Informações
              </button>
              <button
                onClick={() => setViewingSector(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE ================= */}
      {deletingSector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-fadeIn text-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Excluir Gerência {deletingSector.abbreviation}?
              </h3>
              <p className="text-slate-500">
                Você está prestes a remover o registro de <strong className="text-slate-800 dark:text-slate-200">{deletingSector.name}</strong>.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingSector(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-xs"
              >
                Sim, Excluir Gerência
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
