import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://illustrious-begonia-64d715.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tabajara's Churrascaria — Delivery",
    template: "%s | Tabajara's Churrascaria",
  },
  description:
    "Peça online da Tabajara's Churrascaria: churrasco de gado, porco, frango e toscana, arrozes, feijões, saladas e acompanhamentos, com entrega rápida.",
  applicationName: "Tabajara's Churrascaria",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Tabajara's Churrascaria",
    title: "Tabajara's Churrascaria — Delivery",
    description:
      "Churrasco de gado, porco, frango e toscana, arrozes, feijões, saladas e acompanhamentos. Peça pelo delivery.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Tabajara's Churrascaria" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tabajara's Churrascaria — Delivery",
    description: "Churrasco, arrozes, feijões e saladas com entrega rápida.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D0D0D",
};

const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Tabajara's Churrascaria",
  servesCuisine: ["Churrascaria", "Comida brasileira"],
  priceRange: "$$",
  acceptsReservations: "False",
  url: siteUrl,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantJsonLd) }}
        />
      </head>
      <body>
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[var(--color-primary)] focus:px-4 focus:py-2 focus:text-white"
        >
          Pular para o conteúdo
        </a>
        <div id="conteudo-principal">{children}</div>
      </body>
    </html>
  );
}
