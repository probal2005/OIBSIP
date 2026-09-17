# 🍕 PizzaHot

**Build your pizza. Order it. Track it live.**

PizzaHot is a modern full-stack pizza ordering platform built to deliver a complete digital ordering experience — from browsing pizzas and customizing ingredients to placing orders and managing them through an administrative dashboard.

The project combines a React frontend with TanStack Start, Supabase, Drizzle ORM, Tailwind CSS, and TypeScript to create a responsive and scalable pizza ordering application.

<div align="center">

**A modern pizza ordering & management platform**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Installation](#-installation) • [Database](#-database) • [Configuration](#-environment-configuration) • [Usage](#-running-the-project)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Application Modules](#️-application-modules)
- [Tech Stack](#-tech-stack)
- [Architecture](#️-architecture)
- [Project Structure](#-project-structure)
- [Requirements](#-requirements)
- [Installation](#-installation)
- [Environment Configuration](#-environment-configuration)
- [Supabase Setup](#️-supabase-setup)
- [Database](#-database)
- [Running the Project](#-running-the-project)
- [Available Routes](#-available-routes)
- [Pizza Builder](#-pizza-builder)
- [Authentication](#-authentication)
- [Order Management](#-order-lifecycle)
- [Admin Dashboard](#-admin-system)
- [Assets](#️-assets)
- [Development](#-development)
- [Troubleshooting](#-troubleshooting)
- [Security](#-security)
- [Future Improvements](#-future-improvements)
- [Production Deployment](#-production-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🍕 About

PizzaHot is a web-based pizza ordering application built around a simple idea:

> Give customers complete control over their pizza ordering experience.

**Customers can:**

- Browse available pizzas
- View pizza ingredients
- Build a custom pizza
- Select bases, sauces, cheeses, and vegetables
- Manage their cart
- Place orders
- Authenticate through Supabase
- Track order progress

**Administrators can:**

- Access a protected admin area
- Manage pizza inventory
- Monitor orders
- Manage stock
- View operational information

The application uses Supabase as the backend service and PostgreSQL as the database layer.

---

## ✨ Features

### 👤 Customer Features

#### 🍕 Pizza Menu

Customers can browse available pizzas such as:

- Vesuvio
- Blaze
- Moon
- Grove

Each pizza contains information such as:

- Name
- Description
- Ingredients
- Price
- Image
- Display order

#### 🧑‍🍳 Build Your Own Pizza

PizzaHot includes a custom pizza builder where customers can construct their own pizza.

Available ingredient categories include:

- Base
- Sauce
- Cheese
- Veggie

Customers can select ingredients and create a personalized pizza.

#### 🛒 Ordering

The application supports an ordering workflow that allows customers to:

1. Select a pizza
2. Customize it
3. Add it to the order
4. Review the order
5. Place the order
6. Follow order status

#### 📦 Order Tracking

Orders use a defined status workflow:

```text
received
    ↓
in_kitchen
    ↓
sent_to_delivery
    ↓
delivered
```

This allows the customer experience to reflect the current state of an order.

#### 🔐 Authentication

Supabase Authentication is used for user authentication and session management.

The project includes functionality for:

- Login
- Authentication
- Password reset
- Session persistence
- Protected routes
- Admin authentication

---

## 🛠️ Application Modules

PizzaHot is divided into several major modules.

| Module | Purpose |
| --- | --- |
| 🏠 Home | Landing page and primary navigation |
| 🍕 Menu | Browse available pizzas |
| 🧑‍🍳 Builder | Create a custom pizza |
| 🔐 Authentication | Login and session management |
| 🔑 Password Reset | Recover account access |
| 📊 Dashboard | Authenticated user area |
| 🛒 Orders | Customer order workflow |
| 👨‍💼 Admin | Administrative management |
| 📦 Inventory | Ingredient and stock management |
| 📋 Order Management | Administrative order handling |

---

## 💻 Tech Stack

### Frontend

- React
- TypeScript
- TanStack Start
- TanStack Router
- TanStack Query
- Vite
- Tailwind CSS
- shadcn/ui

### Backend / Data

- Supabase
- PostgreSQL
- Supabase Auth
- Supabase REST API
- Supabase Realtime
- Drizzle ORM

### Development

- Node.js
- npm
- TypeScript
- ESLint
- Vite

---

## 🏗️ Architecture

The project follows a modern full-stack architecture:

```text
                         ┌──────────────────────┐
                         │       Customer       │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     React / UI       │
                         │   TanStack Router    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   TanStack Query     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Supabase        │
                         │ Auth + REST + RPC    │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     PostgreSQL       │
                         │      Database        │
                         └──────────────────────┘
```

The project also uses Drizzle migration files to define the database schema.

---

## 📁 Project Structure

```text
PizzaHot/
│
├── AGENTS.md
├── README.md
├── package.json
├── package-lock.json
├── bun.lock
├── bunfig.toml
├── components.json
├── eslint.config.js
├── tsconfig.json
├── vite.config.ts
├── drizzle.config.ts
│
├── drizzle/
│   └── migrations/
│       ├── 0000_pizzahot_core_schema.sql
│       └── meta/
│           ├── 0000_snapshot.json
│           └── _journal.json
│
├── public/
│   ├── favicon.ico
│   └── robots.txt
│
├── supabase/
│   └── config.toml
│
└── src/
    │
    ├── assets/
    │   ├── pizza-blaze.jpg
    │   ├── pizza-grove.jpg
    │   ├── pizza-moon.jpg
    │   └── pizza-vesuvio.jpg
    │
    ├── components/
    │   ├── AdminGate.tsx
    │   ├── SiteHeader.tsx
    │   └── ui/
    │
    ├── hooks/
    │   ├── use-mobile.tsx
    │   └── useSession.ts
    │
    ├── integrations/
    │   ├── lovable/
    │   │   └── index.ts
    │   │
    │   └── supabase/
    │       ├── auth-attacher.ts
    │       ├── auth-middleware.ts
    │       ├── client.server.ts
    │       ├── client.ts
    │       ├── cron-auth.ts
    │       ├── previewAuthStorage.ts
    │       └── types.ts
    │
    ├── lib/
    │   ├── error-capture.ts
    │   ├── error-page.ts
    │   ├── lovable-error-reporting.ts
    │   ├── pizza.ts
    │   └── utils.ts
    │
    ├── routes/
    │   ├── __root.tsx
    │   ├── index.tsx
    │   ├── menu.tsx
    │   ├── auth.tsx
    │   ├── admin.login.tsx
    │   ├── reset-password.tsx
    │   │
    │   └── _authenticated/
    │       ├── route.tsx
    │       ├── dashboard.tsx
    │       ├── build.tsx
    │       ├── admin.inventory.tsx
    │       └── admin.orders.tsx
    │
    ├── router.tsx
    ├── routeTree.gen.ts
    ├── server.ts
    ├── start.ts
    └── styles.css
```

---

## 📋 Requirements

Before running PizzaHot, make sure you have:

**Node.js** — installed on your system.

```bash
node --version
```

**npm**

```bash
npm --version
```

**Supabase** — you need a Supabase project containing the PizzaHot database schema.

---

## 📥 Installation

Clone or copy the project, then move into the project directory:

```bash
cd "/home/probal/Downloads/Project Now/PizzaHot"
```

Install dependencies:

```bash
npm install
```

Verify Vite is available:

```bash
npx vite --version
```

---

## 🔐 Environment Configuration

PizzaHot requires Supabase environment variables.

Create a `.env` file in the project root:

```text
PizzaHot/
├── .env
├── package.json
├── src/
└── ...
```

Add the following:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Replace the values with the credentials from your Supabase project.

> [!IMPORTANT]
> Never commit `.env` to GitHub. Add it to `.gitignore`:

```gitignore
.env
.env.local
.env.*.local
```

---

## 🗄️ Supabase Setup

The database schema is provided in:

```text
drizzle/migrations/0000_pizzahot_core_schema.sql
```

Open the Supabase dashboard and navigate to:

```text
SQL Editor
    ↓
New Query
```

Paste the migration SQL and execute it. The migration creates the core PizzaHot database structure.

---

## 🧱 Database

PizzaHot uses PostgreSQL through Supabase.

### Core Tables

- `profiles`
- `user_roles`
- `admin_allowlist`
- `ingredients`
- `pizzas`
- `orders`
- `order_items`
- `stock_alerts`

### 👤 Profiles

Stores user profile information associated with authenticated users.

### 🔐 User Roles

The project defines application roles:

- `admin`
- `user`

Role-based access is used to control administrative functionality.

### 🍅 Ingredients

Ingredients are organized using the following categories:

- `base`
- `sauce`
- `cheese`
- `veggie`

The migration also includes initial ingredient data.

### 🍕 Pizzas

The database contains the initial PizzaHot pizzas:

| Pizza | Price | Image Key |
| --- | --- | --- |
| Vesuvio | 1800 cents | `vesuvio` |
| Blaze | 2100 cents | `blaze` |
| Moon | 1900 cents | `moon` |
| Grove | 1700 cents | `grove` |

Prices are stored in cents. For example, `1800` represents `18.00` in the configured display currency.

### 📦 Order Database

Orders contain customer and order information.

Order statuses are:

- `received`
- `in_kitchen`
- `sent_to_delivery`
- `delivered`

Order items connect individual products/customizations with an order.

### ⚡ Order RPC

The database migration provides:

```sql
place_order(jsonb, text)
```

This RPC handles the order placement workflow and stock-related operations. The database logic can decrement ingredient stock when an order is placed.

### 🔄 Realtime

PizzaHot enables Supabase Realtime for the `orders` table. This provides the foundation for live order status updates.

```text
Customer
   │
   │ places order
   ▼
Supabase
   │
   ├── received
   │
   ├── in_kitchen
   │
   ├── sent_to_delivery
   │
   └── delivered
```

---

## ▶️ Running the Project

Start the development server:

```bash
cd "/home/probal/Downloads/Project Now/PizzaHot"
npm run dev
```

Vite will provide a local development address. Open the address shown in the terminal.

### 🛑 Stop the Development Server

Press:

```text
Ctrl + C
```

### 🧹 Clean Installation

If dependencies become corrupted:

```bash
cd "/home/probal/Downloads/Project Now/PizzaHot"

rm -rf node_modules
rm -f package-lock.json

npm install
```

Then:

```bash
npm run dev
```

> Only remove `package-lock.json` when you intentionally want npm to regenerate the dependency lockfile.

---

## 🧭 Available Routes

The application currently contains routes for the following areas.

### Public Routes

| Route | Description |
| --- | --- |
| `/` | Home page |
| `/menu` | Pizza menu |
| `/auth` | Authentication |
| `/reset-password` | Password reset |

### Authenticated Routes

| Route | Description |
| --- | --- |
| `/dashboard` | Authenticated customer dashboard |
| `/build` | Pizza builder |

### Admin Routes

| Route | Description |
| --- | --- |
| `/admin/login` | Administrator login |
| `/admin/inventory` | Inventory management |
| `/admin/orders` | Order management |

---

## 🧑‍🍳 Pizza Builder

The Pizza Builder is one of the central features of PizzaHot.

The customer can select ingredients from:

```text
┌───────────────┐
│     BASE      │
├───────────────┤
│     SAUCE     │
├───────────────┤
│    CHEESE     │
├───────────────┤
│    VEGGIES    │
└───────────────┘
```

The application retrieves ingredients from Supabase.

Example REST request:

```text
/rest/v1/ingredients
```

With filtering such as:

```text
category=eq.base
```

Ingredients are ordered using:

```text
sort_order.asc
```

---

## 🔐 Authentication

PizzaHot uses Supabase Authentication.

The authentication architecture supports:

```text
User
 │
 ▼
Supabase Auth
 │
 ▼
Session
 │
 ▼
Authenticated Routes
```

The project includes session-related functionality through:

```text
src/hooks/useSession.ts
```

Protected routes are grouped under:

```text
src/routes/_authenticated/
```

---

## 👨‍💼 Admin System

PizzaHot provides an administrative interface.

Admin-related functionality includes:

| Area | Route |
| --- | --- |
| Admin Login | `/admin/login` |
| Inventory | `/admin/inventory` |
| Orders | `/admin/orders` |

Administrative access is protected through application role management. The database defines the following roles:

- `admin`
- `user`

### 📦 Inventory Management

The inventory system is connected to the ingredients database. Administrators can work with ingredient stock information.

The database also includes `stock_alerts` for stock-related notifications.

---

## 🛒 Order Lifecycle

A typical PizzaHot order follows this lifecycle:

```text
Customer
   │
   ▼
Select Pizza
   │
   ▼
Customize Pizza
   │
   ▼
Add to Order
   │
   ▼
Place Order
   │
   ▼
┌──────────────┐
│   received   │
└──────┬───────┘
       ▼
┌──────────────┐
│  in_kitchen  │
└──────┬───────┘
       ▼
┌────────────────────┐
│ sent_to_delivery   │
└─────────┬──────────┘
          ▼
┌──────────────┐
│  delivered   │
└──────────────┘
```

---

## 🖼️ Assets

PizzaHot includes local pizza images:

```text
src/assets/
├── pizza-blaze.jpg
├── pizza-grove.jpg
├── pizza-moon.jpg
└── pizza-vesuvio.jpg
```

The database pizza records use image keys:

```text
vesuvio
blaze
moon
grove
```

These keys can be mapped to the corresponding frontend assets.

---

## 🎨 UI

The application uses:

- Tailwind CSS
- shadcn/ui
- Responsive layouts
- Reusable components
- Modern typography
- Responsive navigation
- Reusable form controls

Shared components are located in:

```text
src/components/
```

Reusable UI primitives are located in:

```text
src/components/ui/
```

---

## 🧩 Important Source Files

| File | Responsibility |
| --- | --- |
| `src/routes/__root.tsx` | Application root layout, document structure, metadata, global scripts, and shared providers |
| `src/router.tsx` | Configures the TanStack Router |
| `src/integrations/supabase/client.ts` | Initializes the Supabase client and reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `src/integrations/supabase/types.ts` | Generated database type definitions |
| `src/lib/pizza.ts` | Pizza-related application logic |
| `src/hooks/useSession.ts` | Authentication/session-related functionality |

---

## 🧪 Development

Recommended development workflow:

```bash
cd "/home/probal/Downloads/Project Now/PizzaHot"

npm install

npm run dev
```

Then modify the source files under:

```text
src/
```

The development server automatically reloads changes.

---

## 🔍 Troubleshooting

### ❌ `vite: not found`

Run:

```bash
npm install
```

Then:

```bash
npx vite --version
```

Then:

```bash
npm run dev
```

### ❌ Missing Supabase environment variables

If you see:

```text
Missing Supabase environment variable(s)
```

Check that `.env` contains:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Then restart the development server.

### ❌ Supabase REST API returns 404

Example:

```text
/rest/v1/pizzas → 404
/rest/v1/ingredients → 404
```

This usually means the corresponding database tables are not available in the connected Supabase project.

Verify that these tables exist:

- `pizzas`
- `ingredients`

Then check that the PizzaHot migration has been successfully executed:

```text
drizzle/migrations/0000_pizzahot_core_schema.sql
```

### ❌ Hydration errors

If the browser reports React hydration mismatch errors, first make sure the root document structure in `src/routes/__root.tsx` does not contain accidental whitespace/text nodes between HTML elements.

Then restart:

```bash
npm run dev
```

And perform a hard refresh:

```text
Ctrl + Shift + R
```

### ❌ Changes are not appearing

Try a hard refresh:

```text
Ctrl + Shift + R
```

If that does not work, stop the server with `Ctrl + C` and restart:

```bash
npm run dev
```

---

## 🔒 Security

PizzaHot uses Supabase Row Level Security (RLS) for database access control. The database migration defines policies for the application's tables.

Important security principles:

- Do not expose secret Supabase keys in frontend code
- Do not commit `.env`
- Use the publishable Supabase key for client-side access
- Keep privileged/server secrets on the server
- Use RLS to protect database records
- Protect administrative routes
- Validate order-related operations on the backend/database
- Do not trust client-side prices or stock values

---

## 🌱 Future Improvements

Potential future enhancements include:

**Customer Experience**

- Shopping cart persistence
- Coupon system
- Multiple delivery addresses
- Saved favorite pizzas
- Order history
- Ratings and reviews
- Reorder functionality

**Payments**

- Online payment integration
- Payment verification
- Payment history
- Refund workflow

**Delivery**

- Live delivery tracking
- Delivery partner dashboard
- Estimated delivery time
- Interactive delivery map

**Admin**

- Sales analytics
- Revenue dashboard
- Customer analytics
- Advanced inventory management
- Low-stock notifications
- Order filtering
- Export reports

**Technical**

- Automated testing
- End-to-end testing
- CI/CD pipeline
- Production deployment
- Performance optimization
- Progressive Web App support

---

## 🚀 Production Deployment

Before deploying PizzaHot to production:

**1. Configure production environment variables**

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

**2. Apply database migrations**

Ensure the production Supabase database contains:

- `profiles`
- `user_roles`
- `admin_allowlist`
- `ingredients`
- `pizzas`
- `orders`
- `order_items`
- `stock_alerts`

**3. Verify Row Level Security**

Confirm that all production tables have appropriate RLS policies.

**4. Build the application**

```bash
npm run build
```

**5. Test production behavior**

Verify:

- Authentication
- Pizza menu
- Pizza builder
- Orders
- Inventory
- Admin access
- Supabase connectivity
- Error handling

---

## 🤝 Contributing

Contributions are welcome.

**1. Fork the repository**

```bash
git clone YOUR_REPOSITORY_URL
```

**2. Enter the project**

```bash
cd PizzaHot
```

**3. Install dependencies**

```bash
npm install
```

**4. Create your environment file**

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

**5. Start development**

```bash
npm run dev
```

**6. Create a feature branch**

```bash
git checkout -b feature/your-feature
```

**7. Commit your changes**

```bash
git add .
git commit -m "Add your feature"
```

**8. Push the branch**

```bash
git push origin feature/your-feature
```

Then open a Pull Request.

---

## 📜 License

This project does not currently specify a license.

If you intend to distribute the project publicly, add an appropriate license file such as `LICENSE` and update this section accordingly.

---

## 👨‍💻 Author

**Probal Dhali**

Developer and creator of the PizzaHot project.

GitHub: [Probal2005](https://github.com/Probal2005)

---

## 🍕 PizzaHot Philosophy

PizzaHot is built around a simple digital ordering experience:

```text
Discover
   ↓
Customize
   ↓
Order
   ↓
Prepare
   ↓
Deliver
   ↓
Enjoy 🍕
```

The goal is to combine a modern user interface with a reliable backend architecture to create a complete pizza ordering ecosystem.

---

<div align="center">

### 🍕 Build Your Pizza. Make It Yours.

**PizzaHot**

Made with ❤️ using React, TypeScript, TanStack, Supabase & Drizzle.

</div>