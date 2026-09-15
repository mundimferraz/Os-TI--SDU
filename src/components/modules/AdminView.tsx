import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  Clock, 
  Building2, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  ShieldCheck,
  Plus
} from 'lucide-react';
import { db } from '../../db/store';
import { User, SectorConfig } from '../../types';

export interface AdminViewProps {
  onNavigate?: (view: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate }) => {
  const [activeSubTab, setActiveSubTab] = useState<'technicians' | 'sla' | 'sectors' | 'backup'>('backup');
  const [backupNotice, setBackupNotice] = useState('');

  const users = db.getUsers();
  const technicians = db.getTechnicians();
  const sectors = db.getSectors();

  const handleExportBackup = () => {
    const json = db.exportBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_SDU_Leste_TI_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupNotice('Backup exportado com sucesso!');
    setTimeout(() => setBackupNotice(''), 4000);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const success = db.importBackupJSON(content);
      if (success) {
        setBackupNotice('Backup importado com sucesso! Dados sincronizados.');
      } else {
        alert('Falha ao importar o arquivo. Verifique se o formato JSON é válido.');
      }
      setTimeout(() => setBackupNotice(''), 4000);
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar a base de dados para o padrão de demonstração da SDU Leste?')) {
      db.resetToDefaults();
      setBackupNotice('Dados restaurados para o padrão com sucesso!');
      setTimeout(() => setBackupNotice(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Configurações do Setor de TI / CPD
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Gerenciamento institucional, parâmetros de SLA, equipe técnica e manutenção de dados
        </p>
      </div>

      {backupNotice && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{backupNotice}</span>
        </div>
      )}

      {/* Sub tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 text-xs">
        {[
          { id: 'backup', label: 'Backup & Banco de Dados', icon: Database },
          { id: 'technicians', label: 'Equipe Técnica & Usuários', icon: Users },
          { id: 'sla', label: 'Prazos de SLA', icon: Clock },
          { id: 'sectors', label: 'Gerências da SDU Leste', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 py-2.5 px-4 font-semibold border-b-2 transition-colors ${
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

      {/* TAB: BACKUP */}
      {activeSubTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Exportação & Importação de Dados</span>
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Todos os chamados, inventário de equipamentos, laudos e configurações do CPD ficam persistidos localmente. Você pode baixar um arquivo de backup ou restaurar em outro navegador.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleExportBackup}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exportar Backup (JSON)</span>
              </button>

              <label className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Restaurar de Arquivo</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-500" />
              <span>Restaurar Base de Demonstração</span>
            </h3>
            <p className="text-slate-500 leading-relaxed">
              Recarrega a base oficial de dados de exemplo da SDU Leste (chamados reais pré-configurados, equipamentos da gerência de obras, protocolo, etc.).
            </p>

            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restaurar Dados Padrão da SDU Leste</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB: TECHNICIANS */}
      {activeSubTab === 'technicians' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Equipe Técnica e Suporte (CPD)
              </h3>
              <p className="text-slate-500">Técnicos habilitados para atendimento e laudo de ordens de serviço</p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('equipe')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors self-start sm:self-auto shadow-xs"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Gestão Completa da Equipe (CRUD)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {users.map((u) => (
              <div key={u.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                  <p className="text-[11px] text-slate-500">{u.sector}</p>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.2 rounded-full font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    {u.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SLA */}
      {activeSubTab === 'sla' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Políticas de SLA (Service Level Agreement) — SDU Leste
          </h3>
          <p className="text-slate-500">Prazos de atendimento pactuados de acordo com a criticidade do chamado</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {[
              { level: 'Urgente', hours: '4 horas', desc: 'Setor completamente inoperante ou fiscalização parada', color: 'border-rose-500 text-rose-600' },
              { level: 'Alta', hours: '8 horas', desc: 'Atendimento direto ao cidadão (Protocolo, Habitação)', color: 'border-amber-500 text-amber-600' },
              { level: 'Média', hours: '24 horas', desc: 'Manutenções padrão de computadores e impressoras', color: 'border-blue-500 text-blue-600' },
              { level: 'Baixa', hours: '48 horas', desc: 'Solicitações preventivas, treinamentos ou remanejamentos', color: 'border-emerald-500 text-emerald-600' },
            ].map((sla) => (
              <div key={sla.level} className={`p-4 rounded-2xl border-l-4 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 ${sla.color}`}>
                <span className="font-bold text-xs uppercase tracking-wider block">{sla.level}</span>
                <span className="text-xl font-black text-slate-900 dark:text-white block mt-1">{sla.hours}</span>
                <p className="text-slate-500 text-[11px] mt-2">{sla.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: SECTORS */}
      {activeSubTab === 'sectors' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Gerências e Setores Atendidos (SDU Leste)
              </h3>
              <p className="text-slate-500">Unidades organizacionais da prefeitura vinculadas ao suporte do CPD</p>
            </div>
            {onNavigate && (
              <button
                onClick={() => onNavigate('gerencias')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors self-start sm:self-auto shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Gestão Completa de Gerências (CRUD)</span>
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sectors.map((sec) => (
              <div key={sec.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{sec.abbreviation}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{sec.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Responsável: {sec.headName} • Tel: {sec.phone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
