/**
 * RECEIPTS PAGE — Glass UI for incoming goods management
 */
import React, { useState } from 'react';
import { Plus, X, CheckCircle, Eye, ArrowDownToLine } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import type { OperationStatus, ReceiptLine } from '../types';

const statusBadge: Record<OperationStatus, string> = {
  draft: 'badge-draft', waiting: 'badge-waiting', ready: 'badge-ready', done: 'badge-done', canceled: 'badge-canceled',
};

const Receipts: React.FC = () => {
  const { receipts, products, warehouses, addReceipt, updateReceiptStatus, validateReceipt } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [reference, setReference] = useState('');
  const [supplier, setSupplier] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [lines, setLines] = useState<ReceiptLine[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = receipts.filter(r => !filterStatus || r.status === filterStatus);

  const openCreate = () => {
    const nextNum = receipts.length + 1;
    setReference(`REC-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`);
    setSupplier(''); setWarehouseId(warehouses[0]?.id || ''); setLines([]); setFormErrors({}); setShowForm(true);
  };

  const addLine = () => {
    const unused = products.find(p => !lines.some(l => l.productId === p.id));
    if (unused) setLines([...lines, { productId: unused.id, expectedQty: 1, receivedQty: 0 }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!supplier.trim()) errors.supplier = 'Supplier is required';
    if (lines.length === 0) errors.lines = 'Add at least one product line';
    if (lines.some(l => l.expectedQty <= 0)) errors.lines = 'All quantities must be positive';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    addReceipt({ reference, supplier, warehouseId, status: 'draft', lines });
    setShowForm(false);
  };

  const viewing = viewReceipt ? receipts.find(r => r.id === viewReceipt) : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Receipts</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Manage incoming goods from suppliers</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 btn-primary px-4 py-2.5 rounded-xl text-sm font-medium">
          <Plus size={16} /> New Receipt
        </button>
      </div>

      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        className="px-4 py-2.5 rounded-xl text-sm glass-input">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option><option value="waiting">Waiting</option>
        <option value="ready">Ready</option><option value="done">Done</option><option value="canceled">Canceled</option>
      </select>

      <div className="space-y-3">
        {filtered.map(receipt => {
          const wh = warehouses.find(w => w.id === receipt.warehouseId);
          return (
            <div key={receipt.id} className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownToLine size={15} className="text-emerald-500" />
                  <span className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>{receipt.reference}</span>
                  <span className={`badge ${statusBadge[receipt.status]}`}>{receipt.status}</span>
                </div>
                <div className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                  Supplier: <span style={{ color: 'var(--text-primary)' }}>{receipt.supplier}</span> · {wh?.name} · {receipt.lines.length} item(s)
                </div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>{new Date(receipt.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewReceipt(receipt.id)} className="px-3 py-1.5 text-sm rounded-xl btn-secondary inline-flex items-center gap-1">
                  <Eye size={13} /> View
                </button>
                {receipt.status !== 'done' && receipt.status !== 'canceled' && (
                  <>
                    {receipt.status === 'draft' && (
                      <button onClick={() => updateReceiptStatus(receipt.id, 'waiting')}
                        className="px-3 py-1.5 text-sm rounded-xl font-medium badge-waiting">Confirm</button>
                    )}
                    {(receipt.status === 'waiting' || receipt.status === 'ready') && (
                      <button onClick={() => validateReceipt(receipt.id)}
                        className="px-3 py-1.5 text-sm rounded-xl font-medium btn-success inline-flex items-center gap-1">
                        <CheckCircle size={13} /> Validate
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
            <ArrowDownToLine size={40} className="mx-auto mb-2 opacity-30" />No receipts found
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{viewing.reference}</h2>
              <button onClick={() => setViewReceipt(null)} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span style={{ color: 'var(--text-tertiary)' }}>Supplier:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{viewing.supplier}</span></div>
                <div><span style={{ color: 'var(--text-tertiary)' }}>Status:</span> <span className={`badge ${statusBadge[viewing.status]}`}>{viewing.status}</span></div>
                <div><span style={{ color: 'var(--text-tertiary)' }}>Warehouse:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{warehouses.find(w => w.id === viewing.warehouseId)?.name}</span></div>
                <div><span style={{ color: 'var(--text-tertiary)' }}>Date:</span> <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{new Date(viewing.createdAt).toLocaleDateString()}</span></div>
              </div>
              <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-sm glass-table">
                  <thead><tr><th className="text-left px-3 py-2">Product</th><th className="text-right px-3 py-2">Expected</th><th className="text-right px-3 py-2">Received</th></tr></thead>
                  <tbody>
                    {viewing.lines.map((line, idx) => {
                      const prod = products.find(p => p.id === line.productId);
                      return (
                        <tr key={idx} style={{ borderTop: '1px solid var(--divider)' }}>
                          <td className="px-3 py-2" style={{ color: 'var(--text-primary)' }}>{prod?.name}</td>
                          <td className="px-3 py-2 text-right" style={{ color: 'var(--text-secondary)' }}>{line.expectedQty}</td>
                          <td className="px-3 py-2 text-right font-medium" style={{ color: 'var(--text-primary)' }}>{viewing.status === 'done' ? (line.receivedQty || line.expectedQty) : line.receivedQty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>New Receipt</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Reference</label>
                <input type="text" value={reference} readOnly className="w-full px-4 py-2.5 rounded-xl text-sm glass-input font-mono opacity-60" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Supplier *</label>
                <input type="text" value={supplier} onChange={e => setSupplier(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm glass-input ${formErrors.supplier ? 'border-red-400/50' : ''}`}
                  placeholder="e.g., MetalCorp Inc." />
                {formErrors.supplier && <p className="text-red-400 text-xs mt-1">{formErrors.supplier}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Destination Warehouse</label>
                <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input">
                  {warehouses.filter(w => w.isActive).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Product Lines *</label>
                  <button type="button" onClick={addLine} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>+ Add Line</button>
                </div>
                {formErrors.lines && <p className="text-red-400 text-xs mb-2">{formErrors.lines}</p>}
                {lines.map((line, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <select value={line.productId} onChange={e => setLines(lines.map((l, i) => i === idx ? { ...l, productId: e.target.value } : l))}
                      className="flex-1 px-3 py-2 rounded-xl text-sm glass-input">
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" value={line.expectedQty} onChange={e => setLines(lines.map((l, i) => i === idx ? { ...l, expectedQty: parseInt(e.target.value) || 0 } : l))}
                      className="w-20 px-3 py-2 rounded-xl text-sm glass-input text-right" min="1" />
                    <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-500"><X size={15} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-primary">Create Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;
