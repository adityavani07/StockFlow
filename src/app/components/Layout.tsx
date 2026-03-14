import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useInventory } from '../context/InventoryContext';
import { Button } from './ui/button';
import {
  LayoutDashboard,
  Package,
  Inbox,
  ArrowRightLeft,
  Truck,
  Settings,
  History,
  Warehouse,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export function Layout() {
  const { logout } = useInventory();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Products' },
    { path: '/receipts', icon: Inbox, label: 'Receipts' },
    { path: '/transfers', icon: ArrowRightLeft, label: 'Transfers' },
    { path: '/deliveries', icon: Truck, label: 'Deliveries' },
    { path: '/adjustments', icon: Settings, label: 'Adjustments' },
    { path: '/history', icon: History, label: 'Move History' },
    { path: '/warehouses', icon: Warehouse, label: 'Warehouses' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white/80 backdrop-blur-xl border-b border-white/30 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">StockFlow</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-2xl transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-white/30">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">StockFlow</h1>
            <p className="text-sm text-gray-500 mt-1">Inventory Management</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/60 backdrop-blur-sm'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/30">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50/50"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}