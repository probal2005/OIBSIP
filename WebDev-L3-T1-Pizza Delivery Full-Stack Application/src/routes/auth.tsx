import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/useSession";
import { SiteFooter } from "@/components/SiteHeader";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search['mode'] === "signup" ? ("signup" as const) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in or create your PizzaHot account" },
      {
        name: "description",
        content:
          "Create a PizzaHot account to build custom pizzas, pay securely and track your order in real time.",
      },
      { property: "og:title", content: "Sign in — PizzaHot" },
      { property: "og:description", content: "Access your PizzaHot orders and custom builds." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<Mode>(search.mode === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);

    if (mode === "signup") {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      if (err) setError(err.message);
      else setMessage("Check your inbox — we sent a link to verify your email address.");
    } else if (mode === "signin") {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else navigate({ to: "/dashboard" });
    } else {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) setError(err.message);
      else setMessage("If that address has an account, a reset link is on its way.");
    }
    setBusy(false);
  };

  const googleSignIn = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in could not start. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-[1200px] px-5 py-6">
        <div className="flex justify-center pt-10">
          <div className="w-full max-w-md card-glass rounded-3xl p-7">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-xl bg-brand text-cream font-display font-bold text-lg">
                P
              </span>
              <span className="font-display font-bold text-xl tracking-tight">PizzaHot</span>
            </Link>

            <h1 className="mt-6 font-display font-extrabold text-3xl tracking-tight">
              {mode === "signup"
                ? "Create your account"
                : mode === "forgot"
                  ? "Reset your password"
                  : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-foreground/55">
              {mode === "signup"
                ? "We'll email you a verification link before your first order."
                : mode === "forgot"
                  ? "Enter your email and we'll send you a reset link."
                  : "Sign in to build a pizza and track your orders."}
            </p>

            <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
              {mode === "signup" ? (
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="rounded-xl glass px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              ) : null}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-xl glass px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              {mode !== "forgot" ? (
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="rounded-xl glass px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              ) : null}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {message ? <p className="text-sm text-olive">{message}</p> : null}

              <button
                type="submit"
                disabled={busy}
                className="mt-1 rounded-xl bg-brand text-cream py-3 text-sm font-semibold hover:bg-brand-deep transition-colors disabled:opacity-60"
              >
                {busy
                  ? "One moment…"
                  : mode === "signup"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Sign in"}
              </button>
            </form>

            {mode !== "forgot" ? (
              <>
                <div className="my-5 flex items-center gap-3 text-xs text-foreground/40">
                  <span className="h-px flex-1 bg-border" />
                  or
                  <span className="h-px flex-1 bg-border" />
                </div>
                <button
                  onClick={googleSignIn}
                  className="w-full rounded-xl glass py-3 text-sm font-semibold hover:bg-card transition-colors"
                >
                  Continue with Google
                </button>
              </>
            ) : null}

            <div className="mt-6 flex flex-col gap-1.5 text-sm text-foreground/60">
              {mode === "signin" ? (
                <>
                  <button onClick={() => setMode("forgot")} className="text-left hover:text-foreground">
                    Forgot your password?
                  </button>
                  <button onClick={() => setMode("signup")} className="text-left hover:text-foreground">
                    New here? <span className="font-semibold text-brand-deep">Create an account</span>
                  </button>
                </>
              ) : (
                <button onClick={() => setMode("signin")} className="text-left hover:text-foreground">
                  Already have an account?{" "}
                  <span className="font-semibold text-brand-deep">Sign in</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}
