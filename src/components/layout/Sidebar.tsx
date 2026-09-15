import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  PlusCircle, 
  HardDrive, 
  BarChart3, 
  SearchCode, 
  Settings, 
  Building2, 
  Clock, 
  Phone,
  CheckCircle2,
  X
} from 'lucide-react';
import { User } from '../../types';
import { db } from '../../db/store';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  currentUser,
  isOpen,
  onClose,
}) => {
  const orders = db.getOrders();
  const openCount = orders.filter((o) => ['aberta', 'triagem', 'atribuida', 'em_andamento'].includes(o.status)).length;
  const isTechOrAdmin = currentUser.role === 'tecnico' || currentUser.role === 'admin';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Visão Geral',
      icon: LayoutDashboard,
      badge: null,
      visible: true,
    },
    {
      id: 'orders',
      label: 'Ordens de Serviço',
      icon: ClipboardList,
      badge: openCount > 0 ? openCount : null,
      visible: true,
    },
    {
      id: 'new-order',
      label: 'Abrir Nova OS',
      icon: PlusCircle,
      badge: null,
      visible: true,
      highlight: true,
    },
    {
      id: 'equipment',
      label: 'Parque Tecnológico',
      icon: HardDrive,
      badge: null,
      visible: isTechOrAdmin,
    },
    {
      id: 'reports',
      label: 'Relatórios & SLA',
      icon: BarChart3,
      badge: null,
      visible: isTechOrAdmin,
    },
    {
      id: 'public-consult',
      label: 'Consulta Pública',
      icon: SearchCode,
      badge: null,
      visible: true,
    },
    {
      id: 'admin',
      label: 'Configurações CPD',
      icon: Settings,
      badge: null,
      visible: currentUser.role === 'admin',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:static top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-200 z-50 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                SDU
              </div>
              <span className="font-bold text-white text-sm">CPD Leste</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Institutional Badge in Sidebar */}
          <div className="hidden lg:block p-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-slate-800 text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white tracking-wide uppercase">
                  SDU Leste
                </p>
                <p className="text-[11px] text-slate-400">
                  Superintendência de Desenv. Urbano
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Módulos Principais
            </p>

            {menuItems
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-${item.id}`}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xs font-semibold'
                        : item.highlight
                        ? 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 border border-blue-800/40'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== null && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Support & Institutional Contact Footer */}
        <div className="p-3.5 m-3 rounded-xl bg-slate-800/70 border border-slate-700/60 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 text-blue-400 font-semibold mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plantão CPD Leste</span>
          </div>
          
          <div className="space-y-1 text-slate-400 mt-1.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Seg à Sex: 07:30 às 13:30</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
              <span>Ramal: 3215-7510 / 7512</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
            Teresina - Piauí
          </div>
        </div>
      </aside>
    </>
  );
};
