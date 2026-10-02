import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Expense, Sale, Workshop, Client, Reservation, DepositStatus, PaymentMethod, Article } from '../types';

const STORAGE_KEY = 'macrame_aurora_data_v1';

interface DataContextType {
  expenses: Expense[];
  sales: Sale[];
  workshops: Workshop[];
  clients: Client[];
  articles: Article[];
  
  // Articles CRUD
  addArticle: (article: Omit<Article, 'id' | 'createdAt'>) => Article;
  updateArticle: (id: string, article: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  resetArticlesToExcel: () => void;

  // Expenses CRUD
  addExpense: (expense: Omit<Expense, 'id'>) => Expense;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Sales CRUD
  addSale: (sale: Omit<Sale, 'id'>) => Sale;
  updateSale: (id: string, sale: Partial<Sale>) => void;
  deleteSale: (id: string) => void;

  // Workshops CRUD
  addWorkshop: (workshop: Omit<Workshop, 'id' | 'reservations'>) => Workshop;
  updateWorkshop: (id: string, workshop: Partial<Workshop>) => void;
  deleteWorkshop: (id: string) => void;

  // Reservations & Attendees
  addReservation: (workshopId: string, data: {
    clientName: string;
    clientPhone: string;
    clientEmail?: string;
    depositStatus: DepositStatus;
    depositAmount: number;
    depositPaymentMethod?: PaymentMethod;
    notes?: string;
  }) => { success: boolean; message: string; reservation?: Reservation };
  
  updateReservation: (workshopId: string, reservationId: string, data: Partial<Reservation>) => void;
  deleteReservation: (workshopId: string, reservationId: string) => void;

  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  findOrCreateClient: (name: string, phone: string, email?: string) => Client;

  // Backup & Reset
  resetToSampleData: () => void;
  exportJSONBackup: () => void;
  importJSONBackup: (jsonData: string) => boolean;
}

const initialClients: Client[] = [
  { id: 'c-1', name: 'Valentina Gomez', phone: '11 4523-9812', email: 'valen.gomez@gmail.com', createdAt: '2026-09-01' },
  { id: 'c-2', name: 'Camila Morales', phone: '11 5843-2190', email: 'camicamila@hotmail.com', createdAt: '2026-09-05' },
  { id: 'c-3', name: 'Sofia Benitez', phone: '11 3298-7410', email: 'sofibz@gmail.com', createdAt: '2026-09-10' },
  { id: 'c-4', name: 'Luciana Rossi', phone: '11 6541-8902', email: 'lurossi@gmail.com', createdAt: '2026-09-15' },
  { id: 'c-5', name: 'Mariana Fernandez', phone: '11 4120-9534', email: 'mariana.f@gmail.com', createdAt: '2026-09-18' },
  { id: 'c-6', name: 'Paula Castro', phone: '11 2938-4756', email: 'paucastro@gmail.com', createdAt: '2026-09-20' },
];

export const excelArticles: Article[] = [
  {
    id: 'art-1',
    name: 'Armazon bandeja circular chica',
    category: 'Armazones Decorados',
    cost: 3100,
    price: 7500,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-2',
    name: 'Armazon bandeja circular grande',
    category: 'Armazones Decorados',
    cost: 4200,
    price: 10000,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-3',
    name: 'Armazon bandeja rectangular',
    category: 'Armazones Decorados',
    cost: 3900,
    price: 7500,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-4',
    name: 'Armazon cesto',
    category: 'Canastas',
    cost: 4800,
    price: 10000,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-5',
    name: 'Armazon espejo',
    category: 'Espejos',
    cost: 3200,
    price: 10000,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-6',
    name: 'Armazon pantalla',
    category: 'Otros',
    cost: 3900,
    price: 10000,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-7',
    name: 'Bandeja circular (Hilo papel kraft)',
    category: 'Canastas',
    cost: 15370,
    price: 40000,
    threadType: 'Hilo papel kraft',
    createdAt: '2026-09-01'
  },
  {
    id: 'art-8',
    name: 'Bandeja rectangular (Hilo papel kraft)',
    category: 'Canastas',
    cost: 16170,
    price: 40000,
    threadType: 'Hilo papel kraft',
    createdAt: '2026-09-01'
  },
  {
    id: 'art-9',
    name: 'Cesto (Hilo papel kraft)',
    category: 'Canastas',
    cost: 16220,
    price: 40000,
    threadType: 'Hilo papel kraft',
    createdAt: '2026-09-01'
  },
  {
    id: 'art-10',
    name: 'Espejo chico',
    category: 'Espejos',
    cost: 2000,
    price: 3500,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-11',
    name: 'Espejo grande',
    category: 'Espejos',
    cost: 5500,
    price: 7000,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-12',
    name: 'Espejo (Hilo papel kraft)',
    category: 'Espejos',
    cost: 21395,
    price: 40000,
    threadType: 'Hilo papel kraft',
    createdAt: '2026-09-01'
  },
  {
    id: 'art-13',
    name: 'Espejo (Hilo polipropileno)',
    category: 'Espejos',
    cost: 21145,
    price: 40000,
    threadType: 'Hilo polipropileno',
    createdAt: '2026-09-01'
  },
  {
    id: 'art-14',
    name: 'Hilo papel kraft',
    category: 'Otros',
    cost: 8500,
    price: 10000,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-15',
    name: 'Hilo polipropileno',
    category: 'Otros',
    cost: 7500,
    price: 10000,
    createdAt: '2026-09-01'
  },
  {
    id: 'art-16',
    name: 'Pantalla (Hilo papel kraft)',
    category: 'Otros',
    cost: 16170,
    price: 40000,
    threadType: 'Hilo papel kraft',
    createdAt: '2026-09-01'
  },
  {
    id: 'art-17',
    name: 'Pantalla (Hilo polipropileno)',
    category: 'Otros',
    cost: 15970,
    price: 40000,
    threadType: 'Hilo polipropileno',
    createdAt: '2026-09-01'
  }
];

const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    date: '2026-09-12',
    category: 'Armazones',
    concept: '10 Armazones circulares de hierro 30cm para espejos',
    amount: 22500,
    supplier: 'Herrería San Martín',
    paymentMethod: 'Transferencia',
    notes: 'Soldadura reforzada para macramé'
  },
  {
    id: 'exp-2',
    date: '2026-09-15',
    category: 'Hilos y Cordones',
    concept: 'Bobinas de cordón peinado de algodón 4mm crudo y tostado (8 kg)',
    amount: 38000,
    supplier: 'Hilandería Textil Centro',
    paymentMethod: 'Transferencia',
    notes: 'Algodón 100% natural primera calidad'
  },
  {
    id: 'exp-3',
    date: '2026-09-18',
    category: 'Espejos',
    concept: 'Lote de 6 espejos biselados pulidos 25cm',
    amount: 25400,
    supplier: 'Vidriería Cristal Deco',
    paymentMethod: 'Mercado Pago',
    notes: 'Listos para montar en armazón'
  },
  {
    id: 'exp-4',
    date: '2026-09-22',
    category: 'Herrajes y Accesorios',
    concept: 'Argollas de madera de guatambú y mosquetones dorados',
    amount: 11200,
    supplier: 'Maderera Artesanal',
    paymentMethod: 'Efectivo',
    notes: 'Para colgadores de plantas y llaveros'
  },
  {
    id: 'exp-5',
    date: '2026-09-24',
    category: 'Packaging y Bolsas',
    concept: 'Bolsas de lienzo estampadas con logo Aurora y postales de agradecimiento',
    amount: 16800,
    supplier: 'Imprenta Gráfica Verde',
    paymentMethod: 'Transferencia'
  },
  {
    id: 'exp-6',
    date: '2026-09-26',
    category: 'Insumos de Taller',
    concept: 'Snacks merienda, té gourmet, guías de nudos impresas para taller',
    amount: 14500,
    supplier: 'Almacén Natural',
    paymentMethod: 'Mercado Pago'
  }
];

