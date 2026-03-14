/**
 * SEED DATA
 * Provides realistic initial data so the app launches with a functional demo.
 * In production, this would come from a backend/database.
 */
import type { Product, Warehouse, StockEntry, Receipt, DeliveryOrder, Transfer, Adjustment, MoveRecord, User } from '../types';

export const seedUser: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@stockflow.com',
  password: 'admin123',
  role: 'inventory_manager',
  createdAt: new Date().toISOString(),
};

export const seedWarehouses: Warehouse[] = [
  { id: 'wh1', name: 'Main Warehouse', location: 'Building A, Ground Floor', isActive: true },
  { id: 'wh2', name: 'Production Floor', location: 'Building B, Floor 1', isActive: true },
  { id: 'wh3', name: 'Cold Storage', location: 'Building A, Basement', isActive: true },
  { id: 'wh4', name: 'Returns Dock', location: 'Building C, Loading Bay', isActive: false },
];

export const seedProducts: Product[] = [
  { id: 'p1', name: 'Steel Rods (10mm)', sku: 'STL-ROD-10', category: 'Raw Materials', unitOfMeasure: 'kg', reorderLevel: 50, createdAt: '2025-01-15T08:00:00Z', updatedAt: '2025-01-15T08:00:00Z' },
  { id: 'p2', name: 'Aluminum Sheet 2x4', sku: 'ALU-SHT-24', category: 'Raw Materials', unitOfMeasure: 'pcs', reorderLevel: 20, createdAt: '2025-01-15T08:00:00Z', updatedAt: '2025-01-15T08:00:00Z' },
  { id: 'p3', name: 'Office Chair Ergo Pro', sku: 'FUR-CHR-EP', category: 'Finished Goods', unitOfMeasure: 'pcs', reorderLevel: 10, createdAt: '2025-01-16T10:00:00Z', updatedAt: '2025-01-16T10:00:00Z' },
  { id: 'p4', name: 'LED Panel Light 40W', sku: 'ELC-LED-40', category: 'Electronics', unitOfMeasure: 'pcs', reorderLevel: 30, createdAt: '2025-01-17T09:00:00Z', updatedAt: '2025-01-17T09:00:00Z' },
  { id: 'p5', name: 'Hydraulic Pump HP-200', sku: 'MCH-HYD-200', category: 'Machinery', unitOfMeasure: 'pcs', reorderLevel: 5, createdAt: '2025-01-18T11:00:00Z', updatedAt: '2025-01-18T11:00:00Z' },
  { id: 'p6', name: 'Copper Wire 2.5mm', sku: 'ELC-COP-25', category: 'Electronics', unitOfMeasure: 'meters', reorderLevel: 100, createdAt: '2025-01-19T07:00:00Z', updatedAt: '2025-01-19T07:00:00Z' },
  { id: 'p7', name: 'Packing Tape Roll', sku: 'PKG-TAP-01', category: 'Packaging', unitOfMeasure: 'rolls', reorderLevel: 50, createdAt: '2025-01-20T12:00:00Z', updatedAt: '2025-01-20T12:00:00Z' },
  { id: 'p8', name: 'Safety Goggles', sku: 'SAF-GOG-01', category: 'Safety', unitOfMeasure: 'pcs', reorderLevel: 25, createdAt: '2025-01-20T12:00:00Z', updatedAt: '2025-01-20T12:00:00Z' },
];

export const seedStock: StockEntry[] = [
  { productId: 'p1', warehouseId: 'wh1', quantity: 250 },
  { productId: 'p1', warehouseId: 'wh2', quantity: 40 },
  { productId: 'p2', warehouseId: 'wh1', quantity: 15 },
  { productId: 'p3', warehouseId: 'wh1', quantity: 45 },
  { productId: 'p4', warehouseId: 'wh1', quantity: 120 },
  { productId: 'p4', warehouseId: 'wh3', quantity: 30 },
  { productId: 'p5', warehouseId: 'wh1', quantity: 3 },
  { productId: 'p6', warehouseId: 'wh1', quantity: 80 },
  { productId: 'p7', warehouseId: 'wh1', quantity: 200 },
  { productId: 'p8', warehouseId: 'wh1', quantity: 60 },
];

