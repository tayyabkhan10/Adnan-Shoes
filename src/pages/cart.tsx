import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetCart, 
  getGetCartQueryKey,
  useUpdateCartItem,
  useRemoveCartItem,
  useClearCart
} from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatPKR, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/pkr";

export default function Cart() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useGetCart();

  const invalidateCart = () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem({
    onSuccess: invalidateCart,
  });

  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem({
    onSuccess: invalidateCart,
  });

  const { mutate: clearCart, isPending: isClearing } = useClearCart({
    onSuccess: invalidateCart,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <h1 className="text-3xl font-serif font-bold mb-8">Shopping Cart</h1>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-6 h-32 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-3xl text-center">
        <h1 className="text-3xl font-serif font-bold mb-6">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 text-lg">Looks like you haven't added anything yet.</p>
        <Link href="/shop">
          <Button size="lg" className="px-8 h-12 text-base rounded-none">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const shipping = cart.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = cart.subtotal + shipping;
  const isBusy = isUpdating || isRemoving || isClearing;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex justify-between items-end mb-8">
        <h1 className="text-3xl font-serif font-bold">Shopping Cart ({cart.itemCount})</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => clearCart()}
          disabled={isBusy}
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border bg-card">
              <div className="w-24 h-32 shrink-0 bg-muted overflow-hidden">
                <img 
                  src={item.productImageUrl} 
                  alt={item.productName} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Link href={`/product/${item.productId}`} className="font-semibold text-lg hover:underline line-clamp-1">
                      {item.productName}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.color} / Size {item.size}
                    </p>
                  </div>
                  <span className="font-semibold whitespace-nowrap">{formatPKR(item.price * item.quantity)}</span>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center border w-28 h-9">
                    <button 
                      onClick={() => updateItem({ cartItemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      disabled={isBusy || item.quantity <= 1}
                      className="h-full w-8 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <div className="h-full flex-1 flex items-center justify-center text-sm font-medium border-x">
                      {item.quantity}
                    </div>
                    <button 
                      onClick={() => updateItem({ cartItemId: item.id, quantity: item.quantity + 1 })}
                      disabled={isBusy}
                      className="h-full w-8 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-muted-foreground hover:text-destructive"
                    onClick={() => removeItem(item.id)}
                    disabled={isBusy}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card border p-6 sticky top-24">
            <h2 className="text-xl font-serif font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPKR(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : formatPKR(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  Spend {formatPKR(FREE_SHIPPING_THRESHOLD - cart.subtotal)} more for free shipping.
                </p>
              )}
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex justify-between items-center mb-8">
              <span className="font-semibold text-lg">Total</span>
              <span className="font-bold text-2xl">{formatPKR(total)}</span>
            </div>
            
            <Button 
              size="lg" 
              className="w-full h-14 text-base font-semibold group rounded-none"
              onClick={() => setLocation("/checkout")}
            >
              Checkout <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <div className="mt-6 text-center text-xs text-muted-foreground">
              Secure checkout. Free returns within 30 days.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
