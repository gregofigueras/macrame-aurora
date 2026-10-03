import React, { useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/formatters';
import { exportExpensesToCSV, exportSalesToCSV } from '../utils/exportCsv';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  RotateCcw, 
  ShieldCheck, 
  PieChart,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Database,
  Code
} from 'lucide-react';
import { SUPABASE_SETUP_SQL } from '../lib/supabase';

export const ReportsView: React.FC = () => {
  const { 
    expenses, 
    sales, 
    workshops, 
    cloudSyncStatus,
    lastSyncTime,
    syncLocalToCloud,
    syncCloudToLocal,
    checkCloudConnection,
    resetToSampleData, 
    exportJSONBackup, 
    importJSONBackup 
  } = useData();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [cloudMessage, setCloudMessage] = useState<string | null>(null);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSyncToCloud = async () => {
    setIsSyncingCloud(true);
    setCloudMessage(null);
    const res = await syncLocalToCloud();
    setIsSyncingCloud(false);
    setCloudMessage(res.message);
    setTimeout(() => setCloudMessage(null), 8000);
  };

  const handleSyncFromCloud = async () => {
    if (!window.confirm('¿Deseas descargar los datos de Supabase? Esto actualizará tu copia local con los registros de la nube.')) {
      return;
    }
    setIsSyncingCloud(true);
    setCloudMessage(null);
    const res = await syncCloudToLocal();
    setIsSyncingCloud(false);
    setCloudMessage(res.message);
    setTimeout(() => setCloudMessage(null), 8000);
  };

  const handleCheckConnection = async () => {
    setIsSyncingCloud(true);
    setCloudMessage(null);
    const connected = await checkCloudConnection();
    setIsSyncingCloud(false);
    if (connected) {
      setCloudMessage('¡Conexión exitosa con la base de datos de Supabase!');
    } else {
      setCloudMessage('No se pudo validar la conexión. Si acabas de ejecutar el script SQL, espera unos segundos e intenta nuevamente.');
    }
    setTimeout(() => setCloudMessage(null), 7000);
  };

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
          alert('¡Copia de seguridad restaurada con éxito! Tus datos se cargaron y se sincronizaron con Supabase.');
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

      {/* Supabase Cloud Synchronization */}
      <div className="bg-white rounded-3xl border border-[#EBE3D7] p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#16A34A] shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif-aurora text-2xl font-bold text-[#2D231E]">
                Sincronización en la Nube (Supabase)
              </h2>
              <p className="text-xs text-[#7D6E63]">
                Guarda tus datos de forma permanente y accede en tiempo real desde cualquier PC o celular
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            {cloudSyncStatus === 'synced' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F5E9] text-[#2E6B4A] border border-[#C8E6C9]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6B4A]" />
                <span>Nube Conectada y Activa</span>
              </span>
            )}
            {cloudSyncStatus === 'syncing' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                <RefreshCw className="w-3.5 h-3.5 text-[#E65100] animate-spin" />
                <span>Sincronizando...</span>
              </span>
            )}
            {cloudSyncStatus === 'connecting' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]">
                <RefreshCw className="w-3.5 h-3.5 text-[#E65100] animate-spin" />
                <span>Verificando conexión...</span>
              </span>
            )}
            {cloudSyncStatus === 'local_only' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF8E1] text-[#B78103] border border-[#FFE082]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#F57F17]" />
                <span>Tablas Pendientes de Creación</span>
              </span>
            )}
            {cloudSyncStatus === 'error' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#C62828]" />
                <span>Desconectado / Modo Local</span>
              </span>
            )}
          </div>
        </div>

        {/* Message notification if any */}
        {cloudMessage && (
          <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#DFCBB9] text-xs font-medium text-[#2D231E] flex items-center justify-between animate-fadeIn">
            <span>{cloudMessage}</span>
            <button onClick={() => setCloudMessage(null)} className="text-[#8E7E73] hover:text-[#2D231E] text-xs font-bold ml-2">✕</button>
          </div>
        )}

        {/* Instructions banner when tables need to be created */}
        {cloudSyncStatus === 'local_only' && (
          <div className="p-5 rounded-2xl bg-[#FFFBF0] border border-[#FFE082] space-y-3">
            <div className="flex items-start gap-2.5">
              <Database className="w-5 h-5 text-[#E65100] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#8C3B00]">
                  ¡Paso final para activar tu sincronización permanente!
                </h3>
                <p className="text-xs text-[#7A4B1A] mt-1 leading-relaxed">
                  Tu base de datos de Supabase ya está vinculada, pero todavía no tiene las tablas creadas. Sigue estos 3 sencillos pasos:
                </p>
                <ol className="text-xs text-[#7A4B1A] list-decimal list-inside space-y-1.5 mt-2.5 font-medium">
                  <li>
                    Haz clic en el botón <strong>"Copiar Script SQL"</strong> a continuación.
                  </li>
                  <li>
                    Haz clic en <strong>"Abrir SQL Editor en Supabase"</strong> para ir directamente a la consola de tu proyecto.
                  </li>
                  <li>
                    Pega el código copiado en el editor y presiona el botón verde <strong>"Run"</strong> (abajo a la derecha).
                  </li>
                </ol>
                <p className="text-[11px] text-[#A6601D] mt-2 italic">
                  Una vez ejecutado, regresa aquí y presiona "Verificar Conexión". ¡Tus datos actuales se subirán automáticamente!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status details when synced */}
        {cloudSyncStatus === 'synced' && (
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-[#166534]">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>
                <strong>Sincronización en Tiempo Real activa:</strong> Cualquier cambio en ventas, gastos, talleres, clientes o catálogo se guarda automáticamente en Supabase y se ve reflejado en todos tus dispositivos.
              </span>
            </div>
            {lastSyncTime && (
              <span className="text-[11px] text-[#15803D] font-medium shrink-0 bg-white/70 px-2.5 py-1 rounded-lg border border-[#BBF7D0]">
                Última sync: {lastSyncTime}
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopySql}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 ${
              copiedSql
                ? 'bg-[#16A34A] text-white'
                : 'bg-[#2D231E] hover:bg-[#43352E] text-white'
            }`}
          >
            {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? '¡Script SQL Copiado!' : 'Copiar Script SQL para Supabase'}</span>
          </button>

          <a
            href="https://supabase.com/dashboard/project/ipfxlxxsyvxxmounomee/sql/new"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#2D231E] font-bold text-xs rounded-xl border border-[#DFCBB9] shadow-2xs transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-[#C86D51]" />
            <span>Abrir SQL Editor en Supabase</span>
          </a>

          <button
            onClick={handleSyncToCloud}
            disabled={isSyncingCloud}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#C86D51] hover:bg-[#B3583E] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{isSyncingCloud ? 'Subiendo...' : 'Subir Datos Locales a la Nube'}</span>
          </button>

          <button
            onClick={handleSyncFromCloud}
            disabled={isSyncingCloud}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#5C4F47] font-bold text-xs rounded-xl border border-[#DFCBB9] shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-[#8E7E73]" />
            <span>Descargar de la Nube</span>
          </button>

          <button
            onClick={handleCheckConnection}
            disabled={isSyncingCloud}
            className="flex items-center gap-1.5 px-3 py-2.5 text-[#8E7E73] hover:text-[#2D231E] text-xs font-semibold transition-colors ml-auto"
            title="Verificar estado de las tablas en Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCloud ? 'animate-spin' : ''}`} />
            <span>Verificar Conexión</span>
          </button>

          <button
            onClick={() => setShowSqlPreview(!showSqlPreview)}
            className="flex items-center gap-1 text-[11px] text-[#7D6E63] hover:text-[#2D231E] underline decoration-dotted ml-2"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showSqlPreview ? 'Ocultar código SQL' : 'Ver código SQL'}</span>
          </button>
        </div>

        {/* Expandable SQL Preview */}
        {showSqlPreview && (
          <div className="relative mt-3 p-4 bg-[#1E1E1E] text-[#D4D4D4] rounded-2xl font-mono text-[11px] overflow-x-auto max-h-72 border border-[#3E3E3E]">
            <div className="sticky top-0 right-0 flex justify-end pb-2">
              <button
                onClick={handleCopySql}
                className="px-2.5 py-1 bg-[#333] hover:bg-[#444] text-white text-[10px] rounded-lg font-sans flex items-center gap-1"
              >
                {copiedSql ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSql ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
            <pre>{SUPABASE_SETUP_SQL}</pre>
          </div>
        )}
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
