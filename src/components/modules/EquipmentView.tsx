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
  Cpu
} from 'lucide-react';
import { db } from '../../db/store';
import { Equipment } from '../../types';
import { formatDateOnlyBR, formatDateBR, STATUS_MAP } from '../../utils/formatters';

interface EquipmentViewProps {
  onNavigate: (view: string, orderId?: string) => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({ onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);

  // New equipment form
  const [newAsset, setNewAsset] = useState('');
  const [newBrand, setNewBrand] = useState('Dell');
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState<Equipment['type']>('desktop');
  const [newSerial, setNewSerial] = useState('');
  const [newSector, setNewSector] = useState('');

  const equipments = db.getEquipments();
  const sectors = db.getSectors();
  const allOrders = db.getOrders();

  const filteredEquipments = equipments.filter((eq) => {
    if (typeFilter !== 'all' && eq.type !== typeFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        eq.assetNumber.toLowerCase().includes(q) ||
        eq.brand.toLowerCase().includes(q) ||
        eq.model.toLowerCase().includes(q) ||
        eq.sector.toLowerCase().includes(q) ||
        eq.serialNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.trim()) {
      alert('Informe o número de tombamento da Prefeitura.');
      return;
    }
    db.createEquipment({
      type: newType,
      brand: newBrand.trim(),
      model: newModel.trim() || 'Padrão PMT',
      assetNumber: newAsset.trim().toUpperCase(),
      serialNumber: newSerial.trim() || 'S/N',
      sector: newSector || sectors[0]?.name || 'Gabinete',
      status: 'operacional',
      purchaseYear: new Date().getFullYear(),
      lastMaintenanceDate: new Date().toISOString(),
    });
    setShowNewModal(false);
    setNewAsset('');
    setNewModel('');
    setNewSerial('');
  };

  const getEquipmentIcon = (type: Equipment['type']) => {
    switch (type) {
      case 'notebook': return Laptop;
      case 'impressora': return Printer;
      case 'switch':
      case 'roteador': return Radio;
      default: return Cpu;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Parque Tecnológico — Inventário de Equipamentos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Controle de computadores, impressoras e patrimônios da SDU Leste
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Equipamento</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar tombamento PMT, modelo, marca ou setor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Tipo:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="all">Todos os tipos</option>
            <option value="desktop">Desktops</option>
            <option value="notebook">Notebooks</option>
            <option value="impressora">Impressoras</option>
            <option value="nobreak">Nobreaks</option>
            <option value="switch">Switches & Rede</option>
          </select>
        </div>
      </div>

      {/* Equipments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {filteredEquipments.map((eq) => {
          const Icon = getEquipmentIcon(eq.type);
          const eqOrders = allOrders.filter((o) => o.equipment.assetNumber.toLowerCase() === eq.assetNumber.toLowerCase());

          return (
            <div
              key={eq.id}
              onClick={() => setSelectedEquipment(eq)}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm block">
                      {eq.assetNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {eq.type} • {eq.brand}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  eq.status === 'operacional'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {eq.status === 'operacional' ? 'Operacional' : 'Em Manutenção'}
                </span>
              </div>

              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">
                  {eq.model}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {eq.sector}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Histórico: <strong className="text-slate-700 dark:text-slate-300">{eqOrders.length} OSs</strong></span>
                <span className="text-blue-600 dark:text-blue-400 group-hover:underline">Ver manutenções →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Equipment Modal with Full OS History */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Patrimônio SDU Leste</span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-mono">
                  {selectedEquipment.assetNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-slate-400 block">Tipo:</span>
                <span className="font-semibold capitalize">{selectedEquipment.type}</span>
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
                <span className="text-slate-400 block">Ano de Aquisição:</span>
                <span>{selectedEquipment.purchaseYear || '2021'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status Atual:</span>
                <span className="font-bold text-emerald-600 capitalize">{selectedEquipment.status}</span>
              </div>
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
                        <span className="text-blue-600 hover:underline font-semibold">Abrir OS</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* New Equipment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cadastrar Novo Equipamento</h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEquipment} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Tombamento / Patrimônio PMT *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PMT-SDUL-06500"
                  value={newAsset}
                  onChange={(e) => setNewAsset(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Tipo</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as Equipment['type'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="desktop">Desktop</option>
                    <option value="notebook">Notebook</option>
                    <option value="impressora">Impressora</option>
                    <option value="nobreak">Nobreak</option>
                    <option value="switch">Switch</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Marca</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Modelo</label>
                <input
                  type="text"
                  placeholder="Ex: ThinkCentre M70q"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Setor Alocado</label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {sectors.map((sec) => (
                    <option key={sec.id} value={`${sec.name} (${sec.abbreviation})`}>
                      {sec.name} ({sec.abbreviation})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 border rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
