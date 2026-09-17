import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { AdminGate, AdminTabs } from "@/components/AdminGate";
import { money, statusFlow, statusLabel, type OrderStatus } from "@/lib/pizza";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  head: () => ({
    meta: [
      { title: "Order console — PizzaHot staff" },
      {
        name: "description",
        content: "See every incoming PizzaHot order and move it through the kitchen in real time.",
      },
      { property: "og:title", content: "Order console — PizzaHot" },
      { property: "og:description", content: "Manage incoming orders and update their status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="mx-auto max-w-[1200px] px-5 py-6">
        <SiteHeader />
        <AdminGate>
          <OrdersPanel />
        </AdminGate>
        <SiteFooter />
      </div>
    </div>
  ),
});

function OrdersPanel() {
  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ["all-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*), profiles(email)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    const channel = supabase
      .channel("admin-orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void queryClient.invalidateQueries({ queryKey: ["all-orders"] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const advance = async (id: string, status: OrderStatus) => {
    const next = statusFlow[Math.min(statusFlow.indexOf(status) + 1, statusFlow.length - 1)];
    await supabase.from("orders").update({ status: next }).eq("id", id);
    void queryClient.invalidateQueries({ queryKey: ["all-orders"] });
  };

  return (
    <>
      <header className="mt-12">
        <h1 className="font-display font-extrabold text-5xl tracking-tight">Incoming orders</h1>
        <p className="mt-3 text-foreground/60">
          Every status change appears on the customer's tracker instantly.
        </p>
      </header>

      <AdminTabs />

      <section className="mt-6 card-glass rounded-3xl p-5 sm:p-6">
        <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_1fr_auto_auto] gap-3 border-b border-border pb-2 text-xs uppercase tracking-wider text-foreground/45">
          <span>Order</span>
          <span className="hidden sm:block">Customer</span>
          <span>Status</span>
          <span className="text-right">Action</span>
        </div>
        {(orders ?? []).length === 0 ? (
          <p className="py-6 text-sm text-foreground/45">No orders yet tonight.</p>
        ) : (
          (orders ?? []).map((order) => {
            const status = order.status as OrderStatus;
            const items = order.order_items as { id: string; label: string; detail: string | null }[];
            return (
              <div
                key={order.id}
                className="grid grid-cols-[1fr_auto] sm:grid-cols-[1.4fr_1fr_auto_auto] items-center gap-3 border-b border-border py-3 last:border-0 text-sm"
              >
                <div>
                  <p className="font-medium">
                    #{order.id.slice(0, 6).toUpperCase()} · {money(order.total_cents)}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {items.map((i) => i.detail || i.label).join(" | ")}
                  </p>
                </div>
                <span className="hidden sm:block text-foreground/60">
                  {(order.profiles as { email: string | null } | null)?.email ?? "—"}
                </span>
                <span
                  className={
                    status === "delivered"
                      ? "rounded-full bg-secondary px-3 py-1 text-xs font-semibold"
                      : "rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand-deep"
                  }
                >
                  {statusLabel[status]}
                </span>
                <div className="text-right">
                  {status === "delivered" ? (
                    <span className="text-xs text-foreground/35">Complete</span>
                  ) : (
                    <button
                      onClick={() => advance(order.id, status)}
                      className="rounded-full bg-ink text-cream px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                    >
                      {statusLabel[statusFlow[statusFlow.indexOf(status) + 1]]} →
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>
    </>
  );
}
