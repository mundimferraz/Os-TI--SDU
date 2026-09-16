import React, { useState, useEffect } from 'react';
import { db } from './db/store';
import { User, ServiceOrder } from './types';

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

// View Components
import { DashboardView } from './components/dashboard/DashboardView';
import { OrderListView } from './components/orders/OrderListView';
import { NewOrderForm } from './components/orders/NewOrderForm';
import { OrderDetailView } from './components/orders/OrderDetailView';
import { EquipmentView } from './components/modules/EquipmentView';
import { ReportsView } from './components/modules/ReportsView';
import { PublicConsultationView } from './components/modules/PublicConsultationView';
import { AdminView } from './components/modules/AdminView';
import { SectorsView } from './components/modules/SectorsView';
import { TechniciansView } from './components/modules/TechniciansView';

// Modals
import { GlobalSearchModal } from './components/modals/GlobalSearchModal';
import { OrderPrintModal } from './components/orders/OrderPrintModal';
import { BlankOrderPrintModal } from './components/orders/BlankOrderPrintModal';

export default function App() {
  // DB Sync State
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Layout & Theming State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('os_ti_dark_mode') === 'true';
  });

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [printOrder, setPrintOrder] = useState<ServiceOrder | null>(null);
  const [isBlankPrintOpen, setIsBlankPrintOpen] = useState(false);

  const currentUser = db.getCurrentUser();

  // Dark mode class sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('os_ti_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('os_ti_dark_mode', 'false');
    }
  }, [darkMode]);

  // Global keyboard shortcut: Ctrl+K / Cmd+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation Router Helper
  const handleNavigate = (view: string, orderId?: string) => {
    if (orderId) {
      setSelectedOrderId(orderId);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrintOrder = (order: ServiceOrder) => {
    setPrintOrder(order);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">
      
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onOpenSearch={() => setIsSearchOpen(true)}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />

      {/* Main Body with Sidebar and Content Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Navigation Sidebar */}
        <Sidebar
          currentView={currentView}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onPrintBlankOrder={() => setIsBlankPrintOpen(true)}
        />

        {/* Content View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onPrintOrder={handlePrintOrder}
                onPrintBlankOrder={() => setIsBlankPrintOpen(true)}
              />
            )}

            {currentView === 'orders' && (
              <OrderListView
                onNavigate={handleNavigate}
                onPrintOrder={handlePrintOrder}
                onPrintBlankOrder={() => setIsBlankPrintOpen(true)}
              />
            )}

            {currentView === 'new-order' && (
              <NewOrderForm
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onPrintOrder={handlePrintOrder}
                onPrintBlankOrder={() => setIsBlankPrintOpen(true)}
              />
            )}

            {currentView === 'order-detail' && selectedOrderId && (
              <OrderDetailView
                orderId={selectedOrderId}
                currentUser={currentUser}
                onNavigate={handleNavigate}
                onPrintOrder={handlePrintOrder}
              />
            )}

            {currentView === 'equipment' && (
              <EquipmentView
                onNavigate={handleNavigate}
              />
            )}

            {(currentView === 'gerencias' || currentView === 'sectors') && (
              <SectorsView
                onNavigate={handleNavigate}
              />
            )}

            {(currentView === 'equipe' || currentView === 'technicians') && (
              <TechniciansView
                onNavigate={handleNavigate}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView />
            )}

            {currentView === 'public-consult' && (
              <PublicConsultationView
                onNavigateToDetail={(id) => handleNavigate('order-detail', id)}
              />
            )}

            {currentView === 'admin' && (
              <AdminView onNavigate={handleNavigate} />
            )}
          </div>
        </main>
      </div>

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={handleNavigate}
        />
      )}

      {/* Print Official Order & Equipment Tag Modal */}
      {printOrder && (
        <OrderPrintModal
          order={printOrder}
          onClose={() => setPrintOrder(null)}
          onOpenBlankOrder={() => setIsBlankPrintOpen(true)}
        />
      )}

      {/* Blank Service Order Print Modal (Official Field Sheet A4 / PDF) */}
      <BlankOrderPrintModal
        isOpen={isBlankPrintOpen}
        onClose={() => setIsBlankPrintOpen(false)}
      />

    </div>
  );
}
