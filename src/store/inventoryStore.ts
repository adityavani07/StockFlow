/**
 * ZUSTAND STORE — Central state management for the entire IMS.
 *
 * Architecture:
 * - All data is persisted to localStorage (offline-first approach)
 * - Each entity (products, receipts, etc.) has its own slice of state
 * - Actions mutate state and automatically persist
 * - Stock ledger (moves) is automatically updated when operations are validated
 *
 * In a production app, these actions would call REST APIs instead.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User, Product, Warehouse, StockEntry, Receipt, DeliveryOrder,
  Transfer, Adjustment, MoveRecord, DashboardKPIs, OperationStatus,
} from '../types';
import {
  seedUser, seedProducts, seedWarehouses, seedStock, seedReceipts,
  seedDeliveries, seedTransfers, seedAdjustments, seedMoves
} from '../utils/seedData';

/** Generate unique IDs (good enough for hackathon) */
const uid = () => Math.random().toString(36).substring(2, 10) + Date.now().toString(36);

interface InventoryState {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Auth
  currentUser: User | null;
  users: User[];
  login: (email: string, password: string) => boolean;
  signup: (name: string, email: string, password: string, role: User['role']) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;

  // Products
  products: Product[];
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Warehouses
  warehouses: Warehouse[];
  addWarehouse: (w: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, w: Partial<Warehouse>) => void;

  // Stock
  stock: StockEntry[];
  getStockForProduct: (productId: string) => StockEntry[];
  getTotalStock: (productId: string) => number;

  // Receipts
  receipts: Receipt[];
  addReceipt: (r: Omit<Receipt, 'id' | 'createdAt'>) => void;
  updateReceiptStatus: (id: string, status: OperationStatus) => void;
  validateReceipt: (id: string) => void;

  // Deliveries
  deliveries: DeliveryOrder[];
  addDelivery: (d: Omit<DeliveryOrder, 'id' | 'createdAt'>) => void;
  updateDeliveryStatus: (id: string, status: OperationStatus) => void;
  validateDelivery: (id: string) => void;

  // Transfers
  transfers: Transfer[];
  addTransfer: (t: Omit<Transfer, 'id' | 'createdAt'>) => void;
  updateTransferStatus: (id: string, status: OperationStatus) => void;
  validateTransfer: (id: string) => void;

  // Adjustments
  adjustments: Adjustment[];
  addAdjustment: (a: Omit<Adjustment, 'id' | 'createdAt'>) => void;
  validateAdjustment: (id: string) => void;

  // Move History (Stock Ledger)
  moves: MoveRecord[];

  // Dashboard KPIs (computed)
  getKPIs: () => DashboardKPIs;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      // ==================== THEME ====================
      theme: 'dark',
      toggleTheme: () => {
        set(s => {
          const next = s.theme === 'light' ? 'dark' : 'light';
          document.documentElement.classList.toggle('dark', next === 'dark');
          return { theme: next };
        });
      },

      // ==================== AUTH ====================
      currentUser: null,
      users: [seedUser],

      login: (email, password) => {
        const user = get().users.find(u => u.email === email && u.password === password);
        if (user) { set({ currentUser: user }); return true; }
        return false;
      },

      signup: (name, email, password, role) => {
        if (get().users.find(u => u.email === email)) return false;
        const newUser: User = { id: uid(), name, email, password, role, createdAt: new Date().toISOString() };
        set(s => ({ users: [...s.users, newUser], currentUser: newUser }));
        return true;
      },

      logout: () => set({ currentUser: null }),

      updateProfile: (updates) => {
        const cur = get().currentUser;
        if (!cur) return;
        const updated = { ...cur, ...updates };
        set(s => ({
          currentUser: updated,
          users: s.users.map(u => u.id === cur.id ? updated : u),
        }));
      },

      // ==================== PRODUCTS ====================
      products: seedProducts,

      addProduct: (p) => {
        const now = new Date().toISOString();
        const newProduct: Product = { ...p, id: uid(), createdAt: now, updatedAt: now };
        set(s => ({ products: [...s.products, newProduct] }));
      },

      updateProduct: (id, p) => {
        set(s => ({
          products: s.products.map(prod =>
            prod.id === id ? { ...prod, ...p, updatedAt: new Date().toISOString() } : prod
          ),
        }));
      },

      deleteProduct: (id) => set(s => ({ products: s.products.filter(p => p.id !== id) })),

      // ==================== WAREHOUSES ====================
      warehouses: seedWarehouses,

      addWarehouse: (w) => set(s => ({ warehouses: [...s.warehouses, { ...w, id: uid() }] })),

