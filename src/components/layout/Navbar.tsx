import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Show, useClerk, useUser } from "@clerk/react";
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  User,
  LogOut,
  Package,
  LayoutDashboard,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetCart } from "@/hooks/api";

const ADMIN_EMAIL = "nailaanjum1530@gmail.com";

export function Navbar() {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { data: cart } = useGetCart({ enabled: !!user });
  const [mobileOpen, setMobileOpen] = useState(false);
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/journal", label: "Journal" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const handleSignOut = () => {
    setMobileOpen(false);
    signOut({ redirectUrl: basePath || "/" });
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/95 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="Adnan Shoes Home">
            <span className="font-serif text-[22px] font-bold tracking-tight text-foreground">
              Adnan<span className="text-foreground/40">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-medium tracking-wide transition-colors link-line ${
                  location === link.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1">
            <Link href="/shop" aria-label="Search products">
              <Button variant="ghost" size="icon" className="hidden md:flex h-9 w-9">
                <Search className="h-4 w-4" />
              </Button>
            </Link>

            <Show when="signed-in">
              <Link href="/cart" aria-label={`Cart${cart && cart.itemCount > 0 ? `, ${cart.itemCount} items` : ""}`}>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <ShoppingBag className="h-4 w-4" />
                  {cart && cart.itemCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                      {cart.itemCount > 9 ? "9+" : cart.itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Account menu">
                      <div className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-[11px] font-bold">
                        {user?.firstName?.[0] ?? user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal py-2">
                      <p className="text-sm font-semibold truncate">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.firstName ?? "My Account"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/orders">
                      <DropdownMenuItem className="cursor-pointer gap-2">
                        <Package className="h-4 w-4" />My Orders
                      </DropdownMenuItem>
                    </Link>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <Link href="/admin">
                          <DropdownMenuItem className="cursor-pointer gap-2 font-medium">
                            <LayoutDashboard className="h-4 w-4" />Admin Panel
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer gap-2 text-destructive focus:text-destructive" onClick={handleSignOut}>
                      <LogOut className="h-4 w-4" />Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Show>

            <Show when="signed-out">
              <Link href="/sign-in" className="hidden md:block">
                <Button variant="ghost" size="sm" className="h-9 gap-1.5 text-[13px]">
                  <User className="h-4 w-4" />Sign In
                </Button>
              </Link>
            </Show>

            <Button
              variant="ghost" size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-0 top-16 z-40 bg-white border-t md:hidden overflow-y-auto" role="dialog" aria-label="Mobile navigation">
          <div className="px-6 py-6 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <div className={`px-4 py-3 text-sm font-medium transition-colors ${
                  location === link.href ? "bg-foreground text-background" : "hover:bg-muted"
                }`}>
                  {link.label}
                </div>
              </Link>
            ))}

            <Show when="signed-in">
              <div className="border-t border-border mt-5 pt-5 space-y-1">
                {user && (
                  <div className="px-4 py-2 mb-3">
                    <p className="text-sm font-semibold">{user.firstName ?? user.primaryEmailAddress?.emailAddress?.split("@")[0]}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</p>
                  </div>
                )}
                <Link href="/cart" onClick={() => setMobileOpen(false)}>
                  <div className="px-4 py-3 text-sm font-medium hover:bg-muted flex items-center gap-3">
                    <ShoppingBag className="h-4 w-4" />Cart {cart && cart.itemCount > 0 && `(${cart.itemCount})`}
                  </div>
                </Link>
                <Link href="/orders" onClick={() => setMobileOpen(false)}>
                  <div className="px-4 py-3 text-sm font-medium hover:bg-muted flex items-center gap-3">
                    <Package className="h-4 w-4" />My Orders
                  </div>
                </Link>
                <Link href="/journal" onClick={() => setMobileOpen(false)}>
                  <div className="px-4 py-3 text-sm font-medium hover:bg-muted flex items-center gap-3">
                    <BookOpen className="h-4 w-4" />Journal
                  </div>
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)}>
                    <div className="px-4 py-3 text-sm font-semibold hover:bg-muted flex items-center gap-3">
                      <LayoutDashboard className="h-4 w-4" />Admin Panel
                    </div>
                  </Link>
                )}
                <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-muted flex items-center gap-3 text-destructive">
                  <LogOut className="h-4 w-4" />Log Out
                </button>
              </div>
            </Show>

            <Show when="signed-out">
              <div className="border-t border-border mt-5 pt-5">
                <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full h-12 text-sm font-semibold">Sign In</Button>
                </Link>
              </div>
            </Show>
          </div>
        </div>
      )}
    </>
  );
}
