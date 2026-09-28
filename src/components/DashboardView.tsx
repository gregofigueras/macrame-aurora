import React from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency, formatDate, createWhatsAppWorkshopLink } from '../utils/formatters';
import { 
  TrendingUp, 
  Receipt, 
  CalendarDays, 
  Wallet, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2, 
  MessageCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles 
} from 'lucide-react';
import type { ActiveTab } from './Navbar';


interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewExpense: () => void;
  onOpenNewSale: () => void;
  onOpenNewWorkshop: () => void;
  onSelectWorkshop: (workshopId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenNewExpense,
  onOpenNewSale,
  onOpenNewWorkshop,
  onSelectWorkshop,
}) => {
  const { expenses, sales, workshops } = useData();

  // Calculate product sales income
  const totalSalesIncome = sales.reduce((acc, s) => acc + s.totalAmount, 0);

  // Calculate workshop income (deposits collected + full payments collected)
  let totalWorkshopIncome = 0;
  let totalPendingWorkshopIncome = 0;
  let pendingDepositsList: {
    clientName: string;
    clientPhone: string;
    workshopTitle: string;
    workshopDate: string;
    workshopTime: string;
    depositAmount: number;
    remainingBalance: number;
    workshopId: string;
  }[] = [];

  workshops.forEach(w => {
    w.reservations.forEach(r => {
      if (r.depositStatus === 'Pagada') {
        totalWorkshopIncome += r.depositAmount;
        if (r.isFullyPaid) {
          totalWorkshopIncome += r.remainingBalance;
        } else {
          totalPendingWorkshopIncome += r.remainingBalance;
        }
      } else if (r.depositStatus === 'Pendiente') {
        totalPendingWorkshopIncome += r.totalPrice;
        pendingDepositsList.push({
          clientName: r.clientName,
          clientPhone: r.clientPhone,
          workshopTitle: w.title,
          workshopDate: w.date,
          workshopTime: w.time,
          depositAmount: w.suggestedDeposit,
          remainingBalance: w.pricePerPerson,
          workshopId: w.id
        });
      }
    });
  });

  const totalIncome = totalSalesIncome + totalWorkshopIncome;
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Next upcoming workshops
  const upcomingWorkshops = [...workshops]
    .filter(w => w.status === 'Programado')
    .sort((a, b) => a.date.localeCompare(b.date));

  // Recent transactions
  const recentSales = [...sales].slice(0, 4);
  const recentExpenses = [...expenses].slice(0, 4);

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FAF3EA] via-[#F4EBE1] to-[#EBDDCE] border border-[#DFCBB9] p-6 sm:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C86D51]/10 text-[#C86D51] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Gestión Artesanal Inteligente
            </div>
            <h1 className="font-serif-aurora text-3xl sm:text-4xl text-[#2D231E] font-bold">
              Bienvenida a Macramé Aurora
            </h1>
            <p className="text-[#6D5D53] text-sm sm:text-base leading-relaxed">
              Controla tus compras de insumos (armazones, hilos, espejos), ventas de piezas tejidas y cupos de tus talleres con cobro de señas en un solo lugar.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={onOpenNewExpense}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#93452E] font-semibold text-sm rounded-xl border border-[#DFCBB9] shadow-2xs transition-all hover:shadow-xs active:scale-98"
            >
              <Receipt className="w-4 h-4 text-[#C86D51]" />
              <span>Anotar Gasto</span>
            </button>
            <button
              onClick={onOpenNewSale}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#2E6B4A] font-semibold text-sm rounded-xl border border-[#DFCBB9] shadow-2xs transition-all hover:shadow-xs active:scale-98"
            >
              <TrendingUp className="w-4 h-4 text-[#2E6B4A]" />
              <span>Anotar Venta</span>
            </button>
            <button
              onClick={onOpenNewWorkshop}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white font-semibold text-sm rounded-xl shadow-md shadow-[#C86D51]/25 transition-all hover:shadow-lg hover:shadow-[#C86D51]/30 active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Taller</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Ingresos */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE3D7] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7D6E63] uppercase tracking-wider">
              Ingresos Totales
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-[#2D231E]">
              {formatCurrency(totalIncome)}
            </p>
            <p className="text-xs text-[#8E7E73] mt-1">
              Ventas: {formatCurrency(totalSalesIncome)} • Talleres: {formatCurrency(totalWorkshopIncome)}
            </p>
          </div>
        </div>

        {/* Total Gastos */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE3D7] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7D6E63] uppercase tracking-wider">
              Gastos en Insumos
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FFEBEE] text-[#C62828] flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-[#2D231E]">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-xs text-[#8E7E73] mt-1">
              {expenses.length} compras (armazones, hilos, espejos)
            </p>
          </div>
        </div>

        {/* Ganancia Neta */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE3D7] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7D6E63] uppercase tracking-wider">
              Ganancia Neta
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#F0EBE1] text-[#795548] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className={`text-2xl sm:text-3xl font-bold ${netProfit >= 0 ? 'text-[#2E6B4A]' : 'text-[#C62828]'}`}>
              {formatCurrency(netProfit)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-sm ${netProfit >= 0 ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-[#FFEBEE] text-[#C62828]'}`}>
                {profitMargin}% margen
              </span>
              <span className="text-xs text-[#8E7E73]">sobre facturado</span>
            </div>
          </div>
        </div>

        {/* Talleres y Ocupación */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE3D7] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7D6E63] uppercase tracking-wider">
              Talleres Próximos
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#FDF0EB] text-[#C86D51] flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold text-[#2D231E]">
              {upcomingWorkshops.length}
            </p>
            <p className="text-xs text-[#8E7E73] mt-1">
              {pendingDepositsList.length > 0 ? (
                <span className="text-[#C86D51] font-semibold">
                  {pendingDepositsList.length} señas por confirmar
                </span>
              ) : (
                'Todas las señas al día'
              )}
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Pending Deposits Alert & Upcoming Workshops */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upcoming Workshops with progress bar */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#C86D51]" />
              <h2 className="font-serif-aurora text-2xl font-bold text-[#2D231E]">
                Próximos Talleres Programados
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('talleres')}
              className="text-xs font-bold text-[#C86D51] hover:text-[#93452E] flex items-center gap-1 transition-colors"
            >
              Ver calendario completo →
            </button>
          </div>

          {upcomingWorkshops.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#EBE3D7] text-[#8E7E73]">
              <CalendarDays className="w-10 h-10 mx-auto text-[#DFCBB9] mb-2" />
              <p className="font-medium">No hay talleres programados próximamente.</p>
              <button
                onClick={onOpenNewWorkshop}
                className="mt-3 px-4 py-2 bg-[#C86D51] text-white text-xs font-semibold rounded-xl"
              >
                Crear primer taller
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {upcomingWorkshops.map(ws => {
                const booked = ws.reservations.length;
                const capacity = ws.maxCapacity;
                const percent = Math.min(100, Math.round((booked / capacity) * 100));
                const isFull = booked >= capacity;

                return (
                  <div
                    key={ws.id}
                    className="p-5 bg-white rounded-2xl border border-[#EBE3D7] hover:border-[#D5C1AE] transition-all shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F5EFEB] text-[#6D5D53]">
                            📅 {formatDate(ws.date)} • {ws.time} hs
                          </span>
                          {isFull ? (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FFEBEE] text-[#C62828]">
                              Cupo Lleno
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2E7D32]">
                              {capacity - booked} cupos libres
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif-aurora text-xl font-bold text-[#2D231E] mt-1.5">
                          {ws.title}
                        </h3>
                        <p className="text-xs text-[#8E7E73] mt-0.5">
                          Arancel: {formatCurrency(ws.pricePerPerson)} • Seña sugerida: {formatCurrency(ws.suggestedDeposit)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setActiveTab('talleres');
                            onSelectWorkshop(ws.id);
                          }}
                          className="px-4 py-2 bg-[#FAF3EA] hover:bg-[#F3E5D4] text-[#93452E] font-semibold text-xs rounded-xl border border-[#DFCBB9] transition-colors"
                        >
                          Ver Inscriptos ({booked}/{capacity})
                        </button>
                      </div>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="mt-4 pt-3 border-t border-[#F2ECE4]">
                      <div className="flex justify-between text-xs text-[#7D6E63] font-medium mb-1.5">
                        <span>Ocupación de cupos: {booked} de {capacity} personas</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-[#EFE7DE] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isFull ? 'bg-[#C62828]' : percent >= 75 ? 'bg-[#C86D51]' : 'bg-[#7B8E7C]'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Pending Deposits / Señas por Confirmar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#C86D51]" />
            <h2 className="font-serif-aurora text-2xl font-bold text-[#2D231E]">
              Señas por Cobrar
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-[#EBE3D7] p-4 shadow-2xs space-y-3">
            {pendingDepositsList.length === 0 ? (
              <div className="py-8 text-center text-[#7D6E63]">
                <CheckCircle2 className="w-9 h-9 mx-auto text-[#7B8E7C] mb-2" />
                <p className="text-sm font-semibold text-[#2D231E]">¡Todo al día!</p>
                <p className="text-xs text-[#8E7E73] mt-0.5">
                  No hay señas pendientes de confirmación en tus talleres.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs text-[#8E7E73] font-medium">
                  {pendingDepositsList.length} inscripto(s) todavía no han abonado la seña:
                </p>
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {pendingDepositsList.map((item, idx) => {
                    const waLink = createWhatsAppWorkshopLink(
                      item.clientPhone,
                      item.clientName,
                      item.workshopTitle,
                      item.workshopDate,
                      item.workshopTime,
                      'Pendiente',
                      item.depositAmount,
                      item.remainingBalance
                    );

                    return (
                      <div
                        key={idx}
                        className="p-3 bg-[#FDF9F6] rounded-xl border border-[#F2ECE4] flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-[#2D231E]">
                              {item.clientName}
                            </p>
                            <p className="text-xs text-[#7D6E63]">
                              {item.clientPhone}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF3E0] text-[#E65100]">
                            Seña Pendiente
                          </span>
                        </div>

                        <div className="text-xs text-[#8E7E73]">
                          Taller: <span className="font-medium text-[#2D231E]">{item.workshopTitle}</span> ({formatDate(item.workshopDate)})
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-xs font-semibold text-[#C86D51]">
                            Seña: {formatCurrency(item.depositAmount)}
                          </span>
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs rounded-lg transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Avisar WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Sales & Recent Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Recent Sales */}
        <div className="bg-white rounded-2xl border border-[#EBE3D7] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2E6B4A]" />
              <h3 className="font-serif-aurora text-xl font-bold text-[#2D231E]">
                Últimas Ventas de Productos
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('ventas')}
              className="text-xs font-bold text-[#2E6B4A] hover:underline"
            >
              Ver todas →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentSales.map(sale => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#F2ECE4]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#2D231E]">
                    {sale.productName}
                  </p>
                  <p className="text-xs text-[#8E7E73]">
                    {formatDate(sale.date)} • {sale.customerName ? `Cliente: ${sale.customerName}` : sale.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#2E6B4A]">
                    +{formatCurrency(sale.totalAmount)}
                  </p>
                  <span className="text-[10px] text-[#7D6E63] font-medium bg-[#EFE7DE] px-1.5 py-0.5 rounded-sm">
                    {sale.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl border border-[#EBE3D7] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#C86D51]" />
              <h3 className="font-serif-aurora text-xl font-bold text-[#2D231E]">
                Últimas Compras de Insumos
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('gastos')}
              className="text-xs font-bold text-[#C86D51] hover:underline"
            >
              Ver todos →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentExpenses.map(exp => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#F2ECE4]"
              >
                <div>
                  <p className="text-sm font-semibold text-[#2D231E]">
                    {exp.concept}
                  </p>
                  <p className="text-xs text-[#8E7E73]">
                    {formatDate(exp.date)} • {exp.category} {exp.supplier ? `(${exp.supplier})` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#C62828]">
                    -{formatCurrency(exp.amount)}
                  </p>
                  <span className="text-[10px] text-[#7D6E63] font-medium bg-[#EFE7DE] px-1.5 py-0.5 rounded-sm">
                    {exp.paymentMethod}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
