import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { money, pizzaImages, statusFlow, statusLabel, type OrderStatus } from "@/lib/pizza";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Your orders — PizzaHot dashboard" },
      {
        name: "description",
        content: "Track your PizzaHot orders live and order another wood-fired pizza in one tap.",
      },
      { property: "og:title", content: "Your PizzaHot dashboard" },
      { property: "og:description", content: "Live order tracking and one-tap reordering." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const queryClient = useQueryClient();
  const [ordering, setOrdering] = useState<string | null>(null);

  const { data: pizzas } = useQuery({
    queryKey: ["pizzas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pizzas").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: orders } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const quickOrder = async (pizza: { id: string; name: string; description: string; price_cents: number }) => {
    setOrdering(pizza.id);
    await supabase.rpc("place_order", {
      _items: [
        { label: pizza.name, detail: pizza.description, price_cents: pizza.price_cents },
      ],
      _payment_id: `rzp_test_${Math.random().toString(36).slice(2, 12)}`,
    });
    setOrdering(null);
    void queryClient.invalidateQueries({ queryKey: ["my-orders"] });
  };

  const active = (orders ?? []).filter((o) => o.status !== "delivered");
  const past = (orders ?? []).filter((o) => o.status === "delivered");

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="mx-auto max-w-[1200px] px-5 py-6">
        <SiteHeader />

        <header className="mt-12 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-extrabold text-5xl tracking-tight">Your kitchen</h1>
            <p className="mt-3 text-foreground/60">
              Live status on everything in the oven, plus tonight's menu.
            </p>
          </div>
          <Link
            to="/build"
            className="rounded-xl bg-brand text-cream px-6 py-3 text-sm font-semibold hover:bg-brand-deep transition-colors"
          >
            Build a pizza
          </Link>
        </header>

        <section className="mt-8 grid lg:grid-cols-2 gap-5">
          {active.length === 0 ? (
            <div className="card-glass rounded-3xl p-6">
              <p className="font-display font-bold text-xl">Nothing in the oven</p>
              <p className="mt-2 text-sm text-foreground/55">
                Build a custom pizza or pick a house classic below — you'll see every status change
                here the moment the kitchen makes it.
              </p>
            </div>
          ) : (
            active.map((order) => (
              <OrderTracker
                key={order.id}
                id={order.id}
                status={order.status as OrderStatus}
                total={order.total_cents}
                createdAt={order.created_at}
                items={order.order_items as { id: string; label: string; detail: string | null }[]}
              />
            ))
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-display font-extrabold text-3xl tracking-tight">Available tonight</h2>
          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {(pizzas ?? []).map((pizza) => (
              <div key={pizza.id} className="card-glass rounded-2xl p-4 flex flex-col">
                <img
                  src={pizzaImages[pizza.image_key]}
                  alt={`${pizza.name} pizza`}
                  loading="lazy"
                  width={880}
                  height={752}
                  className="w-full aspect-[4/3] rounded-xl object-cover"
                />
                <div className="mt-4 flex items-center justify-between">
                  <h3 className="font-display font-bold">{pizza.name}</h3>
                  <span className="font-display font-extrabold text-brand-deep">
                    {money(pizza.price_cents)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground/55 leading-snug">{pizza.description}</p>
                <button
                  onClick={() => quickOrder(pizza)}
                  disabled={ordering === pizza.id}
                  className="mt-4 rounded-lg bg-ink text-cream py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {ordering === pizza.id ? "Placing…" : "Order now"}
                </button>
              </div>
            ))}
          </div>
        </section>

        {past.length ? (
          <section className="mt-14">
            <h2 className="font-display font-extrabold text-3xl tracking-tight">Past orders</h2>
            <div className="mt-5 card-glass rounded-3xl p-5">
              {past.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-border py-3 last:border-0 text-sm"
                >
                  <span className="font-medium">
                    #{order.id.slice(0, 6).toUpperCase()} ·{" "}
                    {(order.order_items as { label: string }[]).map((i) => i.label).join(", ")}
                  </span>
                  <span className="text-foreground/50">
                    {new Date(order.created_at).toLocaleDateString()} · {money(order.total_cents)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <SiteFooter />
      </div>
    </div>
  );
}

function OrderTracker({
  id,
  status,
  total,
  createdAt,
  items,
}: {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: { id: string; label: string; detail: string | null }[];
}) {
  const index = statusFlow.indexOf(status);

  return (
    <div className="card-glass rounded-3xl p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep">
          Order #{id.slice(0, 6).toUpperCase()}
        </span>
        <span className="text-xs font-medium text-foreground/50">
          {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ·{" "}
          {money(total)}
        </span>
      </div>
      <p className="mt-3 font-display font-bold text-2xl">{statusLabel[status]}</p>
      <p className="mt-1 text-sm text-foreground/55">
        {items.map((i) => i.detail || i.label).join(" | ")}
      </p>

      <ol className="mt-6 flex flex-col gap-0">
        {statusFlow.map((s, i) => (
          <li key={s} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <span
                className={
                  i <= index
                    ? "grid size-8 place-items-center rounded-full bg-brand text-cream text-xs font-bold"
                    : "grid size-8 place-items-center rounded-full border-2 border-border text-foreground/40 text-xs font-bold"
                }
              >
                {i + 1}
              </span>
              {i < statusFlow.length - 1 ? (
                <span className={i < index ? "w-px h-7 bg-brand" : "w-px h-7 bg-border"} />
              ) : null}
            </div>
            <p
              className={
                i === index
                  ? "text-sm font-semibold text-brand-deep pt-1.5"
                  : i < index
                    ? "text-sm font-semibold pt-1.5"
                    : "text-sm text-foreground/40 pt-1.5"
              }
            >
              {statusLabel[s]}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
