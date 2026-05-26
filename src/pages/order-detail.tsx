import { useParams, Link } from "wouter";
import { format } from "date-fns";
import { useGetOrder } from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, CheckCircle2, XCircle } from "lucide-react";
import { formatPKR } from "@/lib/pkr";

export default function OrderDetail() {
  const { id } = useParams();
  const orderId = parseInt(id || "0", 10);

  const { data: order, isLoading, error } = useGetOrder(orderId);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-24 text-center">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-semibold mb-4">Order not found</h2>
        <Link href="/orders">
          <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders</Button>
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
      case "processing": return <Package className="h-6 w-6 text-blue-500" />;
      case "shipped": return <Truck className="h-6 w-6 text-purple-500" />;
      case "delivered": return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "cancelled": return <XCircle className="h-6 w-6 text-red-500" />;
      default: return <Package className="h-6 w-6" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "Order is pending confirmation";
      case "processing": return "We're preparing your order";
      case "shipped": return "Your order is on the way";
      case "delivered": return "Your order has been delivered";
      case "cancelled": return "This order was cancelled";
      default: return status;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="mb-6">
        <Link href="/orders" className="text-muted-foreground hover:text-foreground flex items-center text-sm transition-colors w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">Order #{order.id}</h1>
          <p className="text-muted-foreground">Placed on {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}</p>
        </div>
        <Badge variant="outline" className="w-fit px-4 py-1.5 text-sm uppercase tracking-wider font-semibold">
          {order.status}
        </Badge>
      </div>

      {/* Status Banner */}
      <div className="bg-muted/30 border p-6 mb-10 flex items-center gap-4">
        <div className="p-3 bg-background border shadow-sm">
          {getStatusIcon(order.status)}
        </div>
        <div>
          <h3 className="font-semibold text-lg">{getStatusText(order.status)}</h3>
          {order.updatedAt && order.status !== "pending" && (
            <p className="text-sm text-muted-foreground">Last updated {format(new Date(order.updatedAt), "MMM d, yyyy")}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Items */}
        <div className="md:col-span-2">
          <h2 className="text-sm font-semibold mb-6 uppercase tracking-wider">Items Ordered</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border bg-card">
                <div className="w-20 h-24 shrink-0 bg-muted overflow-hidden">
                  <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start">
                    <Link href={`/product/${item.productId}`} className="font-semibold hover:underline line-clamp-1">
                      {item.productName}
                    </Link>
                    <span className="font-medium ml-4 shrink-0">{formatPKR(item.price * item.quantity)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{item.color} / Size {item.size}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Qty: {item.quantity} × {formatPKR(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-muted/30 p-6 border">
            <h2 className="font-semibold mb-4 uppercase tracking-wider text-sm">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPKR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shippingCost === 0 ? "Free" : formatPKR(order.shippingCost ?? 0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-semibold">
                <span>Total</span>
                <span className="text-lg">{formatPKR(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-6 border">
            <h2 className="font-semibold mb-4 uppercase tracking-wider text-sm">Shipping Address</h2>
            <address className="not-italic text-sm text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              <p>{order.shippingAddress.country}</p>
            </address>
          </div>
        </div>
      </div>
    </div>
  );
}
