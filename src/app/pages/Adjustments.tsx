import { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export function Adjustments() {
  const { adjustments, products, warehouses, addAdjustment } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    productId: '',
    location: '',
    newQuantity: 0,
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    const adjustment = {
      id: `ADJ-${Date.now()}`,
      productId: formData.productId,
      productName: product.name,
      location: formData.location,
      oldQuantity: product.stock,
      newQuantity: formData.newQuantity,
      reason: formData.reason,
      date: new Date().toISOString().split('T')[0],
    };
    addAdjustment(adjustment);
    toast.success('Stock adjustment recorded');
    setIsOpen(false);
    setFormData({ productId: '', location: '', newQuantity: 0, reason: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Adjustments</h1>
          <p className="text-gray-500 mt-1">Correct inventory discrepancies</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Stock Adjustment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        {product.name} (Current: {product.stock})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
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
                <Label htmlFor="newQuantity">Corrected Quantity</Label>
                <Input
                  id="newQuantity"
                  type="number"
                  value={formData.newQuantity}
                  onChange={(e) => setFormData({ ...formData, newQuantity: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Adjustment</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Damaged units, counting error, etc."
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Record Adjustment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adjustment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adjustment ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Old Qty</TableHead>
                <TableHead>New Qty</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.map((adjustment) => {
                const change = adjustment.newQuantity - adjustment.oldQuantity;
                return (
                  <TableRow key={adjustment.id}>
                    <TableCell className="font-mono text-sm">{adjustment.id}</TableCell>
                    <TableCell>{adjustment.productName}</TableCell>
                    <TableCell>{adjustment.location}</TableCell>
                    <TableCell>{adjustment.oldQuantity}</TableCell>
                    <TableCell>{adjustment.newQuantity}</TableCell>
                    <TableCell>
                      <div className={`flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {change >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="font-medium">
                          {change >= 0 ? '+' : ''}{change}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{adjustment.reason}</TableCell>
                    <TableCell>{adjustment.date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
