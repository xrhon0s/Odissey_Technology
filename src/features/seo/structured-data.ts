import { absoluteSiteUrl } from "./site-url";

type ProductForStructuredData = {
  categoryName: string;
  categorySlug: string;
  description: string;
  images: { url: string }[];
  name: string;
  slug: string;
  variants: {
    availableQuantity: number;
    name: string;
    priceInCop: number;
    sku: string;
  }[];
};

export function buildStoreStructuredData() {
  const homeUrl = absoluteSiteUrl("/");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@id": `${homeUrl}#organization`,
        "@type": "Organization",
        logo: absoluteSiteUrl("/images/odissey-logo.webp"),
        name: "Odissey Technology",
        url: homeUrl,
      },
      {
        "@id": `${homeUrl}#website`,
        "@type": "WebSite",
        inLanguage: "es-CO",
        name: "Odissey Technology",
        publisher: { "@id": `${homeUrl}#organization` },
        url: homeUrl,
      },
    ],
  };
}

export function buildProductStructuredData(product: ProductForStructuredData) {
  const productUrl = absoluteSiteUrl(`/producto/${product.slug}`);
  const primaryVariant = product.variants[0];

  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      category: product.categoryName,
      description: product.description,
      image: product.images.map((image) => image.url),
      name: product.name,
      offers: primaryVariant
        ? {
            "@type": "Offer",
            availability:
              primaryVariant.availableQuantity > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            price: primaryVariant.priceInCop,
            priceCurrency: "COP",
            seller: {
              "@id": `${absoluteSiteUrl("/")}#organization`,
            },
            sku: primaryVariant.sku,
            url: productUrl,
          }
        : undefined,
      sku: primaryVariant?.sku,
      url: productUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          item: absoluteSiteUrl("/"),
          name: "Inicio",
          position: 1,
        },
        {
          "@type": "ListItem",
          item: absoluteSiteUrl(`/categoria/${product.categorySlug}`),
          name: product.categoryName,
          position: 2,
        },
        {
          "@type": "ListItem",
          item: productUrl,
          name: product.name,
          position: 3,
        },
      ],
    },
  ];
}

export function buildCategoryStructuredData(category: {
  description: string;
  name: string;
  slug: string;
}) {
  const categoryUrl = absoluteSiteUrl(`/categoria/${category.slug}`);

  return [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      description: category.description,
      inLanguage: "es-CO",
      name: category.name,
      url: categoryUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          item: absoluteSiteUrl("/"),
          name: "Inicio",
          position: 1,
        },
        {
          "@type": "ListItem",
          item: categoryUrl,
          name: category.name,
          position: 2,
        },
      ],
    },
  ];
}
