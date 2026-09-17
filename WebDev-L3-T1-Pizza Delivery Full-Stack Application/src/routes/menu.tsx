import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader, SiteFooter } from "@/components/SiteHeader";
import { money, pizzaImages, categoryLabel } from "@/lib/pizza";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — PizzaHot wood-fired pizzas and toppings" },
      {
        name: "description",
        content:
          "Browse PizzaHot signature pizzas plus every base, sauce, cheese and vegetable available in the custom builder.",
      },
      { property: "og:title", content: "Menu — PizzaHot" },
      {
        property: "og:description",
        content: "Signature pizzas and every topping available in the PizzaHot builder.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { data: pizzas } = useQuery({
    queryKey: ["pizzas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pizzas").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });

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
  });

  const categories = ["base", "sauce", "cheese", "veggie"] as const;

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="mx-auto max-w-[1200px] px-5 py-6">
        <SiteHeader />

        <header className="mt-12">
          <h1 className="font-display font-extrabold text-5xl tracking-tight">The menu</h1>
          <p className="mt-3 text-foreground/60 max-w-xl">
            Four house pizzas from the stone oven, plus every ingredient you can stack in the
            builder.
          </p>
        </header>

        <section className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                <h2 className="font-display font-bold">{pizza.name}</h2>
                <span className="font-display font-extrabold text-brand-deep">
                  {money(pizza.price_cents)}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/55 leading-snug">{pizza.description}</p>
              <Link
                to="/build"
                className="mt-4 rounded-lg bg-ink text-cream py-2.5 text-sm font-semibold text-center hover:opacity-90 transition-opacity"
              >
                Order now
              </Link>
            </div>
          ))}
        </section>

        <section className="mt-14 grid md:grid-cols-2 gap-5">
          {categories.map((category) => (
            <div key={category} className="card-glass rounded-3xl p-6">
              <h2 className="font-display font-bold text-xl">{categoryLabel[category]}</h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {(ingredients ?? [])
                  .filter((i) => i.category === category)
                  .map((item) => (
                    <li key={item.id} className="flex items-center justify-between text-sm">
                      <span>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-foreground/50"> · {item.description}</span>
                      </span>
                      <span className="font-semibold text-brand-deep">
                        {item.price_cents === 0 ? "Included" : `+${money(item.price_cents)}`}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </section>

        <SiteFooter />
      </div>
    </div>
  );
}
