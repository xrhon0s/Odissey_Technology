import { z } from "zod";

const localUrl = "http://localhost:3000";

function deploymentUrl() {
  const hostname =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return hostname ? `https://${hostname}` : undefined;
}

export function getSiteUrl(): URL {
  const candidate =
    process.env.NEXT_PUBLIC_APP_URL ?? deploymentUrl() ?? localUrl;
  const parsed = z.url().safeParse(candidate);

  if (!parsed.success) return new URL(localUrl);

  const url = new URL(parsed.data);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return new URL(localUrl);
  }

  return new URL(url.origin);
}

export function absoluteSiteUrl(path = "/"): string {
  return new URL(path, getSiteUrl()).toString();
}

export function isPublicSiteConfigured(): boolean {
  if (
    process.env.VERCEL_ENV !== undefined &&
    process.env.VERCEL_ENV !== "production"
  ) {
    return false;
  }

  const url = getSiteUrl();
  return (
    url.protocol === "https:" &&
    url.hostname !== "localhost" &&
    url.hostname !== "127.0.0.1"
  );
}
