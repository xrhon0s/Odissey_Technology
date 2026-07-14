import type { Metadata, Viewport } from "next";

import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Odissey Technology",
    template: "%s | Odissey Technology",
  },
  description: "Accesorios tecnológicos para Colombia.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#071A33",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CO" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
