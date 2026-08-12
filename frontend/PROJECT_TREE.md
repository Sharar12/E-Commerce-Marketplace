# ApnarDokan — Full-Stack Project Tree

> Post de-mock. The frontend is a Next.js storefront wired to a real Laravel 12 REST
> API (MySQL + Redis). All mock data has been removed — every page fetches live data
> through RTK Query against `/api/v1`.

```
e-commerce-marketplace/
├── README.md / PRODUCT.md
├── backend/                          # Laravel 12 API (php artisan serve → :8000)
│   ├── app/
│   │   ├── Models/                   # 36 Eloquent models (string PKs mirror mock IDs)
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/   # Public/, Customer, Seller, Delivery, Support, Admin
│   │   │   ├── Resources/Api/V1/     # Product, Order, Ticket, Payout, People, etc.
│   │   │   ├── Requests/ Middleware/
│   │   │   └── Responses/ApiResponse.php   # { data, meta, message } envelope
│   │   ├── Services/                 # Order/Inventory/Payout/Delivery/Notification/Promotion
│   │   ├── Events/ + Listeners/      # OrderPlaced, OrderStatusChanged, PayoutApproved, TicketEscalated
│   │   ├── Policies/                 # Product, Order, Ticket, Payout
│   │   └── Providers/AppServiceProvider.php  # event→listener bindings
│   ├── bootstrap/app.php             # /api/v1 mount, JSON error envelope, API guest 401
│   ├── database/
│   │   ├── migrations/               # 30+ tables (products, orders, tickets, payouts…)
│   │   ├── seeders/DatabaseSeeder.php# 39 products, 128 orders, 145 reviews, 24 tickets, 10 sellers
│   │   └── factories/
│   ├── routes/api.php                # public + auth:sanctum + role-scoped routes
│   ├── config/                       # cors (localhost:3000), cache/queue/session → Redis
│   └── tests/                        # e2e-per-role.sh, e2e-smoke.sh, services-check.php, unauth-diag.sh
└── frontend/                         # Next.js 15 storefront (→ :3000)
    ├── .env.local                    # NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
    ├── src/
    │   ├── app/                      # App Router — 74 routes
    │   │   ├── (store)/              # public storefront (Navbar + Footer shell)
    │   │   ├── account/              # CUSTOMER (dashboard, orders, tickets, addresses…)
    │   │   ├── seller/               # SELLER (products, inventory, payouts, analytics…)
    │   │   ├── delivery/             # DELIVERY (queue, active, history, cod, profile…)
    │   │   ├── support/              # SUPPORT (tickets, orders lookup, refunds, knowledge…)
    │   │   └── admin/                # ADMIN (users, sellers, catalog, payments, audit…)
    │   ├── components/
    │   │   ├── ui/                   # Button, Card, Badge, Table, Tabs, Modal, Toast, Skeleton…
    │   │   ├── layout/               # Navbar, Footer, CartDrawer, StorefrontLayout, DashboardShell, RequireRole
    │   │   └── shared/               # ProductCard, RatingStars, Price, OrderStatusTimeline, charts/
    │   ├── features/
    │   │   ├── api/
    │   │   │   ├── realBaseQuery.ts  # fetchBaseQuery → Laravel + Sanctum token header
    │   │   │   └── api.ts            # createApi — every endpoint hits /api/v1
    │   │   ├── auth/authSlice.ts     # persisted session + demo accounts
    │   │   ├── cart/cartSlice.ts     # persisted cart + wishlist + coupon
    │   │   └── ui/uiSlice.ts         # toasts, mobile menu
    │   ├── lib/                      # design-tokens.ts, utils.ts, store.ts, hooks.ts, providers.tsx
    │   └── types/index.ts            # full domain model (matches Laravel resources 1:1)
```

## Transport

- `src/features/api/api.ts` — hard-wired to `realBaseQuery` (fetchBaseQuery against
  `NEXT_PUBLIC_API_URL`). The mock layer (`src/mocks/`, `baseQuery.ts`) was deleted.
- Auth: Sanctum bearer token stored under `SESSION_TOKEN_KEY`; login page falls back
  to demo sessions only when the API is unreachable.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Customer | rahim.uddin@gmail.com | demo1234 |
| Seller | tanvir@techpointbd.com | demo1234 |
| Delivery | habib.mia@apnardokan.delivery | demo1234 |
| Support | sharmin@apnardokan.com | demo1234 |
| Admin | admin@apnardokan.com | demo1234 |
