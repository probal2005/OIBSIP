import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Staff sign in — PizzaHot kitchen console" },
      {
        name: "description",
        content: "Private sign-in for PizzaHot staff managing inventory and incoming orders.",
      },
      { property: "og:title", content: "Staff sign in — PizzaHot" },
      { property: "og:description", content: "Private console for PizzaHot staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err || !data.user) {
      setBusy(false);
      setError(err?.message ?? "Sign in failed.");
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    setBusy(false);
    if (!roles?.some((r) => r.role === "admin")) {
      await supabase.auth.signOut();
      setError("This account does not have kitchen access.");
      return;
    }
    navigate({ to: "/admin/inventory" });
  };

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-md card-glass rounded-3xl p-7">
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep">
          Staff only
        </span>
        <h1 className="mt-5 font-display font-extrabold text-3xl tracking-tight">
          Kitchen console
        </h1>
        <p className="mt-2 text-sm text-foreground/55">
          Inventory and order management. Staff accounts are created by the owner — there is no
          sign-up here.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@pizzahot.com"
            className="rounded-xl glass px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-xl glass px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-ink text-cream py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {busy ? "Checking…" : "Enter console"}
          </button>
        </form>
        <Link to="/" className="mt-6 block text-sm text-foreground/50 hover:text-foreground">
          ← Back to PizzaHot
        </Link>
      </div>
    </div>
  );
}
