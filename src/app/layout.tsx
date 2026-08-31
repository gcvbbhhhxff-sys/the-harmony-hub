import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://illustrious-begonia-64d715.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Delivery",
    template: "%s | Delivery",
  },
  description: "Faça seu pedido online com praticidade e acompanhe o andamento da entrega.",
  applicationName: "Delivery",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Delivery",
    title: "Delivery",
    description: "Faça seu pedido online com praticidade e acompanhe o andamento da entrega.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Delivery" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Delivery",
    description: "Faça seu pedido online com praticidade e acompanhe o andamento da entrega.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D0D0D",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
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
