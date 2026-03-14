/**
 * WAREHOUSES PAGE — Settings
 * Manage warehouse/location configuration.
 * Warehouses can be activated/deactivated without deletion.
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

  const openCreate = () => {
    setEditId(null);
    setName('');
    setLocation('');
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (id: string) => {
    const wh = warehouses.find(w => w.id === id);
    if (!wh) return;
    setEditId(id);
    setName(wh.name);
    setLocation(wh.location);
    setFormErrors({});
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (!location.trim()) errors.location = 'Location is required';
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (editId) {
      updateWarehouse(editId, { name, location });
    } else {
      addWarehouse({ name, location, isActive: true });
    }
    setShowForm(false);
  };

  const getWarehouseStock = (whId: string) => {
    return stock.filter(s => s.warehouseId === whId).reduce((sum, s) => sum + s.quantity, 0);
  };

  const getWarehouseProductCount = (whId: string) => {
    return stock.filter(s => s.warehouseId === whId && s.quantity > 0).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warehouses</h1>
          <p className="text-slate-500 mt-1">Manage storage locations</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 font-medium text-sm">
          <Plus size={18} /> Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map(wh => (
          <div key={wh.id} className={`bg-white rounded-xl p-5 shadow-sm border ${wh.isActive ? 'border-slate-100' : 'border-red-100 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${wh.isActive ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  <Warehouse size={20} className={wh.isActive ? 'text-emerald-600' : 'text-slate-400'} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{wh.name}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={12} />{wh.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(wh.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={15} /></button>
                <button onClick={() => updateWarehouse(wh.id, { isActive: !wh.isActive })}
                  className={`p-1.5 rounded-lg ${wh.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-50'}`}>
                  {wh.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-slate-900">{getWarehouseProductCount(wh.id)}</div>
                <div className="text-xs text-slate-500">Products</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-slate-900">{getWarehouseStock(wh.id).toLocaleString()}</div>
                <div className="text-xs text-slate-500">Total Units</div>
              </div>
            </div>
            <div className={`mt-3 text-xs font-medium ${wh.isActive ? 'text-emerald-600' : 'text-red-500'}`}>
              {wh.isActive ? '● Active' : '● Inactive'}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editId ? 'Edit Warehouse' : 'New Warehouse'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Warehouse Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${formErrors.name ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="e.g., Production Floor" />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${formErrors.location ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="e.g., Building B, Floor 2" />
                {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Warehouses;
