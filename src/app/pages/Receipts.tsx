import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

export function Receipts() {
  const { receipts, warehouses, products, addReceipt, confirmReceipt } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    vendor: '',
    warehouse: '',
    productId: '',
    quantity: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const receipt = {
      id: `RCP-${Date.now()}`,
      vendor: formData.vendor,
      warehouse: formData.warehouse,
      products: [{ productId: formData.productId, quantity: formData.quantity, productName: product.name }],
      date: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
    };
    addReceipt(receipt);
    toast.success('Receipt created successfully');
    setIsOpen(false);
    setFormData({ vendor: '', warehouse: '', productId: '', quantity: 0 });
  };

  const handleConfirm = (id: string) => {
    confirmReceipt(id);
    toast.success('Receipt confirmed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Receipts</h1>
          <p className="text-gray-500 mt-1">Record incoming inventory from suppliers</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Receipt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Receipt</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor Name</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="e.g., TechSupply Inc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select
                  value={formData.warehouse}
                  onValueChange={(value) => setFormData({ ...formData, warehouse: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.name}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => setFormData({ ...formData, productId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Received</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Create Receipt
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt ID</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-mono text-sm">{receipt.id}</TableCell>
                  <TableCell>{receipt.vendor}</TableCell>
                  <TableCell>{receipt.warehouse}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {receipt.products.map((p, i) => (
                        <div key={i}>
                          {p.productName} ({p.quantity})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{receipt.date}</TableCell>
                  <TableCell>
                    <Badge variant={receipt.status === 'confirmed' ? 'default' : 'secondary'}>
                      {receipt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {receipt.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(receipt.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
