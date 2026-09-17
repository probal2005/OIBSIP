import { Link, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useSession";

export function SiteHeader() {
  const { user, isAdmin } = useSession();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <nav className="glass rounded-2xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-9">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-brand text-cream font-display font-bold text-lg shadow-lg">
            P
          </span>
          <span className="font-display font-bold text-xl tracking-tight">PizzaHot</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-foreground/70">
          <Link to="/" activeProps={{ className: "text-foreground font-semibold" }} className="hover:text-foreground transition-colors">
            Order
          </Link>
          <Link to="/menu" activeProps={{ className: "text-foreground font-semibold" }} className="hover:text-foreground transition-colors">
            Menu
          </Link>
          <Link to="/dashboard" activeProps={{ className: "text-foreground font-semibold" }} className="hover:text-foreground transition-colors">
            Track
          </Link>
          {isAdmin ? (
            <Link to="/admin/inventory" activeProps={{ className: "text-foreground font-semibold" }} className="hover:text-foreground transition-colors">
              Admin
            </Link>
          ) : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="hidden sm:block text-sm text-foreground/60">{user.email}</span>
            <button
              onClick={signOut}
              className="rounded-xl bg-ink text-cream px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/auth" className="hidden sm:block text-sm font-medium text-foreground/70 hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-xl bg-ink text-cream px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/55">
      <span className="font-display font-bold text-foreground">PizzaHot</span>
      <span>Crafted with fire · Test mode payments enabled</span>
      <span>© 2026 PizzaHot</span>
    </footer>
  );
}
