import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { PLATFORM_NAME } from "@/lib/marketplace/constants";

export const metadata: Metadata = {
  title: `${PLATFORM_NAME} — Marketplace de coleccionables`,
  description: "C2C con First to Claim en tiempo real — PostgreSQL y Redis local",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
