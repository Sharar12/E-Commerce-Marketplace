---
name: ApnarDokan — Bento Market
description: Bright bento-grid marketplace — white paper, bold ink, one electric lime accent, warm smoke grays.
colors:
  paper: "#FFFFFF"
  ink: "#0D0D0D"
  lime-500: "#C6FF00"
  lime-400: "#D7FF47"
  lime-600: "#A9D800"
  lime-700: "#87AB00"
  lime-800: "#667F00"
  smoke-50: "#FAFAF8"
  smoke-100: "#F4F4F4"
  smoke-200: "#EAEAE8"
  success-700: "#15803D"
  danger-600: "#DC2626"
  info-700: "#1D4ED8"
  console-900: "#050506"
  console-800: "#060607"
typography:
  display:
    fontFamily: "Unbounded, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Unbounded, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.625rem"
    fontWeight: 600
    letterSpacing: "0.2em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  "2xl": "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
components:
  button-primary:
    backgroundColor: "{colors.lime-500}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px 32px"
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.lime-500}"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "16px 24px"
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "20px"
  chip:
    backgroundColor: "{colors.smoke-100}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "14px 16px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: ApnarDokan — Bento Market

## Overview

**Creative North Star: "The Electric Market Board"**

ApnarDokan's storefront is a bright, animated bento board — the marketplace as a living bulletin where what's trending is literally bigger, what's urgent glows, and every tile is a door into the catalog. The ground is white paper; the layout is asymmetric modular tiles of varying size that reflow with FLIP, lift with a spring on hover, and reveal themselves in staggered rises as you scroll. One electric lime accent carries all the energy — nothing else is allowed to compete with it.

The world refuses the uniform card-grid bazaar (every cell identical, every card the same size) and the dark "operator wall" console aesthetic that preceded it. Instead it borrows the grammar of retail signage and editorial boards: bold display headlines, mono readouts for prices and status, hairline rules, and color committed at the tile level — black tiles, lime tiles, white tiles — never scattered accents.

**Key Characteristics:**
- White paper ground with bold ink type; one saturated accent (electric lime) at a time.
- Bento tiles of varying size and color; 12–16px radii, never pills for panels.
- Spring-physics hover (lift + scale 1.02 + shadow), FLIP reflow on filter, staggered rise reveals.
- Mono readouts for prices, counts, and status labels; Unbounded display for headlines and the logo mark.
- Role dashboards (admin/seller/delivery/support/account) keep a separate dark console world via CSS-variable overrides.

## Colors

Bright ground, bold ink, and one saturated accent. Lime is a field color, not an accent sprinkle.

### Primary

- **Electric Lime** (`#C6FF00`): the single saturated accent. Owns the primary CTA, the logo mark, flash-sale tiles, live indicators, and the morphing nav underline. Used as a fill (with ink text) or on ink tiles (lime text); never as text on white below 4.5:1 contrast.
- **Lime Shadow** (`#A9D800`): pressed/hover-adjacent lime, focus rings.
- **Olive Lime** (`#87AB00`): decorative lime text on white (icons, labels) where exact WCAG is not required.
- **Legible Lime** (`#667F00`): the contrast-safe lime for real text on white (≈4.7:1). All lime link/label text uses this tier.

### Neutral

- **Paper** (`#FFFFFF`): the page ground and default card surface.
- **Ink** (`#0D0D0D`): all text, icons, dark tiles, the ticker bar, and the wordmark. Pairs with lime for the brand mark.
- **Warm Smoke** (`#F4F4F4`, with `#FAFAF8`/`#EAEAE8`/`#DCDCD9` steps): secondary tile surfaces, search field fill, footer band, skeletons.
- **Hairline** (`rgb(13 13 13 / 0.09)` at rest, `/0.18` strong): every tile border. Tiles are ruled, not shadowed, at rest.
- **Muted Text** (`#5C5C5F`): secondary/tertiary labels on paper (~6.6:1).

### Semantic

- **Success** (`#15803D` on light), **Danger** (`#DC2626`), **Info** (`#1D4ED8`): status chips and alerts, at the dark tier on paper so they clear WCAG.
- **Console Black family** (`#050506`–`#1C1C1E`): reserved for the role dashboards, which keep the dark world (`--surface` overrides in `DashboardShell`).

