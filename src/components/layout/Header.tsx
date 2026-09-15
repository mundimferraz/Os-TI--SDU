import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  UserCheck, 
  PlusCircle, 
  Menu, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { db } from '../../db/store';
import { User, AppNotification } from '../../types';

interface HeaderProps {
  currentUser: User;
  onOpenSearch: () => void;
  onNavigate: (view: string, orderId?: string) => void;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenSearch,
  onNavigate,
  onToggleSidebar,
  darkMode,
  onToggleDarkMode,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifications = db.getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const allUsers = db.getUsers();

  const handleSelectUser = (user: User) => {
    db.setCurrentUser(user);
    setShowProfileMenu(false);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    db.markNotificationAsRead(notif.id);
    if (notif.orderId) {
      onNavigate('order-detail', notif.orderId);
      setShowNotifications(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2.5">
        
        {/* Left: Mobile Toggle & Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            id="btn-sidebar-toggle"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title="Menu lateral"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            {/* Brasão / Ícone Governamental */}
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 via-blue-600 to-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              <span className="tracking-tighter">SDU</span>
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 dark:text-white text-base leading-tight tracking-tight">
                  CPD / Setor de TI
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                  SDU Leste
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block leading-tight">
                Prefeitura Municipal de Teresina
              </p>
            </div>
          </div>
        </div>

        {/* Center: Quick Search Trigger */}
        <div className="flex-1 max-w-md mx-4 hidden md:block">
          <button
            id="btn-quick-search"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Buscar OS, patrimônio ou solicitante...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-slate-600 dark:text-slate-300">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Theme, Notifications & User Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile search icon */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            title="Buscar"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* New Order Button */}
          <button
            id="btn-header-new-order"
            onClick={() => onNavigate('new-order')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Nova OS</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            id="btn-toggle-dark-mode"
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title={darkMode ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              id="btn-notifications-toggle"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifications && (
              <div 
                id="popover-notifications"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                  <span className="font-semibold text-xs text-slate-900 dark:text-white">
                    Notificações do Sistema ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => db.markAllNotificationsAsRead()}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Marcar lidas
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Nenhuma notificação</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-lg text-xs cursor-pointer transition-colors border ${
                          n.read
                            ? 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800'
                            : 'bg-blue-50 dark:bg-blue-950/40 text-slate-900 dark:text-slate-100 border-blue-200 dark:border-blue-900/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                          {n.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                          {n.type === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
                          {n.type === 'alert' && <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                          <div className="flex-1">
                            <p className="font-semibold">{n.title}</p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Quick Switcher */}
          <div className="relative">
            <button
              id="btn-user-profile-menu"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 pl-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-full border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {currentUser.role === 'admin' ? 'Gestor CPD' : currentUser.role}
                </p>
              </div>
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/40"
              />
            </button>

            {/* Profile Menu & Role Switcher */}
            {showProfileMenu && (
              <div 
                id="popover-profile-switcher"
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold text-xs text-slate-900 dark:text-white leading-snug">
                        {currentUser.name}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {currentUser.sector}
                      </p>
                      <span className="inline-block mt-0.5 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                        Matrícula: {currentUser.registration}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-2">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Troca Rápida de Perfil (Demo)
                  </p>
                  <div className="space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => handleSelectUser(u)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition-colors ${
                          u.id === currentUser.id
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="truncate">
                          <p className="truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 capitalize">
                            {u.role === 'admin' ? 'Gestor CPD (Admin)' : u.role === 'tecnico' ? 'Técnico de TI' : 'Solicitante'}
                          </p>
                        </div>
                        {u.id === currentUser.id && <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
