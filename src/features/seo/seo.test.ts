import { afterEach, describe, expect, it } from "vitest";

import { serializeJsonLd } from "./json-ld";
import { getSiteUrl, isPublicSiteConfigured } from "./site-url";
import { buildProductStructuredData } from "./structured-data";

const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;
const originalVercelEnvironment = process.env.VERCEL_ENV;

afterEach(() => {
  if (originalAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL;
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  }
  if (originalVercelEnvironment === undefined) {
    delete process.env.VERCEL_ENV;
  } else {
    process.env.VERCEL_ENV = originalVercelEnvironment;
  }
});

describe("SEO helpers", () => {
  it("normalizes the configured site URL to its origin", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://tienda.example.com/ruta";

    expect(getSiteUrl().toString()).toBe("https://tienda.example.com/");
  });

  it("falls back safely when the site URL is invalid", () => {
    process.env.NEXT_PUBLIC_APP_URL = "javascript:alert(1)";

    expect(getSiteUrl().toString()).toBe("http://localhost:3000/");
  });

  it("keeps preview deployments out of the index", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://tienda.example.com";
    process.env.VERCEL_ENV = "preview";

    expect(isPublicSiteConfigured()).toBe(false);
  });

  it("escapes HTML-significant characters in JSON-LD", () => {
    expect(serializeJsonLd({ name: "</script><script>" })).not.toContain("<");
  });

  it("describes the purchasable product with COP price and stock", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://tienda.example.com";

    const [product] = buildProductStructuredData({
      categoryName: "Audífonos",
      categorySlug: "audifonos",
      description: "Sonido para todos los días.",
      images: [{ url: "https://cdn.example.com/audifonos.webp" }],
      name: "Audífonos Pro",
      slug: "audifonos-pro",
      variants: [
        {
          availableQuantity: 4,
          name: "Blanco",
          priceInCop: 129_900,
          sku: "AUD-PRO-BLA",
        },
      ],
    });

    expect(product).toMatchObject({
      "@type": "Product",
      offers: {
        availability: "https://schema.org/InStock",
        price: 129_900,
        priceCurrency: "COP",
      },
    });
  });
});
