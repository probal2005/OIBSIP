import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { money, pizzaImages } from "@/lib/pizza";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PizzaHot — Build your perfect slice" },
      {
        name: "description",
        content:
          "Choose a base, layer it your way, pay in seconds and follow your pizza live from the kitchen to your door.",
      },
      { property: "og:title", content: "PizzaHot — Build your perfect slice" },
      {
        property: "og:description",
        content: "Custom pizza builder, live order tracking and fresh wood-fired classics.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: bases } = useQuery({
    queryKey: ["ingredients", "base"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ingredients")
        .select("*")
        .eq("category", "base")
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  const { data: pizzas } = useQuery({
    queryKey: ["pizzas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pizzas").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="mx-auto max-w-[1200px] px-5 py-6">
        <SiteHeader />

        <section className="mt-14 grid lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7">
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-deep">
              Fresh out of the oven
            </span>
            <h1 className="mt-5 font-display font-extrabold leading-[0.95] text-[3.4rem] sm:text-6xl tracking-tight">
              Build your perfect slice, watch it all the way to the door.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-foreground/60 leading-relaxed">
              Choose a base, layer it your way, and follow your order live — from the kitchen to
              your doorstep.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/build"
                className="rounded-xl bg-brand text-cream px-7 py-3.5 font-semibold shadow-xl hover:bg-brand-deep transition-colors"
              >
                Start building
              </Link>
              <Link
                to="/menu"
                className="rounded-xl glass px-7 py-3.5 font-semibold text-foreground hover:bg-card transition-colors"
              >
                View menu
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-brand" />
                <span className="font-semibold">5 bases</span>
                <span className="text-foreground/50">to choose</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-olive" />
                <span className="font-semibold">Live tracking</span>
                <span className="text-foreground/50">kitchen to door</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-warn" />
                <span className="font-semibold">38 min</span>
                <span className="text-foreground/50">avg delivery</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="card-glass rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand/60" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-brand" />
                  </span>
                  <span className="text-sm font-semibold">Custom build</span>
                </div>
                <span className="text-xs font-medium text-foreground/50">Step 1 of 4</span>
              </div>
              <div className="h-1.5 rounded-full bg-foreground/10 overflow-hidden">
                <div className="h-full w-1/4 rounded-full bg-brand" />
              </div>
              <p className="mt-5 font-display font-bold text-lg">Pick your base</p>
              <div className="mt-3 flex flex-col gap-2">
                {(bases ?? []).slice(0, 4).map((base, i) => (
                  <div
                    key={base.id}
                    className={
                      i === 0
                        ? "flex items-center justify-between rounded-xl bg-brand px-4 py-3 text-cream"
                        : "flex items-center justify-between rounded-xl glass px-4 py-3"
                    }
                  >
                    <span className={i === 0 ? "font-semibold" : "font-medium"}>{base.name}</span>
                    <span className={i === 0 ? "text-sm opacity-80" : "text-sm text-foreground/50"}>
                      {base.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="font-display font-extrabold text-3xl tracking-tight">Order variants</h2>
              <p className="text-foreground/55 mt-1">Ready to customise, straight from the oven.</p>
            </div>
            <Link to="/menu" className="text-sm font-semibold text-brand-deep hover:underline">
              See the full menu
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                <Link
                  to="/build"
                  className="mt-4 rounded-lg bg-ink text-cream py-2.5 text-sm font-semibold text-center hover:opacity-90 transition-opacity"
                >
                  Add to build
                </Link>
              </div>
            ))}
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
