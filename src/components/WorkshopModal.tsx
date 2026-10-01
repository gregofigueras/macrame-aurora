import React, { useState, useEffect } from 'react';
import type { Workshop, WorkshopStatus } from '../types';
import { X, CalendarDays } from 'lucide-react';


interface WorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (workshopData: {
    title: string;
    date: string;
    time: string;
    durationHours: number;
    location: string;
    maxCapacity: number;
    pricePerPerson: number;
    suggestedDeposit: number;
    description: string;
    status: WorkshopStatus;
  }) => void;
  editingWorkshop: Workshop | null;
  initialDate?: string;
}

export const WorkshopModal: React.FC<WorkshopModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingWorkshop,
  initialDate,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    date: initialDate || new Date().toISOString().slice(0, 10),
    time: '15:30',
    durationHours: 3.5,
    location: 'Showroom Aurora - Palermo',
    maxCapacity: 8,
    pricePerPerson: 32000,
    suggestedDeposit: 12000,
    description: '',
    status: 'Programado' as WorkshopStatus,
  });

  useEffect(() => {
    if (editingWorkshop) {
      setFormData({
        title: editingWorkshop.title,
        date: editingWorkshop.date,
        time: editingWorkshop.time,
        durationHours: editingWorkshop.durationHours || 3.5,
        location: editingWorkshop.location || 'Showroom Aurora',
        maxCapacity: editingWorkshop.maxCapacity,
        pricePerPerson: editingWorkshop.pricePerPerson,
        suggestedDeposit: editingWorkshop.suggestedDeposit,
        description: editingWorkshop.description || '',
        status: editingWorkshop.status,
      });
    } else if (initialDate) {
      setFormData(prev => ({
        ...prev,
        date: initialDate,
      }));
    }
  }, [editingWorkshop, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) return;

    onSave({
      title: formData.title,
      date: formData.date,
      time: formData.time,
      durationHours: Number(formData.durationHours) || 3,
      location: formData.location,
      maxCapacity: Number(formData.maxCapacity) || 8,
      pricePerPerson: Number(formData.pricePerPerson) || 0,
      suggestedDeposit: Number(formData.suggestedDeposit) || 0,
      description: formData.description,
      status: formData.status,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#DFCBB9] shadow-2xl w-full max-w-xl my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header Fijo */}
        <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-[#F2ECE4] bg-[#FAF7F2]">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#C86D51]" />
            <h3 className="font-serif-aurora text-lg sm:text-xl font-bold text-[#2D231E]">
              {editingWorkshop ? 'Editar Taller' : 'Programar Nuevo Taller'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8E7E73] hover:bg-[#EFE7DE] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body Scrolleable */}
        <form id="workshop-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-xs">
          
          {/* Título */}
          <div>
            <label className="block font-bold text-[#5C4F47] mb-1">
              Nombre / Temática del Taller *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Taller Espejo Sol Bohemio con Flecos, Iniciación al Macramé..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-sm font-semibold"
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#5C4F47] mb-1">
                Fecha del Taller *
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
                Hora de Inicio *
              </label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-[#5C4F47] mb-1">
                Duración (Horas)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={formData.durationHours}
                onChange={(e) => setFormData({ ...formData, durationHours: parseFloat(e.target.value) || 3 })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs"
              />
            </div>
          </div>

          {/* Cupo Máximo y Precios */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DFCBB9]">
              <label className="block font-bold text-[#C86D51] mb-1">
                Cupo Máximo (Personas) *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-1.5 rounded-lg border border-[#DFCBB9] bg-white text-sm font-bold text-[#2D231E] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
              <p className="text-[10px] text-[#8E7E73] mt-1">Límite de asistentes</p>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DFCBB9]">
              <label className="block font-bold text-[#5C4F47] mb-1">
                Precio Total Alumno ($) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.pricePerPerson}
                onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 rounded-lg border border-[#DFCBB9] bg-white text-sm font-bold text-[#2E6B4A] focus:outline-none focus:ring-2 focus:ring-[#2E6B4A]"
              />
              <p className="text-[10px] text-[#8E7E73] mt-1">Arancel total</p>
            </div>

            <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#DFCBB9]">
              <label className="block font-bold text-[#5C4F47] mb-1">
                Seña Sugerida ($) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={formData.suggestedDeposit}
                onChange={(e) => setFormData({ ...formData, suggestedDeposit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-1.5 rounded-lg border border-[#DFCBB9] bg-white text-sm font-bold text-[#C86D51] focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
              />
              <p className="text-[10px] text-[#8E7E73] mt-1">Monto para reservar</p>
            </div>
          </div>

          {/* Ubicación y Estado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#5C4F47] mb-1">
                Ubicación / Modalidad
              </label>
              <input
                type="text"
                placeholder="Showroom Aurora - Palermo"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#5C4F47] mb-1">
                Estado del Taller
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkshopStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs font-semibold"
              >
                <option value="Programado">Programado</option>
                <option value="En Curso">En Curso</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block font-bold text-[#5C4F47] mb-1">
              Descripción y Materiales Incluidos
            </label>
            <textarea
              rows={3}
              placeholder="Detalla qué incluye (hilos, armazones, merienda) y qué se van a llevar..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] focus:outline-none focus:ring-2 focus:ring-[#C86D51] text-xs"
            />
          </div>

        </form>

        {/* Footer Fijo y Siempre Visible */}
        <div className="shrink-0 flex items-center justify-end gap-2.5 sm:gap-3 p-3.5 sm:p-4 border-t border-[#F2ECE4] bg-[#FAF7F2]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-[#7D6E63] hover:bg-[#F2ECE4] rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="workshop-form"
            className="px-5 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white text-xs font-bold rounded-xl shadow-md transition-colors"
          >
            {editingWorkshop ? 'Guardar Cambios' : 'Crear Taller'}
          </button>
        </div>

      </div>
    </div>
  );
};
