import { useInventory } from '../context/InventoryContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Package, AlertTriangle, Truck, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { Badge } from '../components/ui/badge';

export function Dashboard() {
  const { products, receipts, deliveries, transfers, moveHistory } = useInventory();

  const totalProducts = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockItems = products.filter(p => p.stock < 20);
  const pendingReceipts = receipts.filter(r => r.status === 'pending').length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length;

  const recentMoves = moveHistory.slice(0, 5);

  const stats = [
    {
      title: 'Total Stock',
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Pending Deliveries',
      value: pendingDeliveries,
      icon: Truck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Pending Receipts',
      value: pendingReceipts,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your inventory operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-xl shadow-md`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              Recent Move History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMoves.map((move) => (
                <div
                  key={move.id}
                  className="flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50 hover:bg-white/70 transition-all"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{move.productName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {move.source} → {move.destination}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={move.status === 'completed' || move.status === 'confirmed' || move.status === 'shipped' ? 'default' : 'secondary'}>
                      {move.status}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">{move.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  All products are well stocked
                </p>
              ) : (
                lowStockItems.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200/50 rounded-xl backdrop-blur-sm hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{product.stock}</p>
                      <p className="text-xs text-gray-500">{product.unit}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}