const initialSales: Sale[] = [
  {
    id: 'sale-1',
    date: '2026-09-14',
    productName: 'Espejo Sol Bohemio con flecos 35cm',
    category: 'Espejos',
    quantity: 1,
    unitPrice: 42000,
    totalAmount: 42000,
    estimatedCost: 14500,
    paymentMethod: 'Transferencia',
    customerName: 'Camila Morales',
    customerPhone: '11 5843-2190',
    notes: 'Entregado en showroom con bolsa lienzo'
  },
  {
    id: 'sale-2',
    date: '2026-09-18',
    productName: 'Canasta organizadora rústica con asas',
    category: 'Canastas',
    quantity: 2,
    unitPrice: 28000,
    totalAmount: 56000,
    estimatedCost: 18000,
    paymentMethod: 'Mercado Pago',
    customerName: 'Mariana Fernandez',
    customerPhone: '11 4120-9534'
  },
  {
    id: 'sale-3',
    date: '2026-09-20',
    productName: 'Tapiz de pared Aurora Grande (1.20m x 80cm)',
    category: 'Tapices de Pared',
    quantity: 1,
    unitPrice: 65000,
    totalAmount: 65000,
    estimatedCost: 21000,
    paymentMethod: 'Transferencia',
    customerName: 'Valentina Gomez',
    customerPhone: '11 4523-9812',
    notes: 'Encargo especial para living'
  },
  {
    id: 'sale-4',
    date: '2026-09-23',
    productName: 'Armazón circular decorado con plumas y flecos',
    category: 'Armazones Decorados',
    quantity: 1,
    unitPrice: 34000,
    totalAmount: 34000,
    estimatedCost: 11000,
    paymentMethod: 'Efectivo',
    customerName: 'Paula Castro',
    customerPhone: '11 2938-4756'
  },
  {
    id: 'sale-5',
    date: '2026-09-25',
    productName: 'Portamaceta colgante doble piso',
    category: 'Portamacetas',
    quantity: 1,
    unitPrice: 19500,
    totalAmount: 19500,
    estimatedCost: 6500,
    paymentMethod: 'Mercado Pago',
    customerName: 'Sofia Benitez',
    customerPhone: '11 3298-7410'
  }
];

