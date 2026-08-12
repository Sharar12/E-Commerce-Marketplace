# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences, both confirmed as equally important:

- **Shoppers** in Bangladesh (urban, mobile-heavy) buying electronics, fashion, home & living, and more. Their job: find a trustworthy product at a fair price and get it delivered fast and safely.
- **Sellers** running shops on the platform — the people powering supply. Their job: list products, manage inventory and orders, and receive reliable payouts.

Secondary operating roles: delivery partners, support agents, admins.

## Product Purpose

ApnarDokan is a multi-vendor e-commerce marketplace for Bangladesh. Success means a shopper buys with confidence and a seller builds a sustainable shop — on the same trusted platform.

## Positioning

[Inferred — user delegated this decision. Anchored in the product's own Bengali tagline "আপনার দোকান — আপনার বিশ্বাস" ("Your shop — your trust").]

ApnarDokan is the **trust-first marketplace**: the premium alternative to price-gamble marketplaces. Buyer protection, same-day delivery in Dhaka, easy 7-day returns, verified sellers, and reliable weekly seller payouts — trust is the product, made legible on every surface.

## Operating Context

- Bangladesh market; currency BDT; payments: bKash, Nagad, cards, and COD (cash on delivery is first-class).
- Same-day delivery in Dhaka; per-product delivery estimates across the country (`deliveryEstimateDays`).
- 7-day return policy; buyer protection; 24/7 support with ticket SLAs.
- Flash sales with live countdowns are a core merchandising mechanism.
- UI is English-first with Bengali accents (Bengali tagline; Hind Siliguri font loaded for Bengali glyphs).

## Capabilities and Constraints

- Five roles: customer, seller, delivery, support, admin — each with its own dashboard area.
- Storefront: catalog, category & brand shopping, search, product pages (variants, ratings, reviews), flash sale, cart, wishlist, checkout, order tracking, returns.
- Seller: onboarding, inventory, products, orders, payouts (weekly), analytics.
- Admin: orders, payments, reports/analytics, moderation (flagging), promo codes, audit log.
- Delivery: partner dispatch, COD reconciliation, earnings.
- Support: tickets with categories/priorities/SLAs, knowledge base.
- No backend yet — all data is typed mock data (`frontend/src/mocks/`); a Laravel backend is planned and the data layer is designed so swapping in real endpoints never touches the UI. Testimonials and user-generated content in mocks are invented and must not be presented as real proof.

## Brand Commitments

- Name: **ApnarDokan** (আপনার দোকান); tagline "আপনার দোকান — আপনার বিশ্বাস" ("Your shop — your trust").
- Incumbent visual world (confirmed in `frontend/src/lib/design-tokens.ts`): rose primary, slate neutrals, amber accent, "white-luxury" premium aesthetic, rounded cards, soft shadows. The storefront design pass refines this world, not replaces it, unless the user opts for replacement.
- English-first UI copy (user confirmed).

## Evidence on Hand

- Typed mock catalog, orders, people, support data in `frontend/src/mocks/`.
- Design tokens and theme in `frontend/src/lib/design-tokens.ts` and `frontend/src/app/globals.css`.
- No real product photography or brand assets; homepage banners use mock imagery.

## Product Principles

1. **Trust is the product** — make protection, delivery speed, and refunds legible everywhere.
2. **Two-sided by design** — the storefront must serve shoppers and give sellers credibility.
3. **Local authenticity** — BDT, bKash/Nagad/COD, Bengali accents; never a western import feel.
4. **Premium calm, not bargain-bin noise** — restraint; urgency is event-driven (flash sales), not constant.
5. **Every claim provable or removed** — no fabricated proof; invented mock content stays clearly mock.
