import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, useClerk, Show } from "@clerk/react";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import { AdminGuard } from "@/components/shared/AdminGuard";
import Home from "@/pages/home";
import Shop from "@/pages/shop";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import ProductDetail from "@/pages/product";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Journal from "@/pages/journal";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminCustomers from "@/pages/admin/customers";
import NotFound from "@/pages/not-found";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!clerkPubKey) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env");

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  variables: {
    colorPrimary: "hsl(0 0% 5%)",
    colorForeground: "hsl(0 0% 4%)",
    colorMutedForeground: "hsl(0 0% 40%)",
    colorDanger: "hsl(0 84% 60%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(0 0% 88%)",
    colorInputForeground: "hsl(0 0% 4%)",
    fontFamily: "DM Sans, system-ui, sans-serif",
    borderRadius: "0rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox:
      "bg-background w-[440px] max-w-full overflow-hidden border border-border shadow-sm",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-foreground font-serif",
    formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
    formFieldInput: "bg-transparent border border-border",
  },
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4 py-12">
      <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <>
      <Show when="signed-in">
        <Component />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function ClerkCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    return addListener(({ user }) => {
      const id = user?.id ?? null;
      if (prevIdRef.current !== undefined && prevIdRef.current !== id) {
        queryClient.clear();
      }
      prevIdRef.current = id;
    });
  }, [addListener, queryClient]);

  return null;
}

export default function App() {
  return (
    <WouterRouter>
      <ClerkProvider publishableKey={clerkPubKey} appearance={clerkAppearance}>
        <QueryClientProvider client={queryClient}>
          <ClerkCacheInvalidator />
          <TooltipProvider>
            <Switch>
              <Route path="/"><Layout><Home /></Layout></Route>
              <Route path="/sign-in/*?" component={SignInPage} />
              <Route path="/sign-up/*?" component={SignUpPage} />
              <Route path="/shop"><Layout><Shop /></Layout></Route>
              <Route path="/about"><Layout><About /></Layout></Route>
              <Route path="/contact"><Layout><Contact /></Layout></Route>
              <Route path="/product/:id"><Layout><ProductDetail /></Layout></Route>
              <Route path="/journal"><Layout><Journal /></Layout></Route>
              <Route path="/cart"><Layout><ProtectedRoute component={Cart} /></Layout></Route>
              <Route path="/checkout"><Layout><ProtectedRoute component={Checkout} /></Layout></Route>
              <Route path="/orders"><Layout><ProtectedRoute component={Orders} /></Layout></Route>
              <Route path="/orders/:id"><Layout><ProtectedRoute component={OrderDetail} /></Layout></Route>
              <Route path="/admin"><AdminGuard><AdminDashboard /></AdminGuard></Route>
              <Route path="/admin/products"><AdminGuard><AdminProducts /></AdminGuard></Route>
              <Route path="/admin/orders"><AdminGuard><AdminOrders /></AdminGuard></Route>
              <Route path="/admin/customers"><AdminGuard><AdminCustomers /></AdminGuard></Route>
              <Route component={NotFound} />
            </Switch>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ClerkProvider>
    </WouterRouter>
  );
}


