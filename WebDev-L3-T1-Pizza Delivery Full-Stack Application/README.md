🍕 PizzaHot

Build your pizza. Order it. Track it live.

PizzaHot is a modern full-stack pizza ordering platform designed to provide a complete digital ordering experience — from browsing pizzas and customizing ingredients to placing orders and managing them through an administrative dashboard.

The project combines a modern React-based frontend with TanStack Start, Supabase, Drizzle ORM, Tailwind CSS, and TypeScript to create a responsive and scalable pizza ordering application.

<div align="center">

🍕 PizzaHot

A modern pizza ordering & management platform

Features •
Tech Stack •
Project Structure •
Installation •
Database •
Configuration •
Usage

</div>

📖 Table of Contents
About
Features
Application Modules
Tech Stack
Architecture
Project Structure
Requirements
Installation
Environment Configuration
Supabase Setup
Database
Running the Project
Available Routes
Pizza Builder
Authentication
Order Management
Admin Dashboard
Assets
Development
Troubleshooting
Security
Future Improvements
Contributing
License
Author
🍕 About

PizzaHot is a web-based pizza ordering application built around a simple idea:

Give customers complete control over their pizza ordering experience.

Customers can:

Browse available pizzas
View pizza ingredients
Build a custom pizza
Select bases
Select sauces
Select cheeses
Add vegetables
Manage their cart
Place orders
Authenticate through Supabase
Track order progress

Administrators can:

Access a protected admin area
Manage pizza inventory
Monitor orders
Manage stock
View operational information

The application uses Supabase as the backend service and PostgreSQL as the database layer.

✨ Features
👤 Customer Features
🍕 Pizza Menu

Customers can browse available pizzas such as:

Vesuvio
Blaze
Moon
Grove

Each pizza contains information such as:

Name
Description
Ingredients
Price
Image
Display order
🧑‍🍳 Build Your Own Pizza

PizzaHot includes a custom pizza builder where customers can construct their own pizza.

Available ingredient categories include:

Base
Sauce
Cheese
Veggie

Customers can select ingredients and create a personalized pizza.

🛒 Ordering

The application supports an ordering workflow that allows customers to:

Select a pizza
Customize it
Add it to the order
Review the order
Place the order
Follow order status
📦 Order Tracking

Orders use a defined status workflow:

received
    ↓
in_kitchen
    ↓
sent_to_delivery
    ↓
delivered

This allows the customer experience to reflect the current state of an order.

🔐 Authentication

Supabase Authentication is used for user authentication and session management.

The project includes functionality for:

Login
Authentication
Password reset
Session persistence
Protected routes
Admin authentication
🛠️ Application Modules

PizzaHot is divided into several major modules.

Module	Purpose
🏠 Home	Landing page and primary navigation
🍕 Menu	Browse available pizzas
🧑‍🍳 Builder	Create a custom pizza
🔐 Authentication	Login and session management
🔑 Password Reset	Recover account access
📊 Dashboard	Authenticated user area
🛒 Orders	Customer order workflow
👨‍💼 Admin	Administrative management
📦 Inventory	Ingredient and stock management
📋 Order Management	Administrative order handling
💻 Tech Stack
Frontend
React
TypeScript
TanStack Start
TanStack Router
TanStack Query
Vite
Tailwind CSS
shadcn/ui
Backend / Data
Supabase
PostgreSQL
Supabase Auth
Supabase REST API
Supabase Realtime
Drizzle ORM
Development
Node.js
npm
TypeScript
ESLint
Vite
🏗️ Architecture

The project follows a modern full-stack architecture:

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

The project also uses Drizzle migration files to define the database schema.

📁 Project Structure
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
📋 Requirements

Before running PizzaHot, make sure you have:

Node.js

Node.js should be installed on your system.

Check:

node --version
npm

Check:

npm --version
Supabase

You need a Supabase project containing the PizzaHot database schema.

📥 Installation

Clone or copy the project:

cd "/home/probal/Downloads/Project Now/PizzaHot"

Install dependencies:

npm install

Verify Vite:

npx vite --version
🔐 Environment Configuration

PizzaHot requires Supabase environment variables.

Create a .env file in the project root:

PizzaHot/
├── .env
├── package.json
├── src/
└── ...

Add:

VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY

Replace the values with the credentials from your Supabase project.

Important

Never commit .env to GitHub.

Add it to .gitignore:

.env
.env.local
.env.*.local
🗄️ Supabase Setup

The database schema is provided in:

