# ApnarDokan — E-Commerce Marketplace

> **আপনার দোকান — আপনার বিশ্বাস** · *"Your shop — your trust"*

A full-stack multi-vendor e-commerce marketplace for Bangladesh — a trust-first alternative to price-gamble marketplaces. Shoppers get buyer protection, same-day delivery in Dhaka, easy 7-day returns and flash sales; sellers get a shopfront, inventory & order management, and reliable weekly payouts — all on one platform with five first-class roles.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · RTK Query / Redux Toolkit · Recharts · Zod + React Hook Form |
| **Backend** | Laravel 12 · PHP 8.3+ · Sanctum token auth · Eloquent · Policies · Service layer · Events/Listeners |
| **Database** | MySQL 8 (schema + seeders + factories) |
| **Cache / Queue** | Redis (catalog, dashboards, sessions, queues) |
| **Payments (BD)** | bKash, Nagad, cards, COD — cash on delivery is first-class |

## Repo Structure

```
├── frontend/            # Next.js storefront + role dashboards
│   └── src/
│       ├── app/         # (store) storefront · account · seller · delivery · support · admin
│       ├── components/  # ui/ · shared/ · layout/
│       ├── features/    # api/ (RTK Query) · auth · cart · ui
│       ├── lib/         # design tokens, store, utils
│       └── types/       # shared TypeScript types
├── backend/             # Laravel REST API
│   ├── app/
│   │   ├── Http/Controllers/Api/V1/   # Public · Customer · Seller · Delivery · Support · Admin
│   │   ├── Http/Resources/            # API response shaping
│   │   ├── Policies/                  # per-resource authorization
│   │   ├── Services/                  # Order, Inventory, Payout, Delivery, Notification, Promotion
│   │   └── Events/ · Listeners/
│   ├── database/        # migrations · seeders · factories
│   └── routes/api.php   # 49 routes under /api/v1
├── PRODUCT.md           # product context & brand commitments
└── .claude/ · .agents/  # design & engineering skills
```

## Roles & Areas

| Role | Area | What they can do |
|---|---|---|
| **Customer** | `/account` | Shop, cart, wishlist, checkout, order tracking, returns, tickets, loyalty & referrals |
| **Seller** | `/seller` | Onboarding, products & inventory, orders, weekly payouts, promotions, analytics, reviews |
| **Delivery Partner** | `/delivery` | Order queue, accept & complete deliveries, COD reconciliation, earnings, availability |
| **Support Agent** | `/support` | Ticket queue with SLAs, order lookup, refund/disputes, knowledge base, performance |
| **Admin** | `/admin` | Users, seller approvals, product moderation, orders oversight, payouts approval, campaigns, settings, audit log |

## Demo Accounts

All seeded accounts use the password **`demo1234`** (the UI login page also has one-click demo buttons per role):

| Role | Email |
|---|---|
| Admin | `admin@apnardokan.com` |
| Customer | `rahim.uddin@gmail.com` |
| Seller | `tanvir@techpointbd.com` |
| Delivery | `habib.mia@apnardokan.delivery` |
| Support | `sharmin@apnardokan.com` |

The seeder produces realistic data: 39 products, 128 orders spanning every status, 145 reviews, 24 tickets, 10 sellers.

## Setup

### Prerequisites

- Node.js 20+ and npm
- PHP 8.3+ and Composer
- MySQL 8 and Redis (`phpredis` extension enabled)

### 1. Backend (Laravel API)

```bash
cd backend
composer install
cp .env.example .env        # then set DB_*, REDIS_*, APP_URL
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve            # http://127.0.0.1:8000
```

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local   # (see below)
npm run dev                        # http://localhost:3000
```

`.env.local` config — `NEXT_PUBLIC_API_MODE=real` points RTK Query at Laravel; set it to `mock` to run without a backend:

```env
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

## API Overview

All routes live under `/api/v1` and return a consistent `{ data, meta, message }` envelope. Auth is via Sanctum bearer tokens (`POST /auth/login` → `{ token }`), with role-scoped middleware + policies enforcing that a seller can only touch their own products/orders, partners only their assigned deliveries, and so on.

**Public** — `products` (list/category/flash-sale/recommended/top-sellers/search-suggest/show), `categories`, `brands`, `sellers`, `reviews`, `promotions`, `knowledge`, `health`

**Auth** — `login` · `register` · `logout` · `me` · `forgot-password` · `otp/send` · `otp/verify`

**Writes (full CRUD)** — `POST /orders` · `POST /tickets/{id}/messages` · `POST|PUT /products[/{id}]` · `POST /payouts/requests`

**Role dashboards** — `dashboard/{admin|seller|delivery|support|customer}` (Redis-cached aggregates)

**People & oversight** — `customers`, `sellers`, `delivery-partners`, `support-agents`, `audit-logs`, `orders` (customer/seller/partner scoped views)

## Testing

Backend E2E scripts (run against a live seeded server):

```bash
cd backend
bash tests/e2e-per-role.sh      # 33 per-role read + role-scoping checks
php tests/e2e-writes.php        # 17 write-flow checks (orders, tickets, products, payouts)
php tests/services-check.php    # 18 service-layer checks
```

Frontend: `npm run lint` and `npx tsc --noEmit` (a production `npm run build` passes all 74 routes).

## Design

The storefront is a **Bento Market** visual world — bright white base (`#FFFFFF`), bold ink (`#0D0D0D`), electric lime accent (`#C6FF00`), warm gray (`#F4F4F4`) — built on asymmetric bento-grid layouts with spring-physics hover lifts, FLIP reflows on filter, staggered scroll entrances, and live countdown modules for flash sales. Design tokens live in `frontend/src/lib/design-tokens.ts`.

---

Built for Bangladesh — BDT pricing, bKash/Nagad/COD, Bengali accents throughout. **V0.1**