### Named Rules

**The One-Accent Rule.** Lime is the only saturated color on the white storefront. Red, green, and blue appear only as semantic status, never as decoration.

**The Legible Lime Rule.** Lime text on white never falls below `#667F00`. Bright lime (`#C6FF00`/`#D7FF47`) appears only as fill (with ink text) or on ink tiles.

**The Dual-Surface Rule.** The storefront is light; the role dashboards are dark. Shared components read surface, line, muted, and foreground from CSS variables that `DashboardShell` overrides — a component never hardcodes a world.

## Typography

**Display Font:** Unbounded (ui-sans-serif fallback) — wide, rounded, unmistakably retail-signage.
**Body Font:** Inter (ui-sans-serif fallback).
**Label/Mono Font:** IBM Plex Mono (ui-monospace fallback) — prices, counts, status, section links.

**Character:** Unbounded's chunky geometric forms give headlines the confidence of a shop-front sign; Inter keeps dense product information quiet and legible; Plex Mono turns every price and stock count into a precise readout.

### Hierarchy

- **Display** (Unbounded 800, `clamp(2.25rem, 5vw, 3.75rem)`, lh 0.98, -0.02em): hero headline and the "A" logo mark only.
- **Headline** (Unbounded 700, 1.5rem–1.875rem, lh 1.1): section titles — "Shop by category", "Trending products", "Trusted shops".
- **Title** (Inter 600, 0.875–1rem, lh 1.3): product names, shop names, card titles.
- **Body** (Inter 400, 1rem, lh 1.6, max 65ch): descriptions and supporting copy.
- **Label** (Plex Mono 600, 0.625–0.75rem, +0.2em tracking): "START SHOPPING", "VIEW ALL", price suffixes, stock counts, all-caps.

### Named Rules

**The Heading-Speaks Rule.** No kicker or eyebrow above a heading. The heading carries its own weight; section context rides below it as muted copy.

## Layout

The storefront is an asymmetric bento grid. The homepage hero is a 4-column, 2-row board on desktop: a 2×2 ink thesis tile beside 1×1 tiles for the trending product, the live stat counter, category quick-links, and a lime flash tile. Category tiles are sized by popularity (bigger tile = hotter trend) and reflow with FLIP when filters change. The product grid mixes 2×1 wide, 1×1, and 1×2 tall tiles with dense flow.

- **Container:** max-width 80rem (`max-w-7xl`), 1rem side padding.
- **Grids:** 2 columns on mobile, 4 on desktop; `auto-rows` with `minmax()` floors so tall tiles span two rows honestly.
- **Rhythm:** sections breathe at 3.5–4rem vertical padding; more space above a heading than below it.
- **Responsive:** the bento collapses to a 2-column stack; hero tiles go full-width; nav rail and mega-menu hide under `lg`.

## Elevation & Depth

A hybrid of ruled edges and soft hover elevation. Tiles rest on a 1px hairline (`rgb(13 13 13 / 0.09)`) with a faint ambient shadow; depth appears only as a response to hover or state.

### Shadow Vocabulary

- **Card** (`0 1px 2px rgb(13 13 13 / 0.04), 0 8px 24px rgb(13 13 13 / 0.07)`): resting tiles, cards, chips.
- **Hover** (`0 2px 4px rgb(13 13 13 / 0.06), 0 20px 44px rgb(13 13 13 / 0.14)`): the lifted state — always paired with the spring lift.
- **Overlay** (`0 24px 60px rgb(13 13 13 / 0.2)`): dropdowns, menus, floating panels.

### Named Rules

**The Spring Rule.** Hover lift is `translateY(-6px) scale(1.02)` over `cubic-bezier(0.34, 1.56, 0.64, 1)` — an overshoot spring, pinned by the brief. No other bounce/elastic easing anywhere; reveals and entrances use expo-style `cubic-bezier(0.16, 1, 0.3, 1)`.

**The Flat-By-Default Rule.** No shadows at rest beyond the ambient card shadow; elevation is earned by interaction, never worn as decoration.

