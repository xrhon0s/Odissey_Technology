import { createHmac } from "node:crypto";

export type RateLimitPolicy = {
  limit: number;
  scope: string;
  windowMs: number;
};

export type RateLimitWindow = {
  expiresAt: Date;
  identityHash: string;
  scope: string;
  windowStartedAt: Date;
};

export function buildRateLimitWindow(input: {
  identity: string;
  now?: Date;
  policy: RateLimitPolicy;
  secret: string;
}): RateLimitWindow {
  const now = input.now ?? new Date();
  const windowStartedAt = new Date(
    Math.floor(now.getTime() / input.policy.windowMs) * input.policy.windowMs,
  );

  return {
    expiresAt: new Date(windowStartedAt.getTime() + input.policy.windowMs),
    identityHash: createHmac("sha256", input.secret)
      .update(`${input.policy.scope}:${input.identity.trim().toLowerCase()}`)
      .digest("hex"),
    scope: input.policy.scope,
    windowStartedAt,
  };
}

export function getRateLimitSecret() {
  const secret = process.env.RATE_LIMIT_SECRET;

  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "odissey-local-rate-limit-secret-2026";
  }

  return null;
}

export function getRequestIdentity(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const candidate =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown-client";

  return candidate.slice(0, 128);
}