      updateWarehouse: (id, w) => {
        set(s => ({ warehouses: s.warehouses.map(wh => wh.id === id ? { ...wh, ...w } : wh) }));
      },

      // ==================== STOCK ====================
      stock: seedStock,

      getStockForProduct: (productId) => get().stock.filter(s => s.productId === productId),

      getTotalStock: (productId) =>
        get().stock.filter(s => s.productId === productId).reduce((sum, s) => sum + s.quantity, 0),

      // ==================== RECEIPTS ====================
      receipts: seedReceipts,

      addReceipt: (r) => {
        const receipt: Receipt = { ...r, id: uid(), createdAt: new Date().toISOString() };
        set(s => ({ receipts: [...s.receipts, receipt] }));
      },

      updateReceiptStatus: (id, status) => {
        set(s => ({ receipts: s.receipts.map(r => r.id === id ? { ...r, status } : r) }));
      },

      /**
       * VALIDATE RECEIPT — the core business logic:
       * 1. Updates receipt status to 'done'
       * 2. Increases stock at the target warehouse for each received product
       * 3. Logs each stock movement in the ledger
       */
      validateReceipt: (id) => {
        const receipt = get().receipts.find(r => r.id === id);
        if (!receipt || receipt.status === 'done') return;

        const now = new Date().toISOString();
        const newMoves: MoveRecord[] = [];
        const newStock = [...get().stock];

        receipt.lines.forEach(line => {
          const qty = line.receivedQty > 0 ? line.receivedQty : line.expectedQty;
          // Find or create stock entry
          const idx = newStock.findIndex(s => s.productId === line.productId && s.warehouseId === receipt.warehouseId);
          if (idx >= 0) {
            newStock[idx] = { ...newStock[idx], quantity: newStock[idx].quantity + qty };
          } else {
            newStock.push({ productId: line.productId, warehouseId: receipt.warehouseId, quantity: qty });
          }
          newMoves.push({
            id: uid(), type: 'receipt', referenceId: id, reference: receipt.reference,
            productId: line.productId, warehouseId: receipt.warehouseId,
            quantityChange: qty, timestamp: now,
            notes: `Received from ${receipt.supplier}`,
          });
        });

        set(s => ({
          receipts: s.receipts.map(r => r.id === id ? { ...r, status: 'done' as OperationStatus, validatedAt: now } : r),
          stock: newStock,
          moves: [...s.moves, ...newMoves],
        }));
      },

      // ==================== DELIVERIES ====================
      deliveries: seedDeliveries,

      addDelivery: (d) => {
        const delivery: DeliveryOrder = { ...d, id: uid(), createdAt: new Date().toISOString() };
        set(s => ({ deliveries: [...s.deliveries, delivery] }));
      },

      updateDeliveryStatus: (id, status) => {
        set(s => ({ deliveries: s.deliveries.map(d => d.id === id ? { ...d, status } : d) }));
      },

      validateDelivery: (id) => {
        const delivery = get().deliveries.find(d => d.id === id);
        if (!delivery || delivery.status === 'done') return;

        const now = new Date().toISOString();
        const newMoves: MoveRecord[] = [];
        const newStock = [...get().stock];

        delivery.lines.forEach(line => {
          const qty = line.deliveredQty > 0 ? line.deliveredQty : line.orderedQty;
          const idx = newStock.findIndex(s => s.productId === line.productId && s.warehouseId === delivery.warehouseId);
          if (idx >= 0) {
            newStock[idx] = { ...newStock[idx], quantity: Math.max(0, newStock[idx].quantity - qty) };
          }
          newMoves.push({
            id: uid(), type: 'delivery', referenceId: id, reference: delivery.reference,
            productId: line.productId, warehouseId: delivery.warehouseId,
            quantityChange: -qty, timestamp: now,
            notes: `Delivered to ${delivery.customer}`,
          });
        });

        set(s => ({
          deliveries: s.deliveries.map(d => d.id === id ? { ...d, status: 'done' as OperationStatus, validatedAt: now } : d),
          stock: newStock,
          moves: [...s.moves, ...newMoves],
        }));
      },

      // ==================== TRANSFERS ====================
      transfers: seedTransfers,

      addTransfer: (t) => {
        const transfer: Transfer = { ...t, id: uid(), createdAt: new Date().toISOString() };
        set(s => ({ transfers: [...s.transfers, transfer] }));
      },

      updateTransferStatus: (id, status) => {
        set(s => ({ transfers: s.transfers.map(t => t.id === id ? { ...t, status } : t) }));
      },

