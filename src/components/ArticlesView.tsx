import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Article, ProductCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { 
  Package, 
  PlusCircle, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  X, 
  RotateCcw, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Layers
} from 'lucide-react';

const CATEGORIES: (ProductCategory | 'Todas')[] = [
  'Todas',
  'Armazones Decorados',
  'Canastas',
  'Espejos',
  'Tapices de Pared',
  'Portamacetas',
  'Otros',
];

export const ArticlesView: React.FC = () => {
  const { articles, addArticle, updateArticle, deleteArticle, resetArticlesToExcel } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    category: ProductCategory;
    cost: string;
    price: string;
    threadType: string;
    notes: string;
  }>({
    name: '',
    category: 'Armazones Decorados',
    cost: '',
    price: '',
    threadType: '',
    notes: '',
  });

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      name: '',
      category: 'Armazones Decorados',
      cost: '',
      price: '',
      threadType: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (art: Article) => {
    setEditingArticle(art);
    setFormData({
      name: art.name,
      category: art.category,
      cost: art.cost.toString(),
      price: art.price.toString(),
      threadType: art.threadType || '',
      notes: art.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const costNum = parseFloat(formData.cost) || 0;
    const priceNum = parseFloat(formData.price) || 0;

    if (editingArticle) {
      updateArticle(editingArticle.id, {
        name: formData.name.trim(),
        category: formData.category,
        cost: costNum,
        price: priceNum,
        threadType: formData.threadType.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    } else {
      addArticle({
        name: formData.name.trim(),
        category: formData.category,
        cost: costNum,
        price: priceNum,
        threadType: formData.threadType.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Filter and sort alphabetically
  const filteredArticles = articles
    .filter(art => {
      const matchSearch =
        art.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (art.threadType && art.threadType.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (art.notes && art.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = selectedCategory === 'Todas' || art.category === selectedCategory;
      return matchSearch && matchCat;
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));

  // Metrics
  const totalArticles = articles.length;
  const avgCost = totalArticles > 0 ? Math.round(articles.reduce((acc, a) => acc + a.cost, 0) / totalArticles) : 0;
  const avgPrice = totalArticles > 0 ? Math.round(articles.reduce((acc, a) => acc + a.price, 0) / totalArticles) : 0;
  const avgProfit = Math.max(0, avgPrice - avgCost);
  const avgMargin = avgPrice > 0 ? Math.round((avgProfit / avgPrice) * 100) : 0;

  // Real-time calculation in modal
  const modalCostNum = parseFloat(formData.cost) || 0;
  const modalPriceNum = parseFloat(formData.price) || 0;
  const modalProfit = Math.max(0, modalPriceNum - modalCostNum);
  const modalMargin = modalPriceNum > 0 ? Math.round((modalProfit / modalPriceNum) * 100) : 0;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-[#C86D51]" />
            <h1 className="font-serif-aurora text-3xl font-bold text-[#2D231E]">
              Catálogo de Artículos & Costos
            </h1>
          </div>
          <p className="text-sm text-[#7D6E63] mt-1">
            Administra tus piezas, armazones, insumos y proyectos con su costo y precio de venta
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (window.confirm('¿Deseas restablecer los artículos al catálogo original de tu planilla Excel (17 artículos)?')) {
                resetArticlesToExcel();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-white hover:bg-[#FAF7F2] text-[#7D6E63] text-xs font-semibold shadow-2xs transition-colors"
            title="Cargar artículos base desde el Excel"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C86D51]" />
            <span className="hidden sm:inline">Restablecer desde Excel</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B3583E] text-white text-xs font-bold shadow-md transition-all active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#DFCBB9] shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#8E7E73] uppercase tracking-wider">Artículos</span>
            <Layers className="w-4 h-4 text-[#C86D51]" />
          </div>
          <p className="font-serif-aurora text-2xl font-bold text-[#2D231E]">{totalArticles}</p>
          <span className="text-[11px] text-[#7D6E63]">cargados en catálogo</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DFCBB9] shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#8E7E73] uppercase tracking-wider">Costo Promedio</span>
            <DollarSign className="w-4 h-4 text-[#8E7E73]" />
          </div>
          <p className="font-serif-aurora text-2xl font-bold text-[#7D6E63]">{formatCurrency(avgCost)}</p>
          <span className="text-[11px] text-[#8E7E73]">por pieza o insumo</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DFCBB9] shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#8E7E73] uppercase tracking-wider">Precio Promedio</span>
            <TrendingUp className="w-4 h-4 text-[#2E6B4A]" />
          </div>
          <p className="font-serif-aurora text-2xl font-bold text-[#2E6B4A]">{formatCurrency(avgPrice)}</p>
          <span className="text-[11px] text-[#2E6B4A]/80">precio de venta</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#DFCBB9] shadow-2xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-[#8E7E73] uppercase tracking-wider">Margen Promedio</span>
            <Percent className="w-4 h-4 text-[#C86D51]" />
          </div>
          <p className="font-serif-aurora text-2xl font-bold text-[#C86D51]">{avgMargin}%</p>
          <span className="text-[11px] text-[#C86D51]/80">+{formatCurrency(avgProfit)} por venta</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DFCBB9] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8E7E73]" />
            <input
              type="text"
              placeholder="Buscar artículo por nombre, hilo o detalle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-8 py-2 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E7E73] hover:text-[#2D231E]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar pb-1 sm:pb-0">
            <Filter className="w-3.5 h-3.5 text-[#8E7E73] shrink-0 ml-1" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-[#C86D51] text-white shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#7D6E63] hover:bg-[#EFE7DE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles List / Table */}
      <div className="bg-white rounded-2xl border border-[#DFCBB9] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#F2ECE4] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#5C4F47] uppercase tracking-wider">
              Listado Alfabético ({filteredArticles.length})
            </span>
          </div>
          <span className="text-[11px] text-[#8E7E73]">
            Ordenados de la A a la Z
          </span>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#7D6E63] space-y-2">
            <p>No se encontraron artículos con los filtros aplicados.</p>
            <button
              onClick={handleOpenCreate}
              className="text-xs font-bold text-[#C86D51] hover:underline"
            >
              + Cargar un nuevo artículo
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2]/60 text-[11px] font-bold text-[#7D6E63] border-b border-[#F2ECE4]">
                <tr>
                  <th className="py-3 px-4">Artículo</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-right">Costo ($)</th>
                  <th className="py-3 px-4 text-right">Precio de Venta ($)</th>
                  <th className="py-3 px-4 text-right">Ganancia ($ / %)</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE4]">
                {filteredArticles.map(art => {
                  const profit = Math.max(0, art.price - art.cost);
                  const marginPct = art.price > 0 ? Math.round((profit / art.price) * 100) : 0;

                  return (
                    <tr key={art.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#FAF0E6] text-[#C86D51] font-bold flex items-center justify-center text-xs shrink-0">
                            {art.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#2D231E]">{art.name}</p>
                            {art.threadType && (
                              <span className="inline-block text-[10px] text-[#8E7E73] bg-[#EFE7DE] px-1.5 py-0.2 rounded mt-0.5">
                                {art.threadType}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#7D6E63]">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF3EA] text-[#C86D51] border border-[#DFCBB9]">
                          {art.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#7D6E63]">
                        {formatCurrency(art.cost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#2E6B4A]">
                        {formatCurrency(art.price)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div>
                          <span className="font-bold text-[#2D231E]">+{formatCurrency(profit)}</span>
                          <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] rounded">
                            {marginPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(art)}
                            className="p-1.5 rounded-lg text-[#8E7E73] hover:text-[#2D231E] hover:bg-[#EFE7DE] transition-colors"
                            title="Editar artículo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`¿Eliminar artículo "${art.name}" del catálogo?`)) {
                                deleteArticle(art.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-[#C62828]/70 hover:text-[#C62828] hover:bg-[#FFEBEE] transition-colors"
                            title="Eliminar artículo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Article (Totalmente Responsive) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#DFCBB9] shadow-2xl w-full max-w-md my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header Fijo */}
            <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-[#F2ECE4] bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#C86D51]" />
                <h3 className="font-serif-aurora text-lg sm:text-xl font-bold text-[#2D231E]">
                  {editingArticle ? 'Editar Artículo' : 'Cargar Nuevo Artículo'}
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

            {/* Form Body Scrolleable */}
            <form id="article-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 text-xs">
              
              {/* Nombre */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Nombre del Artículo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Armazon bandeja rectangular, Espejo sol 35cm..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                >
                  <option value="Armazones Decorados">Armazones Decorados</option>
                  <option value="Canastas">Canastas</option>
                  <option value="Espejos">Espejos</option>
                  <option value="Tapices de Pared">Tapices de Pared</option>
                  <option value="Portamacetas">Portamacetas</option>
                  <option value="Llaveros y Souvenirs">Llaveros y Souvenirs</option>
                  <option value="Cortinas y Separadores">Cortinas y Separadores</option>
                  <option value="Encargo Personalizado">Encargo Personalizado</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              {/* Costo y Precio de Venta */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Costo de Insumos ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#8E7E73]">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="3900"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-sm font-bold text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Precio de Venta ($) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[#8E7E73]">$</span>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="7500"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-sm font-bold text-[#2E6B4A] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
                    />
                  </div>
                </div>
              </div>

              {/* Cálculo en vivo de ganancia */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#DFCBB9] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#8E7E73] uppercase tracking-wider block">
                    Ganancia Estimada
                  </span>
                  <p className="font-bold text-sm text-[#2E7D32]">+{formatCurrency(modalProfit)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#8E7E73] uppercase tracking-wider block">
                    Margen
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#E8F5E9] text-[#2E7D32]">
                    {modalMargin}%
                  </span>
                </div>
              </div>

              {/* Tipo de Hilo (Opcional) */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Tipo de Hilo Utilizado (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Hilo papel kraft, Hilo polipropileno 4mm..."
                  value={formData.threadType}
                  onChange={(e) => setFormData({ ...formData, threadType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Notas Adicionales (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Medidas, proveedor del armazón, detalles..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

            </form>

            {/* Footer Fijo y Siempre Visible */}
            <div className="shrink-0 flex items-center justify-end gap-2.5 sm:gap-3 p-3.5 sm:p-4 border-t border-[#F2ECE4] bg-[#FAF7F2]">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 font-bold text-[#7D6E63] hover:bg-[#F2ECE4] rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="article-form"
                className="px-5 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white font-bold rounded-xl shadow-md transition-colors"
              >
                {editingArticle ? 'Guardar Cambios' : 'Guardar Artículo'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
