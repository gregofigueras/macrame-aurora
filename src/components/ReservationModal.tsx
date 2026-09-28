import React, { useState } from 'react';
import type { Workshop, Reservation, DepositStatus, PaymentMethod, Client } from '../types';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDateLong, createWhatsAppWorkshopLink } from '../utils/formatters';
import { exportWorkshopAttendeesToCSV } from '../utils/exportCsv';
import { 
  X, 
  Users, 
  UserPlus, 
  Calendar, 
  MapPin, 
  DollarSign, 
  MessageCircle, 
  CheckCircle2, 
  Clock3, 
  AlertCircle, 
  Trash2, 
  Download, 
  Check, 
  Phone
} from 'lucide-react';

interface ReservationModalProps {
  workshop: Workshop | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  workshop,
  isOpen,
  onClose,
}) => {
  const { clients, addReservation, updateReservation, deleteReservation } = useData();


  // Form states for new reservation
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [depositStatus, setDepositStatus] = useState<DepositStatus>('Pagada');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [depositPaymentMethod, setDepositPaymentMethod] = useState<PaymentMethod>('Transferencia');
  const [notes, setNotes] = useState('');

  // Matching clients based on what's typed in clientName
  const cleanTypedName = clientName.toLowerCase().trim();
  const matchingClients = cleanTypedName
    ? clients.filter(c =>
        c.name.toLowerCase().includes(cleanTypedName) ||
        c.phone.replace(/\D/g, '').includes(cleanTypedName.replace(/\D/g, ''))
      )
    : clients.slice(0, 5);

  const matchedClient = clients.find(
    c => c.name.toLowerCase().trim() === cleanTypedName && cleanTypedName.length > 0
  );

  const handleClientNameChange = (nameVal: string) => {
    setClientName(nameVal);
    const exact = clients.find(c => c.name.toLowerCase().trim() === nameVal.toLowerCase().trim());
    if (exact) {
      setClientPhone(exact.phone);
      if (exact.email) setClientEmail(exact.email);
    }
  };

  const handleSelectClient = (c: Client) => {
    setClientName(c.name);
    setClientPhone(c.phone);
    if (c.email) setClientEmail(c.email);
  };


  // Quick edit deposit modal/state for an attendee
  const [editingDepositResId, setEditingDepositResId] = useState<string | null>(null);
  const [quickDepositAmount, setQuickDepositAmount] = useState<string>('');
  const [quickPaymentMethod, setQuickPaymentMethod] = useState<PaymentMethod>('Transferencia');

  // Error/Success messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  if (!isOpen || !workshop) return null;

  // Initialize deposit amount with workshop suggested deposit when modal opens
  const effectiveSuggestedDeposit = workshop.suggestedDeposit || workshop.pricePerPerson * 0.4;

  const bookedCount = workshop.reservations.length;
  const isFull = bookedCount >= workshop.maxCapacity;
  const availableSpots = Math.max(0, workshop.maxCapacity - bookedCount);
  const occupancyPercent = Math.min(100, Math.round((bookedCount / workshop.maxCapacity) * 100));

  // Totals for workshop
  const totalCollected = workshop.reservations.reduce((acc, r) => {
    return acc + (r.depositStatus === 'Pagada' ? r.depositAmount : 0) + (r.isFullyPaid ? r.remainingBalance : 0);
  }, 0);

  const totalExpected = workshop.reservations.length * workshop.pricePerPerson;
  const totalPendingBalance = Math.max(0, totalExpected - totalCollected);

  const handleAddReservationSubmit = (e: React.FormEvent) => {

    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!clientName.trim() || !clientPhone.trim()) {
      setErrorMessage('Por favor ingresa Nombre, Apellido y Teléfono.');
      return;
    }

    if (isFull) {
      setErrorMessage(`El taller ya alcanzó su capacidad máxima (${workshop.maxCapacity} personas).`);
      return;
    }

    const amountNum = depositStatus === 'Pagada' 
      ? (depositAmount ? parseFloat(depositAmount) : effectiveSuggestedDeposit)
      : 0;

    const result = addReservation(workshop.id, {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientEmail: clientEmail.trim() || undefined,
      depositStatus,
      depositAmount: amountNum,
      depositPaymentMethod: depositStatus === 'Pagada' ? depositPaymentMethod : undefined,
      notes: notes.trim() || undefined,
    });

    if (result.success) {
      setSuccessMessage('¡Reserva agregada con éxito!');
      // Reset form
      setClientName('');
      setClientPhone('');
      setClientEmail('');
      setDepositAmount('');
      setNotes('');
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(result.message);
    }
  };

  const handleQuickPayDeposit = (res: Reservation) => {
    const amount = quickDepositAmount ? parseFloat(quickDepositAmount) : effectiveSuggestedDeposit;
    updateReservation(workshop.id, res.id, {
      depositStatus: 'Pagada',
      depositAmount: amount,
      depositPaymentMethod: quickPaymentMethod,
      depositDate: new Date().toISOString().slice(0, 10),
    });
    setEditingDepositResId(null);
    setQuickDepositAmount('');
  };

  const handleMarkFullyPaid = (res: Reservation) => {
    updateReservation(workshop.id, res.id, {
      isFullyPaid: true,
      remainingBalance: 0,
      depositStatus: 'Pagada',
      depositAmount: res.totalPrice,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-[#DFCBB9] shadow-2xl max-w-4xl w-full overflow-hidden max-h-[94vh] flex flex-col">
        
        {/* Workshop Header & Details */}
        <div className="p-5 sm:p-6 border-b border-[#F2ECE4] bg-gradient-to-r from-[#FAF3EA] via-[#F4EBE1] to-[#FAF7F2]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C86D51] text-white">
                  Taller Macramé
                </span>
                <span className="text-xs font-semibold text-[#7D6E63] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#C86D51]" />
                  {formatDateLong(workshop.date)} • {workshop.time} hs
                </span>
                <span className="text-xs font-semibold text-[#7D6E63] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#7B8E7C]" />
                  {workshop.location}
                </span>
              </div>
              <h2 className="font-serif-aurora text-2xl sm:text-3xl font-bold text-[#2D231E]">
                {workshop.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-[#5C4F47]">
                <span>Precio por Alumno: <b className="text-[#2E6B4A]">{formatCurrency(workshop.pricePerPerson)}</b></span>
                <span>Seña Sugerida: <b className="text-[#C86D51]">{formatCurrency(workshop.suggestedDeposit)}</b></span>
                <span>Recaudado hasta ahora: <b className="text-[#2E7D32]">{formatCurrency(totalCollected)}</b></span>
                {totalPendingBalance > 0 && (
                  <span>Saldo a cobrar en taller: <b className="text-[#E65100]">{formatCurrency(totalPendingBalance)}</b></span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-[#8E7E73] hover:bg-[#EFE7DE] transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Occupancy bar */}
          <div className="mt-4 pt-3 border-t border-[#DFCBB9]/60">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="flex items-center gap-1.5 text-[#5C4F47]">
                <Users className="w-4 h-4 text-[#C86D51]" />
                Cupos: {bookedCount} de {workshop.maxCapacity} inscriptos
              </span>
              <span className={isFull ? 'text-[#C62828]' : 'text-[#2E7D32]'}>
                {isFull ? '¡Cupo Completo!' : `${availableSpots} lugares disponibles`}
              </span>
            </div>
            <div className="w-full h-3 bg-[#EAE2D5] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFull ? 'bg-[#C62828]' : occupancyPercent >= 75 ? 'bg-[#C86D51]' : 'bg-[#7B8E7C]'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Body: Two columns on desktop */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Form to Register & Reserve */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#DFCBB9]">
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#C86D51]" />
                  <h3 className="font-bold text-[#2D231E] text-sm">
                    Inscribir Persona al Taller
                  </h3>
                </div>
                {isFull && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFEBEE] text-[#C62828]">
                    Cupo Lleno
                  </span>
                )}
              </div>

              <form onSubmit={handleAddReservationSubmit} className="space-y-3 text-xs">
                
                {/* Nombre y Apellido con Datalist y Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#5C4F47]">
                      Nombre y Apellido del Alumno *
                    </label>
                    {(clientName || clientPhone) && (
                      <button
                        type="button"
                        onClick={() => {
                          setClientName('');
                          setClientPhone('');
                          setClientEmail('');
                        }}
                        className="text-[11px] text-[#C86D51] hover:underline font-semibold"
                      >
                        Limpiar
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      list="clients-datalist-reservations"
                      placeholder="Ingresa el nombre (ej: Valentina Gomez)..."
                      value={clientName}
                      onChange={(e) => handleClientNameChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                    />
                    <datalist id="clients-datalist-reservations">
                      {clients.map(c => (
                        <option key={c.id} value={c.name}>
                          {c.phone}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Nombres disponibles que coinciden */}
                {matchingClients.length > 0 && !matchedClient && (
                  <div className="space-y-1.5 pt-0.5">
                    <p className="text-[10px] font-bold text-[#8E7E73] uppercase tracking-wider">
                      {clientName.trim()
                        ? `Nombres que coinciden con "${clientName}":`
                        : 'O selecciona un alumno registrado:'}
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

                {/* Alumno confirmado */}
                {matchedClient && (
                  <div className="flex items-center justify-between text-[11px] text-[#2E7D32] bg-[#E8F5E9] px-3 py-1.5 rounded-xl font-medium border border-[#C8E6C9]">
                    <div className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Alumno registrado: <b>{matchedClient.name}</b></span>
                    </div>
                    <span className="text-[10px] text-[#2E7D32]/80">Tel: {matchedClient.phone}</span>
                  </div>
                )}


                {/* Teléfono */}
                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Número de Teléfono (con WhatsApp) *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E7E73]" />
                    <input
                      type="tel"
                      required
                      placeholder="Ej: 11 4523-9812"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                    />
                  </div>
                  <p className="text-[10px] text-[#8E7E73] mt-0.5">
                    Permite enviarle la confirmación y recordatorio por WhatsApp.
                  </p>
                </div>

                {/* Email (opcional) */}
                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Email (Opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="alumno@ejemplo.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                  />
                </div>

                {/* SEÑA: Control Central */}
                <div className="p-3 bg-white rounded-xl border border-[#E8DEC8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[#C86D51] text-xs flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      ¿Pagó la Seña? *
                    </label>
                  </div>

                  {/* Radio buttons for deposit status */}
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setDepositStatus('Pagada');
                        if (!depositAmount) setDepositAmount(effectiveSuggestedDeposit.toString());
                      }}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[11px] text-center transition-all ${
                        depositStatus === 'Pagada'
                          ? 'bg-[#E8F5E9] text-[#2E7D32] border border-[#A5D6A7]'
                          : 'bg-[#FAF7F2] text-[#7D6E63] border border-transparent hover:bg-[#F2ECE4]'
                      }`}
                    >
                      ✓ Sí, pagó
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositStatus('Pendiente')}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[11px] text-center transition-all ${
                        depositStatus === 'Pendiente'
                          ? 'bg-[#FFF3E0] text-[#E65100] border border-[#FFCC80]'
                          : 'bg-[#FAF7F2] text-[#7D6E63] border border-transparent hover:bg-[#F2ECE4]'
                      }`}
                    >
                      ⏳ No pagó aún
                    </button>

                    <button
                      type="button"
                      onClick={() => setDepositStatus('Exenta')}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[11px] text-center transition-all ${
                        depositStatus === 'Exenta'
                          ? 'bg-[#E3F2FD] text-[#1565C0] border border-[#90CAF9]'
                          : 'bg-[#FAF7F2] text-[#7D6E63] border border-transparent hover:bg-[#F2ECE4]'
                      }`}
                    >
                      Sin seña
                    </button>
                  </div>

                  {/* If Pagada, ask for amount and method */}
                  {depositStatus === 'Pagada' && (
                    <div className="pt-2 space-y-2 border-t border-[#F2ECE4]">
                      <div>
                        <label className="block text-[10px] font-bold text-[#5C4F47] mb-1">
                          ¿Cuánto pagó de seña? ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-[#8E7E73]">$</span>
                          <input
                            type="number"
                            min="1"
                            placeholder={effectiveSuggestedDeposit.toString()}
                            value={depositAmount || effectiveSuggestedDeposit}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-[#DFCBB9] bg-[#FAF7F2] text-xs font-bold text-[#2E7D32]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#5C4F47] mb-1">
                          Medio de Pago de la Seña
                        </label>
                        <select
                          value={depositPaymentMethod}
                          onChange={(e) => setDepositPaymentMethod(e.target.value as PaymentMethod)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-[#DFCBB9] bg-[#FAF7F2] text-xs font-medium"
                        >
                          <option value="Transferencia">Transferencia bancaria</option>
                          <option value="Mercado Pago">Mercado Pago</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Tarjeta de Débito/Crédito">Tarjeta</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {depositStatus === 'Pendiente' && (
                    <div className="p-2 rounded-lg bg-[#FFF8E1] text-[#B78103] text-[11px] leading-tight flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>Quedará registrado como pendiente. Podrás registrar el cobro en un clic cuando mande el comprobante.</span>
                    </div>
                  )}
                </div>

                {/* Notas */}
                <div>
                  <label className="block font-bold text-[#5C4F47] mb-1">
                    Notas / Preferencias (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Viene con una amiga, prefiere hilo natural..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#DFCBB9] bg-white text-xs"
                  />
                </div>

                {errorMessage && (
                  <div className="p-2 rounded-lg bg-[#FFEBEE] text-[#C62828] text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                {successMessage && (
                  <div className="p-2 rounded-lg bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold">
                    {successMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isFull}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all ${
                    isFull
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#C86D51] hover:bg-[#B3583E] text-white shadow-[#C86D51]/25 active:scale-98'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isFull ? 'Cupo Completo' : 'Confirmar Reserva'}</span>
                </button>

              </form>

            </div>
          </div>

          {/* Right Column: Attendees List */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C86D51]" />
                <h3 className="font-bold text-[#2D231E] text-sm">
                  Alumnos Inscriptos ({bookedCount})
                </h3>
              </div>

              {workshop.reservations.length > 0 && (
                <button
                  onClick={() => exportWorkshopAttendeesToCSV(workshop)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DFCBB9] bg-white hover:bg-[#FAF7F2] text-xs font-semibold text-[#6D5D53] transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-[#8E7E73]" />
                  <span>Descargar Lista</span>
                </button>
              )}
            </div>

            {workshop.reservations.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#FAF7F2] rounded-2xl border border-dashed border-[#DFCBB9] text-center text-[#8E7E73]">
                <Users className="w-10 h-10 text-[#DFCBB9] mb-2" />
                <p className="font-bold text-[#2D231E]">No hay inscriptos todavía</p>
                <p className="text-xs mt-1">Usa el formulario de la izquierda para registrar a la primera persona.</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {workshop.reservations.map((res, index) => {
                  const waLink = createWhatsAppWorkshopLink(
                    res.clientPhone,
                    res.clientName,
                    workshop.title,
                    workshop.date,
                    workshop.time,
                    res.depositStatus,
                    res.depositAmount,
                    res.remainingBalance
                  );

                  const isEditingDeposit = editingDepositResId === res.id;

                  return (
                    <div
                      key={res.id}
                      className="p-4 bg-white rounded-2xl border border-[#EBE3D7] shadow-2xs space-y-3 transition-all hover:border-[#DFCBB9]"
                    >
                      {/* Top attendee header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#FAF3EA] text-[#C86D51] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-bold text-[#2D231E] text-sm">
                              {res.clientName}
                            </p>
                            <p className="text-xs text-[#7D6E63] flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3 text-[#C86D51]" />
                              {res.clientPhone}
                            </p>
                            {res.notes && (
                              <p className="text-[11px] text-[#8E7E73] italic mt-1 bg-[#FAF7F2] px-2 py-0.5 rounded-md">
                                Nota: {res.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="shrink-0 text-right">
                          {res.isFullyPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                              <CheckCircle2 className="w-3 h-3" />
                              100% Pagado
                            </span>
                          ) : res.depositStatus === 'Pagada' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                              <CheckCircle2 className="w-3 h-3" />
                              Seña Abonada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                              <Clock3 className="w-3 h-3" />
                              Seña Pendiente
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Financial info for this reservation */}
                      <div className="flex flex-wrap items-center justify-between text-xs p-2.5 bg-[#FAF7F2] rounded-xl border border-[#F2ECE4] gap-2">
                        <div>
                          <span className="text-[#7D6E63]">Seña Pagada: </span>
                          <span className={`font-bold ${res.depositAmount > 0 ? 'text-[#2E7D32]' : 'text-[#C62828]'}`}>
                            {formatCurrency(res.depositAmount)}
                          </span>
                          {res.depositPaymentMethod && (
                            <span className="text-[10px] text-[#8E7E73] ml-1">({res.depositPaymentMethod})</span>
                          )}
                        </div>

                        <div>
                          <span className="text-[#7D6E63]">Resta Abonar: </span>
                          <span className={`font-bold ${res.remainingBalance > 0 ? 'text-[#E65100]' : 'text-[#2E7D32]'}`}>
                            {formatCurrency(res.remainingBalance)}
                          </span>
                        </div>
                      </div>

                      {/* Quick pay deposit inline box if opened */}
                      {isEditingDeposit && (
                        <div className="p-3 bg-[#FFF9F5] border border-[#DFCBB9] rounded-xl space-y-2 animate-in fade-in">
                          <p className="text-xs font-bold text-[#C86D51]">
                            Registrar Cobro de Seña para {res.clientName}:
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <input
                              type="number"
                              placeholder={`Monto (ej: ${effectiveSuggestedDeposit})`}
                              value={quickDepositAmount}
                              onChange={(e) => setQuickDepositAmount(e.target.value)}
                              className="px-2.5 py-1.5 rounded-lg border border-[#DFCBB9] bg-white font-bold"
                            />
                            <select
                              value={quickPaymentMethod}
                              onChange={(e) => setQuickPaymentMethod(e.target.value as PaymentMethod)}
                              className="px-2.5 py-1.5 rounded-lg border border-[#DFCBB9] bg-white"
                            >
                              <option value="Transferencia">Transferencia</option>
                              <option value="Mercado Pago">Mercado Pago</option>
                              <option value="Efectivo">Efectivo</option>
                              <option value="Tarjeta de Débito/Crédito">Tarjeta</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingDepositResId(null)}
                              className="px-3 py-1 text-xs text-[#7D6E63] hover:underline"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuickPayDeposit(res)}
                              className="px-3 py-1 bg-[#2E7D32] hover:bg-[#1B5E20] text-white text-xs font-bold rounded-lg"
                            >
                              Confirmar Cobro
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {res.depositStatus === 'Pendiente' && !isEditingDeposit && (
                            <button
                              onClick={() => {
                                setEditingDepositResId(res.id);
                                setQuickDepositAmount(effectiveSuggestedDeposit.toString());
                              }}
                              className="px-2.5 py-1 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2E7D32] text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Registrar Seña</span>
                            </button>
                          )}

                          {!res.isFullyPaid && (
                            <button
                              onClick={() => handleMarkFullyPaid(res)}
                              className="px-2.5 py-1 bg-[#FAF3EA] hover:bg-[#F2ECE4] text-[#93452E] text-xs font-semibold rounded-lg transition-colors"
                              title="Marcar que abonó el 100% del arancel"
                            >
                              Cobrar Saldo Total
                            </button>
                          )}

                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2.5 py-1 bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs rounded-lg transition-colors"
                            title="Enviar mensaje de WhatsApp con estado de seña y detalles"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm(`¿Quitar la reserva de ${res.clientName}?`)) {
                              deleteReservation(workshop.id, res.id);
                            }
                          }}
                          className="p-1.5 text-[#C62828]/60 hover:text-[#C62828] hover:bg-[#FFEBEE] rounded-lg transition-colors"
                          title="Eliminar reserva"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
