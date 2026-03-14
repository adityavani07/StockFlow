/**
 * APP.TSX — Root Component & Router
 *
 * Architecture:
 * - If not authenticated → shows Auth page (login/signup)
 * - If authenticated → shows Layout with sidebar + page content
 * - Simple state-based routing (no react-router needed for single-page)
 * - Responsive: sidebar collapses on mobile, toggles via hamburger
 *
 * Pages:
 * - Dashboard (default landing after login)
 * - Products (CRUD + stock visibility)
 * - Receipts (incoming goods)
 * - Deliveries (outgoing goods)
 * - Transfers (internal stock movement)
 * - Adjustments (stock corrections)
 * - Move History (audit trail / stock ledger)
 * - Warehouses (settings)
 * - Profile (user settings)
 */
import React, { useState } from 'react';
import { useInventoryStore } from './store/inventoryStore';
import Sidebar, { MobileMenuButton } from './components/Sidebar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Receipts from './pages/Receipts';
import Deliveries from './pages/Deliveries';
import Transfers from './pages/Transfers';
import Adjustments from './pages/Adjustments';
import MoveHistory from './pages/MoveHistory';
import Warehouses from './pages/Warehouses';
import Profile from './pages/Profile';

const App: React.FC = () => {
  const { currentUser } = useInventoryStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Not authenticated → show login/signup
  if (!currentUser) {
    return <Auth />;
  }

  // Render the correct page based on currentPage state
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'products': return <Products />;
      case 'receipts': return <Receipts />;
      case 'deliveries': return <Deliveries />;
      case 'transfers': return <Transfers />;
      case 'adjustments': return <Adjustments />;
      case 'moves': return <MoveHistory />;
      case 'warehouses': return <Warehouses />;
      case 'profile': return <Profile />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  // Page titles for the header
  const pageTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    products: 'Products',
    receipts: 'Receipts',
    deliveries: 'Delivery Orders',
    transfers: 'Internal Transfers',
    adjustments: 'Stock Adjustments',
    moves: 'Move History',
    warehouses: 'Warehouses',
    profile: 'My Profile',
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <div>
              <h2 className="text-lg font-bold text-slate-900 hidden sm:block">
                {pageTitles[currentPage] || 'Dashboard'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Live
            </div>
            <button
              onClick={() => setCurrentPage('profile')}
              className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-bold text-emerald-600 hover:bg-emerald-200 transition-colors"
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Page Content — scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default App;
