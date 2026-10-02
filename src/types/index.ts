export type ExpenseCategory =
  | 'Armazones'
  | 'Hilos y Cordones'
  | 'Espejos'
  | 'Herrajes y Accesorios'
  | 'Herramientas'
  | 'Packaging y Bolsas'
  | 'Insumos de Taller'
  | 'Otros';

export type PaymentMethod =
  | 'Efectivo'
  | 'Transferencia'
  | 'Mercado Pago'
  | 'Tarjeta de Débito/Crédito'
  | 'Otro';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  concept: string; // e.g. "10 Armazones circulares de hierro 30cm"
  amount: number;
  supplier?: string; // e.g. "Herrería San Martín"
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type ProductCategory =
  | 'Canastas'
  | 'Espejos'
  | 'Armazones Decorados'
  | 'Tapices de Pared'
  | 'Portamacetas'
  | 'Llaveros y Souvenirs'
  | 'Cortinas y Separadores'
  | 'Encargo Personalizado'
  | 'Otros';

export interface Article {
  id: string;
  name: string;
  category: ProductCategory;
  cost: number; // Costo de materiales / insumos
  price: number; // Precio de venta al público
  threadType?: string; // Tipo de hilo si corresponde
  notes?: string;
  createdAt: string;
}

export interface Sale {
  id: string;
  date: string; // YYYY-MM-DD
  articleId?: string; // ID del artículo seleccionado si proviene del catálogo
  productName: string; // Nombre del artículo o pieza
  category: ProductCategory;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  estimatedCost?: number; // Costo de materiales para calcular margen neto
  paymentMethod: PaymentMethod;
  customerName?: string;
  customerPhone?: string;
  notes?: string;

  // Venta por encargo con seña (opcional)
  isCustomOrder?: boolean; // Indica si la venta es por encargo
  depositAmount?: number; // Monto de la seña abonada ($)
  isFullyPaid?: boolean; // true si ya abonó el saldo restante al entregar, false si solo pagó seña
  deliveryDate?: string; // Fecha estimada de entrega / terminación
}

export type WorkshopStatus = 'Programado' | 'En Curso' | 'Finalizado' | 'Cancelado';

export type DepositStatus = 'Pagada' | 'Pendiente' | 'Exenta';

export interface Reservation {
  id: string;
  workshopId: string;
  clientId: string;
  clientName: string; // Nombre y Apellido
  clientPhone: string; // Número de teléfono
  clientEmail?: string;
  depositStatus: DepositStatus; // Si pagó la seña o todavía no la pagó
  depositAmount: number; // Cuánto pagó de seña ($)
  totalPrice: number; // Precio total del taller para este alumno
  remainingBalance: number; // totalPrice - depositAmount
  isFullyPaid: boolean; // Si ya terminó de abonar el saldo total
  depositPaymentMethod?: PaymentMethod;
  depositDate?: string;
  notes?: string;
  registeredAt: string;
}

export interface Workshop {
  id: string;
  title: string; // e.g. "Taller Espejo Boho con Flecos"
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  durationHours?: number; // e.g. 3
  location: string; // e.g. "Showroom Aurora"
  maxCapacity: number; // Cantidad máxima de personas que se pueden anotar
  pricePerPerson: number;
  suggestedDeposit: number; // Monto sugerido de seña
  description?: string;
  status: WorkshopStatus;
  reservations: Reservation[];
}

export interface Client {
  id: string;
  name: string; // Nombre y Apellido
  phone: string; // Teléfono
  email?: string;
  notes?: string;
  createdAt: string;
}
