import { asc } from "drizzle-orm";

import { getDb } from "..";
import { shippingMethods } from "../schema";

export function listAdminShippingMethods() {
  return getDb()
    .select({
      code: shippingMethods.code,
      description: shippingMethods.description,
      id: shippingMethods.id,
      isActive: shippingMethods.isActive,
      name: shippingMethods.name,
      priceInCop: shippingMethods.priceInCop,
      requiresAddress: shippingMethods.requiresAddress,
      sortOrder: shippingMethods.sortOrder,
    })
    .from(shippingMethods)
    .orderBy(asc(shippingMethods.sortOrder), asc(shippingMethods.name));
}