export const seedReceipts: Receipt[] = [
  {
    id: 'rcpt1', reference: 'REC-2025-001', supplier: 'MetalCorp Inc.', warehouseId: 'wh1', status: 'done',
    lines: [{ productId: 'p1', expectedQty: 100, receivedQty: 100 }],
    createdAt: '2025-01-20T09:00:00Z', validatedAt: '2025-01-20T10:00:00Z'
  },
  {
    id: 'rcpt2', reference: 'REC-2025-002', supplier: 'ElectroParts Ltd.', warehouseId: 'wh1', status: 'waiting',
    lines: [
      { productId: 'p4', expectedQty: 50, receivedQty: 0 },
      { productId: 'p6', expectedQty: 200, receivedQty: 0 },
    ],
    createdAt: '2025-01-22T14:00:00Z'
  },
  {
    id: 'rcpt3', reference: 'REC-2025-003', supplier: 'SafetyFirst Co.', warehouseId: 'wh1', status: 'draft',
    lines: [{ productId: 'p8', expectedQty: 100, receivedQty: 0 }],
    createdAt: '2025-01-23T08:00:00Z'
  },
];

export const seedDeliveries: DeliveryOrder[] = [
  {
    id: 'del1', reference: 'DEL-2025-001', customer: 'BuildRight Corp.', warehouseId: 'wh1', status: 'done',
    lines: [{ productId: 'p3', orderedQty: 10, deliveredQty: 10 }],
    createdAt: '2025-01-21T11:00:00Z', validatedAt: '2025-01-21T14:00:00Z'
  },
  {
    id: 'del2', reference: 'DEL-2025-002', customer: 'OfficeMax Solutions', warehouseId: 'wh1', status: 'ready',
    lines: [
      { productId: 'p3', orderedQty: 5, deliveredQty: 0 },
      { productId: 'p4', orderedQty: 20, deliveredQty: 0 },
    ],
    createdAt: '2025-01-23T10:00:00Z'
  },
];

export const seedTransfers: Transfer[] = [
  {
    id: 'tr1', reference: 'TRF-2025-001', fromWarehouseId: 'wh1', toWarehouseId: 'wh2', status: 'done',
    lines: [{ productId: 'p1', quantity: 40 }],
    createdAt: '2025-01-21T08:00:00Z', validatedAt: '2025-01-21T09:00:00Z'
  },
  {
    id: 'tr2', reference: 'TRF-2025-002', fromWarehouseId: 'wh1', toWarehouseId: 'wh3', status: 'waiting',
    lines: [{ productId: 'p4', quantity: 30 }],
    createdAt: '2025-01-23T15:00:00Z'
  },
];

export const seedAdjustments: Adjustment[] = [
  {
    id: 'adj1', reference: 'ADJ-2025-001', reason: 'Damaged items found during audit', status: 'done',
    lines: [{ productId: 'p1', warehouseId: 'wh1', recordedQty: 253, countedQty: 250, difference: -3 }],
    createdAt: '2025-01-22T16:00:00Z', validatedAt: '2025-01-22T16:30:00Z'
  },
];

export const seedMoves: MoveRecord[] = [
  { id: 'mv1', type: 'receipt', referenceId: 'rcpt1', reference: 'REC-2025-001', productId: 'p1', warehouseId: 'wh1', quantityChange: 100, timestamp: '2025-01-20T10:00:00Z', notes: 'Received from MetalCorp Inc.' },
  { id: 'mv2', type: 'transfer', referenceId: 'tr1', reference: 'TRF-2025-001', productId: 'p1', warehouseId: 'wh1', quantityChange: -40, timestamp: '2025-01-21T09:00:00Z', notes: 'Transferred to Production Floor' },
  { id: 'mv3', type: 'transfer', referenceId: 'tr1', reference: 'TRF-2025-001', productId: 'p1', warehouseId: 'wh2', quantityChange: 40, timestamp: '2025-01-21T09:00:00Z', notes: 'Received from Main Warehouse' },
  { id: 'mv4', type: 'delivery', referenceId: 'del1', reference: 'DEL-2025-001', productId: 'p3', warehouseId: 'wh1', quantityChange: -10, timestamp: '2025-01-21T14:00:00Z', notes: 'Delivered to BuildRight Corp.' },
  { id: 'mv5', type: 'adjustment', referenceId: 'adj1', reference: 'ADJ-2025-001', productId: 'p1', warehouseId: 'wh1', quantityChange: -3, timestamp: '2025-01-22T16:30:00Z', notes: 'Damaged items adjustment' },
];
