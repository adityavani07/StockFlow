/**
 * ADJUSTMENTS PAGE — Stock Corrections
 *
 * Used when a physical count reveals a discrepancy between
 * recorded stock and actual stock on the shelf.
 * System automatically calculates the difference and updates stock.
 */
import React, { useState } from 'react';
import { Plus, X, CheckCircle, ClipboardList } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import type { OperationStatus, AdjustmentLine } from '../types';

const statusColors: Record<OperationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700', waiting: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-blue-100 text-blue-700', done: 'bg-green-100 text-green-700', canceled: 'bg-red-100 text-red-700',
};

const Adjustments: React.FC = () => {
  const { adjustments, products, warehouses, stock, addAdjustment, validateAdjustment } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);

  const [reason, setReason] = useState('');
  const [lines, setLines] = useState<AdjustmentLine[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const activeWarehouses = warehouses.filter(w => w.isActive);

  const openCreate = () => {
    setReason('');
    setLines([]);
    setFormErrors({});
    setShowForm(true);
  };

  const addLine = () => {
    const firstProduct = products[0];
    const firstWh = activeWarehouses[0];
    if (!firstProduct || !firstWh) return;
    const currentStock = stock.find(s => s.productId === firstProduct.id && s.warehouseId === firstWh.id)?.quantity || 0;
    setLines([...lines, { productId: firstProduct.id, warehouseId: firstWh.id, recordedQty: currentStock, countedQty: currentStock, difference: 0 }]);
  };

  const updateLine = (idx: number, field: string, value: string) => {
    setLines(lines.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: value };

      // Recalculate recorded qty and difference when product/warehouse changes
      if (field === 'productId' || field === 'warehouseId') {
        const pid = field === 'productId' ? value : l.productId;
        const wid = field === 'warehouseId' ? value : l.warehouseId;
        const recorded = stock.find(s => s.productId === pid && s.warehouseId === wid)?.quantity || 0;
        updated.recordedQty = recorded;
        updated.productId = pid;
        updated.warehouseId = wid;
        updated.difference = (updated.countedQty || 0) - recorded;
      }
      if (field === 'countedQty') {
        const counted = parseInt(value) || 0;
        updated.countedQty = counted;
        updated.difference = counted - updated.recordedQty;
      }
      return updated;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!reason.trim()) errors.reason = 'Reason is required';
    if (lines.length === 0) errors.lines = 'Add at least one adjustment line';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const nextNum = adjustments.length + 1;
    const reference = `ADJ-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
    addAdjustment({ reference, reason, status: 'draft', lines });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Stock Adjustments</h1>
          <p className="text-slate-500 mt-1">Correct stock discrepancies from physical counts</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 font-medium text-sm">
          <Plus size={18} /> New Adjustment
        </button>
      </div>

      <div className="space-y-3">
        {adjustments.map(adj => (
          <div key={adj.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList size={16} className="text-amber-500" />
                <span className="font-bold text-slate-900">{adj.reference}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[adj.status]}`}>{adj.status}</span>
              </div>
              <div className="text-sm text-slate-500">{adj.reason}</div>
              <div className="text-xs text-slate-400 mt-1">{new Date(adj.createdAt).toLocaleDateString()}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {adj.lines.map((line, idx) => {
                  const prod = products.find(p => p.id === line.productId);
                  return (
                    <span key={idx} className={`px-2 py-0.5 rounded text-xs font-medium ${line.difference > 0 ? 'bg-green-100 text-green-700' : line.difference < 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {prod?.name}: {line.difference > 0 ? '+' : ''}{line.difference}
                    </span>
                  );
                })}
              </div>
            </div>
            {adj.status !== 'done' && adj.status !== 'canceled' && (
              <button onClick={() => validateAdjustment(adj.id)} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-1">
                <CheckCircle size={14} /> Validate
              </button>
            )}
          </div>
        ))}
        {adjustments.length === 0 && (
          <div className="text-center py-12 text-slate-400"><ClipboardList size={40} className="mx-auto mb-2 opacity-30" />No adjustments found</div>
        )}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">New Stock Adjustment</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason *</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${formErrors.reason ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="e.g., Damaged items found during audit" />
                {formErrors.reason && <p className="text-red-500 text-xs mt-1">{formErrors.reason}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-slate-700">Adjustment Lines *</label>
                  <button type="button" onClick={addLine} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Add Line</button>
                </div>
                {formErrors.lines && <p className="text-red-500 text-xs mb-2">{formErrors.lines}</p>}
                {lines.map((line, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 mb-3 p-3 bg-slate-50 rounded-lg">
                    <select value={line.productId} onChange={e => updateLine(idx, 'productId', e.target.value)}
                      className="flex-1 min-w-[140px] px-3 py-2 border border-slate-200 rounded-lg text-sm">
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select value={line.warehouseId} onChange={e => updateLine(idx, 'warehouseId', e.target.value)}
                      className="min-w-[120px] px-3 py-2 border border-slate-200 rounded-lg text-sm">
                      {activeWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    <div className="text-xs text-slate-500">
                      Recorded: <span className="font-bold">{line.recordedQty}</span>
                    </div>
                    <input type="number" value={line.countedQty} onChange={e => updateLine(idx, 'countedQty', e.target.value)}
                      className="w-24 px-3 py-2 border border-slate-200 rounded-lg text-sm text-right" min="0" placeholder="Counted" />
                    <span className={`text-sm font-bold min-w-[50px] text-right ${line.difference > 0 ? 'text-green-600' : line.difference < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                      {line.difference > 0 ? '+' : ''}{line.difference}
                    </span>
                    <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Create Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adjustments;
