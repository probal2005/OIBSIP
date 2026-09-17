import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AdminGate, AdminTabs } from "@/components/AdminGate";
import { categoryLabel, money } from "@/lib/pizza";

export const Route = createFileRoute("/_authenticated/admin/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory console — PizzaHot staff" },
      {
        name: "description",
        content: "Live stock levels for bases, sauces, cheeses and vegetables with manual restock.",
      },
      { property: "og:title", content: "Inventory console — PizzaHot" },
      { property: "og:description", content: "Stock levels and low-stock alerts for the kitchen." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <Shell>
      <InventoryPanel />
    </Shell>
  ),
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="mx-auto max-w-[1200px] px-5 py-6">
        <SiteHeader />
        <AdminGate>{children}</AdminGate>
        <SiteFooter />
      </div>
    </div>
  );
}

function InventoryPanel() {
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, { stock: string; threshold: string }>>({});

  const { data: ingredients } = useQuery({
    queryKey: ["ingredients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .order("category")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
    refetchInterval: 20000,
  });

  const { data: alerts } = useQuery({
    queryKey: ["stock-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_alerts")
        .select("*, ingredients(name)")
        .order("notified_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const save = async (id: string, stock: number, threshold: number) => {
    await supabase.from("ingredients").update({ stock, threshold }).eq("id", id);
    setDrafts((d) => {
      const next = { ...d };
      delete next[id];
      return next;
    });
    void queryClient.invalidateQueries({ queryKey: ["ingredients"] });
  };

  const categories = ["base", "sauce", "cheese", "veggie"] as const;
  const low = (ingredients ?? []).filter((i) => i.stock < i.threshold);

  return (
    <>
      <header className="mt-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-5xl tracking-tight">Inventory</h1>
          <p className="mt-3 text-foreground/60">
            Stock drops automatically with every order. Update counts by hand whenever you restock.
          </p>
        </div>
        <span
          className={
            low.length
              ? "rounded-full bg-brand/15 text-brand-deep px-4 py-2 text-sm font-semibold"
              : "rounded-full bg-olive/15 text-olive px-4 py-2 text-sm font-semibold"
          }
        >
          {low.length ? `${low.length} items below threshold` : "All items above threshold"}
        </span>
      </header>

      <AdminTabs />

      <section className="mt-6 grid md:grid-cols-2 gap-5">
        {categories.map((category) => (
          <div key={category} className="card-glass rounded-3xl p-6">
            <h2 className="font-display font-bold text-xl">{categoryLabel[category]}</h2>
            <div className="mt-4 flex flex-col gap-4">
              {(ingredients ?? [])
                .filter((i) => i.category === category)
                .map((item) => {
                  const draft = drafts[item.id] ?? {
                    stock: String(item.stock),
                    threshold: String(item.threshold),
                  };
                  const isLow = item.stock < item.threshold;
                  const pct = Math.min(100, (item.stock / Math.max(item.threshold * 2, 1)) * 100);
                  return (
                    <div key={item.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {item.name}
                          <span className="text-foreground/40"> · {money(item.price_cents)}</span>
                        </span>
                        <span
                          className={
                            isLow ? "font-semibold text-brand-deep" : "font-semibold text-olive"
                          }
                        >
                          {item.stock} in stock
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 rounded-full bg-foreground/10">
                        <div
                          className={
                            isLow ? "h-full rounded-full bg-brand" : "h-full rounded-full bg-olive"
                          }
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-xs text-foreground/50">Stock</label>
                        <input
                          type="number"
                          value={draft.stock}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [item.id]: { ...draft, stock: e.target.value },
                            }))
                          }
                          className="w-20 rounded-lg glass px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                        <label className="text-xs text-foreground/50">Alert below</label>
                        <input
                          type="number"
                          value={draft.threshold}
                          onChange={(e) =>
                            setDrafts((d) => ({
                              ...d,
                              [item.id]: { ...draft, threshold: e.target.value },
                            }))
                          }
                          className="w-20 rounded-lg glass px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                        <button
                          onClick={() =>
                            save(item.id, Number(draft.stock) || 0, Number(draft.threshold) || 0)
                          }
                          className="ml-auto rounded-lg bg-ink text-cream px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6 card-glass rounded-3xl p-6">
        <h2 className="font-display font-bold text-xl">Recent low-stock alerts</h2>
        <p className="mt-1 text-sm text-foreground/55">
          Stock is checked automatically every hour and each item below its threshold is logged here.
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          {(alerts ?? []).length === 0 ? (
            <p className="text-foreground/40">No alerts yet.</p>
          ) : (
            (alerts ?? []).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                <span className="font-medium">
                  {(alert.ingredients as { name: string } | null)?.name ?? "Ingredient"}
                </span>
                <span className="text-foreground/50">
                  {alert.stock_at_alert} left (threshold {alert.threshold_at_alert}) ·{" "}
                  {new Date(alert.notified_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
