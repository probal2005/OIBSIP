-- ENUMS
create type public.app_role as enum ('admin','user');
create type public.ingredient_category as enum ('base','sauce','cheese','veggie');
create type public.order_status as enum ('received','in_kitchen','sent_to_delivery','delivered');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile read" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

-- ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- ADMIN ALLOWLIST (emails that become admins on signup)
create table public.admin_allowlist (email text primary key);
grant all on public.admin_allowlist to service_role;
alter table public.admin_allowlist enable row level security;
insert into public.admin_allowlist(email) values ('admin@pizzahot.com');

-- NEW USER TRIGGER
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''));
  if exists (select 1 from public.admin_allowlist a where lower(a.email) = lower(new.email)) then
    insert into public.user_roles (user_id, role) values (new.id, 'admin') on conflict do nothing;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- INGREDIENTS (inventory)
create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  category public.ingredient_category not null,
  name text not null,
  description text,
  price_cents integer not null default 0,
  stock integer not null default 0,
  threshold integer not null default 20,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
grant select on public.ingredients to anon, authenticated;
grant insert, update, delete on public.ingredients to authenticated;
grant all on public.ingredients to service_role;
alter table public.ingredients enable row level security;
create policy "anyone reads ingredients" on public.ingredients for select to anon, authenticated using (true);
create policy "admins manage ingredients" on public.ingredients for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- PIZZAS (preset varieties)
create table public.pizzas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price_cents integer not null,
  image_key text not null,
  sort_order integer not null default 0
);
grant select on public.pizzas to anon, authenticated;
grant all on public.pizzas to service_role;
alter table public.pizzas enable row level security;
create policy "anyone reads pizzas" on public.pizzas for select to anon, authenticated using (true);

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.order_status not null default 'received',
  total_cents integer not null,
  payment_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.orders to authenticated;
grant update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "own orders read" on public.orders for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "admins update orders" on public.orders for update to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  label text not null,
  detail text,
  price_cents integer not null,
  quantity integer not null default 1
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order items read" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));

-- STOCK ALERTS
create table public.stock_alerts (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients(id) on delete cascade,
  stock_at_alert integer not null,
  threshold_at_alert integer not null,
  notified_at timestamptz not null default now()
);
grant select on public.stock_alerts to authenticated;
grant all on public.stock_alerts to service_role;
alter table public.stock_alerts enable row level security;
create policy "admins read alerts" on public.stock_alerts for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- PLACE ORDER RPC: creates order, items, decrements stock
create or replace function public.place_order(_items jsonb, _payment_id text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _order_id uuid;
  _total integer := 0;
  _item jsonb;
  _ing uuid;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;

  for _item in select * from jsonb_array_elements(_items) loop
    _total := _total + (_item->>'price_cents')::int;
  end loop;

  insert into public.orders (user_id, total_cents, payment_id)
  values (_uid, _total, _payment_id) returning id into _order_id;

  for _item in select * from jsonb_array_elements(_items) loop
    insert into public.order_items (order_id, label, detail, price_cents)
    values (_order_id, _item->>'label', _item->>'detail', (_item->>'price_cents')::int);

    if _item ? 'ingredient_ids' then
      for _ing in select (jsonb_array_elements_text(_item->'ingredient_ids'))::uuid loop
        update public.ingredients set stock = greatest(stock - 1, 0) where id = _ing;
      end loop;
    end if;
  end loop;

  return _order_id;
end;
$$;
grant execute on function public.place_order(jsonb, text) to authenticated;

-- updated_at
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
create trigger orders_touch before update on public.orders
for each row execute function public.touch_updated_at();

-- REALTIME
alter table public.orders replica identity full;
alter publication supabase_realtime add table public.orders;

-- SEED INGREDIENTS
insert into public.ingredients (category, name, description, price_cents, stock, threshold, sort_order) values
('base','Neapolitan','Classic & thin',0,42,20,1),
('base','Sourdough','Tangy & airy',150,34,20,2),
('base','Whole wheat','Hearty',150,28,20,3),
('base','Gluten-free','Light',250,18,20,4),
('base','Deep pan','Thick & fluffy',200,31,20,5),
('sauce','San Marzano','Sweet tomato',200,55,20,1),
('sauce','Spicy arrabbiata','Chilli kick',250,40,20,2),
('sauce','Garlic cream','Rich & white',250,26,20,3),
('sauce','Basil pesto','Herby green',300,19,20,4),
('sauce','Smoky BBQ','Sweet & smoked',250,33,20,5),
('cheese','Fior di latte','Milky & soft',400,36,20,1),
('cheese','Mozzarella','The classic',300,48,20,2),
('cheese','Buffalo mozzarella','Creamy',600,22,20,3),
('cheese','Goat cheese','Tangy',500,17,20,4),
('cheese','Gorgonzola','Bold & blue',500,24,20,5),
('veggie','Fresh basil','Aromatic leaves',100,31,20,1),
('veggie','Bell peppers','Sweet & crisp',120,51,20,2),
('veggie','Mushrooms','Earthy',150,44,20,3),
('veggie','Red onion','Sharp',100,38,20,4),
('veggie','Black olives','Briny',150,29,20,5),
('veggie','Cherry tomatoes','Juicy',150,35,20,6),
('veggie','Jalapenos','Hot',120,16,20,7),
('veggie','Rocket','Peppery greens',130,21,20,8);

-- SEED PIZZAS
insert into public.pizzas (name, description, price_cents, image_key, sort_order) values
('Vesuvio','San Marzano, fior di latte, fresh basil',1800,'vesuvio',1),
('Blaze','Cup char pepperoni, smoked mozzarella',2100,'blaze',2),
('Moon','Roasted mushroom, truffle cream, thyme',1900,'moon',3),
('Grove','Charred broccoli, olives, cashew cream',1700,'grove',4);