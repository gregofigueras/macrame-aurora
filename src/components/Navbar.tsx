import React from 'react';
import { 
  LayoutDashboard, 
  CalendarDays, 
  TrendingUp, 
  Receipt, 
  Package,
  Users, 
  Download, 
  Sparkles,
  Cloud,
  CloudOff,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { InstagramIcon } from './InstagramIcon';

export type ActiveTab = 'dashboard' | 'talleres' | 'ventas' | 'gastos' | 'articulos' | 'clientes' | 'reportes';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingDepositsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab,
  pendingDepositsCount 
}) => {
  const { cloudSyncStatus } = useData();

  const getCloudBadge = () => {
    switch (cloudSyncStatus) {
      case 'synced':
        return {
          icon: <Cloud className="w-3.5 h-3.5 text-[#16A34A]" />,
          text: 'Nube Sincronizada',
          shortText: 'Nube OK',
          bg: 'bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
          title: 'Conectado a Supabase en tiempo real. Todos los cambios están respaldados en la nube.',
        };
      case 'syncing':
      case 'connecting':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-[#E65100] animate-spin" />,
          text: 'Sincronizando...',
          shortText: 'Sincronizando',
          bg: 'bg-[#FFF8E1] hover:bg-[#FEF08A] text-[#854D0E] border-[#FEF08A]',
          title: 'Conectando con Supabase...',
        };
      case 'local_only':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-[#D97706]" />,
          text: 'Tablas Pendientes',
          shortText: 'Configurar Nube',
          bg: 'bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
          title: 'Falta ejecutar el script SQL en Supabase para activar la sincronización permanente.',
        };
      case 'error':
      default:
        return {
          icon: <CloudOff className="w-3.5 h-3.5 text-[#DC2626]" />,
          text: 'Sin Conexión Nube',
          shortText: 'Modo Local',
          bg: 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] border-[#FECACA]',
          title: 'No se pudo conectar a la base de datos de Supabase. Operando con copia local.',
        };
    }
  };

  const cloudBadge = getCloudBadge();
  const navItems = [
    { id: 'dashboard', label: 'Panel General', icon: LayoutDashboard },
    { 
      id: 'talleres', 
      label: 'Talleres & Calendario', 
      icon: CalendarDays,
      badge: pendingDepositsCount > 0 ? `${pendingDepositsCount} señas pend.` : undefined
    },
    { id: 'ventas', label: 'Ganancias / Ventas', icon: TrendingUp },
    { id: 'gastos', label: 'Gastos / Insumos', icon: Receipt },
    { id: 'articulos', label: 'Artículos & Costos', icon: Package },
    { id: 'clientes', label: 'Alumnos & Clientes', icon: Users },
    { id: 'reportes', label: 'Reportes & Backup', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DEC8] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3.5 cursor-pointer group transition-transform active:scale-98"
          >
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#C86D51] shadow-sm bg-white shrink-0 group-hover:border-[#B3583E] transition-colors">
              <img 
                src="/logo.jpg" 
                alt="Macramé Aurora Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-aurora text-2xl font-bold text-[#2D231E] tracking-tight group-hover:text-[#C86D51] transition-colors">
                  Macramé Aurora
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
              </div>
              <p className="text-xs font-medium text-[#7D6E63] tracking-wider uppercase">
                Tienda Artesanal & Talleres
              </p>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as ActiveTab)}
                  className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#C86D51] text-white shadow-md shadow-[#C86D51]/20 font-semibold'
                      : 'text-[#5C4F47] hover:bg-[#EFE7DE] hover:text-[#2D231E]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#8E7C70]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive ? 'bg-white text-[#C86D51]' : 'bg-[#E2876D] text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Cloud Status & Instagram Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveTab('reportes')}
              title={cloudBadge.title}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95 shadow-2xs cursor-pointer ${cloudBadge.bg}`}
            >
              {cloudBadge.icon}
              <span className="hidden sm:inline">{cloudBadge.text}</span>
              <span className="inline sm:hidden">{cloudBadge.shortText}</span>
            </button>

            <a
              href="https://www.instagram.com/macrameaurora_/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FDEEEA] to-[#F7E7DE] border border-[#EACEC1] text-[#93452E] hover:text-[#7A3622] hover:border-[#D9A390] text-xs font-semibold transition-all shadow-2xs"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-[#C86D51]" />
              <span className="hidden lg:inline">@macrameaurora_</span>
            </a>
          </div>

        </div>

        {/* Mobile Nav Scroller */}
        <div className="flex md:hidden overflow-x-auto py-2.5 gap-1.5 no-scrollbar border-t border-[#EFE7DE]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  isActive
                    ? 'bg-[#C86D51] text-white font-semibold'
                    : 'bg-[#F2ECE4] text-[#5C4F47] hover:bg-[#EAE1D7]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[9px] px-1 bg-[#B3583E] text-white rounded-full">
                    !
                  </span>
                )}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
