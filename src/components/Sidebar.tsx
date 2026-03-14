/**
 * SIDEBAR — Main navigation for the IMS.
 * Shows the app logo, navigation links grouped by section,
 * and user profile at the bottom.
 */
import React from 'react';
import {
  LayoutDashboard, Package, ArrowDownToLine, Truck, ArrowLeftRight,
  ClipboardList, History, User, LogOut, Warehouse, X, Menu
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
  { id: 'deliveries', label: 'Delivery Orders', icon: Truck },
  { id: 'transfers', label: 'Internal Transfers', icon: ArrowLeftRight },
  { id: 'adjustments', label: 'Stock Adjustments', icon: ClipboardList },
  { id: 'moves', label: 'Move History', icon: History },
  { id: 'divider2', label: 'Settings', divider: true },
  { id: 'warehouses', label: 'Warehouses', icon: Warehouse },
];

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onToggle }) => {
  const { currentUser, logout } = useInventoryStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-50 flex flex-col
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <img src={"/sf.svg"} alt="logo" width={40} height={40} style={{ borderRadius: '50%' }} />
            <span className="text-lg font-bold tracking-tight">StockFlow</span>
          </div>
          <button onClick={onToggle} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map(item => {
            if ('divider' in item && item.divider) {
              return (
                <div key={item.id} className="mt-5 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150 mb-0.5
                  ${isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t border-slate-700 p-3">
          <button
            onClick={() => { onNavigate('profile'); onToggle(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 mb-1
              ${currentPage === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <User size={18} />
            <div className="text-left flex-1 min-w-0">
              <div className="truncate">{currentUser?.name || 'User'}</div>
              <div className="text-xs text-slate-400 truncate">{currentUser?.email}</div>
            </div>
          </button>
          <button
            onClick={() => { logout(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/** Mobile menu toggle button */
export const MobileMenuButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button onClick={onClick} className="lg:hidden p-2 text-slate-600 hover:text-slate-900">
    <Menu size={24} />
  </button>
);

export default Sidebar;
