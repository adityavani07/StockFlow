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

export function Transfers() {
  const { transfers, warehouses, products, addTransfer, completeTransfer } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    productId: '',
    quantity: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const transfer = {
      id: `TRF-${Date.now()}`,
      from: formData.from,
      to: formData.to,
      products: [{ productId: formData.productId, quantity: formData.quantity, productName: product.name }],
      date: new Date().toISOString().split('T')[0],
      status: 'pending' as const,
    };
    addTransfer(transfer);
    toast.success('Transfer created successfully');
    setIsOpen(false);
    setFormData({ from: '', to: '', productId: '', quantity: 0 });
  };

  const handleComplete = (id: string) => {
    completeTransfer(id);
    toast.success('Transfer completed');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Warehouse Transfers</h1>
          <p className="text-gray-500 mt-1">Move inventory between locations</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Transfer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="from">From Location</Label>
                <Select
                  value={formData.from}
                  onValueChange={(value) => setFormData({ ...formData, from: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
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
                <Label htmlFor="to">To Location</Label>
                <Select
                  value={formData.to}
                  onValueChange={(value) => setFormData({ ...formData, to: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
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
                Create Transfer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transfer ID</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell className="font-mono text-sm">{transfer.id}</TableCell>
                  <TableCell>{transfer.from}</TableCell>
                  <TableCell>{transfer.to}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {transfer.products.map((p, i) => (
                        <div key={i}>
                          {p.productName} ({p.quantity})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{transfer.date}</TableCell>
                  <TableCell>
                    <Badge variant={transfer.status === 'completed' ? 'default' : 'secondary'}>
                      {transfer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {transfer.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleComplete(transfer.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Complete
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
