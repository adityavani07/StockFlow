/**
 * PRODUCTS PAGE
 * Full CRUD for product management with:
 * - Search & category filters
 * - Inline stock visibility per warehouse
 * - Create/Edit modal with validation
 * - Reorder level configuration
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

  // Form state
  const [formData, setFormData] = useState({ name: '', sku: '', category: 'Raw Materials', unitOfMeasure: 'pcs', reorderLevel: 10 });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
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
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setShowForm(false);
  };

  const getProductStock = (productId: string) => {
    return stock.filter(s => s.productId === productId);
  };

  const getTotalStock = (productId: string) => {
    return stock.filter(s => s.productId === productId).reduce((sum, s) => sum + s.quantity, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 mt-1">{products.length} products in catalog</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm">
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search by name or SKU..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <select
          value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Product</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">SKU</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600">Stock</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 hidden md:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600">Actions</th>
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
                      className="border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer"
                      onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{product.name}</div>
                        <div className="text-xs text-slate-400">{product.unitOfMeasure}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">{product.sku}</td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-full text-xs">{product.category}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{totalStock}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {isOut ? (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">Out of Stock</span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Low Stock</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={(e) => { e.stopPropagation(); openEdit(product); }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this product?')) deleteProduct(product.id); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded row: stock by location */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={6} className="px-4 py-3">
                          <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-500">
                            <MapPin size={14} /> Stock by Location
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {productStocks.length === 0 ? (
                              <span className="text-xs text-slate-400">No stock entries</span>
                            ) : productStocks.map(s => {
                              const wh = warehouses.find(w => w.id === s.warehouseId);
                              return (
                                <div key={s.warehouseId} className="bg-white rounded-lg px-3 py-2 border border-slate-100">
                                  <div className="text-xs text-slate-500">{wh?.name || s.warehouseId}</div>
                                  <div className="text-sm font-bold text-slate-900">{s.quantity} {product.unitOfMeasure}</div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-2 text-xs text-slate-400">
                            Reorder Level: {product.reorderLevel} {product.unitOfMeasure}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Package size={40} className="mx-auto mb-2 opacity-30" />
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                <input type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${formErrors.name ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="e.g., Steel Rods 10mm" />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Code *</label>
                <input type="text" value={formData.sku} onChange={e => setFormData(f => ({ ...f, sku: e.target.value.toUpperCase() }))}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono ${formErrors.sku ? 'border-red-400' : 'border-slate-200'}`}
                  placeholder="e.g., STL-ROD-10" disabled={!!editingProduct} />
                {formErrors.sku && <p className="text-red-500 text-xs mt-1">{formErrors.sku}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit of Measure</label>
                  <select value={formData.unitOfMeasure} onChange={e => setFormData(f => ({ ...f, unitOfMeasure: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Level</label>
                <input type="number" value={formData.reorderLevel} onChange={e => setFormData(f => ({ ...f, reorderLevel: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${formErrors.reorderLevel ? 'border-red-400' : 'border-slate-200'}`}
                  min="0" />
                {formErrors.reorderLevel && <p className="text-red-500 text-xs mt-1">{formErrors.reorderLevel}</p>}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">{editingProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
