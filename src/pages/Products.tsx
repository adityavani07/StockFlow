/**
 * PRODUCTS PAGE — Glass CRUD with modern table and modals
 */
import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package, MapPin } from 'lucide-react';
import { useInventoryStore } from '../store/inventoryStore';
import type { Product } from '../types';

const CATEGORIES = ['Raw Materials', 'Finished Goods', 'Electronics', 'Machinery', 'Packaging', 'Safety', 'Other'];
const UNITS = ['pcs', 'kg', 'meters', 'liters', 'rolls', 'boxes', 'pallets'];

const Products: React.FC = () => {
  const { products, stock, warehouses, addProduct, updateProduct, deleteProduct } = useInventoryStore();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', sku: '', category: 'Raw Materials', unitOfMeasure: 'pcs', reorderLevel: 10 });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !filterCategory || p.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, filterCategory]);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    if (formData.sku && !editingProduct && products.some(p => p.sku === formData.sku)) errors.sku = 'SKU already exists';
    if (formData.reorderLevel < 0) errors.reorderLevel = 'Must be 0 or greater';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', sku: '', category: 'Raw Materials', unitOfMeasure: 'pcs', reorderLevel: 10 });
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({ name: p.name, sku: p.sku, category: p.category, unitOfMeasure: p.unitOfMeasure, reorderLevel: p.reorderLevel });
    setFormErrors({});
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (editingProduct) updateProduct(editingProduct.id, formData);
    else addProduct(formData);
    setShowForm(false);
  };

  const getProductStock = (productId: string) => stock.filter(s => s.productId === productId);
  const getTotalStock = (productId: string) => stock.filter(s => s.productId === productId).reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Products</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{products.length} products in catalog</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 btn-primary px-4 py-2.5 rounded-xl text-sm font-medium">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input type="text" placeholder="Search by name or SKU..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input" />
        </div>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm glass-input">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Products Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm glass-table">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--divider)' }}>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3">SKU</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3">Stock</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(product => {
                const totalStock = getTotalStock(product.id);
                const isLow = totalStock > 0 && totalStock <= product.reorderLevel;
                const isOut = totalStock === 0;
                const productStocks = getProductStock(product.id);
                const isExpanded = expandedProduct === product.id;

                return (
                  <React.Fragment key={product.id}>
                    <tr
                      className="cursor-pointer"
                      style={{ borderBottom: '1px solid var(--divider)' }}
                      onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{product.name}</div>
                        <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{product.unitOfMeasure}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{product.sku}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="badge" style={{ background: 'var(--badge-bg)', color: 'var(--text-secondary)' }}>{product.category}</span>
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: 'var(--text-primary)' }}>{totalStock}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {isOut ? <span className="badge badge-canceled">Out of Stock</span>
                          : isLow ? <span className="badge badge-waiting">Low Stock</span>
                          : <span className="badge badge-done">In Stock</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEdit(product); }}
                            className="p-1.5 rounded-lg btn-ghost"><Edit2 size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this product?')) deleteProduct(product.id); }}
                            className="p-1.5 rounded-lg btn-ghost text-red-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr style={{ background: 'var(--surface)' }}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                            <MapPin size={12} /> Stock by Location
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {productStocks.length === 0 ? (
                              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No stock entries</span>
                            ) : productStocks.map(s => {
                              const wh = warehouses.find(w => w.id === s.warehouseId);
                              return (
                                <div key={s.warehouseId} className="glass rounded-xl px-3 py-2">
                                  <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{wh?.name || s.warehouseId}</div>
                                  <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{s.quantity} {product.unitOfMeasure}</div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                            Reorder Level: {product.reorderLevel} {product.unitOfMeasure}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
                  <Package size={40} className="mx-auto mb-2 opacity-30" />No products found
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(8px)' }}>
          <div className="glass-modal rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn">
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--divider)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="btn-ghost p-1.5 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Product Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm glass-input ${formErrors.name ? 'border-red-400/50' : ''}`}
                  placeholder="e.g., Steel Rods 10mm" />
                {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>SKU / Code *</label>
                <input type="text" value={formData.sku} onChange={e => setFormData(f => ({ ...f, sku: e.target.value.toUpperCase() }))}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm glass-input font-mono ${formErrors.sku ? 'border-red-400/50' : ''}`}
                  placeholder="e.g., STL-ROD-10" disabled={!!editingProduct} />
                {formErrors.sku && <p className="text-red-400 text-xs mt-1">{formErrors.sku}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Category</label>
                  <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Unit of Measure</label>
                  <select value={formData.unitOfMeasure} onChange={e => setFormData(f => ({ ...f, unitOfMeasure: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Reorder Level</label>
                <input type="number" value={formData.reorderLevel} onChange={e => setFormData(f => ({ ...f, reorderLevel: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-2.5 rounded-xl text-sm glass-input ${formErrors.reorderLevel ? 'border-red-400/50' : ''}`} min="0" />
                {formErrors.reorderLevel && <p className="text-red-400 text-xs mt-1">{formErrors.reorderLevel}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium btn-primary">{editingProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
