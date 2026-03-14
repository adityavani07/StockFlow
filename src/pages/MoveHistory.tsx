/**
 * MOVE HISTORY PAGE — Glass table with full audit trail
 */
import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, History } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import type { OperationType } from '../types';

const typeClasses: Record<OperationType, string> = {
  receipt: 'type-receipt', delivery: 'type-delivery', transfer: 'type-transfer', adjustment: 'type-adjustment',
};

const MoveHistory: React.FC = () => {
  const { moves, products, warehouses } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState('');

  const filtered = useMemo(() => {
    return [...moves]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter(m => {
        const product = products.find(p => p.id === m.productId);
        const matchSearch = !search ||
          m.reference.toLowerCase().includes(search.toLowerCase()) ||
          product?.name.toLowerCase().includes(search.toLowerCase()) ||
          m.notes.toLowerCase().includes(search.toLowerCase());
        const matchType = !filterType || m.type === filterType;
        const matchWh = !filterWarehouse || m.warehouseId === filterWarehouse;
        return matchSearch && matchType && matchWh;
      });
  }, [moves, products, search, filterType, filterWarehouse]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Move History</h1>
        <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Complete stock ledger — every movement is logged</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input type="text" placeholder="Search by reference, product, or notes..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm glass-input">
          <option value="">All Types</option>
          <option value="receipt">Receipts</option><option value="delivery">Deliveries</option>
          <option value="transfer">Transfers</option><option value="adjustment">Adjustments</option>
        </select>
        <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm glass-input">
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      <div className="flex gap-4 text-[13px]">
        <span style={{ color: 'var(--text-tertiary)' }}>{filtered.length} movements</span>
        <span className="text-emerald-500 font-medium">
          ↑ {filtered.filter(m => m.quantityChange > 0).reduce((s, m) => s + m.quantityChange, 0)} in
        </span>
        <span className="text-red-500 font-medium">
          ↓ {Math.abs(filtered.filter(m => m.quantityChange < 0).reduce((s, m) => s + m.quantityChange, 0))} out
        </span>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm glass-table">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                <th className="text-left px-4 py-3">Time</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Reference</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Warehouse</th>
                <th className="text-right px-4 py-3">Change</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(move => {
                const product = products.find(p => p.id === move.productId);
                const wh = warehouses.find(w => w.id === move.warehouseId);
                return (
                  <tr key={move.id} style={{ borderBottom: '1px solid var(--divider)' }}>
                    <td className="px-4 py-3 text-[11px] whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
                      {new Date(move.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3"><span className={`badge ${typeClasses[move.type]}`}>{move.type}</span></td>
                    <td className="px-4 py-3 font-mono text-[11px]" style={{ color: 'var(--text-secondary)' }}>{move.reference}</td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{product?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 hidden sm:table-cell" style={{ color: 'var(--text-secondary)' }}>{wh?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {move.quantityChange > 0 ? <TrendingUp size={13} className="text-emerald-500" /> : <TrendingDown size={13} className="text-red-500" />}
                        <span className={`font-bold ${move.quantityChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {move.quantityChange > 0 ? '+' : ''}{move.quantityChange}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] hidden md:table-cell max-w-[200px] truncate" style={{ color: 'var(--text-tertiary)' }}>{move.notes}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
                  <History size={40} className="mx-auto mb-2 opacity-30" />No movements found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MoveHistory;
