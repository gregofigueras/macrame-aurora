export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatDateLong = (dateStr: string): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const cleanPhoneForWhatsApp = (rawPhone: string): string => {
  let cleaned = rawPhone.replace(/\D/g, '');
  
  // If Argentina local mobile number without country code (e.g. 11 1234 5678 or 15 1234 5678)
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.startsWith('15') && cleaned.length === 10) {
    cleaned = '11' + cleaned.substring(2);
  }
  if (!cleaned.startsWith('54') && cleaned.length >= 10) {
    cleaned = '549' + cleaned;
  }
  return cleaned;
};

export const createWhatsAppWorkshopLink = (
  phone: string,
  clientName: string,
  workshopTitle: string,
  workshopDate: string,
  workshopTime: string,
  depositStatus: string,
  depositAmount: number,
  remainingBalance: number
): string => {
  const cleanPhone = cleanPhoneForWhatsApp(phone);
  
  let señaText = '';
  if (depositStatus === 'Pagada') {
    señaText = `✅ Seña registrada: ${formatCurrency(depositAmount)}. Saldo restante a abonar en el taller: ${formatCurrency(remainingBalance)}.`;
  } else if (depositStatus === 'Pendiente') {
    señaText = `⏳ Estado de la seña: Pendiente (${formatCurrency(depositAmount || remainingBalance)}). Por favor envíanos el comprobante para confirmar tu lugar.`;
  } else {
    señaText = `✨ Reserva confirmada sin seña requerida.`;
  }

  const message = `¡Hola ${clientName}! ✨ Te escribimos desde *Macramé Aurora* 🌿\n\nTe recordamos tu lugar reservado para el:\n🗓️ *${workshopTitle}*\n📅 Fecha: ${formatDateLong(workshopDate)}\n⏰ Horario: ${workshopTime} hs\n\n${señaText}\n\n¡Cualquier duda o consulta estamos a tu disposición! Nos vemos pronto con muchas ganas de crear. ✨`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
