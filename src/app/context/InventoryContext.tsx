import React, { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface Receipt {
  id: string;
  vendor: string;
  warehouse: string;
  products: { productId: string; quantity: number; productName: string }[];
  date: string;
  status: 'pending' | 'confirmed';
}

export interface Transfer {
  id: string;
  from: string;
  to: string;
  products: { productId: string; quantity: number; productName: string }[];
  date: string;
  status: 'pending' | 'completed';
}

export interface Delivery {
  id: string;
  customer: string;
  warehouse: string;
  products: { productId: string; quantity: number; productName: string }[];
  date: string;
  status: 'pending' | 'shipped';
}

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  location: string;
  oldQuantity: number;
  newQuantity: number;
  reason: string;
  date: string;
}

export interface MoveHistory {
  id: string;
  type: 'receipt' | 'transfer' | 'delivery' | 'adjustment';
  source: string;
  destination: string;
  productName: string;
  quantity: number;
  date: string;
  status: string;
}

interface InventoryContextType {
  products: Product[];
  warehouses: Warehouse[];
  receipts: Receipt[];
  transfers: Transfer[];
  deliveries: Delivery[];
  adjustments: StockAdjustment[];
  moveHistory: MoveHistory[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addWarehouse: (warehouse: Warehouse) => void;
  addReceipt: (receipt: Receipt) => void;
  confirmReceipt: (id: string) => void;
  addTransfer: (transfer: Transfer) => void;
  completeTransfer: (id: string) => void;
  addDelivery: (delivery: Delivery) => void;
  confirmDelivery: (id: string) => void;
  addAdjustment: (adjustment: StockAdjustment) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => void;
  logout: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([
    { id: '1', sku: 'LAP-001', name: 'Laptop Dell XPS 15', category: 'Electronics', unit: 'pcs', stock: 45 },
    { id: '2', sku: 'MOU-002', name: 'Wireless Mouse', category: 'Electronics', unit: 'pcs', stock: 120 },
    { id: '3', sku: 'CHR-003', name: 'Office Chair', category: 'Furniture', unit: 'pcs', stock: 30 },
    { id: '4', sku: 'DSK-004', name: 'Standing Desk', category: 'Furniture', unit: 'pcs', stock: 15 },
    { id: '5', sku: 'PHN-005', name: 'iPhone 15 Pro', category: 'Electronics', unit: 'pcs', stock: 8 },
  ]);

  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    { id: '1', name: 'Main Warehouse', location: 'New York' },
    { id: '2', name: 'Storage Facility B', location: 'Los Angeles' },
    { id: '3', name: 'Distribution Center', location: 'Chicago' },
  ]);

  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: 'RCP-001',
      vendor: 'TechSupply Inc.',
      warehouse: 'Main Warehouse',
      products: [{ productId: '1', quantity: 20, productName: 'Laptop Dell XPS 15' }],
      date: '2026-03-12',
      status: 'confirmed',
    },
    {
      id: 'RCP-002',
      vendor: 'FurniturePlus',
      warehouse: 'Main Warehouse',
      products: [{ productId: '3', quantity: 10, productName: 'Office Chair' }],
      date: '2026-03-13',
      status: 'pending',
    },
  ]);

  const [transfers, setTransfers] = useState<Transfer[]>([
    {
      id: 'TRF-001',
      from: 'Main Warehouse',
      to: 'Distribution Center',
      products: [{ productId: '2', quantity: 50, productName: 'Wireless Mouse' }],
      date: '2026-03-11',
      status: 'completed',
    },
  ]);

  const [deliveries, setDeliveries] = useState<Delivery[]>([
    {
      id: 'DEL-001',
      customer: 'ABC Corporation',
      warehouse: 'Main Warehouse',
      products: [{ productId: '1', quantity: 5, productName: 'Laptop Dell XPS 15' }],
      date: '2026-03-10',
      status: 'shipped',
    },
  ]);

  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([
    {
      id: 'ADJ-001',
      productId: '5',
      productName: 'iPhone 15 Pro',
      location: 'Main Warehouse',
      oldQuantity: 10,
      newQuantity: 8,
      reason: 'Damaged units',
      date: '2026-03-09',
    },
  ]);

  const [moveHistory, setMoveHistory] = useState<MoveHistory[]>([
    {
      id: 'MOV-001',
      type: 'receipt',
      source: 'TechSupply Inc.',
      destination: 'Main Warehouse',
      productName: 'Laptop Dell XPS 15',
      quantity: 20,
      date: '2026-03-12',
      status: 'confirmed',
    },
    {
      id: 'MOV-002',
      type: 'transfer',
      source: 'Main Warehouse',
      destination: 'Distribution Center',
      productName: 'Wireless Mouse',
      quantity: 50,
      date: '2026-03-11',
      status: 'completed',
    },
    {
      id: 'MOV-003',
      type: 'delivery',
      source: 'Main Warehouse',
      destination: 'ABC Corporation',
      productName: 'Laptop Dell XPS 15',
      quantity: 5,
      date: '2026-03-10',
      status: 'shipped',
    },
  ]);

  const addProduct = (product: Product) => {
    setProducts([...products, product]);
  };

  const updateProduct = (id: string, updatedProduct: Partial<Product>) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updatedProduct } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const addWarehouse = (warehouse: Warehouse) => {
    setWarehouses([...warehouses, warehouse]);
  };

  const addReceipt = (receipt: Receipt) => {
    setReceipts([...receipts, receipt]);
    const move: MoveHistory = {
      id: `MOV-${Date.now()}`,
      type: 'receipt',
      source: receipt.vendor,
      destination: receipt.warehouse,
      productName: receipt.products[0]?.productName || 'Multiple Items',
      quantity: receipt.products[0]?.quantity || 0,
      date: receipt.date,
      status: receipt.status,
    };
    setMoveHistory([move, ...moveHistory]);
  };

  const confirmReceipt = (id: string) => {
    setReceipts(receipts.map(r => r.id === id ? { ...r, status: 'confirmed' as const } : r));
  };

  const addTransfer = (transfer: Transfer) => {
    setTransfers([...transfers, transfer]);
    const move: MoveHistory = {
      id: `MOV-${Date.now()}`,
      type: 'transfer',
      source: transfer.from,
      destination: transfer.to,
      productName: transfer.products[0]?.productName || 'Multiple Items',
      quantity: transfer.products[0]?.quantity || 0,
      date: transfer.date,
      status: transfer.status,
    };
    setMoveHistory([move, ...moveHistory]);
  };

  const completeTransfer = (id: string) => {
    setTransfers(transfers.map(t => t.id === id ? { ...t, status: 'completed' as const } : t));
  };

  const addDelivery = (delivery: Delivery) => {
    setDeliveries([...deliveries, delivery]);
    const move: MoveHistory = {
      id: `MOV-${Date.now()}`,
      type: 'delivery',
      source: delivery.warehouse,
      destination: delivery.customer,
      productName: delivery.products[0]?.productName || 'Multiple Items',
      quantity: delivery.products[0]?.quantity || 0,
      date: delivery.date,
      status: delivery.status,
    };
    setMoveHistory([move, ...moveHistory]);
  };

  const confirmDelivery = (id: string) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, status: 'shipped' as const } : d));
  };

  const addAdjustment = (adjustment: StockAdjustment) => {
    setAdjustments([...adjustments, adjustment]);
    updateProduct(adjustment.productId, { stock: adjustment.newQuantity });
  };

  const login = (email: string, password: string) => {
    // Mock authentication
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        warehouses,
        receipts,
        transfers,
        deliveries,
        adjustments,
        moveHistory,
        addProduct,
        updateProduct,
        deleteProduct,
        addWarehouse,
        addReceipt,
        confirmReceipt,
        addTransfer,
        completeTransfer,
        addDelivery,
        confirmDelivery,
        addAdjustment,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};
