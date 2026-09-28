import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

import { exportExpensesToCSV } from '../utils/exportCsv';
import { 
  Receipt, 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit3, 
  X
} from 'lucide-react';


const CATEGORIES: ExpenseCategory[] = [
  'Armazones',
  'Hilos y Cordones',
  'Espejos',
  'Herrajes y Accesorios',
  'Herramientas',
  'Packaging y Bolsas',
  'Insumos de Taller',
  'Otros',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Transferencia',
  'Mercado Pago',
  'Efectivo',
  'Tarjeta de Débito/Crédito',
  'Otro',
];

interface ExpensesViewProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    concept: string;
    category: ExpenseCategory;
    amount: string;
    date: string;
    supplier: string;
    paymentMethod: PaymentMethod;
    notes: string;
  }>({
    concept: '',
    category: 'Armazones',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    supplier: '',
    paymentMethod: 'Transferencia',
    notes: '',
  });

  const handleOpenCreate = () => {
    setEditingExpense(null);
    setFormData({
      concept: '',
      category: 'Armazones',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      supplier: '',
      paymentMethod: 'Transferencia',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      concept: expense.concept,
      category: expense.category,
      amount: expense.amount.toString(),
      date: expense.date,
      supplier: expense.supplier || '',
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.concept || !formData.amount) return;

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        concept: formData.concept,
        category: formData.category,
        amount: amountNum,
        date: formData.date,
        supplier: formData.supplier || undefined,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
      });
    } else {
      addExpense({
        concept: formData.concept,
        category: formData.category,
        amount: amountNum,
        date: formData.date,
        supplier: formData.supplier || undefined,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered expenses
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch =
      exp.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exp.supplier && exp.supplier.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'Todas' || exp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const totalFilteredAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Group amounts by category for quick summary pills
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="w-6 h-6 text-[#C86D51]" />
            <h1 className="font-serif-aurora text-3xl font-bold text-[#2D231E]">
              Control de Gastos y Materiales
            </h1>
          </div>
          <p className="text-sm text-[#7D6E63] mt-1">
            Registra compras de armazones, hilos, espejos, herrajes y elementos del taller
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportExpensesToCSV(filteredExpenses)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-white hover:bg-[#FAF7F2] text-[#6D5D53] text-xs font-semibold shadow-2xs transition-colors"
            title="Exportar a archivo Excel CSV"
          >
            <Download className="w-4 h-4 text-[#8E7E73]" />
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-[#C86D51]/25 transition-all hover:shadow-lg active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Anotar Gasto</span>
          </button>
        </div>
      </div>

      {/* Category Pills Quick Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Armazones', 'Hilos y Cordones', 'Espejos', 'Insumos de Taller'].map(cat => (
          <div 
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? 'Todas' : cat)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedCategory === cat
                ? 'bg-[#C86D51] text-white border-[#C86D51] shadow-xs'
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

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBE3D7] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8988D]" />
          <input
            type="text"
            placeholder="Buscar por concepto (ej: hilos, armazones 30cm), proveedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#DFCBB9] focus:outline-none focus:ring-2 focus:ring-[#C86D51] focus:border-transparent bg-[#FAF7F2]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8E7E73] shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold text-[#5C4F47] py-2 px-3 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
          >
            <option value="Todas">Todas las Categorías</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Banner for filtered items */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAF3EA] rounded-xl border border-[#DFCBB9] text-xs font-medium text-[#6D5D53]">
        <span>Mostrando <b>{filteredExpenses.length}</b> gastos registrados</span>
        <span className="text-sm font-bold text-[#C62828]">
          Total: {formatCurrency(totalFilteredAmount)}
        </span>
      </div>

      {/* Expenses Table / List */}
      <div className="bg-white rounded-2xl border border-[#EBE3D7] overflow-hidden shadow-2xs">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-[#8E7E73]">
            <Receipt className="w-10 h-10 mx-auto text-[#DFCBB9] mb-2" />
            <p className="font-semibold text-[#2D231E]">No se encontraron gastos</p>
            <p className="text-xs mt-1">Prueba cambiando los filtros o anota un nuevo gasto con el botón superior.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] border-b border-[#EBE3D7] text-[11px] font-bold text-[#7D6E63] uppercase tracking-wider">
                  <th className="py-3 px-4">Fecha</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Concepto / Detalle</th>
                  <th className="py-3 px-4">Proveedor</th>
                  <th className="py-3 px-4">Medio de Pago</th>
                  <th className="py-3 px-4 text-right">Monto</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4] text-xs">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-[#5C4F47]">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5EFEB] text-[#795548] border border-[#E8DEC8]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#2D231E]">{exp.concept}</p>
                      {exp.notes && (
                        <p className="text-[11px] text-[#8E7E73] italic mt-0.5">{exp.notes}</p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#6D5D53] whitespace-nowrap">
                      {exp.supplier || '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-[11px] text-[#5C4F47] bg-[#EFE7DE] px-2 py-0.5 rounded-md font-medium">
                        {exp.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-sm text-[#C62828]">
                      -{formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          className="p-1.5 rounded-lg text-[#8E7E73] hover:text-[#2D231E] hover:bg-[#F2ECE4] transition-colors"
                          title="Editar gasto"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar gasto "${exp.concept}"?`)) {
                              deleteExpense(exp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-[#C62828]/70 hover:text-[#C62828] hover:bg-[#FFEBEE] transition-colors"
                          title="Eliminar gasto"
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

      {/* Modal: Add / Edit Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#DFCBB9] shadow-2xl max-w-lg w-full overflow-hidden">
            
            <div className="flex items-center justify-between p-5 border-b border-[#F2ECE4] bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#C86D51]" />
                <h3 className="font-serif-aurora text-xl font-bold text-[#2D231E]">
                  {editingExpense ? 'Editar Gasto' : 'Anotar Nuevo Gasto'}
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
              
              {/* Concepto */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Concepto / Detalle del Material *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 10 Armazones circulares 30cm, Bobina cordón algodón 4mm..."
                  value={formData.concept}
                  onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-sm"
                />
              </div>

              {/* Categoría y Monto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Categoría *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs font-medium"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Monto ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#8E7E73]">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="25000"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-sm font-bold text-[#2D231E]"
                    />
                  </div>
                </div>
              </div>

              {/* Fecha y Medio de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Fecha de Compra *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Medio de Pago *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs font-medium"
                  >
                    {PAYMENT_METHODS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Proveedor */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Proveedor / Comercio (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Herrería San Martín, Hilandería Textil, Vidriería..."
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Notas Adicionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles de calidad, número de comprobante, medidas..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs"
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
                  className="px-5 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  {editingExpense ? 'Guardar Cambios' : 'Anotar Gasto'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
