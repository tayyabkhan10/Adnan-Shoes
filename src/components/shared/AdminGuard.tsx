import { useUser } from "@clerk/react";
import { Redirect } from "wouter";
import { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const ADMIN_EMAIL = "nailaanjum1530@gmail.com";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/sign-in" />;
  }

  const email = user.primaryEmailAddress?.emailAddress;
  if (email !== ADMIN_EMAIL) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4 opacity-80" />
        <h1 className="text-3xl font-serif font-bold mb-3">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm mx-auto mb-8">
          This area is restricted to authorized administrators only.
        </p>
        <Link href="/">
          <Button className="rounded-none">Return to Home</Button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
