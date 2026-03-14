/**
 * DASHBOARD PAGE
 * Shows KPI cards, recent activity, stock distribution chart,
 * and low-stock alerts. This is the main landing page after login.
 */
import React from 'react';
import {
  Package, AlertTriangle, ArrowDownToLine, Truck, ArrowLeftRight,
  TrendingUp, TrendingDown, XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useInventoryStore } from '../store/inventoryStore';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const Dashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { getKPIs, products, stock, moves } = useInventoryStore();
  const kpis = getKPIs();

  // Prepare stock-by-product chart data
  const stockByProduct = products.map(p => ({
    name: p.name.length > 15 ? p.name.substring(0, 15) + '…' : p.name,
    stock: stock.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0),
    reorder: p.reorderLevel,
  }));

  // Stock by category for pie chart
  const categories = [...new Set(products.map(p => p.category))];
  const stockByCategory = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    const total = catProducts.reduce((sum, p) =>
      sum + stock.filter(s => s.productId === p.id).reduce((s2, s) => s2 + s.quantity, 0), 0);
    return { name: cat, value: total };
  });

  // Low stock alerts
  const lowStockProducts = products.filter(p => {
    const total = stock.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0);
    return total <= p.reorderLevel;
  }).map(p => ({
    ...p,
    totalStock: stock.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0),
  }));

  // Recent moves
  const recentMoves = [...moves].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  const kpiCards = [
    { label: 'Total Products', value: kpis.totalProducts, icon: Package, color: 'bg-blue-500', click: 'products' },
    { label: 'Total Stock Units', value: kpis.totalStock.toLocaleString(), icon: TrendingUp, color: 'bg-emerald-500', click: 'products' },
    { label: 'Low Stock Items', value: kpis.lowStockItems, icon: AlertTriangle, color: 'bg-amber-500', click: 'products' },
    { label: 'Out of Stock', value: kpis.outOfStockItems, icon: XCircle, color: 'bg-red-500', click: 'products' },
    { label: 'Pending Receipts', value: kpis.pendingReceipts, icon: ArrowDownToLine, color: 'bg-indigo-500', click: 'receipts' },
    { label: 'Pending Deliveries', value: kpis.pendingDeliveries, icon: Truck, color: 'bg-purple-500', click: 'deliveries' },
    { label: 'Scheduled Transfers', value: kpis.scheduledTransfers, icon: ArrowLeftRight, color: 'bg-cyan-500', click: 'transfers' },
  ];

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      receipt: 'bg-green-100 text-green-700',
      delivery: 'bg-blue-100 text-blue-700',
      transfer: 'bg-purple-100 text-purple-700',
      adjustment: 'bg-amber-100 text-amber-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your inventory operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {kpiCards.map(kpi => (
          <button
            key={kpi.label}
            onClick={() => onNavigate(kpi.click)}
            className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow text-left"
          >
            <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center mb-3`}>
              <kpi.icon size={20} className="text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
            <div className="text-xs text-slate-500 mt-1">{kpi.label}</div>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock by Product Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">Stock Levels vs Reorder Points</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByProduct} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="stock" fill="#10b981" name="Current Stock" radius={[4, 4, 0, 0]} />
                <Bar dataKey="reorder" fill="#f59e0b" name="Reorder Level" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock by Category Pie */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4">Stock by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {stockByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Low Stock Alerts
          </h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-slate-400 text-sm py-4 text-center">All stock levels are healthy ✓</p>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.sku}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${p.totalStock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {p.totalStock} {p.unitOfMeasure}
                    </span>
                    <div className="text-xs text-slate-400">Reorder: {p.reorderLevel}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            Recent Stock Movements
          </h3>
          <div className="space-y-3">
            {recentMoves.map(move => {
              const product = products.find(p => p.id === move.productId);
              return (
                <div key={move.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(move.type)}`}>
                      {move.type}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{product?.name || 'Unknown'}</div>
                      <div className="text-xs text-slate-400">{move.reference}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {move.quantityChange > 0 ? (
                      <TrendingUp size={14} className="text-green-500" />
                    ) : (
                      <TrendingDown size={14} className="text-red-500" />
                    )}
                    <span className={`text-sm font-bold ${move.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {move.quantityChange > 0 ? '+' : ''}{move.quantityChange}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