drizzle/migrations/0000_pizzahot_core_schema.sql

Open the Supabase dashboard and navigate to:

SQL Editor
    ↓
New Query

Paste the migration SQL and execute it.

The migration creates the core PizzaHot database structure.

🧱 Database

PizzaHot uses PostgreSQL through Supabase.

Core Tables
profiles
user_roles
admin_allowlist
ingredients
pizzas
orders
order_items
stock_alerts
👤 Profiles

Stores user profile information associated with authenticated users.

🔐 User Roles

The project defines application roles:

admin
user

Role-based access is used to control administrative functionality.

🍅 Ingredients

Ingredients are organized using the following categories:

base
sauce
cheese
veggie

The migration also includes initial ingredient data.

🍕 Pizzas

The database contains the initial PizzaHot pizzas:

Pizza	Price	Image Key
Vesuvio	1800 cents	vesuvio
Blaze	2100 cents	blaze
Moon	1900 cents	moon
Grove	1700 cents	grove

Prices are stored in cents.

For example:

1800 = ₹18.00

if the application is configured to interpret the stored value as the corresponding currency amount.

📦 Order Database

Orders contain customer and order information.

Order statuses are:

received
in_kitchen
sent_to_delivery
delivered

Order items connect individual products/customizations with an order.

⚡ Order RPC

The database migration provides:

place_order(jsonb, text)

This RPC handles the order placement workflow and stock-related operations.

The database logic can decrement ingredient stock when an order is placed.

🔄 Realtime

PizzaHot enables Supabase Realtime for the orders table.

This provides the foundation for live order status updates.

Conceptually:

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
▶️ Running the Project

Start the development server:

cd "/home/probal/Downloads/Project Now/PizzaHot"
npm run dev

Vite will provide a local development address.

Open the address shown in the terminal.

🛑 Stop the Development Server

Press:

Ctrl + C
🧹 Clean Installation

If dependencies become corrupted:

cd "/home/probal/Downloads/Project Now/PizzaHot"

rm -rf node_modules
rm -f package-lock.json

npm install

Then:

npm run dev

Only remove package-lock.json when you intentionally want npm to regenerate the dependency lockfile.

🧭 Available Routes

The application currently contains routes for the following areas.

Public Routes
/

Home page.

/menu

Pizza menu.

/auth

Authentication.

/reset-password

Password reset.

Authenticated Routes
/dashboard

Authenticated customer dashboard.

/build

Pizza builder.

Admin Routes
/admin/login

Administrator login.

/admin/inventory

Inventory management.

/admin/orders

Order management.

🧑‍🍳 Pizza Builder

The Pizza Builder is one of the central features of PizzaHot.

The customer can select ingredients from:

┌───────────────┐
│     BASE      │
├───────────────┤
│     SAUCE     │
├───────────────┤
│     CHEESE    │
├───────────────┤
│    VEGGIES    │
└───────────────┘

The application retrieves ingredients from Supabase.

Example REST requests:

/rest/v1/ingredients

with filtering such as:

category=eq.base

Ingredients are ordered using:

sort_order.asc
🔐 Authentication

PizzaHot uses Supabase Authentication.

The authentication architecture supports:

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

The project includes session-related functionality through:

src/hooks/useSession.ts

Protected routes are grouped under:

src/routes/_authenticated/
👨‍💼 Admin System

PizzaHot provides an administrative interface.

Admin-related functionality includes:

Admin Login
/admin/login
Inventory
/admin/inventory
Orders
/admin/orders

Administrative access is protected through application role management.

The database defines:

admin
user

roles.

📦 Inventory Management

The inventory system is connected to the ingredients database.

Administrators can work with ingredient stock information.

The database also includes:

stock_alerts

for stock-related notifications.

🛒 Order Lifecycle

A typical PizzaHot order follows this lifecycle:

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
🖼️ Assets

PizzaHot includes local pizza images:

src/assets/
├── pizza-blaze.jpg
├── pizza-grove.jpg
├── pizza-moon.jpg
└── pizza-vesuvio.jpg

The database pizza records use image keys:

vesuvio
blaze
moon
grove

These keys can be mapped to the corresponding frontend assets.

🎨 UI

The application uses:

Tailwind CSS
shadcn/ui
Responsive layouts
Reusable components
Modern typography
Responsive navigation
Reusable form controls

Shared components are located in:

src/components/

Reusable UI primitives are located in:

src/components/ui/
🧩 Important Source Files
Root Route
src/routes/__root.tsx

Responsible for the application root layout, document structure, metadata, global scripts, and shared providers.

