/**
 * TYPES / INTERFACES for the Inventory Management System
 * Every entity in the system is strictly typed for safety & clarity.
 */

// === Authentication ===
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'inventory_manager' | 'warehouse_staff';
  createdAt: string;
}

// === Products ===
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  reorderLevel: number;     // alert when stock falls below this
  createdAt: string;
  updatedAt: string;
}

// === Stock per Location (tracks quantity at each warehouse) ===
export interface StockEntry {
  productId: string;
  warehouseId: string;
  quantity: number;
}

// === Warehouses ===
export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}

// === Operation Statuses ===
export type OperationStatus = 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
export type OperationType = 'receipt' | 'delivery' | 'transfer' | 'adjustment';

// === Receipts (Incoming Goods) ===
export interface ReceiptLine {
  productId: string;
  expectedQty: number;
  receivedQty: number;
}

export interface Receipt {
  id: string;
  reference: string;
  supplier: string;
  warehouseId: string;
  status: OperationStatus;
  lines: ReceiptLine[];
  createdAt: string;
  validatedAt?: string;
}

// === Delivery Orders (Outgoing Goods) ===
export interface DeliveryLine {
  productId: string;
  orderedQty: number;
  deliveredQty: number;
}

export interface DeliveryOrder {
  id: string;
  reference: string;
  customer: string;
  warehouseId: string;
  status: OperationStatus;
  lines: DeliveryLine[];
  createdAt: string;
  validatedAt?: string;
}

// === Internal Transfers ===
export interface TransferLine {
  productId: string;
  quantity: number;
}

export interface Transfer {
  id: string;
  reference: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: OperationStatus;
  lines: TransferLine[];
  createdAt: string;
  validatedAt?: string;
}

// === Stock Adjustments ===
export interface AdjustmentLine {
  productId: string;
  warehouseId: string;
  recordedQty: number;
  countedQty: number;
  difference: number;
}

export interface Adjustment {
  id: string;
  reference: string;
  reason: string;
  status: OperationStatus;
  lines: AdjustmentLine[];
  createdAt: string;
  validatedAt?: string;
}

// === Move History (Stock Ledger) ===
export interface MoveRecord {
  id: string;
  type: OperationType;
  referenceId: string;
  reference: string;
  productId: string;
  warehouseId: string;
  quantityChange: number;   // positive = in, negative = out
  timestamp: string;
  notes: string;
}

// === Dashboard KPIs ===
export interface DashboardKPIs {
  totalProducts: number;
  totalStock: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
}
