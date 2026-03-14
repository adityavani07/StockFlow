/**
 * SIDEBAR — macOS 26 glassy navigation with theme toggle.
 * Features vibrancy effect, smooth hover transitions, and accent glow.
 */
import React from 'react';
import {
  LayoutDashboard, Package, ArrowDownToLine, Truck, ArrowLeftRight,
  ClipboardList, History, LogOut, Warehouse, X, Menu,
  Sun, Moon
} from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'divider1', label: 'Operations', divider: true },
  { id: 'receipts', label: 'Receipts', icon: ArrowDownToLine },
  { id: 'deliveries', label: 'Deliveries', icon: Truck },
  { id: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
  { id: 'adjustments', label: 'Adjustments', icon: ClipboardList },
  { id: 'moves', label: 'Move History', icon: History },
  { id: 'divider2', label: 'Settings', divider: true },
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onToggle }) => {
  const { currentUser, logout, theme, toggleTheme } = useInventoryStore();

  return (
    <>
      {/* Mobile overlay with blur */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(4px)' }}
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-[260px] glass-sidebar z-50 flex flex-col
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header with logo */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              SF
            </div>
            <div>
              <span className="text-[15px] font-bold tracking-tight text-white">StockFlow</span>
              <div className="text-[10px] text-white/40 font-medium tracking-wider uppercase">IMS Pro</div>
            </div>
          </div>
          <button onClick={onToggle} className="lg:hidden text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map(item => {
            if ('divider' in item && item.divider) {
              return (
                <div key={item.id} className="mt-5 mb-2 px-3 text-[10px] font-semibold text-white/25 uppercase tracking-[0.12em]">
                  {item.label}
                </div>
              );
            }
            const Icon = item.icon!;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); onToggle(); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                  transition-all duration-200 mb-0.5 relative group
                  ${isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
                `}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.2))',
                  boxShadow: '0 0 20px rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                } : {}}
              >
                <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                {item.label}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: 'linear-gradient(to bottom, #6366f1, #8b5cf6)' }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme toggle + User section */}
        <div style={{ borderTop: '1px solid var(--sidebar-border)' }} className="p-3 space-y-1">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
              text-white/50 hover:text-white/80 hover:bg-white/5 transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Profile */}
          <button
            onClick={() => { onNavigate('profile'); onToggle(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
              ${currentPage === 'profile'
                ? 'text-white bg-white/10'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="truncate text-white/80">{currentUser?.name || 'User'}</div>
              <div className="text-[10px] text-white/30 truncate">{currentUser?.email}</div>
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={() => { logout(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
              text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/** Mobile menu toggle button */
export const MobileMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="lg:hidden p-2 rounded-xl transition-colors btn-ghost">
    <Menu size={22} />
  </button>
);

export default Sidebar;
