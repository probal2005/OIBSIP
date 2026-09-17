import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a new password — PizzaHot" },
      { name: "description", content: "Set a new password for your PizzaHot account." },
      { property: "og:title", content: "Reset your PizzaHot password" },
      { property: "og:description", content: "Set a new password for your PizzaHot account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/dashboard" }), 1200);
  };

  return (
    <div className="min-h-screen grid place-items-center px-5">
      <div className="w-full max-w-md card-glass rounded-3xl p-7">
        <h1 className="font-display font-extrabold text-3xl tracking-tight">New password</h1>
        <p className="mt-2 text-sm text-foreground/55">
          Pick something you'll remember — at least 6 characters.
        </p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="rounded-xl glass px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {done ? <p className="text-sm text-olive">Password updated. Taking you in…</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-brand text-cream py-3 text-sm font-semibold hover:bg-brand-deep transition-colors disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save password"}
          </button>
        </form>
      </div>
    </div>
  );
}
