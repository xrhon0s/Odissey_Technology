import { and, eq, lt, sql } from "drizzle-orm";

import {
  buildRateLimitWindow,
  getRateLimitSecret,
  type RateLimitPolicy,
} from "@/features/security/rate-limit";

import { getDb } from "..";
import { requestRateLimits } from "../schema";

export type RateLimitResult =
  | {
      allowed: boolean;
      limit: number;
      remaining: number;
      retryAfterSeconds: number;
    }
  | { configurationMissing: true };

export async function consumeRateLimit(input: {
  identity: string;
  policy: RateLimitPolicy;
}): Promise<RateLimitResult> {
  const secret = getRateLimitSecret();
  if (!secret) return { configurationMissing: true };

  const now = new Date();
  const window = buildRateLimitWindow({
    ...input,
    now,
    secret,
  });
  const database = getDb();

  await database
    .delete(requestRateLimits)
    .where(
      and(
        eq(requestRateLimits.scope, window.scope),
        eq(requestRateLimits.identityHash, window.identityHash),
        lt(requestRateLimits.expiresAt, now),
      ),
    );

  const [record] = await database
    .insert(requestRateLimits)
    .values({ ...window, count: 1 })
    .onConflictDoUpdate({
      target: [
        requestRateLimits.scope,
        requestRateLimits.identityHash,
        requestRateLimits.windowStartedAt,
      ],
      set: { count: sql`${requestRateLimits.count} + 1` },
    })
    .returning({ count: requestRateLimits.count });
  const count = record?.count ?? input.policy.limit + 1;

  return {
    allowed: count <= input.policy.limit,
    limit: input.policy.limit,
    remaining: Math.max(input.policy.limit - count, 0),
    retryAfterSeconds: Math.max(
      Math.ceil((window.expiresAt.getTime() - now.getTime()) / 1000),
      1,
    ),
  };
}

export function deleteExpiredRateLimits() {
  return getDb()
    .delete(requestRateLimits)
    .where(lt(requestRateLimits.expiresAt, new Date()));
}
