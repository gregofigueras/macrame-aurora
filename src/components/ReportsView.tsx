import React, { useRef } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/formatters';
import { exportExpensesToCSV, exportSalesToCSV } from '../utils/exportCsv';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RotateCcw, 
  ShieldCheck, 
  PieChart
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    expenses, 
    sales, 
    workshops, 
    resetToSampleData, 
    exportJSONBackup, 
    importJSONBackup 
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Financial calculations
  const totalSales = sales.reduce((acc, s) => acc + s.totalAmount, 0);


  let totalWorkshopIncome = 0;
  let totalWorkshopPending = 0;
  let totalAttendees = 0;

  workshops.forEach(w => {
    totalAttendees += w.reservations.length;
    w.reservations.forEach(r => {
      if (r.depositStatus === 'Pagada') {
        totalWorkshopIncome += r.depositAmount;
        if (r.isFullyPaid) {
          totalWorkshopIncome += r.remainingBalance;
        } else {
          totalWorkshopPending += r.remainingBalance;
        }
      } else if (r.depositStatus === 'Pendiente') {
        totalWorkshopPending += r.totalPrice;
      }
    });
  });

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalGlobalIncome = totalSales + totalWorkshopIncome;
  const netGlobalProfit = totalGlobalIncome - totalExpenses;

  // Handle file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJSONBackup(content);
        if (success) {
          alert('¡Copia de seguridad restaurada con éxito!');
        } else {
          alert('Hubo un error al procesar el archivo de respaldo. Asegúrate de que sea un JSON válido.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Download className="w-6 h-6 text-[#C86D51]" />
          <h1 className="font-serif-aurora text-3xl font-bold text-[#2D231E]">
            Reportes, Exportación y Respaldos
          </h1>
        </div>
        <p className="text-sm text-[#7D6E63] mt-1">
          Descarga tus datos a Excel, gestiona copias de seguridad y analiza el balance del taller
        </p>
      </div>

      {/* Global Financial Summary Card */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] p-6 shadow-2xs space-y-6">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-[#C86D51]" />
          <h2 className="font-serif-aurora text-2xl font-bold text-[#2D231E]">
            Balance General Consolidado
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#F2ECE4]">
            <p className="text-xs font-semibold text-[#8E7E73] uppercase">Ingresos por Productos</p>
            <p className="text-2xl font-bold text-[#2E6B4A] mt-1">{formatCurrency(totalSales)}</p>
            <p className="text-[11px] text-[#7D6E63] mt-0.5">{sales.length} ventas registradas</p>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#F2ECE4]">
            <p className="text-xs font-semibold text-[#8E7E73] uppercase">Ingresos por Talleres</p>
            <p className="text-2xl font-bold text-[#C86D51] mt-1">{formatCurrency(totalWorkshopIncome)}</p>
            <p className="text-[11px] text-[#7D6E63] mt-0.5">{totalAttendees} alumnos inscriptos</p>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#F2ECE4]">
            <p className="text-xs font-semibold text-[#8E7E73] uppercase">Gastos en Materiales</p>
            <p className="text-2xl font-bold text-[#C62828] mt-1">{formatCurrency(totalExpenses)}</p>
            <p className="text-[11px] text-[#7D6E63] mt-0.5">{expenses.length} compras de insumos</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FAF3EA] to-[#F5EFEB] border border-[#DFCBB9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-[#7D6E63] uppercase tracking-wider">
              Ganancia Neta Total (Ingresos - Gastos)
            </p>
            <p className={`text-3xl font-extrabold mt-1 ${netGlobalProfit >= 0 ? 'text-[#2E6B4A]' : 'text-[#C62828]'}`}>
              {formatCurrency(netGlobalProfit)}
            </p>
          </div>

          {totalWorkshopPending > 0 && (
            <div className="sm:text-right">
              <span className="text-xs text-[#E65100] font-semibold bg-[#FFF3E0] px-3 py-1 rounded-full border border-[#FFE0B2]">
                Por cobrar en talleres: {formatCurrency(totalWorkshopPending)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Export to Excel Section */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-[#2E6B4A]" />
          <h2 className="font-serif-aurora text-2xl font-bold text-[#2D231E]">
            Exportar a Planilla Excel (CSV)
          </h2>
        </div>
        <p className="text-xs text-[#7D6E63]">
          Descarga tus registros en formato compatible con Microsoft Excel y Google Sheets (con codificación UTF-8 para mantener tildes y símbolos).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFCBB9] flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-[#2D231E]">Gastos de Materiales</p>
              <p className="text-xs text-[#7D6E63]">Armazones, hilos, espejos y proveedores</p>
            </div>
            <button
              onClick={() => exportExpensesToCSV(expenses)}
              className="px-4 py-2 bg-white hover:bg-[#FAF3EA] text-[#C86D51] font-bold text-xs rounded-xl border border-[#DFCBB9] shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar CSV</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#DFCBB9] flex items-center justify-between">
            <div>
              <p className="font-bold text-sm text-[#2D231E]">Ventas de Productos</p>
              <p className="text-xs text-[#7D6E63]">Canastas, espejos, armazones y clientes</p>
            </div>
            <button
              onClick={() => exportSalesToCSV(sales)}
              className="px-4 py-2 bg-white hover:bg-[#FAF3EA] text-[#2E6B4A] font-bold text-xs rounded-xl border border-[#DFCBB9] shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Descargar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#C86D51]" />
          <h2 className="font-serif-aurora text-2xl font-bold text-[#2D231E]">
            Copia de Seguridad y Restauración
          </h2>
        </div>
        <p className="text-xs text-[#7D6E63]">
          Guarda una copia de respaldo completa de todos tus gastos, ventas, talleres y lista de alumnos en un archivo seguro en tu computadora.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={exportJSONBackup}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Copia de Seguridad (.json)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#5C4F47] font-bold text-xs rounded-xl border border-[#DFCBB9] shadow-2xs transition-colors"
          >
            <Upload className="w-4 h-4 text-[#8E7E73]" />
            <span>Restaurar desde Archivo</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('¿Deseas restablecer los datos de demostración de Macramé Aurora? Esto recargará los ejemplos iniciales.')) {
                resetToSampleData();
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 text-[#8E7E73] hover:text-[#C62828] text-xs font-semibold hover:bg-[#FFEBEE] rounded-xl transition-colors ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Datos de Muestra</span>
          </button>
        </div>
      </div>

    </div>
  );
};
