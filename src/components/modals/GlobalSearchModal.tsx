import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ClipboardList, HardDrive, User, ArrowRight } from 'lucide-react';
import { db } from '../../db/store';
import { STATUS_MAP } from '../../utils/formatters';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOrder: (orderId: string) => void;
  onSelectEquipment: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectOrder,
  onSelectEquipment,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Handled by parent or toggled
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const orders = db.getOrders();
  const equipments = db.getEquipments();
  const users = db.getUsers();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { orders: orders.slice(0, 4), equipments: [], users: [] };

    const filteredOrders = orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.requester.name.toLowerCase().includes(q) ||
        o.requester.sector.toLowerCase().includes(q) ||
        o.equipment.assetNumber.toLowerCase().includes(q) ||
        o.issueDescription.toLowerCase().includes(q)
    );

    const filteredEquipments = equipments.filter(
      (e) =>
        e.assetNumber.toLowerCase().includes(q) ||
        e.brand.toLowerCase().includes(q) ||
        e.model.toLowerCase().includes(q) ||
        e.sector.toLowerCase().includes(q) ||
        e.serialNumber.toLowerCase().includes(q)
    );

    const filteredUsers = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.sector.toLowerCase().includes(q) ||
        u.registration.toLowerCase().includes(q)
    );

    return {
      orders: filteredOrders.slice(0, 6),
      equipments: filteredEquipments.slice(0, 4),
      users: filteredUsers.slice(0, 3),
    };
  }, [query, orders, equipments, users]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar número de OS (ex: OS-2026-0001), tombamento, solicitante..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-4 space-y-4">
          
          {/* Orders Section */}
          {results.orders.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" />
                Ordens de Serviço ({results.orders.length})
              </p>
              <div className="space-y-1.5">
                {results.orders.map((order) => {
                  const statusInfo = STATUS_MAP[order.status];
                  return (
                    <div
                      key={order.id}
                      onClick={() => {
                        onSelectOrder(order.id);
                        onClose();
                      }}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800/80 cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                            {order.id}
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full border ${statusInfo.badgeClass}`}>
                            {statusInfo.label}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate">
                            {order.requester.sector}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 truncate">
                          {order.equipment.brand} {order.equipment.model} — {order.issueDescription}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Equipments Section */}
          {results.equipments.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5" />
                Equipamentos / Tombamento ({results.equipments.length})
              </p>
              <div className="space-y-1.5">
                {results.equipments.map((eq) => (
                  <div
                    key={eq.id}
                    onClick={() => {
                      onSelectEquipment();
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                          {eq.assetNumber}
                        </span>
                        <span className="text-xs text-slate-900 dark:text-white font-medium">
                          {eq.brand} {eq.model}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {eq.sector} • Série: {eq.serialNumber}
                      </p>
                    </div>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                      Ver inventário
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Section */}
          {results.users.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Servidores & Técnicos ({results.users.length})
              </p>
              <div className="space-y-1.5">
                {results.users.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                  >
                    <img
                      src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{u.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.sector} • Matrícula {u.registration}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.orders.length === 0 && results.equipments.length === 0 && results.users.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhum resultado encontrado para &quot;{query}&quot;. Verifique o número de OS ou o tombamento.
            </div>
          )}

        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Dica: Digite o número do patrimônio PMT ou o nome do servidor</span>
          <span>Setor de TI / CPD — SDU Leste</span>
        </div>
      </div>
    </div>
  );
};
