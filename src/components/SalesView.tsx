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
  Check
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

  // Matching clients based on what's typed in customerName
  const cleanTypedName = formData.customerName.toLowerCase().trim();
  const matchingClients = cleanTypedName
    ? clients.filter(c =>
        c.name.toLowerCase().includes(cleanTypedName) ||
        c.phone.replace(/\D/g, '').includes(cleanTypedName.replace(/\D/g, ''))
      )
    : clients.slice(0, 6);

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

      {/* Modal: Add / Edit Sale */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#DFCBB9] shadow-2xl max-w-lg w-full overflow-hidden">
            
            <div className="flex items-center justify-between p-5 border-b border-[#F2ECE4] bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#2E6B4A]" />
                <h3 className="font-serif-aurora text-xl font-bold text-[#2D231E]">
                  {editingSale ? 'Editar Venta' : 'Anotar Nueva Venta'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-[#8E7E73] hover:bg-[#EFE7DE] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              
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

              {/* Datos de la Compradora con Datalist y Selección Dinámica de Nombres */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#DFCBB9] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#5C4F47] text-xs flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span>Datos de la Compradora / Cliente</span>
                  </label>
                  {(formData.customerName || formData.customerPhone) && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, customerName: '', customerPhone: '' }))}
                      className="text-[11px] text-[#C86D51] hover:underline font-semibold"
                    >
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Input de Nombre con Datalist integrado */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#7D6E63] mb-1">
                    Nombre y Apellido
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="clients-datalist-sales"
                      placeholder="Ingresa el nombre (ej: Valentina Gomez)..."
                      value={formData.customerName}
                      onChange={(e) => handleCustomerNameChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-white text-xs text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
                    />
                    <datalist id="clients-datalist-sales">
                      {clients.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.phone}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Nombres disponibles que coinciden a medida que se escribe */}
                {matchingClients.length > 0 && !matchedClient && (
                  <div className="space-y-1.5 pt-0.5">
                    <p className="text-[10px] font-bold text-[#8E7E73] uppercase tracking-wider">
                      {formData.customerName.trim()
                        ? `Nombres que coinciden con "${formData.customerName}":`
                        : 'O selecciona una clienta registrada:'}
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {matchingClients.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectClient(c)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-[#FAF3EA] text-[#2D231E] hover:text-[#C86D51] border border-[#DFCBB9] shadow-2xs transition-all hover:scale-[1.02] active:scale-98"
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] text-[#8E7E73]">({c.phone})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clienta confirmada / vinculada */}
                {matchedClient && (
                  <div className="flex items-center justify-between text-[11px] text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-xl font-medium border border-[#C8E6C9]">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Clienta vinculada: <b>{matchedClient.name}</b></span>
                    </div>
                    <span className="text-[10px] text-[#2E7D32]/80">Tel: {matchedClient.phone}</span>
                  </div>
                )}

                {/* Teléfono */}
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
                      className="w-full pl-8.5 pr-3 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
                    />
                  </div>
                </div>
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

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F2ECE4]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#7D6E63] hover:bg-[#F2ECE4] rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2E6B4A] hover:bg-[#25563B] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  {editingSale ? 'Guardar Cambios' : 'Anotar Venta'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
