import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import { adminUsers, shippingMethods } from "@/db/schema";

export const shippingMethodInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "El código solo puede usar minúsculas, números y guiones.",
    ),
  description: z.string().trim().min(5).max(500),
  isActive: z.boolean(),
  name: z.string().trim().min(2).max(120),
  priceInCop: z.coerce.number().int().min(0).max(10_000_000),
  requiresAddress: z.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
});

export type ShippingMethodInput = z.infer<typeof shippingMethodInputSchema>;

export class ShippingMethodManagementError extends Error {
  constructor(
    public readonly code:
      "ADMIN_FORBIDDEN" | "DUPLICATE_CODE" | "SHIPPING_METHOD_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "ShippingMethodManagementError";
  }
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

async function assertAdmin(
  transaction: Parameters<
    Parameters<ReturnType<typeof getDb>["transaction"]>[0]
  >[0],
  adminId: string,
) {
  const [admin] = await transaction
    .select({ id: adminUsers.id })
    .from(adminUsers)
    .where(and(eq(adminUsers.id, adminId), eq(adminUsers.isActive, true)))
    .limit(1);

  if (!admin) {
    throw new ShippingMethodManagementError(
      "ADMIN_FORBIDDEN",
      "El administrador no está autorizado.",
    );
  }
}

export async function createShippingMethod(
  adminId: string,
  input: ShippingMethodInput,
) {
  try {
    return await getDb().transaction(async (transaction) => {
      await assertAdmin(transaction, adminId);
      const [created] = await transaction
        .insert(shippingMethods)
        .values(input)
        .returning({ id: shippingMethods.id });
      return created;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ShippingMethodManagementError(
        "DUPLICATE_CODE",
        "Ya existe un método de envío con ese código.",
      );
    }
    throw error;
  }
}

export async function updateShippingMethod(
  adminId: string,
  shippingMethodId: string,
  input: ShippingMethodInput,
) {
  try {
    return await getDb().transaction(async (transaction) => {
      await assertAdmin(transaction, adminId);
      const [updated] = await transaction
        .update(shippingMethods)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(shippingMethods.id, shippingMethodId))
        .returning({ id: shippingMethods.id });

      if (!updated) {
        throw new ShippingMethodManagementError(
          "SHIPPING_METHOD_NOT_FOUND",
          "El método de envío no existe.",
        );
      }

      return updated;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ShippingMethodManagementError(
        "DUPLICATE_CODE",
        "Ya existe un método de envío con ese código.",
      );
    }
    throw error;
  }
}
