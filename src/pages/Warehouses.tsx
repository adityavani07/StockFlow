/**
 * WAREHOUSES PAGE — Glass cards with vibrancy effects
 */
import React, { useState } from 'react';
import { Plus, X, Edit2, Warehouse, MapPin, ToggleLeft, ToggleRight } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';

const Warehouses: React.FC = () => {
  const { warehouses, stock, addWarehouse, updateWarehouse } = useInventoryStore();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const openCreate = () => { setEditId(null); setName(''); setLocation(''); setFormErrors({}); setShowForm(true); };
  const openEdit = (id: string) => {
    const wh = warehouses.find(w => w.id === id);
    if (!wh) return;
    setEditId(id); setName(wh.name); setLocation(wh.location); setFormErrors({}); setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!location.trim()) errors.location = 'Location is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (editId) updateWarehouse(editId, { name, location });
    else addWarehouse({ name, location, isActive: true });
    setShowForm(false);
  };

  const getWarehouseStock = (whId: string) => stock.filter(s => s.warehouseId === whId).reduce((sum, s) => sum + s.quantity, 0);
  const getWarehouseProductCount = (whId: string) => stock.filter(s => s.warehouseId === whId && s.quantity > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Warehouses</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Manage storage locations</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 btn-primary px-4 py-2.5 rounded-xl text-sm font-medium">
          <Plus size={16} /> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
        {warehouses.map(wh => (
          <div key={wh.id} className={`glass-card rounded-2xl p-5 ${!wh.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{
                    background: wh.isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))' : 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                  }}>
                  <Warehouse size={20} style={{ color: wh.isActive ? 'var(--accent)' : 'var(--text-tertiary)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-[14px]" style={{ color: 'var(--text-primary)' }}>{wh.name}</h3>
                  <div className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}><MapPin size={11} />{wh.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(wh.id)} className="p-1.5 rounded-lg btn-ghost"><Edit2 size={14} /></button>
                <button onClick={() => updateWarehouse(wh.id, { isActive: !wh.isActive })}
                  className="p-1.5 rounded-lg btn-ghost">
                  {wh.isActive ? <ToggleRight size={18} className="text-indigo-500" /> : <ToggleLeft size={18} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{getWarehouseProductCount(wh.id)}</div>
                <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Products</div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: 'var(--surface)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{getWarehouseStock(wh.id).toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-tertiary)' }}>Units</div>
              </div>
            </div>
            <div className={`mt-3 text-[11px] font-semibold ${wh.isActive ? 'text-emerald-500' : 'text-red-400'}`}>
              {wh.isActive ? '● Active' : '● Inactive'}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-modal rounded-2xl w-full max-w-md animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{editId ? 'Edit Warehouse' : 'New Warehouse'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Warehouse Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm glass-input ${formErrors.name ? 'border-red-400/50' : ''}`}
                  placeholder="e.g., Production Floor" />
                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Location *</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm glass-input ${formErrors.location ? 'border-red-400/50' : ''}`}
                  placeholder="e.g., Building B, Floor 2" />
                {formErrors.location && <p className="text-red-400 text-xs mt-1">{formErrors.location}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-primary">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
