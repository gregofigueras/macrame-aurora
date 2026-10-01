import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import type { Client } from '../types';
import { cleanPhoneForWhatsApp } from '../utils/formatters';
import { 
  Users, 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  MessageCircle, 
  CalendarDays, 
  ShoppingBag, 
  Trash2, 
  Edit3, 
  X
} from 'lucide-react';


export const ClientsView: React.FC = () => {
  const { clients, workshops, sales, addClient, updateClient, deleteClient } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({ name: '', phone: '', email: '', notes: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      notes: client.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    if (editingClient) {
      updateClient(editingClient.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    } else {
      addClient({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  // Find workshops and sales for each client
  const getClientHistory = (client: Client) => {
    const clientPhoneClean = client.phone.replace(/\D/g, '');
    const clientNameLower = client.name.toLowerCase();

    // Workshop reservations
    const clientWorkshops: { title: string; date: string; depositStatus: string }[] = [];
    workshops.forEach(w => {
      w.reservations.forEach(r => {
        if (
          r.clientId === client.id ||
          r.clientName.toLowerCase() === clientNameLower ||
          (clientPhoneClean && r.clientPhone.replace(/\D/g, '').includes(clientPhoneClean))
        ) {
          clientWorkshops.push({
            title: w.title,
            date: w.date,
            depositStatus: r.depositStatus,
          });
        }
      });
    });

    // Product purchases
    const clientPurchases: { productName: string; date: string }[] = [];
    sales.forEach(s => {
      if (
        (s.customerName && s.customerName.toLowerCase() === clientNameLower) ||
        (s.customerPhone && clientPhoneClean && s.customerPhone.replace(/\D/g, '').includes(clientPhoneClean))
      ) {
        clientPurchases.push({
          productName: s.productName,
          date: s.date,
        });
      }
    });

    return { workshops: clientWorkshops, purchases: clientPurchases };
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#C86D51]" />
            <h1 className="font-serif-aurora text-3xl font-bold text-[#2D231E]">
              Alumnos & Directorio de Clientes
            </h1>
          </div>
          <p className="text-sm text-[#7D6E63] mt-1">
            Personas registradas para talleres y compradoras de piezas de macramé
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-[#C86D51]/25 transition-all hover:shadow-lg active:scale-98 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Persona</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#EBE3D7] shadow-2xs flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8988D]" />
          <input
            type="text"
            placeholder="Buscar persona por Nombre y Apellido o Teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-[#DFCBB9] focus:outline-none focus:ring-2 focus:ring-[#C86D51] bg-[#FAF7F2]"
          />
        </div>
        <span className="text-xs font-semibold text-[#8E7E73] ml-4 shrink-0">
          {filteredClients.length} personas
        </span>
      </div>

      {/* Grid of Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => {
          const history = getClientHistory(client);
          const cleanPhone = cleanPhoneForWhatsApp(client.phone);
          const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
            `¡Hola ${client.name}! ✨ Te saludamos desde Macramé Aurora 🌿 ¿Cómo estás?`
          )}`;

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl border border-[#EBE3D7] p-5 shadow-2xs hover:border-[#DFCBB9] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF3EA] text-[#C86D51] font-bold text-sm flex items-center justify-center border border-[#E8DEC8]">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2D231E] text-base">
                        {client.name}
                      </h3>
                      <p className="text-xs text-[#7D6E63] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#C86D51]" />
                        {client.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="p-1.5 text-[#8E7E73] hover:text-[#2D231E] hover:bg-[#FAF7F2] rounded-lg"
                      title="Editar contacto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar contacto de ${client.name}?`)) {
                          deleteClient(client.id);
                        }
                      }}
                      className="p-1.5 text-[#C62828]/60 hover:text-[#C62828] hover:bg-[#FFEBEE] rounded-lg"
                      title="Eliminar contacto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {client.email && (
                  <p className="text-xs text-[#8E7E73] flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[#8E7E73]" />
                    {client.email}
                  </p>
                )}

                {client.notes && (
                  <p className="text-xs text-[#7D6E63] bg-[#FAF7F2] p-2 rounded-lg italic">
                    {client.notes}
                  </p>
                )}

                {/* History summary */}
                <div className="pt-2 border-t border-[#F2ECE4] space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[#7D6E63]">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-[#C86D51]" />
                      Talleres inscriptos:
                    </span>
                    <span className="font-bold text-[#2D231E]">
                      {history.workshops.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#7D6E63]">
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-[#2E6B4A]" />
                      Piezas compradas:
                    </span>
                    <span className="font-bold text-[#2D231E]">
                      {history.purchases.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action: WhatsApp button */}
              <div className="mt-4 pt-3 border-t border-[#F2ECE4]">
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs rounded-xl transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chatear por WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add/Edit Client - Totalmente Responsive en PC y Celular */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-[#DFCBB9] shadow-2xl w-full max-w-md my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Header Fijo */}
            <div className="shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-[#F2ECE4] bg-[#FAF7F2]">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#C86D51]" />
                <h3 className="font-serif-aurora text-lg sm:text-xl font-bold text-[#2D231E]">
                  {editingClient ? 'Editar Contacto' : 'Registrar Persona'}
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
            <form id="client-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-3.5 sm:space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sofia Benitez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Número de Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ej: 11 3298-7410"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-sm focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Correo Electrónico (Opcional)
                </label>
                <input
                  type="email"
                  placeholder="alumno@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFCBB9] bg-[#FAF7F2] text-xs focus:outline-none focus:ring-2 focus:ring-[#C86D51]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#5C4F47] mb-1">
                  Notas / Observaciones
                </label>
                <textarea
                  rows={2}
                  placeholder="Preferencias, tipo de nudo favorito, ciudad..."
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
                form="client-form"
                className="px-5 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white font-bold rounded-xl shadow-md transition-colors"
              >
                {editingClient ? 'Guardar Cambios' : 'Registrar Persona'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
