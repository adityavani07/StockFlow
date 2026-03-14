import { useInventory } from '../context/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Inbox, ArrowRightLeft, Truck, Settings } from 'lucide-react';

export function MoveHistory() {
  const { moveHistory } = useInventory();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return <Inbox className="h-4 w-4" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4" />;
      case 'delivery':
        return <Truck className="h-4 w-4" />;
      case 'adjustment':
        return <Settings className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'receipt':
        return 'bg-blue-100 text-blue-700';
      case 'transfer':
        return 'bg-purple-100 text-purple-700';
      case 'delivery':
        return 'bg-green-100 text-green-700';
      case 'adjustment':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Move History</h1>
        <p className="text-gray-500 mt-1">Complete log of all inventory movements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movement Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Movement ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moveHistory.map((move) => (
                <TableRow key={move.id}>
                  <TableCell className="font-mono text-sm">{move.id}</TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center gap-2 px-2 py-1 rounded ${getTypeColor(move.type)}`}>
                      {getTypeIcon(move.type)}
                      <span className="capitalize text-sm">{move.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{move.productName}</TableCell>
                  <TableCell>{move.source}</TableCell>
                  <TableCell>{move.destination}</TableCell>
                  <TableCell className="font-semibold">{move.quantity}</TableCell>
                  <TableCell>{move.date}</TableCell>
                  <TableCell>
                    <Badge variant={
                      move.status === 'completed' || move.status === 'confirmed' || move.status === 'shipped'
                        ? 'default'
                        : 'secondary'
                    }>
                      {move.status}
                    </Badge>
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
