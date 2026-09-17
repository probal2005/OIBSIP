import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { money } from "@/lib/pizza";

export const Route = createFileRoute("/_authenticated/build")({
  head: () => ({
    meta: [
      { title: "Custom pizza builder — PizzaHot" },
      {
        name: "description",
        content: "Pick a base, sauce, cheese and vegetables, then check out in four quick steps.",
      },
      { property: "og:title", content: "Custom pizza builder — PizzaHot" },
      { property: "og:description", content: "Build your pizza layer by layer and pay in seconds." },
    ],
  }),
  component: BuildPage,
});

type Ingredient = {
  id: string;
  category: string;
  name: string;
  description: string | null;
  price_cents: number;
  stock: number;
};

const steps = [
  { key: "base", label: "Base", title: "Choose your base" },
  { key: "sauce", label: "Sauce", title: "Choose your sauce" },
  { key: "cheese", label: "Cheese", title: "Choose your cheese" },
  { key: "veggie", label: "Veggies", title: "Pick your vegetables" },
] as const;

function BuildPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [base, setBase] = useState<Ingredient | null>(null);
  const [sauce, setSauce] = useState<Ingredient | null>(null);
  const [cheese, setCheese] = useState<Ingredient | null>(null);
  const [veggies, setVeggies] = useState<Ingredient[]>([]);
  const [paying, setPaying] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from("ingredients")
        .select("*")
        .order("sort_order");
      if (err) throw err;
      return data as Ingredient[];
    },
  });

  const selected = useMemo(
    () => [base, sauce, cheese, ...veggies].filter(Boolean) as Ingredient[],
    [base, sauce, cheese, veggies],
  );
  const total = selected.reduce((sum, i) => sum + i.price_cents, 0);
  const onSummary = step === steps.length;
  const current = steps[Math.min(step, steps.length - 1)];
  const options = (ingredients ?? []).filter((i) => i.category === current.key);

  const pick = (item: Ingredient) => {
    if (current.key === "base") setBase(item);
    if (current.key === "sauce") setSauce(item);
    if (current.key === "cheese") setCheese(item);
    if (current.key === "veggie")
      setVeggies((prev) =>
        prev.some((v) => v.id === item.id)
          ? prev.filter((v) => v.id !== item.id)
          : [...prev, item],
      );
  };

  const isPicked = (item: Ingredient) =>
    base?.id === item.id ||
    sauce?.id === item.id ||
    cheese?.id === item.id ||
    veggies.some((v) => v.id === item.id);

  const canContinue =
    (current.key === "base" && base) ||
    (current.key === "sauce" && sauce) ||
    (current.key === "cheese" && cheese) ||
    current.key === "veggie";

  const confirmPayment = async () => {
    setPlacing(true);
    setError(null);
    const detail = [base?.name, sauce?.name, cheese?.name, ...veggies.map((v) => v.name)]
      .filter(Boolean)
      .join(" · ");
    const { data, error: err } = await supabase.rpc("place_order", {
      _items: [
        {
          label: "Custom pizza",
          detail,
          price_cents: total,
          ingredient_ids: selected.map((i) => i.id),
        },
      ],
      _payment_id: `rzp_test_${Math.random().toString(36).slice(2, 12)}`,
    });
    setPlacing(false);
    if (err || !data) {
      setError("We could not confirm that order. Please try again.");
      return;
    }
    setPaying(false);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="mx-auto max-w-[1200px] px-5 py-6">
        <SiteHeader />

        <section className="mt-12 grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="card-glass rounded-3xl p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <h1 className="font-display font-extrabold text-3xl tracking-tight">
                {onSummary ? "Order summary" : "Custom builder"}
              </h1>
              <span className="text-sm text-foreground/55">
                {onSummary ? "Ready to pay" : `Step ${step + 1} of 4`}
              </span>
            </div>
            <div className="mt-4 h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${((onSummary ? 4 : step + 1) / 4) * 100}%` }}
              />
            </div>

            {!onSummary ? (
              <>
                <div className="mt-6 flex flex-wrap gap-1.5 text-xs">
                  {steps.map((s, i) => (
                    <button
                      key={s.key}
                      onClick={() => setStep(i)}
                      className={
                        i === step
                          ? "px-3 py-1.5 rounded-full bg-brand text-cream font-medium"
                          : i < step
                            ? "px-3 py-1.5 rounded-full bg-secondary text-foreground"
                            : "px-3 py-1.5 rounded-full glass text-foreground/50"
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-sm text-foreground/60">{current.title}</p>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {options.map((item) => {
                    const out = item.stock <= 0;
                    return (
                      <button
                        key={item.id}
                        disabled={out}
                        onClick={() => pick(item)}
                        className={
                          isPicked(item)
                            ? "text-left rounded-xl p-4 bg-brand/15 border-2 border-brand transition-transform hover:-translate-y-1"
                            : "text-left rounded-xl p-4 glass border border-transparent transition-transform hover:-translate-y-1 disabled:opacity-40 disabled:hover:translate-y-0"
                        }
                      >
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-foreground/50 mt-1">
                          {out
                            ? "Out of stock"
                            : item.price_cents === 0
                              ? "Included"
                              : `+ ${money(item.price_cents)}`}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-7 flex items-center justify-between">
                  <button
                    onClick={() => setStep((s) => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="text-sm px-4 py-2 rounded-lg text-foreground/60 hover:text-foreground disabled:opacity-40"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canContinue}
                    className="bg-brand text-cream text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-deep transition-colors disabled:opacity-50"
                  >
                    {step === steps.length - 1 ? "Review order →" : "Continue →"}
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-6">
                <ul className="flex flex-col gap-2.5 text-sm">
                  {selected.map((item) => (
                    <li key={item.id} className="flex justify-between">
                      <span className="text-foreground/70">
                        <span className="uppercase text-xs tracking-wider text-foreground/40">
                          {item.category}
                        </span>{" "}
                        · {item.name}
                      </span>
                      <span className="font-medium">{money(item.price_cents)}</span>
                    </li>
                  ))}
                </ul>
                <div className="my-5 h-px bg-border" />
                <div className="flex items-baseline justify-between">
                  <span className="text-foreground/60">Total to pay</span>
                  <span className="font-display font-extrabold text-3xl text-brand-deep">
                    {money(total)}
                  </span>
                </div>
                {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setStep(steps.length - 1)}
                    className="rounded-xl glass px-5 py-3 text-sm font-semibold hover:bg-card transition-colors"
                  >
                    Keep editing
                  </button>
                  <button
                    onClick={() => setPaying(true)}
                    disabled={!base || !sauce || !cheese}
                    className="flex-1 rounded-xl bg-brand text-cream py-3 text-sm font-semibold hover:bg-brand-deep transition-colors disabled:opacity-50"
                  >
                    Pay with Razorpay (test)
                  </button>
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 card-glass rounded-3xl p-5">
            <p className="font-display font-bold">Your pizza</p>
            <p className="text-xs text-foreground/50 mt-0.5">Hand-tossed, 12 inch</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <SummaryRow label="Base" value={base?.name} price={base?.price_cents} />
              <SummaryRow label="Sauce" value={sauce?.name} price={sauce?.price_cents} />
              <SummaryRow label="Cheese" value={cheese?.name} price={cheese?.price_cents} />
              <SummaryRow
                label="Veggies"
                value={veggies.length ? veggies.map((v) => v.name).join(", ") : undefined}
                price={veggies.reduce((s, v) => s + v.price_cents, 0)}
              />
            </ul>
            <div className="my-4 h-px bg-border" />
            <div className="flex justify-between items-baseline">
              <span className="text-foreground/60 text-sm">Running total</span>
              <span className="font-display font-extrabold text-2xl text-brand-deep">
                {money(total)}
              </span>
            </div>
          </aside>
        </section>

        <SiteFooter />
      </div>

      {paying ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 px-5">
          <div className="w-full max-w-sm card-glass rounded-3xl p-6">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep">
              Razorpay · test mode
            </span>
            <p className="mt-3 font-display font-bold text-2xl">Pay {money(total)}</p>
            <p className="mt-2 text-sm text-foreground/55">
              No real money moves in test mode. Choose an outcome to simulate the payment.
            </p>
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPaying(false)}
                className="rounded-xl glass px-5 py-3 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={placing}
                className="flex-1 rounded-xl bg-olive text-cream py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60"
              >
                {placing ? "Confirming…" : "Success"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  price,
}: {
  label: string;
  value?: string;
  price?: number;
}) {
  return (
    <li className="flex justify-between gap-3">
      <span className={value ? "text-foreground/70" : "text-foreground/35"}>
        {label} {value ? `· ${value}` : ""}
      </span>
      <span className={value ? "text-foreground" : "text-foreground/35"}>
        {value ? money(price ?? 0) : "—"}
      </span>
    </li>
  );
}
