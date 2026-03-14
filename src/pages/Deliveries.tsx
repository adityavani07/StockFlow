/**
 * DELIVERIES PAGE — Outgoing Goods Management
 * Mirrors Receipts but for stock that leaves the warehouse.
 * Validating a delivery decreases stock automatically.
 */
import React, { useState } from 'react';
import { Plus, X, CheckCircle, Eye, Truck } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import type { OperationStatus, DeliveryLine } from '../types';

const statusColors: Record<OperationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  waiting: 'bg-yellow-100 text-yellow-700',
  ready: 'bg-blue-100 text-blue-700',
  done: 'bg-green-100 text-green-700',
  canceled: 'bg-red-100 text-red-700',
};

const Deliveries: React.FC = () => {
  const { deliveries, products, warehouses, addDelivery, updateDeliveryStatus, validateDelivery } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('');

  const [reference, setReference] = useState('');
  const [customer, setCustomer] = useState('');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [lines, setLines] = useState<DeliveryLine[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = deliveries.filter(d => !filterStatus || d.status === filterStatus);

  const openCreate = () => {
    const nextNum = deliveries.length + 1;
    setReference(`DEL-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`);
    setCustomer('');
    setWarehouseId(warehouses[0]?.id || '');
    setLines([]);
    setFormErrors({});
    setShowForm(true);
  };

  const addLine = () => {
    const unusedProduct = products.find(p => !lines.some(l => l.productId === p.id));
    if (unusedProduct) {
      setLines([...lines, { productId: unusedProduct.id, orderedQty: 1, deliveredQty: 0 }]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!customer.trim()) errors.customer = 'Customer is required';
    if (lines.length === 0) errors.lines = 'Add at least one product line';
    if (lines.some(l => l.orderedQty <= 0)) errors.lines = 'All quantities must be positive';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    addDelivery({ reference, customer, warehouseId, status: 'draft', lines });
    setShowForm(false);
  };

  const viewing = viewId ? deliveries.find(d => d.id === viewId) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Delivery Orders</h1>
          <p className="text-slate-500 mt-1">Manage outgoing shipments to customers</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
          <Plus size={18} /> New Delivery
        </button>
      </div>

      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
        <option value="">All Statuses</option>
        <option value="draft">Draft</option><option value="waiting">Waiting</option>
        <option value="ready">Ready</option><option value="done">Done</option><option value="canceled">Canceled</option>
      </select>

      <div className="space-y-3">
        {filtered.map(del => {
          const wh = warehouses.find(w => w.id === del.warehouseId);
          return (
            <div key={del.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Truck size={16} className="text-blue-500" />
                  <span className="font-bold text-slate-900">{del.reference}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[del.status]}`}>{del.status}</span>
                </div>
                <div className="text-sm text-slate-500">
                  Customer: <span className="text-slate-700">{del.customer}</span> · {wh?.name} · {del.lines.length} item(s)
                </div>
                <div className="text-xs text-slate-400 mt-1">{new Date(del.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewId(del.id)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 inline-flex items-center gap-1"><Eye size={14} /> View</button>
                {del.status !== 'done' && del.status !== 'canceled' && (
                  <>
                    {del.status === 'draft' && (
                      <button onClick={() => updateDeliveryStatus(del.id, 'ready')} className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100">Pack</button>
                    )}
                    {(del.status === 'waiting' || del.status === 'ready') && (
                      <button onClick={() => validateDelivery(del.id)} className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 inline-flex items-center gap-1"><CheckCircle size={14} /> Validate</button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400"><Truck size={40} className="mx-auto mb-2 opacity-30" />No deliveries found</div>
        )}
      </div>

      {/* View Modal */}
      {viewing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{viewing.reference}</h2>
              <button onClick={() => setViewId(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-500">Customer:</span> <span className="font-medium">{viewing.customer}</span></div>
                <div><span className="text-slate-500">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[viewing.status]}`}>{viewing.status}</span></div>
                <div><span className="text-slate-500">Warehouse:</span> <span className="font-medium">{warehouses.find(w => w.id === viewing.warehouseId)?.name}</span></div>
                <div><span className="text-slate-500">Date:</span> <span className="font-medium">{new Date(viewing.createdAt).toLocaleDateString()}</span></div>
              </div>
              <table className="w-full text-sm border border-slate-100 rounded-lg overflow-hidden">
                <thead><tr className="bg-slate-50"><th className="text-left px-3 py-2">Product</th><th className="text-right px-3 py-2">Ordered</th><th className="text-right px-3 py-2">Delivered</th></tr></thead>
                <tbody>
                  {viewing.lines.map((line, idx) => {
                    const prod = products.find(p => p.id === line.productId);
                    return (
                      <tr key={idx} className="border-t border-slate-50">
                        <td className="px-3 py-2">{prod?.name || 'Unknown'}</td>
                        <td className="px-3 py-2 text-right">{line.orderedQty}</td>
                        <td className="px-3 py-2 text-right font-medium">{viewing.status === 'done' ? (line.deliveredQty || line.orderedQty) : line.deliveredQty}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">New Delivery Order</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference</label>
                <input type="text" value={reference} readOnly className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer *</label>
                <input type="text" value={customer} onChange={e => setCustomer(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${formErrors.customer ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="e.g., BuildRight Corp." />
                {formErrors.customer && <p className="text-red-500 text-xs mt-1">{formErrors.customer}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source Warehouse</label>
                <select value={warehouseId} onChange={e => setWarehouseId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {warehouses.filter(w => w.isActive).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
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
                    <input type="number" value={line.orderedQty} onChange={e => setLines(lines.map((l, i) => i === idx ? { ...l, orderedQty: parseInt(e.target.value) || 0 } : l))}
                      className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm text-right" min="1" placeholder="Qty" />
                    <button type="button" onClick={() => setLines(lines.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">Create Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deliveries;
