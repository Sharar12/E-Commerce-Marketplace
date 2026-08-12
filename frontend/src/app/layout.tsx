import type { Metadata } from "next";
import { Unbounded, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import { APP_NAME } from "@/lib/design-tokens";

const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — Online Shopping in Bangladesh`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "ApnarDokan is Bangladesh's marketplace. Shop electronics, fashion, home & living and more with verified sellers and fast nationwide delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${unbounded.variable} ${inter.variable} ${ibmPlexMono.variable} antialiased`}>
        {/* BENTO MARKET — the storefront world contract.
            THESIS: the marketplace as an animated bento board — modular tiles
            of varying size that reflow, lift and reveal; refuses the uniform
            card-grid bazaar.
            OWN-WORLD: white paper ground, bold ink blacks, electric lime as
            the one saturated accent, warm smoke grays; hairline rules, 12–16px
            tile radii, spring hover-lift, FLIP reflow, staggered rise reveals.
            STORY: a shopper believes the market is alive and curated — what's
            trending is bigger, what's urgent glows, and every tile is a door.
            FIRST VIEWPORT: a four-column bento hero — a black thesis tile with
            headline and magnetic CTA, beside a trending product tile, a live
            count-up stat tile and a lime flash-sale tile.
            FORM: brief-pinned Bento Market direction (seed bento-8f3a1c) —
            the user specified palette, structure and interactions directly.
            FINISH: unreviewed and undocumented is unfinished; this build ends
            with the finish review, the verdict, and DESIGN.md */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
