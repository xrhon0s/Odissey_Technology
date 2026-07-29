import type { MetadataRoute } from "next";

import {
  absoluteSiteUrl,
  isPublicSiteConfigured,
} from "@/features/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  if (!isPublicSiteConfigured()) {
    return { rules: { disallow: "/", userAgent: "*" } };
  }

  return {
    host: absoluteSiteUrl("/"),
    rules: {
      allow: "/",
      disallow: ["/admin/", "/api/", "/login"],
      userAgent: "*",
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  };
}
