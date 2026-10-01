import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Sale, ProductCategory, PaymentMethod, Client } from '../types';
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
  BookOpen
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
  const { sales, clients, addSale, updateSale, deleteSale } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  // Client search mode and query
  const [clientMode, setClientMode] = useState<'search' | 'manual'>('search');
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [isClientDirectoryOpen, setIsClientDirectoryOpen] = useState(false);
  const [directorySearchQuery, setDirectorySearchQuery] = useState('');

  // Form state
  const [formData, setFormData] = useState<{
    productName: string;
    category: ProductCategory;
    quantity: number;
    unitPrice: string;
    date: string;
    paymentMethod: PaymentMethod;
    customerName: string;
    customerPhone: string;
    notes: string;
  }>({
    productName: '',
    category: 'Canastas',
    quantity: 1,
    unitPrice: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Transferencia',
    customerName: '',
    customerPhone: '',
    notes: '',
  });

  const handleOpenCreate = () => {
    setEditingSale(null);
    setClientMode('search');
    setClientSearchQuery('');
    setFormData({
      productName: '',
      category: 'Canastas',
      quantity: 1,
      unitPrice: '',
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Transferencia',
      customerName: '',
      customerPhone: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sale: Sale) => {
    setEditingSale(sale);
    setClientSearchQuery('');
    setClientMode(sale.customerName ? 'search' : 'search');
    setFormData({
      productName: sale.productName,
      category: sale.category,
      quantity: sale.quantity,
      unitPrice: sale.unitPrice.toString(),
      date: sale.date,
      paymentMethod: sale.paymentMethod,
      customerName: sale.customerName || '',
      customerPhone: sale.customerPhone || '',
      notes: sale.notes || '',
    });
    setIsModalOpen(true);
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.unitPrice) return;

    const unitPriceNum = parseFloat(formData.unitPrice);
    if (isNaN(unitPriceNum) || unitPriceNum <= 0) return;

    const qty = Number(formData.quantity) || 1;
    const totalAmount = unitPriceNum * qty;

    if (editingSale) {
      updateSale(editingSale.id, {
        productName: formData.productName,
        category: formData.category,
        quantity: qty,
        unitPrice: unitPriceNum,
        totalAmount,
        estimatedCost: editingSale.estimatedCost,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        customerName: formData.customerName.trim() || undefined,
        customerPhone: formData.customerPhone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    } else {
      addSale({
        productName: formData.productName,
        category: formData.category,
        quantity: qty,
        unitPrice: unitPriceNum,
        totalAmount,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        customerName: formData.customerName.trim() || undefined,
        customerPhone: formData.customerPhone.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
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

    return matchesSearch && matchesCategory;
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

        <div className="flex items-center gap-2">
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
      </div>

      {/* Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-[#E8F5E9] rounded-xl border border-[#C8E6C9] text-xs font-medium text-[#2E7D32]">
        <span>Mostrando <b>{filteredSales.length}</b> ventas registradas</span>
        <div className="flex items-center gap-4">
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
                  <th className="py-3 px-4 text-right">Total</th>
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
                      <p className="font-bold text-[#2D231E]">{sale.productName}</p>
                      {sale.notes && (
                        <p className="text-[11px] text-[#8E7E73] italic mt-0.5">{sale.notes}</p>
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
                    <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-sm text-[#2E6B4A]">
                      +{formatCurrency(sale.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
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
              
              {/* Producto */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Nombre de la Pieza / Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Espejo Sol Bohemio 35cm, Canasta organizadora, Armazón decorado..."
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A] text-sm"
                />
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

              {/* Datos de la Compradora / Cliente con Buscador y Directorio */}
              <div className="p-3.5 sm:p-4 bg-[#FAF7F2] rounded-2xl border border-[#DFCBB9] space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="font-bold text-[#5C4F47] text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>Clienta / Compradora</span>
                    <span className="text-[10px] text-[#8E7E73] font-normal">({clients.length} registradas)</span>
                  </label>
                  {formData.customerName && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, customerName: '', customerPhone: '' }));
                        setClientSearchQuery('');
                        setClientMode('search');
                      }}
                      className="text-[11px] text-[#C86D51] hover:underline font-semibold"
                    >
                      Desvincular
                    </button>
                  )}
                </div>

                {/* Si ya hay clienta elegida / asignada */}
                {formData.customerName ? (
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
                        onClick={() => {
                          setFormData(prev => ({ ...prev, customerName: '', customerPhone: '' }));
                          setClientSearchQuery('');
                          setClientMode('search');
                        }}
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