const initialWorkshops: Workshop[] = [
  {
    id: 'ws-1',
    title: 'Taller Espejo Sol Bohemio con Flecos',
    date: '2026-10-10',
    time: '15:30',
    durationHours: 3.5,
    location: 'Showroom Aurora - Palermo',
    maxCapacity: 8,
    pricePerPerson: 32000,
    suggestedDeposit: 12000,
    description: 'Aprenderás a montar el espejo biselado sobre armazón de hierro, nudo alondra, nudo festón y peinado de flecos. Incluye todos los materiales y merienda.',
    status: 'Programado',
    reservations: [
      {
        id: 'res-1',
        workshopId: 'ws-1',
        clientId: 'c-1',
        clientName: 'Valentina Gomez',
        clientPhone: '11 4523-9812',
        clientEmail: 'valen.gomez@gmail.com',
        depositStatus: 'Pagada',
        depositAmount: 12000,
        totalPrice: 32000,
        remainingBalance: 20000,
        isFullyPaid: false,
        depositPaymentMethod: 'Transferencia',
        depositDate: '2026-09-20',
        registeredAt: '2026-09-20T14:30:00Z',
        notes: 'Pide cordón tono lino natural'
      },
      {
        id: 'res-2',
        workshopId: 'ws-1',
        clientId: 'c-2',
        clientName: 'Camila Morales',
        clientPhone: '11 5843-2190',
        clientEmail: 'camicamila@hotmail.com',
        depositStatus: 'Pagada',
        depositAmount: 12000,
        totalPrice: 32000,
        remainingBalance: 20000,
        isFullyPaid: false,
        depositPaymentMethod: 'Mercado Pago',
        depositDate: '2026-09-22',
        registeredAt: '2026-09-22T16:15:00Z'
      },
      {
        id: 'res-3',
        workshopId: 'ws-1',
        clientId: 'c-3',
        clientName: 'Sofia Benitez',
        clientPhone: '11 3298-7410',
        depositStatus: 'Pagada',
        depositAmount: 32000,
        totalPrice: 32000,
        remainingBalance: 0,
        isFullyPaid: true,
        depositPaymentMethod: 'Transferencia',
        depositDate: '2026-09-24',
        registeredAt: '2026-09-24T11:00:00Z',
        notes: 'Abonó el total completo por adelantado'
      },
      {
        id: 'res-4',
        workshopId: 'ws-1',
        clientId: 'c-4',
        clientName: 'Luciana Rossi',
        clientPhone: '11 6541-8902',
        depositStatus: 'Pendiente',
        depositAmount: 0,
        totalPrice: 32000,
        remainingBalance: 32000,
        isFullyPaid: false,
        registeredAt: '2026-09-27T10:00:00Z',
        notes: 'Prometió transferir la seña el lunes por la tarde'
      },
      {
        id: 'res-5',
        workshopId: 'ws-1',
        clientId: 'c-5',
        clientName: 'Mariana Fernandez',
        clientPhone: '11 4120-9534',
        depositStatus: 'Pagada',
        depositAmount: 12000,
        totalPrice: 32000,
        remainingBalance: 20000,
        isFullyPaid: false,
        depositPaymentMethod: 'Transferencia',
        depositDate: '2026-09-25',
        registeredAt: '2026-09-25T18:20:00Z'
      }
    ]
  },
  {
    id: 'ws-2',
    title: 'Taller Canastas Circulares y Nudos Rústicos',
    date: '2026-10-24',
    time: '16:00',
    durationHours: 3.5,
    location: 'Showroom Aurora - Palermo',
    maxCapacity: 6,
    pricePerPerson: 35000,
    suggestedDeposit: 15000,
    description: 'Técnica de enrollado y nudo cordón para estructurar canastas rígidas con asas de cuero o macramé.',
    status: 'Programado',
    reservations: [
      {
        id: 'res-6',
        workshopId: 'ws-2',
        clientId: 'c-6',
        clientName: 'Paula Castro',
        clientPhone: '11 2938-4756',
        depositStatus: 'Pagada',
        depositAmount: 15000,
        totalPrice: 35000,
        remainingBalance: 20000,
        isFullyPaid: false,
        depositPaymentMethod: 'Mercado Pago',
        depositDate: '2026-09-26',
        registeredAt: '2026-09-26T12:00:00Z'
      }
    ]
  },
  {
    id: 'ws-3',
    title: 'Iniciación al Macramé: Tapiz de Pared',
    date: '2026-11-07',
    time: '15:00',
    durationHours: 4,
    location: 'Showroom Aurora - Palermo',
    maxCapacity: 8,
    pricePerPerson: 30000,
    suggestedDeposit: 10000,
    description: 'Nudos básicos: plano, espiral, alondra y remate. Te llevás tu tapiz listo para colgar.',
    status: 'Programado',
    reservations: []
  }
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_expenses');
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_sales');
    return saved ? JSON.parse(saved) : initialSales;
  });

  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_workshops');
    return saved ? JSON.parse(saved) : initialWorkshops;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_clients');
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [articles, setArticles] = useState<Article[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_articles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback to excel articles
      }
    }
    return excelArticles;
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_workshops', JSON.stringify(workshops));
  }, [workshops]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_articles', JSON.stringify(articles));
  }, [articles]);

  // Articles CRUD
  const addArticle = (articleData: Omit<Article, 'id' | 'createdAt'>): Article => {
    const newArticle: Article = {
      ...articleData,
      id: 'art-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setArticles(prev => [...prev, newArticle]);
    return newArticle;
  };

  const updateArticle = (id: string, data: Partial<Article>) => {
    setArticles(prev => prev.map(a => (a.id === id ? { ...a, ...data } : a)));
  };

  const deleteArticle = (id: string) => {
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  const resetArticlesToExcel = () => {
    setArticles(excelArticles);
  };

  // Clients
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: 'c-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const findOrCreateClient = (name: string, phone: string, email?: string): Client => {
    const cleanName = name.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');
    const existing = clients.find(c => 
      c.name.trim().toLowerCase() === cleanName || 
      (cleanPhone.length > 5 && c.phone.replace(/\D/g, '').includes(cleanPhone))
    );
    if (existing) return existing;
    return addClient({ name: name.trim(), phone: phone.trim(), email: email?.trim() });
  };

  // Expenses
  const addExpense = (expenseData: Omit<Expense, 'id'>): Expense => {
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp-' + Date.now(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    return newExpense;
  };

  const updateExpense = (id: string, data: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...data } : e)));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Sales
  const addSale = (saleData: Omit<Sale, 'id'>): Sale => {
    const newSale: Sale = {
      ...saleData,
      id: 'sale-' + Date.now(),
    };
    // Also auto-register client if customerName provided
    if (saleData.customerName) {
      findOrCreateClient(saleData.customerName, saleData.customerPhone || '');
    }
    setSales(prev => [newSale, ...prev]);
    return newSale;
  };

  const updateSale = (id: string, data: Partial<Sale>) => {
    setSales(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  };

  // Workshops
  const addWorkshop = (workshopData: Omit<Workshop, 'id' | 'reservations'>): Workshop => {
    const newWorkshop: Workshop = {
      ...workshopData,
      id: 'ws-' + Date.now(),
      reservations: [],
    };
    setWorkshops(prev => [newWorkshop, ...prev]);
    return newWorkshop;
  };

  const updateWorkshop = (id: string, data: Partial<Workshop>) => {
    setWorkshops(prev => prev.map(w => (w.id === id ? { ...w, ...data } : w)));
  };

  const deleteWorkshop = (id: string) => {
    setWorkshops(prev => prev.filter(w => w.id !== id));
  };

  // Reservations
  const addReservation = (
    workshopId: string,
    data: {
      clientName: string;
      clientPhone: string;
      clientEmail?: string;
      depositStatus: DepositStatus;
      depositAmount: number;
      depositPaymentMethod?: PaymentMethod;
      notes?: string;
    }
  ) => {
    const workshop = workshops.find(w => w.id === workshopId);
    if (!workshop) {
      return { success: false, message: 'Taller no encontrado' };
    }

    if (workshop.reservations.length >= workshop.maxCapacity) {
      return {
        success: false,
        message: `El taller ya alcanzó su cupo máximo de ${workshop.maxCapacity} personas.`
      };
    }

    // Register or find person
    const client = findOrCreateClient(data.clientName, data.clientPhone, data.clientEmail);

    const depositAmount = data.depositStatus === 'Pagada' ? data.depositAmount : 0;
    const remainingBalance = Math.max(0, workshop.pricePerPerson - depositAmount);
    const isFullyPaid = depositAmount >= workshop.pricePerPerson;

    const newReservation: Reservation = {
      id: 'res-' + Date.now(),
      workshopId,
      clientId: client.id,
      clientName: client.name,
      clientPhone: client.phone,
      clientEmail: client.email,
      depositStatus: data.depositStatus,
      depositAmount,
      totalPrice: workshop.pricePerPerson,
      remainingBalance,
      isFullyPaid,
      depositPaymentMethod: data.depositPaymentMethod,
      depositDate: data.depositStatus === 'Pagada' ? new Date().toISOString().slice(0, 10) : undefined,
      notes: data.notes,
      registeredAt: new Date().toISOString(),
    };

    setWorkshops(prev =>
      prev.map(w => {
        if (w.id === workshopId) {
          return {
            ...w,
            reservations: [...w.reservations, newReservation],
          };
        }
        return w;
      })
    );

    return {
      success: true,
      message: '¡Reserva registrada con éxito!',
      reservation: newReservation,
    };
  };

  const updateReservation = (workshopId: string, reservationId: string, data: Partial<Reservation>) => {
    setWorkshops(prev =>
      prev.map(w => {
        if (w.id === workshopId) {
          return {
            ...w,
            reservations: w.reservations.map(r => {
              if (r.id === reservationId) {
                const updated = { ...r, ...data };
                // Recalculate remaining balance and paid state if deposit changes
                if (data.depositAmount !== undefined || data.totalPrice !== undefined || data.depositStatus !== undefined) {
                  const effectiveDeposit = updated.depositStatus === 'Pagada' ? updated.depositAmount : 0;
                  updated.remainingBalance = Math.max(0, updated.totalPrice - effectiveDeposit);
                  updated.isFullyPaid = effectiveDeposit >= updated.totalPrice;
                }
                return updated;
              }
              return r;
            }),
          };
        }
        return w;
      })
    );
  };

  const deleteReservation = (workshopId: string, reservationId: string) => {
    setWorkshops(prev =>
      prev.map(w => {
        if (w.id === workshopId) {
          return {
            ...w,
            reservations: w.reservations.filter(r => r.id !== reservationId),
          };
        }
        return w;
      })
    );
  };

  // Backup & Reset
  const resetToSampleData = () => {
    setExpenses(initialExpenses);
    setSales(initialSales);
    setWorkshops(initialWorkshops);
    setClients(initialClients);
    setArticles(excelArticles);
  };

  const exportJSONBackup = () => {
    const backup = {
      brand: 'Macramé Aurora',
      exportedAt: new Date().toISOString(),
      expenses,
      sales,
      workshops,
      clients,
      articles,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Macrame_Aurora_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importJSONBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.sales) setSales(parsed.sales);
      if (parsed.workshops) setWorkshops(parsed.workshops);
      if (parsed.clients) setClients(parsed.clients);
      if (parsed.articles) setArticles(parsed.articles);
      return true;
    } catch (err) {
      console.error('Error importing backup:', err);
      return false;
    }
  };

  return (
    <DataContext.Provider
      value={{
        expenses,
        sales,
        workshops,
        clients,
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        resetArticlesToExcel,
        addExpense,
        updateExpense,
        deleteExpense,
        addSale,
        updateSale,
        deleteSale,
        addWorkshop,
        updateWorkshop,
        deleteWorkshop,
        addReservation,
        updateReservation,
        deleteReservation,
        addClient,
        updateClient,
        deleteClient,
        findOrCreateClient,
        resetToSampleData,
        exportJSONBackup,
        importJSONBackup,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
