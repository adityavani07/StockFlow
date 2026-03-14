/**
 * APP.TSX — Root Component with macOS 26 Glass UI
 * Features animated mesh background, glass header, and smooth page transitions.
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
import { Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const { currentUser, theme, toggleTheme } = useInventoryStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) {
    return <Auth />;
  }

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

  const pageSubtitles: Record<string, string> = {
    dashboard: 'Overview of your inventory operations',
    products: 'Manage your product catalog',
    receipts: 'Incoming goods from suppliers',
    deliveries: 'Outgoing shipments to customers',
    transfers: 'Move stock between locations',
    adjustments: 'Correct stock discrepancies',
    moves: 'Complete audit trail',
    warehouses: 'Manage storage locations',
    profile: 'Your account settings',
  };

  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'var(--bg-primary)' }}>
      {/* Animated mesh background */}
      <div className="mesh-bg">
        <div className="mesh-bg-extra" />
      </div>

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Top Header Bar — Glass */}
        <header className="glass-heavy shrink-0 px-4 sm:px-6 py-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setSidebarOpen(true)} />
            <div>
              <h2 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>
                {pageTitles[currentPage] || 'Dashboard'}
              </h2>
              <p className="text-[11px] hidden sm:block" style={{ color: 'var(--text-tertiary)' }}>
                {pageSubtitles[currentPage] || ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <div className="w-2 h-2 bg-emerald-400 rounded-full pulse-live"></div>
              <span>Live</span>
            </div>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 btn-ghost"
              title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setCurrentPage('profile')}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        {/* Page Content — scrollable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6" key={currentPage}>
          <div className="animate-fadeIn">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