## Shapes

Bento geometry: generous radii on big tiles, sharper on small controls.

- **Tiles/cards:** 12px standard, 16px hero, 20px featured modules.
- **Small controls:** 8px buttons and chips; full-pill radius only for tiny counters/dots.
- **Borders:** 1px hairlines (`rgb(13 13 13 / 0.09)` rest, `/0.18` strong); lime borders (`#A9D800`/`#87AB00` at 25–50%) mark interactive hover.
- **The corner-tick motif:** `bento-panel` tiles carry 1.5px lime corner ticks — the board's registration marks.
- **Clipping:** product imagery is clipped by tile radii with `overflow-hidden`; never pill-shaped.

## Components

### Buttons
- **Shape:** rounded 8px; ink or lime fill; mono bold label, tracked.
- **Primary (lime):** lime fill, ink text — the only CTA voice. Hover brightens to `#D7FF47` and lifts 1px; active darkens to `#A9D800`.
- **Dark:** ink fill, lime text — secondary CTAs on light ground ("Sign up", "FLASH" chips).
- **Outline:** hairline border, ink text; hover inverts to ink fill with white text.
- **Magnetic CTAs:** primary CTAs on the homepage lean toward the cursor within ±10px and spring back on leave.
- **Focus:** 2px lime ring with offset; disabled at 50% opacity.

### Chips / Badges
- **Style:** 8px radius, smoke or lime-tinted fill, mono 10px bold label.
- **Tones:** success/danger/info read from semantic vars so the same chip works on white and on the dark dashboards.
- **State:** filter chips invert to ink fill + lime text when selected; category chips lift 2px on hover.

### Cards / Containers
- **Corner Style:** 12–16px.
- **Background:** paper, with smoke (`#F4F4F4`) for secondary/stat tiles.
- **Shadow Strategy:** card at rest, hover on lift (see Elevation).
- **Border:** 1px hairline.
- **Internal Padding:** 16–20px standard, 24–32px for hero/featured.

### Inputs / Fields
- **Style:** hairline-strong border, paper fill, 8px radius; mono labels.
- **Focus:** lime border + 2px lime/30 ring.
- **Error / Disabled:** danger border + red message; disabled at 50%.

### Navigation (storefront)
- **Style:** white sticky bar under an ink marquee ticker; logo mark shape-shifts through rotation/scale on load.
- **States:** nav links share a single lime underline that slides (transform-only) between active links on route change; hover warms text to Legible Lime.
- **Mobile:** slide-down panel with search, nav chips, category grid.

### Flash-Sale Module
- **Character:** the urgency module — ink tile, lime segmented countdown, black/lime chevron hazard band on top.
- **Low-time behavior:** the panel glows with a spreading lime ring (`glow-low`) when the sale window runs low (demo threshold ~36h).
- **Product tiles inside:** dark translucent cards with lime price readouts and red discount chips.

### Vendor Cards
- **Character:** each trusted-shop card runs an auto-rotating product carousel (crossfade every 3s, pause on hover) with a lime progress bar under the cover.
- **Identity row:** shop logo with green online dot, shop name, rating stars, follower count, "FROM ৳X" price strip.

## Do's and Don'ts

### Do:
- **Do** commit color at the tile level — one black tile, one lime tile, white tiles — rather than scattering lime accents over the page.
- **Do** size bento tiles by what they mean: the trending category is bigger; the hero thesis is 2×2.
- **Do** use mono readouts (Plex Mono) for every price, count, and status label.
- **Do** keep lime text on white at `#667F00` or darker, and reserve bright lime for fills and ink tiles.
- **Do** reuse the spring curve only for the brief's lift/pop moments and expo ease for reveals.

### Don't:
- **Don't** use a second saturated accent on the storefront — no orange, no purple, no teal.
- **Don't** return to dark grounds or glowing phosphor effects on the storefront; darkness belongs to the role dashboards.
- **Don't** put an eyebrow/kicker above a heading, or add section numbers that carry no information.
- **Don't** animate `width`/`left` for the nav underline or progress bars — use `transform`.
- **Don't** ship a uniform grid of identical cards where a bento board can say more about the data.
