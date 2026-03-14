/**
 * TRANSFERS PAGE — Glass UI for internal stock movements
 */
import React, { useState } from 'react';
import { Plus, X, CheckCircle, ArrowLeftRight } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import type { OperationStatus, TransferLine } from '../types';

const statusBadge: Record<OperationStatus, string> = {
  draft: 'badge-draft', waiting: 'badge-waiting', ready: 'badge-ready', done: 'badge-done', canceled: 'badge-canceled',
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
    const n = transfers.length + 1;
    setReference(`TRF-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`);
    setFromWarehouseId(activeWarehouses[0]?.id || '');
    setToWarehouseId(activeWarehouses[1]?.id || activeWarehouses[0]?.id || '');
    setLines([]); setFormErrors({}); setShowForm(true);
  };

  const addLine = () => {
    const unused = products.find(p => !lines.some(l => l.productId === p.id));
    if (unused) setLines([...lines, { productId: unused.id, quantity: 1 }]);
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
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Internal Transfers</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Move stock between warehouses and locations</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 btn-primary px-4 py-2.5 rounded-xl text-sm font-medium">
          <Plus size={16} /> New Transfer
        </button>
      </div>

      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm glass-input">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option><option value="waiting">Waiting</option>
        <option value="ready">Ready</option><option value="done">Done</option><option value="canceled">Canceled</option>
      </select>

      <div className="space-y-3">
        {filtered.map(tr => {
          const fromWh = warehouses.find(w => w.id === tr.fromWarehouseId);
          const toWh = warehouses.find(w => w.id === tr.toWarehouseId);
          return (
            <div key={tr.id} className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowLeftRight size={15} className="text-purple-500" />
                  <span className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>{tr.reference}</span>
                  <span className={`badge ${statusBadge[tr.status]}`}>{tr.status}</span>
                </div>
                <div className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{fromWh?.name}</span>
                  <span className="mx-2" style={{ color: 'var(--accent)' }}>→</span>
                  <span style={{ color: 'var(--text-primary)' }}>{toWh?.name}</span>
                  <span className="ml-2">· {tr.lines.length} item(s)</span>
                </div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{new Date(tr.createdAt).toLocaleDateString()}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {tr.lines.map((line, idx) => {
                    const prod = products.find(p => p.id === line.productId);
                    return <span key={idx} className="badge" style={{ background: 'var(--badge-bg)', color: 'var(--text-secondary)' }}>{prod?.name}: {line.quantity}</span>;
                  })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {tr.status !== 'done' && tr.status !== 'canceled' && (
                  <>
                    {tr.status === 'draft' && (
                      <button onClick={() => updateTransferStatus(tr.id, 'waiting')} className="px-3 py-1.5 text-sm rounded-xl font-medium badge-waiting">Confirm</button>
                    )}
                    {(tr.status === 'waiting' || tr.status === 'ready') && (
                      <button onClick={() => validateTransfer(tr.id)} className="px-3 py-1.5 text-sm rounded-xl font-medium btn-success inline-flex items-center gap-1"><CheckCircle size={13} /> Validate</button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}><ArrowLeftRight size={40} className="mx-auto mb-2 opacity-30" />No transfers found</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New Internal Transfer</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Reference</label>
                <input type="text" value={reference} readOnly className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-mono opacity-60" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>From</label>
                  <select value={fromWarehouseId} onChange={e => setFromWarehouseId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm glass-input">
                    {activeWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>To</label>
                  <select value={toWarehouseId} onChange={e => setToWarehouseId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm glass-input">
                    {activeWarehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              {formErrors.warehouse && <p className="text-red-400 text-xs">{formErrors.warehouse}</p>}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Product Lines *</label>
                  <button type="button" onClick={addLine} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>+ Add Line</button>
                </div>
                {formErrors.lines && <p className="text-red-400 text-xs mb-2">{formErrors.lines}</p>}
                {lines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <select value={line.productId} onChange={e => setLines(lines.map((l, i) => i === idx ? { ...l, productId: e.target.value } : l))}
                      className="flex-1 px-3 py-2 rounded-xl text-sm glass-input">{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <input type="number" value={line.quantity} onChange={e => setLines(lines.map((l, i) => i === idx ? { ...l, quantity: parseInt(e.target.value) || 0 } : l))}
                      className="w-20 px-3 py-2 rounded-xl text-sm glass-input text-right" min="1" />
                    <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-500"><X size={15} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-primary">Create Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transfers;