Router
src/router.tsx

Configures the TanStack Router.

Supabase Client
src/integrations/supabase/client.ts

Initializes the Supabase client and reads:

VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
Supabase Types
src/integrations/supabase/types.ts

Contains generated database type definitions.

Pizza Utilities
src/lib/pizza.ts

Contains pizza-related application logic.

Session Hook
src/hooks/useSession.ts

Provides authentication/session-related functionality.

🧪 Development

Recommended development workflow:

cd "/home/probal/Downloads/Project Now/PizzaHot"

npm install

npm run dev

Then modify the source files under:

src/

The development server automatically reloads changes.

🔍 Troubleshooting
❌ vite: not found

Run:

npm install

Then:

npx vite --version

Then:

npm run dev
❌ Missing Supabase environment variables

If you see:

Missing Supabase environment variable(s)

check that .env contains:

VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...

Then restart the development server.

❌ Supabase REST API returns 404

Example:

/rest/v1/pizzas → 404

or:

/rest/v1/ingredients → 404

This usually means the corresponding database tables are not available in the connected Supabase project.

Verify that these tables exist:

pizzas
ingredients

Then check that the PizzaHot migration has been successfully executed.

Migration:

drizzle/migrations/0000_pizzahot_core_schema.sql
❌ Hydration errors

If the browser reports React hydration mismatch errors, first make sure the root document structure in:

src/routes/__root.tsx

does not contain accidental whitespace/text nodes between HTML elements.

Then restart:

npm run dev

and perform a hard refresh:

Ctrl + Shift + R
❌ Changes are not appearing

Try:

Ctrl + Shift + R

If that does not work, stop the server:

Ctrl + C

and restart:

npm run dev
🔒 Security

PizzaHot uses Supabase Row Level Security (RLS) for database access control.

The database migration defines policies for the application's tables.

Important security principles:

Do not expose secret Supabase keys in frontend code.
Do not commit .env.
Use the publishable Supabase key for client-side access.
Keep privileged/server secrets on the server.
Use RLS to protect database records.
Protect administrative routes.
Validate order-related operations on the backend/database.
Do not trust client-side prices or stock values.
🌱 Future Improvements

Potential future enhancements include:

Customer Experience

Shopping cart persistence

Coupon system

Multiple delivery addresses

Saved favorite pizzas

Order history

Ratings and reviews

Reorder functionality

Payments

Online payment integration

Payment verification

Payment history

Refund workflow

Delivery

Live delivery tracking

Delivery partner dashboard

Estimated delivery time

Interactive delivery map

Admin

Sales analytics

Revenue dashboard

Customer analytics

Advanced inventory management

Low-stock notifications

Order filtering

Export reports

Technical

Automated testing

End-to-end testing

CI/CD pipeline

Production deployment

Performance optimization

Progressive Web App support

🚀 Production Deployment

Before deploying PizzaHot to production:

1. Configure production environment variables
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
2. Apply database migrations

Ensure the production Supabase database contains:

profiles
user_roles
admin_allowlist
ingredients
pizzas
orders
order_items
stock_alerts
3. Verify Row Level Security

Confirm that all production tables have appropriate RLS policies.

4. Build the application

Use the project's configured build command:

npm run build
5. Test production behavior

Verify:

Authentication
Pizza menu
Pizza builder
Orders
Inventory
Admin access
Supabase connectivity
Error handling
🤝 Contributing

Contributions are welcome.

1. Fork the repository
git clone YOUR_REPOSITORY_URL
2. Enter the project
cd PizzaHot
3. Install dependencies
npm install
4. Create your environment file
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
5. Start development
npm run dev
6. Create a feature branch
git checkout -b feature/your-feature
7. Commit your changes
git add .
git commit -m "Add your feature"
8. Push the branch
git push origin feature/your-feature

Then open a Pull Request.

📜 License

This project does not currently specify a license.

If you intend to distribute the project publicly, add an appropriate license file such as:

LICENSE

and update this section accordingly.

👨‍💻 Author
Probal Dhali

Developer and creator of the PizzaHot project.

GitHub:

Probal2005

🍕 PizzaHot Philosophy

PizzaHot is built around a simple digital ordering experience:

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

The goal is to combine a modern user interface with a reliable backend architecture to create a complete pizza ordering ecosystem.

<div align="center">

🍕 Build Your Pizza. Make It Yours.

PizzaHot

Made with ❤️ using React, TypeScript, TanStack, Supabase & Drizzle.

</div>