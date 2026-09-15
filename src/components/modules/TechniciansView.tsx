import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  BadgeCheck, 
  Star, 
  ClipboardList, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Shield, 
  Wrench, 
  ExternalLink,
  ChevronRight,
  Filter,
  UserPlus,
  Briefcase
} from 'lucide-react';
import { db } from '../../db/store';
import { User, ServiceOrder, UserRole } from '../../types';

interface TechniciansViewProps {
  onNavigate: (view: string, orderId?: string) => void;
}

export const TechniciansView: React.FC<TechniciansViewProps> = ({ onNavigate }) => {
  const allUsers = db.getUsers();
  const allOrders = db.getOrders();
  const sectors = db.getSectors();
  const currentUser = db.getCurrentUser();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'tecnico' | 'admin' | 'solicitante'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Notices
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    registration: '',
    email: '',
    phone: '',
    role: 'tecnico' as UserRole,
    sector: 'Setor de TI / CPD',
    specialty: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'afastado',
    avatarUrl: '',
  });

  // Calculate statistics per user
  const userStats = useMemo(() => {
    return allUsers.map((user) => {
      const assignedOrders = allOrders.filter((o) => o.technician?.id === user.id);
      const activeOrders = assignedOrders.filter(
        (o) => !['resolvida', 'entregue', 'fechada', 'cancelada'].includes(o.status)
      );
      const resolvedOrders = assignedOrders.filter((o) =>
        ['resolvida', 'entregue', 'fechada'].includes(o.status)
      );

      // Average rating
      const rated = assignedOrders.filter((o) => o.rating && o.rating.stars > 0);
      const avgRating =
        rated.length > 0
          ? (rated.reduce((acc, curr) => acc + (curr.rating?.stars || 0), 0) / rated.length).toFixed(1)
          : null;

      return {
        user,
        totalAssigned: assignedOrders.length,
        activeOrders: activeOrders.length,
        resolvedOrders: resolvedOrders.length,
        avgRating,
        ratedCount: rated.length,
      };
    });
  }, [allUsers, allOrders]);

  // Filtered List
  const filteredUsers = useMemo(() => {
    return userStats.filter(({ user }) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.registration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.specialty && user.specialty.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phone && user.phone.includes(searchTerm));

      if (!matchesSearch) return false;

      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }

      if (statusFilter !== 'all') {
        const userStatus = user.status || 'ativo';
        if (userStatus !== statusFilter) return false;
      }

      return true;
    });
  }, [userStats, searchTerm, roleFilter, statusFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      registration: '',
      email: '',
      phone: '',
      role: 'tecnico',
      sector: 'Setor de TI / CPD',
      specialty: 'Suporte a Hardware & Redes',
      status: 'ativo',
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 90000000)}?w=150&auto=format&fit=crop&q=80`,
    });
    setErrorMessage('');
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      registration: user.registration,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      sector: user.sector,
      specialty: user.specialty || '',
      status: user.status || 'ativo',
      avatarUrl: user.avatarUrl || '',
    });
    setErrorMessage('');
    setIsFormOpen(true);
  };

  // Submit Form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.registration.trim() || !formData.email.trim()) {
      setErrorMessage('Por favor, preencha nome completo, matrícula e e-mail institucional.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      registration: formData.registration.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim() || '(86) 3215-7510',
      role: formData.role,
      sector: formData.sector,
      specialty: formData.specialty.trim() || 'Suporte Técnico Geral',
      status: formData.status,
      avatarUrl: formData.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=2563eb&color=fff`,
    };

    if (editingUser) {
      db.updateUser(editingUser.id, payload);
      setSuccessNotice(`Dados de ${payload.name} atualizados com sucesso!`);
    } else {
      // Check duplicate registration
      const exists = allUsers.some(
        (u) => u.registration.toLowerCase() === payload.registration.toLowerCase()
      );
      if (exists) {
        setErrorMessage(`Já existe um colaborador cadastrado com a matrícula ${payload.registration}.`);
        return;
      }
      db.createUser(payload);
      setSuccessNotice(`Colaborador ${payload.name} cadastrado com sucesso!`);
    }

    setIsFormOpen(false);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    const res = db.deleteUser(deletingUser.id);
    if (!res.success) {
      setErrorMessage(res.message || 'Erro ao excluir usuário.');
      return;
    }

    setSuccessNotice(`Usuário ${deletingUser.name} removido da equipe com sucesso!`);
    setDeletingUser(null);
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Orders for viewing user modal
  const viewingOrders = useMemo(() => {
    if (!viewingUser) return [];
    return allOrders.filter((o) => o.technician?.id === viewingUser.id);
  }, [viewingUser, allOrders]);

  return (
    <div className="space-y-6">
      
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Recursos Humanos & TI
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500">CPD SDU Leste</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mt-0.5">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Gestão da Equipe Técnica</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Controle de técnicos de suporte de bancada, administradores de rede, lotação e escala de atendimento
          </p>
        </div>

        <button
          id="btn-new-technician"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Novo Técnico</span>
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
            Corpo Técnico do CPD
          </span>
          <span className="text-2xl font-black text-slate-900 dark:text-white block mt-1">
            {allUsers.filter((u) => u.role === 'tecnico' || u.role === 'admin').length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Técnicos & Administradores
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
            Técnicos Ativos
          </span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block mt-1">
            {allUsers.filter((u) => (u.role === 'tecnico' || u.role === 'admin') && (u.status || 'ativo') === 'ativo').length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Disponíveis para chamados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
            OS em Atendimento
          </span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 block mt-1">
            {allOrders.filter((o) => ['atribuida', 'em_andamento', 'aguardando_peca'].includes(o.status)).length}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Distribuídas na bancada
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
            Satisfação Média
          </span>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block mt-1 flex items-center gap-1">
            <span>4.9</span>
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Avaliações dos servidores
          </span>
        </div>
      </div>

      {/* Action Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por técnico, matrícula (ex: 92104-5), e-mail ou especialidade..."
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

        {/* Filter by Role and Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 text-xs">
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Todos os Cargos</option>
            <option value="tecnico">Apenas Técnicos</option>
            <option value="admin">Gestores / Admin</option>
            <option value="solicitante">Solicitantes</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>

        </div>

      </div>

      {/* Grid of Team Members */}
      {filteredUsers.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            Nenhum membro da equipe encontrado
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Verifique os termos da busca ou limpe os filtros de cargo e status.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(({ user, totalAssigned, activeOrders, resolvedOrders, avgRating }) => {
            const isCurrentUser = currentUser.id === user.id;
            const status = user.status || 'ativo';

            return (
              <div
                key={user.id}
                id={`tech-card-${user.id}`}
                className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-xs hover:border-blue-400/60 dark:hover:border-blue-700/60 transition-all flex flex-col justify-between overflow-hidden group ${
                  isCurrentUser
                    ? 'border-blue-500/60 ring-2 ring-blue-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="p-5 space-y-4">
                  
                  {/* Top row: Avatar, Info & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff`}
                          alt={user.name}
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-100 dark:border-slate-800 shadow-xs"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            status === 'ativo'
                              ? 'bg-emerald-500'
                              : status === 'afastado'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                          title={`Status: ${status}`}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                            {user.name}
                          </h3>
                          {isCurrentUser && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-blue-600 text-white">
                              Você
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                          <span>Mat: {user.registration}</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {user.role === 'admin' ? 'Gestor CPD' : user.role === 'tecnico' ? 'Técnico TI' : 'Solicitante'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                        status === 'ativo'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : status === 'afastado'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Specialty / Cargo */}
                  {user.specialty && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs">
                      <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {user.specialty}
                      </span>
                    </div>
                  )}

                  {/* Contact Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-blue-600 dark:text-blue-400 truncate text-[11px]">
                        {user.email}
                      </span>
                    </div>

                    {user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-[11px]">{user.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate text-slate-500 text-[11px]">{user.sector}</span>
                    </div>
                  </div>

                  {/* Workload / Performance Indicators */}
                  {(user.role === 'tecnico' || user.role === 'admin') && (
                    <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs border-t border-slate-100 dark:border-slate-800">
                      <div className="p-2 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/40 dark:border-amber-900/30">
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold block">
                          Ativas
                        </span>
                        <span className="font-black text-amber-700 dark:text-amber-400 text-sm">
                          {activeOrders}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-900/30">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold block">
                          Concluídas
                        </span>
                        <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                          {resolvedOrders}
                        </span>
                      </div>

                      <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/40 dark:border-blue-900/30">
                        <span className="text-[10px] text-blue-700 dark:text-blue-400 uppercase font-semibold block">
                          Nota
                        </span>
                        <span className="font-black text-blue-700 dark:text-blue-400 text-sm flex items-center justify-center gap-0.5">
                          {avgRating || '5.0'}
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setViewingUser(user)}
                    className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <span>Ver Atendimentos</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Editar Colaborador"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {!isCurrentUser && (
                      <button
                        onClick={() => {
                          setDeletingUser(user);
                          setErrorMessage('');
                        }}
                        className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Remover Colaborador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL: CREATE / EDIT COLABORADOR ================= */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fadeIn">
            
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {editingUser ? 'Editar Colaborador / Técnico' : 'Novo Membro da Equipe'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingUser ? `Atualizando informações de ${editingUser.name}` : 'Preencha os dados funcionais do servidor'}
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
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Eduardo Santos"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Matrícula PMT *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 92104-5"
                    value={formData.registration}
                    onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    E-mail Institucional *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: tecnico@teresina.pi.gov.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Telefone / Ramal
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: (86) 3215-7512"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Perfil de Acesso *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="tecnico">Técnico de TI</option>
                    <option value="admin">Gestor / Administrador</option>
                    <option value="solicitante">Solicitante Comum</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Status Funcional *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="ativo">Ativo (Em Plantão)</option>
                    <option value="afastado">Afastado / Férias</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Setor de Lotação
                  </label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none truncate"
                  >
                    {sectors.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.abbreviation} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Especialidade / Foco Técnico
                </label>
                <input
                  type="text"
                  placeholder="Ex: Manutenção de Hardware, Redes e Telecom, Impressoras Laser"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  URL da Foto / Avatar (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-[11px]"
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
                  {editingUser ? 'Salvar Alterações' : 'Cadastrar Técnico'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= MODAL: HISTÓRICO DE ATENDIMENTOS ================= */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-fadeIn">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <img
                  src={viewingUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(viewingUser.name)}&background=2563eb&color=fff`}
                  alt={viewingUser.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {viewingUser.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Matrícula: {viewingUser.registration} • {viewingUser.specialty || 'Técnico de Suporte'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-blue-600" />
                  <span>Histórico de Chamados Atribuídos ({viewingOrders.length})</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  {viewingOrders.filter((o) => ['resolvida', 'entregue', 'fechada'].includes(o.status)).length} resolvidos
                </span>
              </div>

              {viewingOrders.length === 0 ? (
                <p className="text-slate-400 italic p-6 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  Nenhum chamado atribuído a este técnico até o momento.
                </p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {viewingOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => {
                        setViewingUser(null);
                        onNavigate('order-detail', order.id);
                      }}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{order.id}</span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {order.requester.name} ({order.requester.sector})
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] truncate max-w-md">
                          {order.issueDescription}
                        </p>
                        {order.rating && (
                          <div className="flex items-center gap-1 text-amber-500 text-[11px]">
                            <span>Avaliação:</span>
                            <div className="flex">
                              {Array.from({ length: order.rating.stars }).map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {order.status.replace('_', ' ')}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Prioridade: {order.priority.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  const u = viewingUser;
                  setViewingUser(null);
                  handleOpenEdit(u);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
              >
                Editar Membro
              </button>
              <button
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE ================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-fadeIn text-xs">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Remover {deletingUser.name}?
              </h3>
              <p className="text-slate-500">
                Você está prestes a desativar ou remover o colaborador da equipe do CPD.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-xs"
              >
                Sim, Remover Membro
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
