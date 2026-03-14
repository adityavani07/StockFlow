/**
 * TRANSFERS PAGE — Internal Stock Movements
 * Move stock between warehouses/locations within the company.
 * Total stock doesn't change; only the location distribution updates.
 */
import React, { useState } from 'react';
import { Plus, X, CheckCircle, ArrowLeftRight } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import type { OperationStatus, TransferLine } from '../types';

const statusColors: Record<OperationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700', waiting: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-blue-100 text-blue-700', done: 'bg-green-100 text-green-700', canceled: 'bg-red-100 text-red-700',
};

const Transfers: React.FC = () => {
  const { transfers, products, warehouses, addTransfer, updateTransferStatus, validateTransfer } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const [reference, setReference] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('');
  const [toWarehouseId, setToWarehouseId] = useState('');
  const [lines, setLines] = useState<TransferLine[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = transfers.filter(t => !filterStatus || t.status === filterStatus);
  const activeWarehouses = warehouses.filter(w => w.isActive);

  const openCreate = () => {
    const nextNum = transfers.length + 1;
    setReference(`TRF-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`);
    setFromWarehouseId(activeWarehouses[0]?.id || '');
    setToWarehouseId(activeWarehouses[1]?.id || activeWarehouses[0]?.id || '');
    setLines([]);
    setFormErrors({});
    setShowForm(true);
  };

  const addLine = () => {
    const unusedProduct = products.find(p => !lines.some(l => l.productId === p.id));
    if (unusedProduct) setLines([...lines, { productId: unusedProduct.id, quantity: 1 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (fromWarehouseId === toWarehouseId) errors.warehouse = 'Source and destination must differ';
    if (lines.length === 0) errors.lines = 'Add at least one product';
    if (lines.some(l => l.quantity <= 0)) errors.lines = 'All quantities must be positive';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    addTransfer({ reference, fromWarehouseId, toWarehouseId, status: 'draft', lines });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Internal Transfers</h1>
          <p className="text-slate-500 mt-1">Move stock between warehouses and locations</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 font-medium text-sm">
          <Plus size={18} /> New Transfer
        </button>
      </div>

      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option><option value="waiting">Waiting</option>
        <option value="ready">Ready</option><option value="done">Done</option><option value="canceled">Canceled</option>
      </select>

      <div className="space-y-3">
        {filtered.map(tr => {
          const fromWh = warehouses.find(w => w.id === tr.fromWarehouseId);
          const toWh = warehouses.find(w => w.id === tr.toWarehouseId);
          return (
            <div key={tr.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowLeftRight size={16} className="text-purple-500" />
                  <span className="font-bold text-slate-900">{tr.reference}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[tr.status]}`}>{tr.status}</span>
                </div>
                <div className="text-sm text-slate-500">
                  <span className="text-slate-700 font-medium">{fromWh?.name}</span> → <span className="text-slate-700 font-medium">{toWh?.name}</span> · {tr.lines.length} item(s)
                </div>
                <div className="text-xs text-slate-400 mt-1">{new Date(tr.createdAt).toLocaleDateString()}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {tr.lines.map((line, idx) => {
                    const prod = products.find(p => p.id === line.productId);
                    return <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">{prod?.name}: {line.quantity}</span>;
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tr.status !== 'done' && tr.status !== 'canceled' && (
                  <>
                    {tr.status === 'draft' && (
                      <button onClick={() => updateTransferStatus(tr.id, 'waiting')} className="px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100">Confirm</button>
                    )}
                    {(tr.status === 'waiting' || tr.status === 'ready') && (
                      <button onClick={() => validateTransfer(tr.id)} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-1"><CheckCircle size={14} /> Validate</button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400"><ArrowLeftRight size={40} className="mx-auto mb-2 opacity-30" />No transfers found</div>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">New Internal Transfer</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                <input type="text" value={reference} readOnly className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">From Warehouse</label>
                  <select value={fromWarehouseId} onChange={e => setFromWarehouseId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {activeWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">To Warehouse</label>
                  <select value={toWarehouseId} onChange={e => setToWarehouseId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {activeWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              {formErrors.warehouse && <p className="text-red-500 text-xs">{formErrors.warehouse}</p>}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Product Lines *</label>
                  <button type="button" onClick={addLine} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Add Line</button>
                </div>
                {formErrors.lines && <p className="text-red-500 text-xs mb-2">{formErrors.lines}</p>}
                {lines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <select value={line.productId} onChange={e => setLines(lines.map((l, i) => i === idx ? { ...l, productId: e.target.value } : l))}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm">
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" value={line.quantity} onChange={e => setLines(lines.map((l, i) => i === idx ? { ...l, quantity: parseInt(e.target.value) || 0 } : l))}
                      className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm text-right" min="1" />
                    <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Create Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfers;
