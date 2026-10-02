import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Sale, ProductCategory, PaymentMethod, Client, Article } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { exportSalesToCSV } from '../utils/exportCsv';
import { 
  TrendingUp, 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  X, 
  ShoppingBag,
  User,
  Phone,
  Check,
  UserPlus,
  BookOpen,
  Package,
  Clock,
  Coins,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Canastas',
  'Espejos',
  'Armazones Decorados',
  'Tapices de Pared',
  'Portamacetas',
  'Llaveros y Souvenirs',
  'Cortinas y Separadores',
  'Encargo Personalizado',
  'Otros',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Transferencia',
  'Mercado Pago',
  'Efectivo',
  'Tarjeta de Débito/Crédito',
  'Otro',
];

interface SalesViewProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const SalesView: React.FC<SalesViewProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { sales, clients, articles, addSale, updateSale, deleteSale, markSaleFullyPaid } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'all' | 'custom_orders' | 'pending_balance' | 'immediate'>('all');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  // Client search mode and query
  const [clientMode, setClientMode] = useState<'search' | 'manual'>('search');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientAssigned, setIsClientAssigned] = useState(false);
  const [isClientDirectoryOpen, setIsClientDirectoryOpen] = useState(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');

  // Article selection state
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [articleSearchQuery, setArticleSearchQuery] = useState('');
  const [isArticleSelectorOpen, setIsArticleSelectorOpen] = useState(false);
  const [isCustomProductMode, setIsCustomProductMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState<{
    articleId?: string;
    productName: string;
    category: ProductCategory;
    quantity: number;
    unitPrice: string;
    estimatedCost?: number;
    date: string;
    paymentMethod: PaymentMethod;
    customerName: string;
    customerPhone: string;
    notes: string;
    isCustomOrder: boolean;
    depositAmount: string;
    isFullyPaid: boolean;
    deliveryDate: string;
  }>({
    articleId: undefined,
    productName: '',
    category: 'Canastas',
    quantity: 1,
    unitPrice: '',
    estimatedCost: undefined,
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Transferencia',
    customerName: '',
    customerPhone: '',
    notes: '',
    isCustomOrder: false,
    depositAmount: '',
    isFullyPaid: false,
    deliveryDate: '',
  });

  const handleOpenCreate = () => {
    setEditingSale(null);
    setSelectedArticleId(null);
    setArticleSearchQuery('');
    setIsArticleSelectorOpen(false);
    setIsCustomProductMode(false);
    setIsClientAssigned(false);
    setClientMode('search');
    setClientSearchQuery('');
    setFormData({
      articleId: undefined,
      productName: '',
      category: 'Canastas',
      quantity: 1,
      unitPrice: '',
      estimatedCost: undefined,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Transferencia',
      customerName: '',
      customerPhone: '',
      notes: '',
      isCustomOrder: false,
      depositAmount: '',
      isFullyPaid: false,
      deliveryDate: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sale: Sale) => {
    setEditingSale(sale);
    const matched = articles.find(
      a => a.id === sale.articleId || a.name.toLowerCase().trim() === sale.productName.toLowerCase().trim()
    );
    setSelectedArticleId(matched ? matched.id : (sale.articleId || null));
    setArticleSearchQuery('');
    setIsArticleSelectorOpen(false);
    setIsCustomProductMode(!matched && !sale.articleId && !!sale.productName);
    setIsClientAssigned(Boolean(sale.customerName && sale.customerName.trim().length > 0));
    setClientSearchQuery('');
    setClientMode('search');
    setFormData({
      articleId: sale.articleId,
      productName: sale.productName,
      category: sale.category,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice.toString(),
      estimatedCost: sale.estimatedCost ? Math.round(sale.estimatedCost / sale.quantity) : undefined,
      date: sale.date,
      paymentMethod: sale.paymentMethod,
      customerName: sale.customerName || '',
      customerPhone: sale.customerPhone || '',
      notes: sale.notes || '',
      isCustomOrder: Boolean(sale.isCustomOrder),
      depositAmount: sale.depositAmount !== undefined ? sale.depositAmount.toString() : '',
      isFullyPaid: sale.isFullyPaid !== undefined ? sale.isFullyPaid : (!sale.isCustomOrder),
      deliveryDate: sale.deliveryDate || '',
    });
    setIsModalOpen(true);
  };

  const handleSelectArticle = (article: Article) => {
    setSelectedArticleId(article.id);
    setIsCustomProductMode(false);
    setIsArticleSelectorOpen(false);
    setArticleSearchQuery('');
    setFormData(prev => ({
      ...prev,
      articleId: article.id,
      productName: article.name,
      category: article.category,
      unitPrice: article.price.toString(),
      estimatedCost: article.cost,
    }));
  };

  const handleCustomerNameChange = (nameVal: string) => {
    // If the entered name matches an existing client exactly, auto-fill phone
    const exact = clients.find(c => c.name.toLowerCase().trim() === nameVal.toLowerCase().trim());
    setFormData(prev => ({
      ...prev,
      customerName: nameVal,
      customerPhone: exact ? exact.phone : prev.customerPhone,
    }));
  };

  const handleSelectClient = (client: Client) => {
    setFormData(prev => ({
      ...prev,
      customerName: client.name,
      customerPhone: client.phone,
    }));
    setIsClientAssigned(true);
  };

  const handleDeselectClient = () => {
    setIsClientAssigned(false);
    setFormData(prev => ({
      ...prev,
      customerName: '',
      customerPhone: '',
    }));
    setClientSearchQuery('');
    setClientMode('search');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName.trim() || !formData.unitPrice) return;

    const unitPriceNum = parseFloat(formData.unitPrice);
    if (isNaN(unitPriceNum) || unitPriceNum <= 0) return;

    const qty = Number(formData.quantity) || 1;
    const totalAmount = unitPriceNum * qty;
    const estimatedCost = formData.estimatedCost ? formData.estimatedCost * qty : undefined;
    const depositAmountNum = formData.isCustomOrder && formData.depositAmount ? parseFloat(formData.depositAmount) : undefined;
    const isFullyPaidVal = formData.isCustomOrder
      ? (formData.isFullyPaid || (depositAmountNum !== undefined && depositAmountNum >= totalAmount))
      : undefined;

    const salePayload = {
      articleId: formData.articleId,
      productName: formData.productName.trim(),
      category: formData.category,
      quantity: qty,
      unitPrice: unitPriceNum,
      totalAmount,
      estimatedCost,
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      customerName: formData.customerName.trim() || undefined,
      customerPhone: formData.customerPhone.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      isCustomOrder: formData.isCustomOrder,
      depositAmount: formData.isCustomOrder ? (depositAmountNum || 0) : undefined,
      isFullyPaid: isFullyPaidVal,
      deliveryDate: formData.isCustomOrder && formData.deliveryDate ? formData.deliveryDate : undefined,
    };

    if (editingSale) {
      updateSale(editingSale.id, salePayload);
    } else {
      addSale(salePayload);
    }

    setIsModalOpen(false);
  };

  // Filtered sales
  const filteredSales = sales.filter(s => {
    const matchesSearch =
      s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.notes && s.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Todas' || s.category === selectedCategory;

    let matchesOrderType = true;
    if (orderTypeFilter === 'custom_orders') {
      matchesOrderType = Boolean(s.isCustomOrder);
    } else if (orderTypeFilter === 'pending_balance') {
      matchesOrderType = Boolean(s.isCustomOrder && !s.isFullyPaid);
    } else if (orderTypeFilter === 'immediate') {
      matchesOrderType = !s.isCustomOrder;
    }

    return matchesSearch && matchesCategory && matchesOrderType;
  });

  const totalFilteredSales = filteredSales.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Filtered clients for quick search in sales modal
  const cleanSearch = clientSearchQuery.trim().toLowerCase();
  const cleanSearchDigits = clientSearchQuery.replace(/\D/g, '');
  const filteredClientsForSearch = clients.filter(c => {
    if (!cleanSearch) return true;
    const matchName = c.name.toLowerCase().includes(cleanSearch);
    const matchPhone = cleanSearchDigits.length > 0 && c.phone.replace(/\D/g, '').includes(cleanSearchDigits);
    const matchEmail = c.email && c.email.toLowerCase().includes(cleanSearch);
    return matchName || matchPhone || matchEmail;
  });

  // Filtered clients for full directory modal
  const cleanDirSearch = directorySearchQuery.trim().toLowerCase();
  const cleanDirDigits = directorySearchQuery.replace(/\D/g, '');
  const filteredClientsForDirectory = clients.filter(c => {
    if (!cleanDirSearch) return true;
    const matchName = c.name.toLowerCase().includes(cleanDirSearch);
    const matchPhone = cleanDirDigits.length > 0 && c.phone.replace(/\D/g, '').includes(cleanDirDigits);
    const matchEmail = c.email && c.email.toLowerCase().includes(cleanDirSearch);
    return matchName || matchPhone || matchEmail;
  });

  // Matching clients for manual input duplicate warning
  const cleanTypedName = formData.customerName.toLowerCase().trim();
  const matchingClients = cleanTypedName
    ? clients.filter(c =>
        c.name.toLowerCase().includes(cleanTypedName) ||
        c.phone.replace(/\D/g, '').includes(cleanTypedName.replace(/\D/g, ''))
      )
    : [];

  const matchedClient = clients.find(
    c => c.name.toLowerCase().trim() === cleanTypedName && cleanTypedName.length > 0
  );

  // Group amounts by category for quick overview
  const categoryTotals: Record<string, number> = {};
  sales.forEach(s => {
    categoryTotals[s.category] = (categoryTotals[s.category] || 0) + s.totalAmount;
  });

  // Artículos ordenados alfabéticamente A-Z para la selección en ventas
  const sortedArticles = [...articles].sort((a, b) =>
    a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
  );

  const cleanArticleSearch = articleSearchQuery.trim().toLowerCase();
  const filteredArticles = sortedArticles.filter(a => {
    if (!cleanArticleSearch) return true;
    return (
      a.name.toLowerCase().includes(cleanArticleSearch) ||
      a.category.toLowerCase().includes(cleanArticleSearch) ||
      (a.threadType && a.threadType.toLowerCase().includes(cleanArticleSearch))
    );
  });

  const currentSelectedArticle = articles.find(
    a => a.id === selectedArticleId || a.name.toLowerCase().trim() === formData.productName.toLowerCase().trim()
  );

  // Métricas de encargos y señas
  const totalCustomOrders = sales.filter(s => s.isCustomOrder).length;
  const pendingCustomOrders = sales.filter(s => s.isCustomOrder && !s.isFullyPaid);
  const totalPendingBalance = pendingCustomOrders.reduce(
    (acc, s) => acc + Math.max(0, s.totalAmount - (s.depositAmount || 0)),
    0
  );
  const totalCollectedDeposits = sales.filter(s => s.isCustomOrder).reduce(
    (acc, s) => acc + (s.depositAmount || 0),
    0
  );

  // Cálculos dinámicos en tiempo real para el modal
  const modalUnitPriceNum = parseFloat(formData.unitPrice) || 0;
  const modalQtyNum = Number(formData.quantity) || 1;
  const modalTotalAmount = modalUnitPriceNum * modalQtyNum;
  const modalDepositNum = parseFloat(formData.depositAmount) || 0;
  const modalRemainingBalance = Math.max(0, modalTotalAmount - modalDepositNum);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#2E6B4A]" />
            <h1 className="font-serif-aurora text-3xl font-bold text-[#2D231E]">
              Registro de Ventas y Ganancias
            </h1>
          </div>
          <p className="text-sm text-[#7D6E63] mt-1">
            Lleva el control de canastas, espejos, armazones y tapices vendidos
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportSalesToCSV(filteredSales)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-white hover:bg-[#FAF7F2] text-[#6D5D53] text-xs font-semibold shadow-2xs transition-colors"
            title="Exportar a Excel CSV"
          >
            <Download className="w-4 h-4 text-[#8E7E73]" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#2E6B4A] hover:bg-[#25563B] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-[#2E6B4A]/25 transition-all hover:shadow-lg active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Anotar Venta</span>
          </button>
        </div>
      </div>

      {/* Category Pills Quick Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Canastas', 'Espejos', 'Armazones Decorados', 'Tapices de Pared'].map(cat => (
          <div 
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? 'Todas' : cat)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedCategory === cat
                ? 'bg-[#2E6B4A] text-white border-[#2E6B4A] shadow-xs'
                : 'bg-white text-[#2D231E] border-[#EBE3D7] hover:border-[#D5C1AE]'
            }`}
          >
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${selectedCategory === cat ? 'text-white/80' : 'text-[#8E7E73]'}`}>
              {cat}
            </p>
            <p className="text-lg font-bold mt-0.5">
              {formatCurrency(categoryTotals[cat] || 0)}
            </p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBE3D7] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8988D]" />
          <input
            type="text"
            placeholder="Buscar por producto (ej: espejo sol, canasta), cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#DFCBB9] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] focus:border-transparent bg-[#FAF7F2]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#8E7E73] shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-semibold text-[#5C4F47] py-2 px-3 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
            >
              <option value="Todas">Todas las Categorías</option>
              {PRODUCT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value as any)}
            className="text-xs font-semibold text-[#5C4F47] py-2 px-3 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
          >
            <option value="all">Todas las Ventas</option>
            <option value="pending_balance">Encargos con Saldo Pendiente ({pendingCustomOrders.length})</option>
            <option value="custom_orders">Todos los Encargos ({totalCustomOrders})</option>
            <option value="immediate">Ventas Inmediatas</option>
          </select>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 bg-[#E8F5E9] rounded-xl border border-[#C8E6C9] text-xs font-medium text-[#2E7D32]">
        <div className="flex items-center gap-2 flex-wrap">
          <span>Mostrando <b>{filteredSales.length}</b> ventas registradas</span>
          {pendingCustomOrders.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[#FFF3E0] text-[#E65100] font-bold border border-[#FFE0B2] text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {pendingCustomOrders.length} {pendingCustomOrders.length === 1 ? 'encargo pendiente de saldo' : 'encargos pendientes de saldo'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {totalPendingBalance > 0 && (
            <span className="text-xs font-bold text-[#E65100]">
              Saldo por cobrar: {formatCurrency(totalPendingBalance)}
            </span>
          )}
          {totalCollectedDeposits > 0 && (
            <span className="text-xs text-[#2E7D32] font-semibold">
              Señas recibidas: {formatCurrency(totalCollectedDeposits)}
            </span>
          )}
          <span className="text-sm font-bold text-[#1B5E20]">
            Total Ventas: {formatCurrency(totalFilteredSales)}
          </span>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-[#EBE3D7] overflow-hidden shadow-2xs">
        {filteredSales.length === 0 ? (
          <div className="py-12 text-center text-[#8E7E73]">
            <ShoppingBag className="w-10 h-10 mx-auto text-[#DFCBB9] mb-2" />
            <p className="font-semibold text-[#2D231E]">No hay ventas registradas</p>
            <p className="text-xs mt-1">Registra tu primera venta con el botón "Anotar Venta".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EBE3D7] text-[11px] font-bold text-[#7D6E63] uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4 text-center">Cant.</th>
                  <th className="py-3 px-4 text-right">Total / Seña</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4] text-xs">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-[#5C4F47]">
                      {formatDate(sale.date)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-bold text-[#2D231E]">{sale.productName}</p>
                        {sale.isCustomOrder && (
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                            !sale.isFullyPaid
                              ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'
                              : 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'
                          }`}>
                            {!sale.isFullyPaid ? 'Encargo • Seña' : 'Encargo • Saldado'}
                          </span>
                        )}
                      </div>
                      {sale.deliveryDate && !sale.isFullyPaid && (
                        <p className="text-[10px] text-[#C86D51] font-medium flex items-center gap-1 mt-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          Entrega est.: {formatDate(sale.deliveryDate)}
                        </p>
                      )}
                      {sale.notes && (
                        <p className="text-[11px] text-[#8E7E73] italic mt-0.5">{sale.notes}</p>
                      )}
                      {sale.estimatedCost !== undefined && (
                        <p className="text-[10px] text-[#2E6B4A] font-semibold mt-0.5">
                          Margen est.: +{formatCurrency(sale.totalAmount - sale.estimatedCost)}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF3EA] text-[#93452E] border border-[#DFCBB9]">
                        {sale.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#6D5D53] whitespace-nowrap">
                      {sale.customerName ? (
                        <div>
                          <p className="font-semibold text-[#2D231E]">{sale.customerName}</p>
                          {sale.customerPhone && (
                            <p className="text-[10px] text-[#8E7E73]">{sale.customerPhone}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#A8988D] italic">Cliente de paso</span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] text-[#5C4F47] bg-[#EFE7DE] px-2 py-0.5 rounded-md font-medium">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-semibold">
                      x{sale.quantity}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <p className="font-bold text-sm text-[#2E6B4A]">
                        +{formatCurrency(sale.totalAmount)}
                      </p>
                      {sale.isCustomOrder && (
                        <div className="text-[10px] text-right mt-0.5">
                          {!sale.isFullyPaid ? (
                            <>
                              <span className="text-[#2E7D32] font-semibold block">
                                Seña: +{formatCurrency(sale.depositAmount || 0)}
                              </span>
                              <span className="text-[#E65100] font-bold block">
                                Resta: {formatCurrency(Math.max(0, sale.totalAmount - (sale.depositAmount || 0)))}
                              </span>
                            </>
                          ) : (
                            <span className="text-[#2E7D32] font-medium inline-flex items-center gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              100% Abonado
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {sale.isCustomOrder && !sale.isFullyPaid && (
                          <button
                            onClick={() => {
                              const rest = Math.max(0, sale.totalAmount - (sale.depositAmount || 0));
                              if (window.confirm(`¿Marcar encargo de "${sale.productName}" como totalmente abonado? Se cobrará el saldo restante de ${formatCurrency(rest)}.`)) {
                                markSaleFullyPaid(sale.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#2E6B4A] hover:bg-[#E8F5E9] transition-colors"
                            title="Cobrar saldo restante y marcar como saldado"
                          >
                            <Coins className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEdit(sale)}
                          className="p-1.5 rounded-lg text-[#8E7E73] hover:text-[#2D231E] hover:bg-[#F2ECE4] transition-colors"
                          title="Editar venta"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la venta de "${sale.productName}"?`)) {
                              deleteSale(sale.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#C62828]/70 hover:text-[#C62828] hover:bg-[#FFEBEE] transition-colors"
                          title="Eliminar venta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Sale - Totalmente Responsive en PC y Celular */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#DFCBB9] shadow-2xl w-full max-w-lg my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header Fijo */}
            <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-[#F2ECE4] bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2E6B4A]" />
                <h3 className="font-serif-aurora text-lg sm:text-xl font-bold text-[#2D231E]">
                  {editingSale ? 'Editar Venta' : 'Anotar Nueva Venta'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-[#8E7E73] hover:bg-[#EFE7DE] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body Scrolleable con scroll táctil suave */}
            <form id="sale-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-xs">
              
              {/* Selector de Artículo del Catálogo (A-Z) */}
              <div className="p-3.5 sm:p-4 bg-[#FAF7F2] rounded-2xl border border-[#DFCBB9] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-[#5C4F47] text-xs flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>Artículo del Catálogo *</span>
                    <span className="text-[10px] text-[#8E7E73] font-normal">
                      ({sortedArticles.length} disponibles A-Z)
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomProductMode(!isCustomProductMode);
                      setIsArticleSelectorOpen(false);
                      if (!isCustomProductMode) {
                        setSelectedArticleId(null);
                      }
                    }}
                    className="text-[11px] text-[#C86D51] hover:underline font-semibold"
                  >
                    {isCustomProductMode ? '← Elegir de Artículos' : '+ Ingresar manual'}
                  </button>
                </div>

                {isCustomProductMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      required
                      placeholder="Ej: Espejo Sol Bohemio 35cm, Canasta especial..."
                      value={formData.productName}
                      onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-white focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] text-sm"
                    />
                    <p className="text-[11px] text-[#8E7E73] italic">
                      Ingreso manual fuera del catálogo cargado. Si es una pieza frecuente, te recomendamos agregarla en la pestaña "Artículos".
                    </p>
                  </div>
                ) : (
                  formData.productName && !isArticleSelectorOpen ? (
                    /* Tarjeta de Artículo Seleccionado */
                    <div className="p-3 bg-white rounded-xl border border-[#C8E6C9] shadow-2xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider bg-[#E8F5E9] px-1.5 py-0.2 rounded">
                                Artículo Seleccionado
                              </span>
                              {currentSelectedArticle?.threadType && (
                                <span className="text-[10px] font-medium text-[#7D6E63] bg-[#EFE7DE] px-1.5 py-0.2 rounded">
                                  {currentSelectedArticle.threadType}
                                </span>
                              )}
                            </div>
                            <p className="font-bold text-sm text-[#2D231E] mt-0.5 break-words">
                              {formData.productName}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setArticleSearchQuery('');
                            setIsArticleSelectorOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-[#8E7E73] hover:text-[#2D231E] bg-[#FAF7F2] hover:bg-[#EFE7DE] rounded-lg border border-[#DFCBB9] transition-colors shrink-0"
                        >
                          Cambiar
                        </button>
                      </div>

                      {/* Info de Costo y Ganancia Unitaria */}
                      {currentSelectedArticle && (
                        <div className="pt-2 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#5C4F47]">
                          <div>
                            <span>Costo material: <b>{formatCurrency(currentSelectedArticle.cost)}</b></span>
                          </div>
                          <div>
                            <span>Precio catálogo: <b>{formatCurrency(currentSelectedArticle.price)}</b></span>
                          </div>
                          <div className="text-[#2E6B4A] font-bold">
                            Ganancia est. u.: +{formatCurrency(currentSelectedArticle.price - currentSelectedArticle.cost)}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Lista / Buscador de Artículos ordenados A-Z */
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7E73]" />
                        <input
                          type="text"
                          placeholder="Buscar artículo A-Z (ej: Bandeja, Cesto, Espejo, Hilo...)"
                          value={articleSearchQuery}
                          onChange={(e) => setArticleSearchQuery(e.target.value)}
                          className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
                        />
                        {articleSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setArticleSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E7E73] hover:text-[#2D231E]"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <div className="max-h-48 sm:max-h-56 overflow-y-auto rounded-xl border border-[#DFCBB9] bg-white divide-y divide-[#F2ECE4] shadow-inner">
                        <div className="px-3 py-1.5 text-[10px] font-bold text-[#8E7E73] bg-[#FAF7F2] uppercase tracking-wider flex items-center justify-between sticky top-0 z-10">
                          <span>
                            {articleSearchQuery
                              ? `Coincidencias (${filteredArticles.length})`
                              : `Artículos disponibles (${filteredArticles.length}) — Orden A-Z`}
                          </span>
                          <span className="text-[9px] font-normal lowercase">click para elegir</span>
                        </div>

                        {filteredArticles.length > 0 ? (
                          filteredArticles.map(a => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => handleSelectArticle(a)}
                              className="w-full text-left p-2.5 hover:bg-[#FAF3EA] transition-colors flex items-center justify-between group gap-2"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-[#FAF0E6] text-[#C86D51] font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-[#C86D51] group-hover:text-white transition-colors">
                                  {a.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="truncate">
                                  <p className="font-bold text-xs text-[#2D231E] group-hover:text-[#C86D51] transition-colors truncate">
                                    {a.name}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-[#7D6E63]">
                                    <span className="bg-[#FAF7F2] px-1.5 py-0.2 rounded border border-[#EFE7DE]">
                                      {a.category}
                                    </span>
                                    {a.threadType && (
                                      <span>• {a.threadType}</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <p className="font-bold text-xs text-[#2E6B4A]">
                                  {formatCurrency(a.price)}
                                </p>
                                <p className="text-[10px] text-[#8E7E73]">
                                  Costo: {formatCurrency(a.cost)}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-[#7D6E63] space-y-1.5">
                            <p>No se encontraron artículos con "{articleSearchQuery}".</p>
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomProductMode(true);
                                setFormData(prev => ({ ...prev, productName: articleSearchQuery }));
                              }}
                              className="text-xs font-bold text-[#C86D51] hover:underline"
                            >
                              + Usar "{articleSearchQuery}" como producto personalizado
                            </button>
                          </div>
                        )}
                      </div>

                      {formData.productName && isArticleSelectorOpen && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setIsArticleSelectorOpen(false)}
                            className="text-[11px] font-semibold text-[#7D6E63] hover:text-[#2D231E]"
                          >
                            Mantener "{formData.productName}"
                          </button>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Categoría y Cantidad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] text-xs font-medium"
                  >
                    {PRODUCT_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Precio Unitario y Medio de Cobro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Precio Unitario ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#8E7E73]">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="38000"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] text-sm font-bold text-[#2D231E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Medio de Cobro *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] text-xs font-medium"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fecha de Venta */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Fecha de Venta *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] text-xs"
                />
              </div>

              {/* Opcional: Venta por Encargo con Seña */}
              <div className="p-3.5 sm:p-4 bg-[#FAF7F2] rounded-2xl border border-[#DFCBB9] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#5C4F47] text-xs flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isCustomOrder}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setFormData(prev => ({
                          ...prev,
                          isCustomOrder: checked,
                          depositAmount: checked && !prev.depositAmount && modalTotalAmount > 0
                            ? (Math.round(modalTotalAmount * 0.5)).toString()
                            : prev.depositAmount,
                          isFullyPaid: false,
                        }));
                      }}
                      className="w-4 h-4 rounded text-[#2E6B4A] focus:ring-[#2E6B4A] border-[#DFCBB9] cursor-pointer"
                    />
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C86D51]" />
                      <span className="text-[#2D231E]">¿Es una pieza por encargo con seña?</span>
                    </div>
                  </label>
                  {formData.isCustomOrder && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF3E0] text-[#E65100] px-2 py-0.5 rounded-full border border-[#FFE0B2]">
                      Por Encargo
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#7D6E63] leading-relaxed">
                  Activá esta opción si te encargaron una pieza personalizada y te dejaron una seña previa, para controlar el saldo pendiente a cobrar cuando esté terminada.
                </p>

                {formData.isCustomOrder && (
                  <div className="pt-2 border-t border-[#EFE7DE] space-y-3 animate-in fade-in duration-150">
                    {/* Input Seña Recibida & Fecha Entrega */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#7D6E63] mb-1">
                          Monto de la Seña Recibida ($) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#8E7E73]">$</span>
                          <input
                            type="number"
                            min="0"
                            placeholder="Ej: 20000"
                            value={formData.depositAmount}
                            onChange={(e) => {
                              const val = e.target.value;
                              const valNum = parseFloat(val) || 0;
                              setFormData(prev => ({
                                ...prev,
                                depositAmount: val,
                                isFullyPaid: modalTotalAmount > 0 && valNum >= modalTotalAmount,
                              }));
                            }}
                            className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-[#DFCBB9] bg-white focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] text-xs font-bold text-[#2D231E]"
                          />
                        </div>

                        {/* Atajos rápidos de porcentaje de seña */}
                        {modalTotalAmount > 0 && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-[#8E7E73]">Sugerir:</span>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                depositAmount: (Math.round(modalTotalAmount * 0.5)).toString(),
                                isFullyPaid: false,
                              }))}
                              className="px-1.5 py-0.5 text-[10px] font-semibold bg-white hover:bg-[#EFE7DE] rounded border border-[#DFCBB9] text-[#5C4F47] transition-colors"
                            >
                              50% ({formatCurrency(Math.round(modalTotalAmount * 0.5))})
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({
                                ...prev,
                                depositAmount: (Math.round(modalTotalAmount * 0.3)).toString(),
                                isFullyPaid: false,
                              }))}
                              className="px-1.5 py-0.5 text-[10px] font-semibold bg-white hover:bg-[#EFE7DE] rounded border border-[#DFCBB9] text-[#5C4F47] transition-colors"
                            >
                              30% ({formatCurrency(Math.round(modalTotalAmount * 0.3))})
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#7D6E63] mb-1">
                          Fecha estimada de entrega (Opcional)
                        </label>
                        <input
                          type="date"
                          value={formData.deliveryDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
                        />
                      </div>
                    </div>

                    {/* Resumen dinámico del encargo */}
                    <div className="p-3 bg-white rounded-xl border border-[#DFCBB9] grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="text-[10px] font-semibold text-[#8E7E73] uppercase">Total Pieza</p>
                        <p className="font-bold text-[#2D231E] mt-0.5">{formatCurrency(modalTotalAmount)}</p>
                      </div>
                      <div className="border-x border-[#F2ECE4]">
                        <p className="text-[10px] font-semibold text-[#2E7D32] uppercase">Seña Cobrada</p>
                        <p className="font-bold text-[#2E7D32] mt-0.5">+{formatCurrency(modalDepositNum)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-[#E65100] uppercase">Saldo Restante</p>
                        <p className={`font-bold mt-0.5 ${modalRemainingBalance > 0 ? 'text-[#E65100]' : 'text-[#2E7D32]'}`}>
                          {modalRemainingBalance > 0 ? formatCurrency(modalRemainingBalance) : '$0 (Saldado)'}
                        </p>
                      </div>
                    </div>

                    {/* Selector de estado del saldo */}
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-[#7D6E63] mb-1.5">
                        Estado actual del pago:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, isFullyPaid: false }))}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            !formData.isFullyPaid
                              ? 'bg-[#FFF8E1] border-[#FFB300] text-[#7A4F01] shadow-2xs font-bold'
                              : 'bg-white border-[#DFCBB9] text-[#7D6E63] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${!formData.isFullyPaid ? 'border-[#FFB300] bg-[#FFB300]' : 'border-[#A8988D]'}`}>
                            {!formData.isFullyPaid && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate">Solo Seña Abonada</p>
                            <p className="text-[10px] font-normal opacity-85">Resta cobrar saldo al entregar</p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, isFullyPaid: true }))}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                            formData.isFullyPaid
                              ? 'bg-[#E8F5E9] border-[#4CAF50] text-[#1B5E20] shadow-2xs font-bold'
                              : 'bg-white border-[#DFCBB9] text-[#7D6E63] hover:bg-[#FAF7F2]'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${formData.isFullyPaid ? 'border-[#4CAF50] bg-[#4CAF50]' : 'border-[#A8988D]'}`}>
                            {formData.isFullyPaid && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate">Pagado 100% (Completado)</p>
                            <p className="text-[10px] font-normal opacity-85">Pieza terminada y cobrada</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Datos de la Compradora / Cliente con Buscador y Directorio */}
              <div className="p-3.5 sm:p-4 bg-[#FAF7F2] rounded-2xl border border-[#DFCBB9] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-[#5C4F47] text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>Clienta / Compradora</span>
                    <span className="text-[10px] text-[#8E7E73] font-normal">({clients.length} registradas)</span>
                  </label>
                  {(isClientAssigned || formData.customerName) && (
                    <button
                      type="button"
                      onClick={handleDeselectClient}
                      className="text-[11px] text-[#C86D51] hover:underline font-semibold"
                    >
                      Desvincular
                    </button>
                  )}
                </div>

                {/* Si ya hay clienta elegida / asignada */}
                {isClientAssigned && formData.customerName ? (
                  <div className="p-3 bg-white rounded-xl border border-[#C8E6C9] shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#E8F5E9] text-[#2E7D32] font-bold flex items-center justify-center text-xs shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-[#2E7D32] uppercase tracking-wider bg-[#E8F5E9] px-1.5 py-0.2 rounded">
                              Clienta Asignada
                            </span>
                          </div>
                          <p className="font-bold text-sm text-[#2D231E]">{formData.customerName}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeselectClient}
                        className="px-2.5 py-1 text-xs font-semibold text-[#8E7E73] hover:text-[#2D231E] bg-[#FAF7F2] hover:bg-[#EFE7DE] rounded-lg border border-[#DFCBB9] transition-colors"
                      >
                        Cambiar
                      </button>
                    </div>

                    <div className="pt-2 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-2 text-xs text-[#5C4F47]">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#8E7E73]" />
                        <span>Tel: <b>{formData.customerPhone || 'Sin teléfono registrado'}</b></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Pestañas: Buscar Registrada o Ingresar Nueva */
                  <div className="space-y-3">
                    <div className="flex rounded-xl bg-[#EFE7DE] p-1 gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setClientMode('search')}
                        className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          clientMode === 'search'
                            ? 'bg-white text-[#2D231E] shadow-2xs'
                            : 'text-[#7D6E63] hover:text-[#2D231E]'
                        }`}
                      >
                        <Search className="w-3.5 h-3.5 text-[#C86D51]" />
                        <span>Buscar Registrada</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setClientMode('manual')}
                        className={`flex-1 py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                          clientMode === 'manual'
                            ? 'bg-white text-[#2D231E] shadow-2xs'
                            : 'text-[#7D6E63] hover:text-[#2D231E]'
                        }`}
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#2E6B4A]" />
                        <span>Nueva Clienta</span>
                      </button>
                    </div>

                    {clientMode === 'search' ? (
                      /* Modo Buscador de Clientas Registradas */
                      <div className="space-y-2">
                        <div className="flex gap-1.5">
                          <div className="relative flex-1">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7E73]" />
                            <input
                              type="text"
                              placeholder="Escribí nombre, apellido o teléfono..."
                              value={clientSearchQuery}
                              onChange={(e) => setClientSearchQuery(e.target.value)}
                              className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
                            />
                            {clientSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setClientSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E7E73] hover:text-[#2D231E]"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setDirectorySearchQuery('');
                              setIsClientDirectoryOpen(true);
                            }}
                            className="px-2.5 py-2 bg-white hover:bg-[#FAF3EA] border border-[#DFCBB9] rounded-xl text-[#7D6E63] hover:text-[#2D231E] text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                            title="Explorar todo el directorio de clientas"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-[#C86D51]" />
                            <span className="hidden sm:inline">Directorio</span>
                          </button>
                        </div>

                        {/* Lista de coincidencias con scroll interno */}
                        <div className="max-h-44 sm:max-h-48 overflow-y-auto rounded-xl border border-[#DFCBB9] bg-white divide-y divide-[#F2ECE4] shadow-inner">
                          {filteredClientsForSearch.length > 0 ? (
                            <>
                              <div className="px-3 py-1.5 text-[10px] font-bold text-[#8E7E73] bg-[#FAF7F2] uppercase tracking-wider flex items-center justify-between sticky top-0">
                                <span>{clientSearchQuery ? `Coincidencias (${filteredClientsForSearch.length})` : `Clientas Registradas (${filteredClientsForSearch.length})`}</span>
                                <span className="text-[9px] font-normal lowercase">click para elegir</span>
                              </div>
                              {filteredClientsForSearch.map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    handleSelectClient(c);
                                    setClientSearchQuery('');
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-[#FAF3EA] transition-colors flex items-center justify-between group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-7 h-7 rounded-full bg-[#FAF0E6] text-[#C86D51] font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-[#C86D51] group-hover:text-white transition-colors">
                                      {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="truncate">
                                      <p className="font-bold text-xs text-[#2D231E] group-hover:text-[#C86D51] transition-colors truncate">
                                        {c.name}
                                      </p>
                                      <p className="text-[11px] text-[#7D6E63] flex items-center gap-1">
                                        <Phone className="w-2.5 h-2.5 text-[#8E7E73]" />
                                        {c.phone}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[11px] font-bold text-[#2E6B4A] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                    Elegir ✓
                                  </span>
                                </button>
                              ))}
                            </>
                          ) : (
                            <div className="p-3.5 text-center text-xs text-[#7D6E63] space-y-1.5">
                              <p>No se encontraron clientas con "{clientSearchQuery}".</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setClientMode('manual');
                                  setFormData(prev => ({ ...prev, customerName: clientSearchQuery }));
                                }}
                                className="text-xs font-bold text-[#C86D51] hover:underline"
                              >
                                + Anotar "{clientSearchQuery}" como nueva clienta
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Modo Nueva Clienta Manual */
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-[#7D6E63] mb-1">
                            Nombre y Apellido *
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Sofia Benitez"
                            value={formData.customerName}
                            onChange={(e) => handleCustomerNameChange(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#7D6E63] mb-1">
                            Teléfono de contacto (Opcional)
                          </label>
                          <div className="relative">
                            <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7E73]" />
                            <input
                              type="tel"
                              placeholder="Ej: 11 4523-9812"
                              value={formData.customerPhone}
                              onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                              className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
                            />
                          </div>
                        </div>

                        {matchingClients.length > 0 && formData.customerName.trim().length >= 3 && !matchedClient && (
                          <div className="p-2.5 bg-[#FFF9E6] border border-[#FFE082] rounded-xl text-xs space-y-1">
                            <p className="text-[11px] font-bold text-[#8D6E00]">
                              ¿Es alguna de estas clientas ya registradas?
                            </p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {matchingClients.slice(0, 3).map(c => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleSelectClient(c)}
                                  className="px-2 py-1 bg-white hover:bg-[#FFE082]/40 rounded-lg text-xs font-semibold text-[#5D4037] border border-[#FFE082] transition-colors"
                                >
                                  {c.name} ({c.phone})
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {formData.customerName.trim().length > 0 && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-[#2E6B4A]">
                              ✓ Se guardará en la libreta de clientas automáticamente
                            </span>
                            <button
                              type="button"
                              onClick={() => setIsClientAssigned(true)}
                              className="text-[11px] font-semibold text-[#2E6B4A] hover:underline"
                            >
                              Fijar como asignada ✓
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notas */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles del encargo, colores de hilo pedidos, lugar de entrega..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] text-xs"
                />
              </div>

            </form>

            {/* Footer Fijo y Siempre Visible */}
            <div className="shrink-0 flex items-center justify-end gap-2.5 sm:gap-3 p-3.5 sm:p-4 border-t border-[#F2ECE4] bg-[#FAF7F2]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-[#7D6E63] hover:bg-[#F2ECE4] rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="sale-form"
                className="px-5 py-2.5 bg-[#2E6B4A] hover:bg-[#25563B] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                {editingSale ? 'Guardar Cambios' : 'Anotar Venta'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal: Directorio Completo de Clientas */}
      {isClientDirectoryOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#DFCBB9] shadow-2xl w-full max-w-md my-auto max-h-[88dvh] flex flex-col overflow-hidden">
            
            {/* Header del Directorio */}
            <div className="shrink-0 p-4 sm:p-5 border-b border-[#F2ECE4] bg-[#FAF7F2] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#C86D51]" />
                <div>
                  <h3 className="font-serif-aurora text-lg font-bold text-[#2D231E]">
                    Directorio de Clientas
                  </h3>
                  <p className="text-[11px] text-[#7D6E63]">
                    {clients.length} contactos registrados
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClientDirectoryOpen(false)}
                className="p-1.5 rounded-full text-[#8E7E73] hover:bg-[#EFE7DE] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Buscador dentro del Directorio */}
            <div className="shrink-0 p-3 bg-white border-b border-[#F2ECE4]">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7E73]" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={directorySearchQuery}
                  onChange={(e) => setDirectorySearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-8 py-2 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                  autoFocus
                />
                {directorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setDirectorySearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E7E73] hover:text-[#2D231E]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Lista scrolleable de clientas */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3 divide-y divide-[#F2ECE4]">
              {filteredClientsForDirectory.length > 0 ? (
                filteredClientsForDirectory.map(c => (
                  <div
                    key={c.id}
                    className="py-2.5 px-2 hover:bg-[#FAF3EA] rounded-xl transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#FAF0E6] text-[#C86D51] font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-[#C86D51] group-hover:text-white transition-colors">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-[#2D231E] group-hover:text-[#C86D51] transition-colors truncate">
                          {c.name}
                        </p>
                        <p className="text-[11px] text-[#7D6E63] flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#8E7E73]" />
                          {c.phone}
                        </p>
                        {c.email && (
                          <p className="text-[10px] text-[#8E7E73] truncate">
                            {c.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleSelectClient(c);
                        setIsClientDirectoryOpen(false);
                      }}
                      className="px-3 py-1.5 bg-[#2E6B4A] hover:bg-[#25563B] text-white text-xs font-semibold rounded-lg shrink-0 transition-colors shadow-2xs"
                    >
                      Elegir
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#7D6E63]">
                  <p>No se encontraron clientas con "{directorySearchQuery}".</p>
                </div>
              )}
            </div>

            {/* Footer del Directorio */}
            <div className="shrink-0 p-3 border-t border-[#F2ECE4] bg-[#FAF7F2] flex items-center justify-between text-xs">
              <span className="text-[#7D6E63]">Mostrando {filteredClientsForDirectory.length} clientas</span>
              <button
                type="button"
                onClick={() => setIsClientDirectoryOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold text-[#7D6E63] hover:bg-[#EFE7DE] rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
