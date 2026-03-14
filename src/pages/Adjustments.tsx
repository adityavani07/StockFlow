/**
 * ADJUSTMENTS PAGE — Glass UI for stock corrections
 */
import React, { useState } from 'react';
import { Plus, X, CheckCircle, ClipboardList } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import type { OperationStatus, AdjustmentLine } from '../types';

const statusBadge: Record<OperationStatus, string> = {
  draft: 'badge-draft', waiting: 'badge-waiting', ready: 'badge-ready', done: 'badge-done', canceled: 'badge-canceled',
};

const Adjustments: React.FC = () => {
  const { adjustments, products, warehouses, stock, addAdjustment, validateAdjustment } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState('');
  const [lines, setLines] = useState<AdjustmentLine[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const activeWarehouses = warehouses.filter(w => w.isActive);

  const openCreate = () => { setReason(''); setLines([]); setFormErrors({}); setShowForm(true); };

  const addLine = () => {
    const fp = products[0]; const fw = activeWarehouses[0];
    if (!fp || !fw) return;
    const cs = stock.find(s => s.productId === fp.id && s.warehouseId === fw.id)?.quantity || 0;
    setLines([...lines, { productId: fp.id, warehouseId: fw.id, recordedQty: cs, countedQty: cs, difference: 0 }]);
  };

  const updateLine = (idx: number, field: string, value: string) => {
    setLines(lines.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: value };
      if (field === 'productId' || field === 'warehouseId') {
        const pid = field === 'productId' ? value : l.productId;
        const wid = field === 'warehouseId' ? value : l.warehouseId;
        const recorded = stock.find(s => s.productId === pid && s.warehouseId === wid)?.quantity || 0;
        updated.recordedQty = recorded; updated.productId = pid; updated.warehouseId = wid;
        updated.difference = (updated.countedQty || 0) - recorded;
      }
      if (field === 'countedQty') {
        const counted = parseInt(value) || 0;
        updated.countedQty = counted; updated.difference = counted - updated.recordedQty;
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
    const n = adjustments.length + 1;
    const reference = `ADJ-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`;
    addAdjustment({ reference, reason, status: 'draft', lines });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Stock Adjustments</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Correct stock discrepancies from physical counts</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 btn-primary px-4 py-2.5 rounded-xl text-sm font-medium">
          <Plus size={16} /> New Adjustment
        </button>
      </div>

      <div className="space-y-3">
        {adjustments.map(adj => (
          <div key={adj.id} className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardList size={15} className="text-amber-500" />
                <span className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>{adj.reference}</span>
                <span className={`badge ${statusBadge[adj.status]}`}>{adj.status}</span>
              </div>
              <div className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{adj.reason}</div>
              <div className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{new Date(adj.createdAt).toLocaleDateString()}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {adj.lines.map((line, idx) => {
                  const prod = products.find(p => p.id === line.productId);
                  return (
                    <span key={idx} className={`badge ${line.difference > 0 ? 'badge-done' : line.difference < 0 ? 'badge-canceled' : 'badge-draft'}`}>
                      {prod?.name}: {line.difference > 0 ? '+' : ''}{line.difference}
                    </span>
                  );
                })}
              </div>
            </div>
            {adj.status !== 'done' && adj.status !== 'canceled' && (
              <button onClick={() => validateAdjustment(adj.id)} className="px-3 py-1.5 text-sm rounded-xl font-medium btn-success inline-flex items-center gap-1">
                <CheckCircle size={13} /> Validate
              </button>
            )}
          </div>
        ))}
        {adjustments.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}><ClipboardList size={40} className="mx-auto mb-2 opacity-30" />No adjustments found</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-modal rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New Stock Adjustment</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Reason *</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm glass-input ${formErrors.reason ? 'border-red-400/50' : ''}`}
                  placeholder="e.g., Damaged items found during audit" />
                {formErrors.reason && <p className="text-red-400 text-xs mt-1">{formErrors.reason}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Adjustment Lines *</label>
                  <button type="button" onClick={addLine} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>+ Add Line</button>
                </div>
                {formErrors.lines && <p className="text-red-400 text-xs mb-2">{formErrors.lines}</p>}
                {lines.map((line, idx) => (
                  <div key={idx} className="flex flex-wrap items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: 'var(--surface)' }}>
                    <select value={line.productId} onChange={e => updateLine(idx, 'productId', e.target.value)}
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-xl text-sm glass-input">
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select value={line.warehouseId} onChange={e => updateLine(idx, 'warehouseId', e.target.value)}
                      className="min-w-[120px] px-3 py-2 rounded-xl text-sm glass-input">
                      {activeWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      Recorded: <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{line.recordedQty}</span>
                    </div>
                    <input type="number" value={line.countedQty} onChange={e => updateLine(idx, 'countedQty', e.target.value)}
                      className="w-24 px-3 py-2 rounded-xl text-sm glass-input text-right" min="0" placeholder="Counted" />
                    <span className={`text-sm font-bold min-w-[50px] text-right ${line.difference > 0 ? 'text-emerald-500' : line.difference < 0 ? 'text-red-500' : ''}`}
                      style={line.difference === 0 ? { color: 'var(--text-tertiary)' } : {}}>
                      {line.difference > 0 ? '+' : ''}{line.difference}
                    </span>
                    <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-500"><X size={15} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-primary">Create Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adjustments;
