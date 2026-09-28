import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Workshop } from '../types';
import { formatCurrency, formatDateLong } from '../utils/formatters';
import { CalendarGrid } from './CalendarGrid';
import { WorkshopModal } from './WorkshopModal';
import { ReservationModal } from './ReservationModal';
import { 
  CalendarDays, 
  PlusCircle, 
  Users, 
  MapPin, 
  Clock, 
  Edit3, 
  Trash2, 
  Sparkles,
  Calendar as CalendarIcon,
  ListFilter,
  AlertCircle
} from 'lucide-react';


interface WorkshopsViewProps {
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  selectedWorkshopIdForReservations?: string | null;
  onClearSelectedWorkshop?: () => void;
}

export const WorkshopsView: React.FC<WorkshopsViewProps> = ({
  isCreateModalOpen,
  setIsCreateModalOpen,
  selectedWorkshopIdForReservations,
  onClearSelectedWorkshop,
}) => {
  const { workshops, addWorkshop, updateWorkshop, deleteWorkshop } = useData();

  const [viewMode, setViewMode] = useState<'calendar' | 'cards'>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [activeReservationWorkshop, setActiveReservationWorkshop] = useState<Workshop | null>(() => {
    if (selectedWorkshopIdForReservations) {
      return workshops.find(w => w.id === selectedWorkshopIdForReservations) || null;
    }
    return null;
  });
  const [createWithDate, setCreateWithDate] = useState<string | undefined>(undefined);

  // Sync with selectedWorkshopIdForReservations prop if it changes
  React.useEffect(() => {
    if (selectedWorkshopIdForReservations) {
      const found = workshops.find(w => w.id === selectedWorkshopIdForReservations);
      if (found) setActiveReservationWorkshop(found);
    }
  }, [selectedWorkshopIdForReservations, workshops]);

  // Keep activeReservationWorkshop fresh if reservations update
  const currentActiveWorkshop = activeReservationWorkshop
    ? workshops.find(w => w.id === activeReservationWorkshop.id) || null
    : null;

  const handleOpenCreate = (date?: string) => {
    setEditingWorkshop(null);
    setCreateWithDate(date);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (ws: Workshop) => {
    setEditingWorkshop(ws);
    setIsCreateModalOpen(true);
  };

  const handleSaveWorkshop = (workshopData: any) => {
    if (editingWorkshop) {
      updateWorkshop(editingWorkshop.id, workshopData);
    } else {
      addWorkshop(workshopData);
    }
  };

  // Filtered workshops if a date is clicked
  const filteredWorkshops = selectedDate
    ? workshops.filter(w => w.date === selectedDate)
    : workshops;

  // Calculate statistics
  let totalBooked = 0;
  let totalCapacity = 0;
  let totalDepositsPaid = 0;

  workshops.forEach(w => {
    totalBooked += w.reservations.length;
    totalCapacity += w.maxCapacity;
    w.reservations.forEach(r => {
      if (r.depositStatus === 'Pagada') {
        totalDepositsPaid += r.depositAmount;
      }
    });
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-[#C86D51]" />
            <h1 className="font-serif-aurora text-3xl font-bold text-[#2D231E]">
              Talleres & Calendario de Reservas
            </h1>
          </div>
          <p className="text-sm text-[#7D6E63] mt-1">
            Programa fechas, gestiona cupos máximos, inscribe alumnos y controla el pago de señas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switch View Buttons */}
          <div className="flex items-center bg-[#FAF7F2] border border-[#DFCBB9] p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'calendar'
                  ? 'bg-white text-[#C86D51] shadow-2xs font-bold'
                  : 'text-[#7D6E63] hover:text-[#2D231E]'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Calendario</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-[#C86D51] shadow-2xs font-bold'
                  : 'text-[#7D6E63] hover:text-[#2D231E]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Lista de Talleres</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenCreate()}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-[#C86D51]/25 transition-all hover:shadow-lg active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Taller</span>
          </button>
        </div>
      </div>

      {/* Quick KPI stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8E7E73] uppercase tracking-wider">Talleres Creados</p>
            <p className="text-2xl font-bold text-[#2D231E] mt-0.5">{workshops.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FDF0EB] text-[#C86D51] flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8E7E73] uppercase tracking-wider">Cupos Totales Ocupados</p>
            <p className="text-2xl font-bold text-[#2D231E] mt-0.5">
              {totalBooked} <span className="text-sm font-medium text-[#7D6E63]">/ {totalCapacity}</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#8E7E73] uppercase tracking-wider">Señas Cobradas</p>
            <p className="text-2xl font-bold text-[#2E7D32] mt-0.5">{formatCurrency(totalDepositsPaid)}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FAF3EA] text-[#C86D51] flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main View: Calendar vs Cards */}
      {viewMode === 'calendar' ? (
        <div className="space-y-6">
          <CalendarGrid
            workshops={workshops}
            onSelectWorkshop={(ws) => setActiveReservationWorkshop(ws)}
            onOpenCreateWithDate={(dateStr) => handleOpenCreate(dateStr)}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />

          {/* Selected Date Drawer / Banner */}
          {selectedDate && (
            <div className="p-5 bg-[#FAF7F2] rounded-3xl border border-[#DFCBB9] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-aurora text-xl font-bold text-[#2D231E]">
                    Talleres para el {formatDateLong(selectedDate)}
                  </h3>
                  <p className="text-xs text-[#7D6E63]">
                    {filteredWorkshops.length} taller(es) programados en este día
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenCreate(selectedDate)}
                    className="px-3.5 py-2 bg-[#C86D51] hover:bg-[#B3583E] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Crear Taller en esta fecha</span>
                  </button>
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="px-3 py-2 text-xs font-semibold text-[#8E7E73] hover:text-[#2D231E]"
                  >
                    Ver todos
                  </button>
                </div>
              </div>

              {filteredWorkshops.length === 0 ? (
                <p className="text-xs text-[#8E7E73] italic">
                  No hay talleres en este día. Puedes programar uno con el botón superior.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredWorkshops.map(ws => renderWorkshopCard(ws))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* Cards View (or when 'cards' is selected) */}
      {(viewMode === 'cards' || (!selectedDate && viewMode === 'calendar')) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-aurora text-2xl font-bold text-[#2D231E]">
              Todos los Talleres Programados
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {workshops.map(ws => renderWorkshopCard(ws))}
          </div>
        </div>
      )}

      {/* Workshop Create/Edit Modal */}
      <WorkshopModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingWorkshop(null);
          setCreateWithDate(undefined);
        }}
        onSave={handleSaveWorkshop}
        editingWorkshop={editingWorkshop}
        initialDate={createWithDate}
      />

      {/* Reservation & Attendees Modal */}
      <ReservationModal
        workshop={currentActiveWorkshop}
        isOpen={!!currentActiveWorkshop}
        onClose={() => {
          setActiveReservationWorkshop(null);
          if (onClearSelectedWorkshop) onClearSelectedWorkshop();
        }}
      />

    </div>
  );

  function renderWorkshopCard(ws: Workshop) {
    const booked = ws.reservations.length;
    const capacity = ws.maxCapacity;
    const isFull = booked >= capacity;
    const percent = Math.min(100, Math.round((booked / capacity) * 100));

    const pendingDeposits = ws.reservations.filter(r => r.depositStatus === 'Pendiente').length;

    return (
      <div
        key={ws.id}
        className="bg-white rounded-3xl border border-[#EBE3D7] hover:border-[#DFCBB9] shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
      >
        <div className="p-5 space-y-3.5">
          {/* Top badges */}
          <div className="flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FAF3EA] text-[#C86D51] border border-[#DFCBB9]">
              📅 {formatDateLong(ws.date)}
            </span>
            <span className="text-xs font-semibold text-[#7D6E63] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#C86D51]" />
              {ws.time} hs
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="font-serif-aurora text-xl font-bold text-[#2D231E] leading-snug">
              {ws.title}
            </h3>
            {ws.description && (
              <p className="text-xs text-[#7D6E63] mt-1 line-clamp-2">
                {ws.description}
              </p>
            )}
          </div>

          {/* Price & Location details */}
          <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#F2ECE4] space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#7D6E63]">Arancel por persona:</span>
              <span className="font-bold text-[#2E6B4A]">{formatCurrency(ws.pricePerPerson)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#7D6E63]">Seña requerida:</span>
              <span className="font-bold text-[#C86D51]">{formatCurrency(ws.suggestedDeposit)}</span>
            </div>
            <div className="flex items-center gap-1 text-[#8E7E73] text-[11px] pt-1">
              <MapPin className="w-3 h-3 text-[#7B8E7C] shrink-0" />
              <span className="truncate">{ws.location}</span>
            </div>
          </div>

          {/* Occupancy and pending alerts */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1 text-[#5C4F47]">
                <Users className="w-3.5 h-3.5 text-[#C86D51]" />
                {booked} de {capacity} personas inscriptas
              </span>
              <span className={isFull ? 'text-[#C62828]' : 'text-[#2E7D32]'}>
                {isFull ? 'Cupo Completo' : `${capacity - booked} libres`}
              </span>
            </div>
            <div className="w-full h-2.5 bg-[#EAE2D5] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull ? 'bg-[#C62828]' : percent >= 75 ? 'bg-[#C86D51]' : 'bg-[#7B8E7C]'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            {pendingDeposits > 0 && (
              <p className="text-[11px] font-bold text-[#E65100] mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {pendingDeposits} inscripto(s) con seña pendiente
              </p>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#F2ECE4] flex items-center justify-between gap-2">
          <button
            onClick={() => setActiveReservationWorkshop(ws)}
            className="flex-1 py-2 px-3 bg-[#C86D51] hover:bg-[#B3583E] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Ver Reservas / Inscribir ({booked}/{capacity})</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handleOpenEdit(ws)}
              className="p-2 text-[#8E7E73] hover:text-[#2D231E] hover:bg-white rounded-lg transition-colors"
              title="Editar taller"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (window.confirm(`¿Eliminar taller "${ws.title}"?`)) {
                  deleteWorkshop(ws.id);
                }
              }}
              className="p-2 text-[#C62828]/70 hover:text-[#C62828] hover:bg-[#FFEBEE] rounded-lg transition-colors"
              title="Eliminar taller"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
};
