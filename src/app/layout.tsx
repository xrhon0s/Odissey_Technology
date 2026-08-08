import type { Metadata, Viewport } from "next";

import "@fontsource-variable/inter";
import "@fontsource-variable/manrope";
import "./globals.css";
import { getSiteUrl } from "@/features/seo/site-url";

export const metadata: Metadata = {
  applicationName: "Odissey Technology",
  metadataBase: getSiteUrl(),
  title: {
    default: "Odissey Technology",
    template: "%s | Odissey Technology",
  },
  description:
    "Audífonos, cargadores, cables y accesorios tecnológicos con envíos a toda Colombia.",
  openGraph: {
    description: "Tecnología útil, pagos flexibles y envíos a toda Colombia.",
    locale: "es_CO",
    siteName: "Odissey Technology",
    title: "Odissey Technology",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    description: "Tecnología útil, pagos flexibles y envíos a toda Colombia.",
    title: "Odissey Technology",
  },
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
