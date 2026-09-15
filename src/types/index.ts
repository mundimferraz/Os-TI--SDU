export type OSStatus = 
  | 'aberta' 
  | 'triagem' 
  | 'atribuida' 
  | 'em_andamento' 
  | 'aguardando_peca' 
  | 'resolvida' 
  | 'entregue' 
  | 'fechada' 
  | 'cancelada';

export type OSPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export type Category = 
  | 'hardware' 
  | 'software' 
  | 'rede' 
  | 'impressora' 
  | 'telefonia' 
  | 'apoio' 
  | 'instalacao';

export type UserRole = 'solicitante' | 'tecnico' | 'admin' | 'gestor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector: string;
  registration: string;
  phone?: string;
  avatarUrl?: string;
}

export interface Equipment {
  id: string;
  type: 'desktop' | 'notebook' | 'impressora' | 'nobreak' | 'monitor' | 'switch' | 'roteador' | 'outro';
  brand: string;
  model: string;
  assetNumber: string; // Número de Tombamento / Patrimônio da Prefeitura
  serialNumber: string;
  sector: string;
  locationDetails?: string;
  status: 'operacional' | 'em_manutencao' | 'desativado' | 'reserva';
  purchaseYear?: number;
  lastMaintenanceDate?: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  authorName: string;
  authorRole: string;
  action: string;
  notes?: string;
  oldStatus?: OSStatus;
  newStatus?: OSStatus;
}

export interface MaterialUsed {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  partNumber?: string;
  dateAdded: string;
}

export interface Checklist {
  startupTest: boolean;
  networkTest: boolean;
  peripheralTest: boolean;
  internalCleaning: boolean;
  stressPrintTest: boolean;
  notes?: string;
}

export interface DeliveryReceipt {
  receivedBy: string;
  receiverRegistration: string;
  receiverCpf?: string;
  receiverSector: string;
  date: string;
  signatureDataUrl?: string;
  confirmationNotes?: string;
}

export interface Rating {
  stars: number;
  comment?: string;
  date: string;
  ratedBy: string;
}

export interface ServiceOrder {
  id: string; // ex: "OS-2026-0001"
  createdAt: string;
  slaDeadline: string;
  slaHours: number;
  resolvedAt?: string;
  closedAt?: string;
  status: OSStatus;
  priority: OSPriority;
  category: Category;
  requester: {
    name: string;
    email: string;
    phone: string;
    sector: string;
    registration: string;
  };
  technician?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  equipment: {
    type: string;
    brand: string;
    model: string;
    assetNumber: string; // Tombamento PMT
    serialNumber: string;
    accessories: string[];
  };
  issueDescription: string;
  technicalDiagnosis?: string;
  actionsTaken: string[];
  materialsUsed: MaterialUsed[];
  checklist: Checklist;
  delivery?: DeliveryReceipt;
  rating?: Rating;
  timeline: TimelineEvent[];
  locationDetails?: string;
  isExternalAssistance?: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  orderId?: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

export interface SectorConfig {
  id: string;
  name: string;
  abbreviation: string;
  headName: string;
  phone: string;
}

export interface SLARule {
  priority: OSPriority;
  label: string;
  hours: number;
  color: string;
}
