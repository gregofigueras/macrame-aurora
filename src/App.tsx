import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { Navbar } from './components/Navbar';
import type { ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { SalesView } from './components/SalesView';
import { WorkshopsView } from './components/WorkshopsView';
import { ClientsView } from './components/ClientsView';
import { ArticlesView } from './components/ArticlesView';
import { ReportsView } from './components/ReportsView';
import { Heart } from 'lucide-react';
import { InstagramIcon } from './components/InstagramIcon';


const MainContent: React.FC = () => {
  const { workshops } = useData();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modal triggers across views
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string | null>(null);

  // Count pending deposits across all workshops
  let pendingDepositsCount = 0;
  workshops.forEach(w => {
    w.reservations.forEach(r => {
      if (r.depositStatus === 'Pendiente') {
        pendingDepositsCount++;
      }
    });
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D231E] flex flex-col font-sans selection:bg-[#E2876D] selection:text-white">
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingDepositsCount={pendingDepositsCount}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenNewExpense={() => {
              setActiveTab('gastos');
              setIsExpenseModalOpen(true);
            }}
            onOpenNewSale={() => {
              setActiveTab('ventas');
              setIsSaleModalOpen(true);
            }}
            onOpenNewWorkshop={() => {
              setActiveTab('talleres');
              setIsWorkshopModalOpen(true);
            }}
            onSelectWorkshop={(wsId) => {
              setSelectedWorkshopId(wsId);
              setActiveTab('talleres');
            }}
          />
        )}

        {activeTab === 'talleres' && (
          <WorkshopsView
            isCreateModalOpen={isWorkshopModalOpen}
            setIsCreateModalOpen={setIsWorkshopModalOpen}
            selectedWorkshopIdForReservations={selectedWorkshopId}
            onClearSelectedWorkshop={() => setSelectedWorkshopId(null)}
          />
        )}

        {activeTab === 'ventas' && (
          <SalesView
            isModalOpen={isSaleModalOpen}
            setIsModalOpen={setIsSaleModalOpen}
          />
        )}

        {activeTab === 'gastos' && (
          <ExpensesView
            isModalOpen={isExpenseModalOpen}
            setIsModalOpen={setIsExpenseModalOpen}
          />
        )}

        {activeTab === 'articulos' && <ArticlesView />}

        {activeTab === 'clientes' && <ClientsView />}

        {activeTab === 'reportes' && <ReportsView />}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E8DEC8] bg-[#F5EFEB]/80 py-6 text-xs text-[#7D6E63]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-serif-aurora font-bold text-base text-[#2D231E]">
              Macramé Aurora
            </span>
            <span>• Tienda y Talleres de Macramé</span>
          </div>

          <div className="flex items-center gap-1.5 justify-center">
            <span>Hecho con dedicación artesanal</span>
            <Heart className="w-3.5 h-3.5 text-[#C86D51] fill-[#C86D51]" />
            <span>para</span>
            <a
              href="https://www.instagram.com/macrameaurora_/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#C86D51] hover:underline flex items-center gap-1"
            >
              <InstagramIcon className="w-3 h-3" />
              @macrameaurora_
            </a>

          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <MainContent />
    </DataProvider>
  );
}
