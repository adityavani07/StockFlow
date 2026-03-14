/**
 * MOVE HISTORY PAGE — Stock Ledger
 *
 * A complete audit trail of every stock movement in the system.
 * Each receipt validation, delivery, transfer, or adjustment creates
 * one or more move records. This is the single source of truth
 * for what happened to any product at any point in time.
 */
import React, { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, History } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import type { OperationType } from '../types';

const typeColors: Record<OperationType, string> = {
  receipt: 'bg-green-100 text-green-700',
  delivery: 'bg-blue-100 text-blue-700',
  transfer: 'bg-purple-100 text-purple-700',
  adjustment: 'bg-amber-100 text-amber-700',
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Move History</h1>
        <p className="text-slate-500 mt-1">Complete stock ledger — every movement is logged</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by reference, product, or notes..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All Types</option>
          <option value="receipt">Receipts</option>
          <option value="delivery">Deliveries</option>
          <option value="transfer">Transfers</option>
          <option value="adjustment">Adjustments</option>
        </select>
        <select value={filterWarehouse} onChange={e => setFilterWarehouse(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm">
        <span className="text-slate-500">{filtered.length} movements</span>
        <span className="text-green-600 font-medium">
          ↑ {filtered.filter(m => m.quantityChange > 0).reduce((s, m) => s + m.quantityChange, 0)} in
        </span>
        <span className="text-red-600 font-medium">
          ↓ {Math.abs(filtered.filter(m => m.quantityChange < 0).reduce((s, m) => s + m.quantityChange, 0))} out
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Time</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Reference</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Warehouse</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Change</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(move => {
                const product = products.find(p => p.id === move.productId);
                const wh = warehouses.find(w => w.id === move.warehouseId);
                return (
                  <tr key={move.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(move.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[move.type]}`}>{move.type}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{move.reference}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{product?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{wh?.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {move.quantityChange > 0 ? (
                          <TrendingUp size={14} className="text-green-500" />
                        ) : (
                          <TrendingDown size={14} className="text-red-500" />
                        )}
                        <span className={`font-bold ${move.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {move.quantityChange > 0 ? '+' : ''}{move.quantityChange}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 hidden md:table-cell max-w-[200px] truncate">{move.notes}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <History size={40} className="mx-auto mb-2 opacity-30" />
                    No movements found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MoveHistory;
