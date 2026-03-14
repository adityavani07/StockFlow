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

export function Deliveries() {
  const { deliveries, warehouses, products, addDelivery, confirmDelivery } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    warehouse: '',
    productId: '',
    quantity: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const delivery = {
      id: `DEL-${Date.now()}`,
      customer: formData.customer,
      warehouse: formData.warehouse,
      products: [{ productId: formData.productId, quantity: formData.quantity, productName: product.name }],
      date: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
    };
    addDelivery(delivery);
    toast.success('Delivery order created successfully');
    setIsOpen(false);
    setFormData({ customer: '', warehouse: '', productId: '', quantity: 0 });
  };

  const handleConfirm = (id: string) => {
    confirmDelivery(id);
    toast.success('Delivery confirmed and shipped');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deliveries</h1>
          <p className="text-gray-500 mt-1">Manage outgoing shipments to customers</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Delivery
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Delivery Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="e.g., ABC Corporation"
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
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Create Delivery Order
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => (
                <TableRow key={delivery.id}>
                  <TableCell className="font-mono text-sm">{delivery.id}</TableCell>
                  <TableCell>{delivery.customer}</TableCell>
                  <TableCell>{delivery.warehouse}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {delivery.products.map((p, i) => (
                        <div key={i}>
                          {p.productName} ({p.quantity})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{delivery.date}</TableCell>
                  <TableCell>
                    <Badge variant={delivery.status === 'shipped' ? 'default' : 'secondary'}>
                      {delivery.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {delivery.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(delivery.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Ship
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
