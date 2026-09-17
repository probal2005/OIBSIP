import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useSession } from "@/hooks/useSession";

export function AdminGate({ children }: { children: ReactNode }) {
  const { loading, user, isAdmin } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/admin/login", replace: true });
  }, [loading, user, navigate]);

  if (loading) {
    return <p className="mt-16 text-center text-sm text-foreground/50">Loading console…</p>;
  }

  if (!isAdmin) {
    return (
      <div className="mt-16 card-glass rounded-3xl p-7 max-w-md mx-auto text-center">
        <p className="font-display font-bold text-2xl">Kitchen access only</p>
        <p className="mt-2 text-sm text-foreground/55">
          This account isn't set up for inventory and order management.
        </p>
        <Link
          to="/admin/login"
          className="mt-5 inline-block rounded-xl bg-ink text-cream px-5 py-3 text-sm font-semibold"
        >
          Use a staff account
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}

export function AdminTabs() {
  return (
    <div className="mt-8 flex gap-2 text-sm">
      <Link
        to="/admin/inventory"
        activeProps={{ className: "bg-brand text-cream" }}
        className="rounded-full glass px-4 py-2 font-semibold"
      >
        Inventory
      </Link>
      <Link
        to="/admin/orders"
        activeProps={{ className: "bg-brand text-cream" }}
        className="rounded-full glass px-4 py-2 font-semibold"
      >
        Orders
      </Link>
    </div>
  );
}
