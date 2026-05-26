import { Link } from "wouter";
import { format } from "date-fns";
import { useListOrders } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/pkr";

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-100 text-amber-800 border-amber-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped": return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-serif font-bold mb-8">Order History</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-md" />)}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-3xl text-center">
        <h1 className="text-3xl font-serif font-bold mb-6">Order History</h1>
        <p className="text-muted-foreground mb-8 text-lg">You haven't placed any orders yet.</p>
        <Link href="/shop">
          <Button size="lg" className="px-8 rounded-none">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-serif font-bold mb-8">Order History</h1>
      
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="border bg-card overflow-hidden">
            <div className="bg-muted/50 p-4 border-b flex flex-wrap justify-between items-center gap-4 text-sm">
              <div className="flex gap-8">
                <div>
                  <div className="text-muted-foreground uppercase text-xs tracking-wider font-semibold mb-1">Order Placed</div>
                  <div className="font-medium">{format(new Date(order.createdAt), "MMM d, yyyy")}</div>
                </div>
                <div>
                  <div className="text-muted-foreground uppercase text-xs tracking-wider font-semibold mb-1">Total</div>
                  <div className="font-semibold">{formatPKR(order.total)}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-muted-foreground uppercase text-xs tracking-wider font-semibold mb-1">Order #</div>
                  <div className="font-medium">{order.id}</div>
                </div>
                <Link href={`/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="rounded-none">View Details</Button>
                </Link>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold flex items-center gap-3">
                  Status
                  <Badge variant="outline" className={`capitalize ${getStatusColor(order.status)}`}>
                    {order.status}
                  </Badge>
                </h3>
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2">
                {order.items.map((item) => (
                  <div key={item.id} className="w-20 shrink-0">
                    <div className="aspect-[4/5] overflow-hidden bg-muted mb-2 border">
                      <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
