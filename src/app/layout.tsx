import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const bodyFont = Inter({ subsets: ["latin"], variable: "--font-body" });
const headingFont = Poppins({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-heading" });

export const metadata: Metadata = { title: "Tabajara's Churrascaria", description: "Delivery do restaurante" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body className={`${bodyFont.variable} ${headingFont.variable}`}>{children}</body></html>;
}
