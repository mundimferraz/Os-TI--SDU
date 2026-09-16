import React, { useState } from 'react';
import { 
  PlusCircle, 
  ArrowLeft, 
  CheckCircle2, 
  Printer, 
  HardDrive, 
  User, 
  FileText, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { db } from '../../db/store';
import { User as UserType, Category, OSPriority, ServiceOrder } from '../../types';
import { CATEGORY_MAP, PRIORITY_MAP } from '../../utils/formatters';

interface NewOrderFormProps {
  currentUser: UserType;
  onNavigate: (view: string, orderId?: string) => void;
  onPrintOrder: (order: ServiceOrder) => void;
  onPrintBlankOrder?: () => void;
}

export const NewOrderForm: React.FC<NewOrderFormProps> = ({
  currentUser,
  onNavigate,
  onPrintOrder,
  onPrintBlankOrder,
}) => {
  const sectors = db.getSectors();
  const existingEquipments = db.getEquipments();
  const equipmentTypes = db.getEquipmentTypes();

  // Form State
  const [requesterName, setRequesterName] = useState(currentUser.role === 'solicitante' ? currentUser.name : '');
  const [requesterEmail, setRequesterEmail] = useState(currentUser.role === 'solicitante' ? currentUser.email : '');
  const [requesterPhone, setRequesterPhone] = useState(currentUser.phone || '(86) 3215-7500');
  const [requesterSector, setRequesterSector] = useState(currentUser.sector || sectors[0]?.name || '');
  const [requesterRegistration, setRequesterRegistration] = useState(currentUser.registration || '');

  const [category, setCategory] = useState<Category>('hardware');
  const [priority, setPriority] = useState<OSPriority>('media');

  const [equipmentType, setEquipmentType] = useState('desktop');
  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('OptiPlex 3080 SFF');
  const [assetNumber, setAssetNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [locationDetails, setLocationDetails] = useState('');
  const [accessories, setAccessories] = useState<string[]>(['Cabo de Força']);
  const [newAccessory, setNewAccessory] = useState('');

  const [issueDescription, setIssueDescription] = useState('');
  const [createdOrder, setCreatedOrder] = useState<ServiceOrder | null>(null);

  // Quick lookup from existing equipment
  const handleSelectExistingEquipment = (eqId: string) => {
    const found = existingEquipments.find((e) => e.id === eqId);
    if (found) {
      setEquipmentType(found.type);
      setBrand(found.brand);
      setModel(found.model);
      setAssetNumber(found.assetNumber);
      setSerialNumber(found.serialNumber);
      if (found.sector) setRequesterSector(found.sector);
      if (found.locationDetails) setLocationDetails(found.locationDetails);
    }
  };

  const toggleAccessory = (acc: string) => {
    if (accessories.includes(acc)) {
      setAccessories(accessories.filter((a) => a !== acc));
    } else {
      setAccessories([...accessories, acc]);
    }
  };

  const handleAddCustomAccessory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccessory.trim() && !accessories.includes(newAccessory.trim())) {
      setAccessories([...accessories, newAccessory.trim()]);
      setNewAccessory('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requesterName.trim() || !issueDescription.trim()) {
      alert('Por favor, preencha o nome do solicitante e a descrição do problema.');
      return;
    }

    const order = db.createOrder({
      category,
      priority,
      issueDescription: issueDescription.trim(),
      locationDetails: locationDetails.trim(),
      requester: {
        name: requesterName.trim(),
        email: requesterEmail.trim() || 'contato@teresina.pi.gov.br',
        phone: requesterPhone.trim() || '(86) 3215-7500',
        sector: requesterSector,
        registration: requesterRegistration.trim() || 'Servidor PMT',
      },
      equipment: {
        type: equipmentType,
        brand: brand.trim() || 'Genérico',
        model: model.trim() || 'Padrão',
        assetNumber: assetNumber.trim().toUpperCase() || 'SEM TOMBO',
        serialNumber: serialNumber.trim() || 'N/A',
        accessories,
      },
    });

    setCreatedOrder(order);
  };

  // SUCCESS VIEW
  if (createdOrder) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400">
            Ordem de Serviço Cadastrada
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
            {createdOrder.id}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
            A solicitação foi registrada no banco de dados do Setor de TI / CPD da SDU Leste com sucesso.
          </p>

          <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Solicitante:</span>
              <span className="font-bold text-slate-900 dark:text-white">{createdOrder.requester.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Setor:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{createdOrder.requester.sector}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Equipamento / Tombamento:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {createdOrder.equipment.brand} {createdOrder.equipment.model} ({createdOrder.equipment.assetNumber})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Prazo SLA:</span>
              <span className="font-bold text-amber-600">{createdOrder.slaHours} horas</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onPrintOrder(createdOrder)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Espelho / Etiqueta</span>
            </button>

            <button
              onClick={() => onNavigate('order-detail', createdOrder.id)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Acompanhar Atendimento</span>
            </button>

            <button
              onClick={() => {
                setCreatedOrder(null);
                setIssueDescription('');
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Abrir Outra OS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('orders')}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Voltar para a lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Abertura de Ordem de Serviço
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Formulário Oficial de Atendimento Técnico — CPD / SDU Leste
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onPrintBlankOrder && (
            <button
              type="button"
              onClick={onPrintBlankOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              title="Imprimir formulário oficial em branco em PDF para preenchimento em visita de campo"
            >
              <Printer className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Imprimir OS em Branco (PDF)</span>
            </button>
          )}

          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800">
            Próxima: {db.getNextOrderId()}
          </span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Dados do Solicitante */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              1. Identificação do Solicitante & Localização
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo do Servidor *
              </label>
              <input
                type="text"
                required
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                placeholder="Ex: Dra. Maria Alice Silva"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gerência / Setor Solicitante *
              </label>
              <select
                value={requesterSector}
                onChange={(e) => setRequesterSector(e.target.value)}
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
                Matrícula ou Cargo
              </label>
              <input
                type="text"
                value={requesterRegistration}
                onChange={(e) => setRequesterRegistration(e.target.value)}
                placeholder="Ex: 84910-2"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Telefone / Ramal Interno
              </label>
              <input
                type="text"
                value={requesterPhone}
                onChange={(e) => setRequesterPhone(e.target.value)}
                placeholder="Ex: (86) 3215-7530 ou Ramal 7530"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-mail Institucional
              </label>
              <input
                type="email"
                value={requesterEmail}
                onChange={(e) => setRequesterEmail(e.target.value)}
                placeholder="nome@teresina.pi.gov.br"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Local Exato / Sala
              </label>
              <input
                type="text"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="Ex: Sala 02 - Mesa dos Engenheiros"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Dados do Equipamento */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                2. Equipamento & Tombamento (Patrimônio)
              </h3>
            </div>

            {/* Existing Equipment Picker shortcut */}
            {existingEquipments.length > 0 && (
              <select
                onChange={(e) => handleSelectExistingEquipment(e.target.value)}
                defaultValue=""
                className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <option value="" disabled>Ou selecione do Parque Tecnológico...</option>
                {existingEquipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.assetNumber} - {eq.brand} {eq.model} ({eq.sector.slice(0, 15)}...)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo do Equipamento *
              </label>
              <select
                value={equipmentType}
                onChange={(e) => setEquipmentType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {equipmentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tombamento / Patrimônio PMT *
              </label>
              <input
                type="text"
                required
                value={assetNumber}
                onChange={(e) => setAssetNumber(e.target.value)}
                placeholder="Ex: PMT-SDUL-04821"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Número na placa metálica ou etiqueta de tombo
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Dell, HP, Lenovo, Brother..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Modelo / Série
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Ex: OptiPlex 3080 / S/N BR124"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Acessórios entregues */}
          <div className="pt-2">
            <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-2">
              Acessórios que acompanham o equipamento ao CPD:
            </label>
            <div className="flex flex-wrap gap-2 text-xs">
              {['Cabo de Força', 'Fonte de Alimentação', 'Teclado', 'Mouse', 'Cabo USB/HDMI', 'Adaptador de Vídeo'].map((acc) => {
                const isSelected = accessories.includes(acc);
                return (
                  <button
                    key={acc}
                    type="button"
                    onClick={() => toggleAccessory(acc)}
                    className={`px-3 py-1.5 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {acc}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 3: Categoria, Prioridade & Descrição do Problema */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <FileText className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              3. Detalhamento do Chamado & Defeito Apresentado
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Atendimento / Categoria *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(CATEGORY_MAP).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prioridade do Atendimento *
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as OSPriority)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="urgente">Urgente — Resolução em até 4 horas (Setor Inoperante)</option>
                <option value="alta">Alta — Resolução em até 8 horas (Atendimento ao Cidadão)</option>
                <option value="media">Média — Resolução em até 24 horas (Padrão SDU)</option>
                <option value="baixa">Baixa — Resolução em até 48 horas (Manutenção preventiva)</option>
              </select>
            </div>
          </div>

          {/* SLA Info Callout */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
            <Clock className="w-4 h-4 shrink-0 text-blue-600" />
            <span>
              Prazo de Atendimento Estimado: <strong className="font-bold">{PRIORITY_MAP[priority].hours} horas</strong> de acordo com a política de SLA da Prefeitura de Teresina.
            </span>
          </div>

          {/* Issue description */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 text-xs mb-1">
              Descrição Detalhada do Problema / Relato do Usuário *
            </label>
            <textarea
              required
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              placeholder="Descreva exatamente o que está acontecendo: mensagens de erro na tela, ruídos, lentidão, peças danificadas, etc."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Ordem de Serviço</span>
          </button>
        </div>

      </form>
    </div>
  );
};
