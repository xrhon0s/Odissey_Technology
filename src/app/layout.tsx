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
    <html
      lang="es-CO"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full">
        <a className="skip-link" href="#main-content">
          Saltar al contenido principal
        </a>
        {children}
      </body>
    </html>
  );
}
