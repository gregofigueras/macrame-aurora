import type { Expense, Sale, Workshop } from '../types';

export const downloadCSV = (filename: string, rows: string[][]) => {
  const processRow = (row: string[]) =>
    row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(';');

  // UTF-8 BOM for Windows Excel compatibility
  const csvContent = '\uFEFF' + rows.map(processRow).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportExpensesToCSV = (expenses: Expense[]) => {
  const headers = ['Fecha', 'Categoría', 'Concepto', 'Monto ($)', 'Proveedor', 'Método de Pago', 'Notas'];
  const rows = expenses.map(e => [
    e.date,
    e.category,
    e.concept,
    e.amount.toString(),
    e.supplier || '',
    e.paymentMethod,
    e.notes || ''
  ]);
  downloadCSV(`Macrame_Aurora_Gastos_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
};

export const exportSalesToCSV = (sales: Sale[]) => {
  const headers = [
    'Fecha',
    'Producto',
    'Categoría',
    'Tipo de Venta',
    'Cantidad',
    'Precio Unitario ($)',
    'Total ($)',
    'Seña Pagada ($)',
    'Saldo Pendiente ($)',
    'Estado de Pago',
    'Fecha Entrega',
    'Costo Estimado ($)',
    'Ganancia Estimada ($)',
    'Método de Pago',
    'Cliente',
    'Teléfono',
    'Notas'
  ];
  const rows = sales.map(s => {
    const profit = s.totalAmount - (s.estimatedCost || 0);
    const orderType = s.isCustomOrder ? 'Por Encargo' : 'Venta Directa';
    const deposit = s.isCustomOrder ? (s.depositAmount || 0) : s.totalAmount;
    const pendingBalance = s.isCustomOrder && !s.isFullyPaid ? Math.max(0, s.totalAmount - (s.depositAmount || 0)) : 0;
    const paymentStatus = s.isCustomOrder
      ? (s.isFullyPaid ? '100% Abonado' : 'Solo Seña (Resta Saldo)')
      : 'Pagado Total';

    return [
      s.date,
      s.productName,
      s.category,
      orderType,
      s.quantity.toString(),
      s.unitPrice.toString(),
      s.totalAmount.toString(),
      deposit.toString(),
      pendingBalance.toString(),
      paymentStatus,
      s.deliveryDate || '',
      (s.estimatedCost || 0).toString(),
      profit.toString(),
      s.paymentMethod,
      s.customerName || '',
      s.customerPhone || '',
      s.notes || ''
    ];
  });
  downloadCSV(`Macrame_Aurora_Ventas_${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
};

export const exportWorkshopAttendeesToCSV = (workshop: Workshop) => {
  const headers = ['Taller', 'Fecha', 'Horario', 'Alumno', 'Teléfono', 'Estado Seña', 'Monto Seña ($)', 'Total Taller ($)', 'Saldo Pendiente ($)', 'Pago Completo', 'Medio de Pago', 'Notas'];
  const rows = workshop.reservations.map(r => [
    workshop.title,
    workshop.date,
    workshop.time,
    r.clientName,
    r.clientPhone,
    r.depositStatus,
    r.depositAmount.toString(),
    r.totalPrice.toString(),
    r.remainingBalance.toString(),
    r.isFullyPaid ? 'Sí' : 'No',
    r.depositPaymentMethod || '',
    r.notes || ''
  ]);
  downloadCSV(`Macrame_Aurora_Taller_${workshop.title.replace(/[^a-zA-Z0-9]/g, '_')}_${workshop.date}.csv`, [headers, ...rows]);
};