      validateTransfer: (id) => {
        const transfer = get().transfers.find(t => t.id === id);
        if (!transfer || transfer.status === 'done') return;

        const now = new Date().toISOString();
        const newMoves: MoveRecord[] = [];
        const newStock = [...get().stock];

        transfer.lines.forEach(line => {
          // Decrease from source
          const fromIdx = newStock.findIndex(s => s.productId === line.productId && s.warehouseId === transfer.fromWarehouseId);
          if (fromIdx >= 0) {
            newStock[fromIdx] = { ...newStock[fromIdx], quantity: Math.max(0, newStock[fromIdx].quantity - line.quantity) };
          }
          // Increase at destination
          const toIdx = newStock.findIndex(s => s.productId === line.productId && s.warehouseId === transfer.toWarehouseId);
          if (toIdx >= 0) {
            newStock[toIdx] = { ...newStock[toIdx], quantity: newStock[toIdx].quantity + line.quantity };
          } else {
            newStock.push({ productId: line.productId, warehouseId: transfer.toWarehouseId, quantity: line.quantity });
          }
          newMoves.push({
            id: uid(), type: 'transfer', referenceId: id, reference: transfer.reference,
            productId: line.productId, warehouseId: transfer.fromWarehouseId,
            quantityChange: -line.quantity, timestamp: now,
            notes: `Transferred out`,
          });
          newMoves.push({
            id: uid(), type: 'transfer', referenceId: id, reference: transfer.reference,
            productId: line.productId, warehouseId: transfer.toWarehouseId,
            quantityChange: line.quantity, timestamp: now,
            notes: `Transferred in`,
          });
        });

        set(s => ({
          transfers: s.transfers.map(t => t.id === id ? { ...t, status: 'done' as OperationStatus, validatedAt: now } : t),
          stock: newStock,
          moves: [...s.moves, ...newMoves],
        }));
      },

      // ==================== ADJUSTMENTS ====================
      adjustments: seedAdjustments,

      addAdjustment: (a) => {
        const adjustment: Adjustment = { ...a, id: uid(), createdAt: new Date().toISOString() };
        set(s => ({ adjustments: [...s.adjustments, adjustment] }));
      },

      validateAdjustment: (id) => {
        const adjustment = get().adjustments.find(a => a.id === id);
        if (!adjustment || adjustment.status === 'done') return;

        const now = new Date().toISOString();
        const newMoves: MoveRecord[] = [];
        const newStock = [...get().stock];

        adjustment.lines.forEach(line => {
          const idx = newStock.findIndex(s => s.productId === line.productId && s.warehouseId === line.warehouseId);
          if (idx >= 0) {
            newStock[idx] = { ...newStock[idx], quantity: line.countedQty };
          } else {
            newStock.push({ productId: line.productId, warehouseId: line.warehouseId, quantity: line.countedQty });
          }
          newMoves.push({
            id: uid(), type: 'adjustment', referenceId: id, reference: adjustment.reference,
            productId: line.productId, warehouseId: line.warehouseId,
            quantityChange: line.difference, timestamp: now,
            notes: `Adjustment: ${adjustment.reason}`,
          });
        });

        set(s => ({
          adjustments: s.adjustments.map(a => a.id === id ? { ...a, status: 'done' as OperationStatus, validatedAt: now } : a),
          stock: newStock,
          moves: [...s.moves, ...newMoves],
        }));
      },

      // ==================== MOVE HISTORY ====================
      moves: seedMoves,

      // ==================== DASHBOARD KPIs ====================
      getKPIs: () => {
        const state = get();
        const totalProducts = state.products.length;
        const totalStock = state.stock.reduce((sum, s) => sum + s.quantity, 0);

        // Find products below reorder level
        const lowStockItems = state.products.filter(p => {
          const total = state.stock.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0);
          return total > 0 && total <= p.reorderLevel;
        }).length;

        const outOfStockItems = state.products.filter(p => {
          const total = state.stock.filter(s => s.productId === p.id).reduce((sum, s) => sum + s.quantity, 0);
          return total === 0;
        }).length;

        const pendingReceipts = state.receipts.filter(r => r.status !== 'done' && r.status !== 'canceled').length;
        const pendingDeliveries = state.deliveries.filter(d => d.status !== 'done' && d.status !== 'canceled').length;
        const scheduledTransfers = state.transfers.filter(t => t.status !== 'done' && t.status !== 'canceled').length;

        return { totalProducts, totalStock, lowStockItems, outOfStockItems, pendingReceipts, pendingDeliveries, scheduledTransfers };
      },
    }),
    {
      name: 'stockflow-ims-storage', // localStorage key
    }
  )
);
