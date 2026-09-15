import { 
  ServiceOrder, 
  Equipment, 
  User, 
  SectorConfig, 
  AppNotification, 
  OSStatus, 
  TimelineEvent, 
  Checklist, 
  DeliveryReceipt, 
  Rating, 
  MaterialUsed, 
  OSPriority, 
  Category 
} from '../types';
import { 
  INITIAL_ORDERS, 
  INITIAL_EQUIPMENTS, 
  INITIAL_USERS, 
  INITIAL_SECTORS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';

const STORAGE_KEYS = {
  ORDERS: 'os_ti_sdu_orders_v1',
  EQUIPMENT: 'os_ti_sdu_equipment_v1',
  USERS: 'os_ti_sdu_users_v1',
  CURRENT_USER: 'os_ti_sdu_current_user_v1',
  SECTORS: 'os_ti_sdu_sectors_v1',
  NOTIFICATIONS: 'os_ti_sdu_notifications_v1',
};

type Listener = () => void;

class DatabaseStore {
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.init();
  }

  private init() {
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) {
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      // Default to Gestor/Admin Carlos Eduardo Santos for rich preview
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SECTORS)) {
      localStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(INITIAL_SECTORS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Current User
  public getCurrentUser(): User {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!data) return INITIAL_USERS[0];
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS[0];
    }
  }

  public setCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify();
  }

  public getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  }

  public getTechnicians(): User[] {
    return this.getUsers().filter((u) => u.role === 'tecnico' || u.role === 'admin');
  }

  // Orders
  public getOrders(): ServiceOrder[] {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  }

  public getOrderById(id: string): ServiceOrder | undefined {
    return this.getOrders().find((o) => o.id.toLowerCase() === id.toLowerCase().trim());
  }

  public getNextOrderId(): string {
    const orders = this.getOrders();
    const currentYear = new Date().getFullYear();
    const yearPrefix = `OS-${currentYear}-`;
    
    // Find highest numerical suffix for current year
    const suffixes = orders
      .filter((o) => o.id.startsWith(yearPrefix))
      .map((o) => {
        const parts = o.id.split('-');
        return parseInt(parts[2], 10) || 0;
      });

    const nextNum = suffixes.length > 0 ? Math.max(...suffixes) + 1 : orders.length + 1;
    return `OS-${currentYear}-${String(nextNum).padStart(4, '0')}`;
  }

  public createOrder(params: {
    category: Category;
    priority: OSPriority;
    issueDescription: string;
    requester: ServiceOrder['requester'];
    equipment: ServiceOrder['equipment'];
    locationDetails?: string;
  }): ServiceOrder {
    const orders = this.getOrders();
    const id = this.getNextOrderId();
    const now = new Date();
    
    const slaHours = params.priority === 'urgente' ? 4 : params.priority === 'alta' ? 8 : params.priority === 'media' ? 24 : 48;
    const deadline = new Date(now.getTime() + slaHours * 3600 * 1000);

    const currentUser = this.getCurrentUser();

    const newOrder: ServiceOrder = {
      id,
      createdAt: now.toISOString(),
      slaDeadline: deadline.toISOString(),
      slaHours,
      status: 'aberta',
      priority: params.priority,
      category: params.category,
      requester: params.requester,
      equipment: params.equipment,
      issueDescription: params.issueDescription,
      locationDetails: params.locationDetails,
      actionsTaken: [],
      materialsUsed: [],
      checklist: {
        startupTest: false,
        networkTest: false,
        peripheralTest: false,
        internalCleaning: false,
        stressPrintTest: false,
      },
      timeline: [
        {
          id: `t-${Date.now()}`,
          timestamp: now.toISOString(),
          authorName: currentUser.name,
          authorRole: currentUser.role === 'admin' ? 'Gestor' : currentUser.role === 'tecnico' ? 'Técnico' : 'Solicitante',
          action: 'Abertura da Ordem de Serviço',
          notes: 'Registrada com sucesso no sistema de TI da SDU Leste.',
          newStatus: 'aberta',
        },
      ],
    };

    orders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Also auto-register or update equipment if tombamento is provided
    if (params.equipment.assetNumber) {
      this.ensureEquipmentRegistered(params.equipment, params.requester.sector);
    }

    // Trigger notification
    this.addNotification({
      title: 'Nova Ordem Aberta',
      message: `${id} registrada por ${params.requester.name} (${params.requester.sector}).`,
      orderId: id,
      type: 'info',
    });

    this.notify();
    return newOrder;
  }

  private ensureEquipmentRegistered(eq: ServiceOrder['equipment'], sector: string) {
    const equipments = this.getEquipments();
    const existing = equipments.find((e) => e.assetNumber.toLowerCase() === eq.assetNumber.toLowerCase());
    if (!existing) {
      const newEq: Equipment = {
        id: `eq-${Date.now()}`,
        type: (eq.type as Equipment['type']) || 'desktop',
        brand: eq.brand || 'Não informada',
        model: eq.model || 'Padrão PMT',
        assetNumber: eq.assetNumber,
        serialNumber: eq.serialNumber || 'S/N',
        sector,
        status: 'em_manutencao',
        lastMaintenanceDate: new Date().toISOString(),
      };
      equipments.push(newEq);
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipments));
    } else {
      existing.status = 'em_manutencao';
      existing.lastMaintenanceDate = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipments));
    }
  }

  public updateOrderStatus(orderId: string, newStatus: OSStatus, notes?: string): ServiceOrder | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const oldStatus = order.status;
    order.status = newStatus;

    if (['resolvida', 'entregue', 'fechada'].includes(newStatus) && !order.resolvedAt) {
      order.resolvedAt = new Date().toISOString();
    }
    if (newStatus === 'fechada') {
      order.closedAt = new Date().toISOString();
    }

    const currentUser = this.getCurrentUser();
    order.timeline.push({
      id: `t-${Date.now()}`,
      timestamp: new Date().toISOString(),
      authorName: currentUser.name,
      authorRole: currentUser.role === 'admin' ? 'Gestor CPD' : 'Técnico',
      action: `Status alterado para ${newStatus.toUpperCase().replace('_', ' ')}`,
      notes: notes || undefined,
      oldStatus,
      newStatus,
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
    return order;
  }

  public assignTechnician(orderId: string, technicianId: string, notes?: string): ServiceOrder | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const tech = this.getUsers().find((u) => u.id === technicianId);
    if (!tech) return null;

    order.technician = {
      id: tech.id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
    };

    if (order.status === 'aberta' || order.status === 'triagem') {
      order.status = 'atribuida';
    }

    const currentUser = this.getCurrentUser();
    order.timeline.push({
      id: `t-${Date.now()}`,
      timestamp: new Date().toISOString(),
      authorName: currentUser.name,
      authorRole: currentUser.role === 'admin' ? 'Gestor' : 'Técnico',
      action: `Atribuído ao técnico ${tech.name}`,
      notes,
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
    return order;
  }

  public updateTechnicalDetails(
    orderId: string, 
    params: {
      technicalDiagnosis?: string;
      actionsTaken?: string[];
      checklist?: Checklist;
      materialsUsed?: MaterialUsed[];
    }
  ): ServiceOrder | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    if (params.technicalDiagnosis !== undefined) {
      order.technicalDiagnosis = params.technicalDiagnosis;
    }
    if (params.actionsTaken !== undefined) {
      order.actionsTaken = params.actionsTaken;
    }
    if (params.checklist !== undefined) {
      order.checklist = params.checklist;
    }
    if (params.materialsUsed !== undefined) {
      order.materialsUsed = params.materialsUsed;
    }

    // If currently 'atribuida', auto move to 'em_andamento'
    if (order.status === 'atribuida') {
      order.status = 'em_andamento';
    }

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
    return order;
  }

  public addActionTaken(orderId: string, actionText: string): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (!order.actionsTaken) order.actionsTaken = [];
    order.actionsTaken.push(actionText);

    const currentUser = this.getCurrentUser();
    order.timeline.push({
      id: `t-${Date.now()}`,
      timestamp: new Date().toISOString(),
      authorName: currentUser.name,
      authorRole: 'Técnico',
      action: 'Procedimento registrado',
      notes: actionText,
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
  }

  public addMaterial(orderId: string, material: Omit<MaterialUsed, 'id' | 'dateAdded'>): void {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const newMat: MaterialUsed = {
      ...material,
      id: `mat-${Date.now()}`,
      dateAdded: new Date().toISOString(),
    };

    if (!order.materialsUsed) order.materialsUsed = [];
    order.materialsUsed.push(newMat);

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
  }

  public confirmDelivery(orderId: string, delivery: DeliveryReceipt): ServiceOrder | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.delivery = delivery;
    order.status = 'entregue';
    if (!order.resolvedAt) order.resolvedAt = new Date().toISOString();

    const currentUser = this.getCurrentUser();
    order.timeline.push({
      id: `t-${Date.now()}`,
      timestamp: new Date().toISOString(),
      authorName: currentUser.name,
      authorRole: currentUser.role === 'admin' ? 'Gestor' : 'Técnico',
      action: 'Equipamento Entregue ao Solicitante',
      notes: `Recebido formalmente por ${delivery.receivedBy} (Matrícula: ${delivery.receiverRegistration}) no setor ${delivery.receiverSector}.`,
      oldStatus: 'resolvida',
      newStatus: 'entregue',
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
    return order;
  }

  public submitRating(orderId: string, rating: Rating): ServiceOrder | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.rating = rating;
    if (order.status === 'entregue') {
      order.status = 'fechada';
      order.closedAt = new Date().toISOString();
    }

    order.timeline.push({
      id: `t-${Date.now()}`,
      timestamp: new Date().toISOString(),
      authorName: rating.ratedBy,
      authorRole: 'Solicitante',
      action: `Avaliação do Atendimento: ${rating.stars} Estrelas`,
      notes: rating.comment || 'Sem observações adicionais.',
      newStatus: order.status,
    });

    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    this.notify();
    return order;
  }

  // Equipment
  public getEquipments(): Equipment[] {
    const data = localStorage.getItem(STORAGE_KEYS.EQUIPMENT);
    return data ? JSON.parse(data) : [];
  }

  public createEquipment(eq: Omit<Equipment, 'id'>): Equipment {
    const equipments = this.getEquipments();
    const newEq: Equipment = {
      ...eq,
      id: `eq-${Date.now()}`,
    };
    equipments.push(newEq);
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipments));
    this.notify();
    return newEq;
  }

  public updateEquipment(id: string, partial: Partial<Equipment>): void {
    const equipments = this.getEquipments();
    const idx = equipments.findIndex((e) => e.id === id);
    if (idx !== -1) {
      equipments[idx] = { ...equipments[idx], ...partial };
      localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipments));
      this.notify();
    }
  }

  // Sectors
  public getSectors(): SectorConfig[] {
    const data = localStorage.getItem(STORAGE_KEYS.SECTORS);
    return data ? JSON.parse(data) : INITIAL_SECTORS;
  }

  // Notifications
  public getNotifications(): AppNotification[] {
    const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  }

  public addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): void {
    const notifs = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    notifs.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs.slice(0, 30)));
    this.notify();
  }

  public markNotificationAsRead(id: string): void {
    const notifs = this.getNotifications();
    const notif = notifs.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
      this.notify();
    }
  }

  public markAllNotificationsAsRead(): void {
    const notifs = this.getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    this.notify();
  }

  // Statistics calculation
  public getStats() {
    const orders = this.getOrders();
    const total = orders.length;
    const open = orders.filter((o) => ['aberta', 'triagem'].includes(o.status)).length;
    const inProgress = orders.filter((o) => ['atribuida', 'em_andamento', 'aguardando_peca'].includes(o.status)).length;
    const resolved = orders.filter((o) => ['resolvida', 'entregue', 'fechada'].includes(o.status)).length;

    // SLA analysis
    const now = Date.now();
    const overdue = orders.filter((o) => {
      const isDone = ['resolvida', 'entregue', 'fechada'].includes(o.status);
      if (isDone) return false;
      return new Date(o.slaDeadline).getTime() < now;
    }).length;

    const slaComplianceRate = total > 0 ? Math.round(((total - overdue) / total) * 100) : 100;

    // Average rating
    const ratedOrders = orders.filter((o) => o.rating && o.rating.stars > 0);
    const avgRating = ratedOrders.length > 0
      ? (ratedOrders.reduce((acc, curr) => acc + (curr.rating?.stars || 0), 0) / ratedOrders.length).toFixed(1)
      : '5.0';

    return {
      total,
      open,
      inProgress,
      resolved,
      overdue,
      slaComplianceRate,
      avgRating,
      ratedCount: ratedOrders.length,
    };
  }

  // Backup & Reset
  public resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(INITIAL_EQUIPMENTS));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    localStorage.setItem(STORAGE_KEYS.SECTORS, JSON.stringify(INITIAL_SECTORS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    this.notify();
  }

  public exportBackupJSON(): string {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      orders: this.getOrders(),
      equipments: this.getEquipments(),
      users: this.getUsers(),
      sectors: this.getSectors(),
    };
    return JSON.stringify(backup, null, 2);
  }

  public importBackupJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.orders && Array.isArray(data.orders)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders));
      }
      if (data.equipments && Array.isArray(data.equipments)) {
        localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(data.equipments));
      }
      if (data.users && Array.isArray(data.users)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data.users));
      }
      this.notify();
      return true;
    } catch (e) {
      console.error('Falha na importação de backup', e);
      return false;
    }
  }
}

export const db = new DatabaseStore();
