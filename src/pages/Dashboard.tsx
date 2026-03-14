/**
 * DASHBOARD — macOS 26 Glass UI with animated KPIs, gradient charts, and vibrancy effects.
 */
import React from 'react';
import {
  Package, AlertTriangle, ArrowDownToLine, Truck, ArrowLeftRight,
  TrendingUp, TrendingDown, XCircle, Boxes
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useInventoryStore } from '../store/inventoryStore';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];

const Dashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { getKPIs, products, stock, moves, theme } = useInventoryStore();
  const kpis = getKPIs();

  const stockByProduct = products.map(p => ({
    name: p.name.length > 12 ? p.name.substring(0, 12) + '…' : p.name,
    stock: stock.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0),
    reorder: p.reorderLevel,
  }));

  const categories = [...new Set(products.map(p => p.category))];
  const stockByCategory = categories.map(cat => {
    const catProducts = products.filter(p => p.category === cat);
    const total = catProducts.reduce((sum, p) =>
      sum + stock.filter(s => s.productId === p.id).reduce((s2, s) => s2 + s.quantity, 0), 0);
    return { name: cat, value: total };
  });

  const lowStockProducts = products.filter(p => {
    const total = stock.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0);
    return total <= p.reorderLevel;
  }).map(p => ({
    ...p,
    totalStock: stock.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0),
  }));

  const recentMoves = [...moves].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 8);

  // Simulated activity data for area chart
  const activityData = Array.from({ length: 7 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    inbound: Math.floor(Math.random() * 50) + 20,
    outbound: Math.floor(Math.random() * 40) + 10,
  }));

  const kpiCards = [
    { label: 'Total Products', value: kpis.totalProducts, icon: Package, gradient: 'from-indigo-500 to-blue-500', glow: 'rgba(99,102,241,0.3)', click: 'products' },
    { label: 'Stock Units', value: kpis.totalStock.toLocaleString(), icon: Boxes, gradient: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.3)', click: 'products' },
    { label: 'Low Stock', value: kpis.lowStockItems, icon: AlertTriangle, gradient: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.3)', click: 'products' },
    { label: 'Out of Stock', value: kpis.outOfStockItems, icon: XCircle, gradient: 'from-red-500 to-rose-500', glow: 'rgba(239,68,68,0.3)', click: 'products' },
    { label: 'Pending Receipts', value: kpis.pendingReceipts, icon: ArrowDownToLine, gradient: 'from-violet-500 to-purple-500', glow: 'rgba(139,92,246,0.3)', click: 'receipts' },
    { label: 'Pending Deliveries', value: kpis.pendingDeliveries, icon: Truck, gradient: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.3)', click: 'deliveries' },
    { label: 'Transfers', value: kpis.scheduledTransfers, icon: ArrowLeftRight, gradient: 'from-pink-500 to-rose-500', glow: 'rgba(236,72,153,0.3)', click: 'transfers' },
  ];

  const getTypeBadgeClass = (type: string) => {
    const classes: Record<string, string> = {
      receipt: 'type-receipt',
      delivery: 'type-delivery',
      transfer: 'type-transfer',
      adjustment: 'type-adjustment',
    };
    return classes[type] || '';
  };

  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(30,30,45,0.9)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: '12px',
    backdropFilter: 'blur(20px)',
    color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    fontSize: '12px',
  };

  const axisColor = theme === 'dark' ? '#475569' : '#94a3b8';

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 stagger">
        {kpiCards.map(kpi => (
          <button
            key={kpi.label}
            onClick={() => onNavigate(kpi.click)}
            className="glass-card rounded-2xl p-4 text-left kpi-card group"
          >
            <div className={`w-10 h-10 bg-gradient-to-br ${kpi.gradient} rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110`}
              style={{ boxShadow: `0 4px 14px ${kpi.glow}` }}>
              <kpi.icon size={18} className="text-white" />
            </div>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{kpi.value}</div>
            <div className="text-[11px] mt-1 font-medium" style={{ color: 'var(--text-tertiary)' }}>{kpi.label}</div>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stock by Product Bar Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-[14px] mb-4" style={{ color: 'var(--text-primary)' }}>Stock Levels vs Reorder Points</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockByProduct} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10, fill: axisColor }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="stock" fill="#6366f1" name="Current Stock" radius={[6, 6, 0, 0]} />
                <Bar dataKey="reorder" fill="#f59e0b" name="Reorder Level" radius={[6, 6, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock by Category Pie */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-[14px] mb-4" style={{ color: 'var(--text-primary)' }}>Stock by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stockByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" strokeWidth={0}
                  label={({ name, value }) => `${name}: ${value}`}>
                  {stockByCategory.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-semibold text-[14px] mb-4" style={{ color: 'var(--text-primary)' }}>Weekly Activity</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: axisColor }} />
              <YAxis tick={{ fontSize: 11, fill: axisColor }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="inbound" stroke="#6366f1" fill="url(#gradIn)" strokeWidth={2} name="Inbound" />
              <Area type="monotone" dataKey="outbound" stroke="#ec4899" fill="url(#gradOut)" strokeWidth={2} name="Outbound" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row: Alerts + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Low Stock Alerts */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-[14px] mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <AlertTriangle size={16} className="text-amber-500" />
            Low Stock Alerts
          </h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--text-tertiary)' }}>All stock levels are healthy ✓</p>
          ) : (
            <div className="space-y-2">
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors"
                  style={{ background: 'var(--surface)' }}>
                  <div>
                    <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                    <div className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{p.sku}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[13px] font-bold ${p.totalStock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                      {p.totalStock} {p.unitOfMeasure}
                    </span>
                    <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Reorder: {p.reorderLevel}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-semibold text-[14px] mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={16} className="text-indigo-500" />
            Recent Stock Movements
          </h3>
          <div className="space-y-2">
            {recentMoves.map(move => {
              const product = products.find(p => p.id === move.productId);
              return (
                <div key={move.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors"
                  style={{ background: 'var(--surface)' }}>
                  <div className="flex items-center gap-3">
                    <span className={`badge ${getTypeBadgeClass(move.type)}`}>{move.type}</span>
                    <div>
                      <div className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{product?.name || 'Unknown'}</div>
                      <div className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{move.reference}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {move.quantityChange > 0 ? (
                      <TrendingUp size={13} className="text-emerald-500" />
                    ) : (
                      <TrendingDown size={13} className="text-red-500" />
                    )}
                    <span className={`text-[13px] font-bold ${move.quantityChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
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
