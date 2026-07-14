import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/db";
import {
  adminUsers,
  categories,
  inventory,
  inventoryMovements,
  productImages,
  products,
  productVariants,
} from "@/db/schema";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().max(500).nullable(),
);

const optionalPrice = z.preprocess(
  (value) => (value === "" || value === null ? null : value),
  z.coerce.number().int().positive().max(100_000_000).nullable(),
);

export const categoryInputSchema = z.object({
  description: optionalText,
  isActive: z.boolean(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
});

export const productInputSchema = z.object({
  categoryId: z.uuid(),
  compatibility: optionalText,
  description: z.string().trim().min(10).max(5_000),
  isFeatured: z.boolean(),
  name: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(200),
  status: z.enum(["draft", "active", "archived"]),
  warranty: optionalText,
});

export const variantInputSchema = z
  .object({
    compareAtPriceInCop: optionalPrice,
    initialQuantity: z.coerce.number().int().min(0).max(1_000_000),
    isActive: z.boolean(),
    lowStockThreshold: z.coerce.number().int().min(0).max(1_000_000),
    name: z.string().trim().min(1).max(160),
    priceInCop: z.coerce.number().int().positive().max(100_000_000),
    sku: z.string().trim().min(3).max(80),
  })
  .superRefine((value, context) => {
    if (
      value.compareAtPriceInCop !== null &&
      value.compareAtPriceInCop <= value.priceInCop
    ) {
      context.addIssue({
        code: "custom",
        message: "El precio anterior debe ser mayor que el precio actual.",
        path: ["compareAtPriceInCop"],
      });
    }
  });

export const createProductInputSchema = productInputSchema.extend({
  variant: variantInputSchema,
});

export const productImageMetadataSchema = z.object({
  altText: z.string().trim().min(3).max(240),
  sortOrder: z.coerce.number().int().min(0).max(10_000),
});

export const productImageInputSchema = productImageMetadataSchema.extend({
  storagePath: z.string().trim().min(3).max(255),
  url: z.url().startsWith("https://"),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type VariantInput = z.infer<typeof variantInputSchema>;
export type ProductImageInput = z.infer<typeof productImageInputSchema>;
export type ProductImageMetadata = z.infer<typeof productImageMetadataSchema>;

export class CatalogManagementError extends Error {
  constructor(
    public readonly code:
      | "ADMIN_FORBIDDEN"
      | "CATEGORY_NOT_FOUND"
      | "DUPLICATE_VALUE"
      | "IMAGE_NOT_FOUND"
      | "PRODUCT_NOT_FOUND"
      | "VARIANT_NOT_FOUND",
    message: string,
  ) {
    super(message);
    this.name = "CatalogManagementError";
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
    throw new CatalogManagementError(
      "ADMIN_FORBIDDEN",
      "El administrador no está autorizado.",
    );
  }
}

export async function createCategory(adminId: string, input: CategoryInput) {
  try {
    return await getDb().transaction(async (transaction) => {
      await assertAdmin(transaction, adminId);
      const [category] = await transaction
        .insert(categories)
        .values(input)
        .returning({ id: categories.id });
      return category;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CatalogManagementError(
        "DUPLICATE_VALUE",
        "Ya existe una categoría con ese slug.",
      );
    }
    throw error;
  }
}

export async function updateCategory(
  adminId: string,
  categoryId: string,
  input: CategoryInput,
) {
  try {
    return await getDb().transaction(async (transaction) => {
      await assertAdmin(transaction, adminId);
      const [updated] = await transaction
        .update(categories)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(categories.id, categoryId))
        .returning({ id: categories.id });
      if (!updated) {
        throw new CatalogManagementError(
          "CATEGORY_NOT_FOUND",
          "La categoría no existe.",
        );
      }
      return updated;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CatalogManagementError(
        "DUPLICATE_VALUE",
        "Ya existe una categoría con ese slug.",
      );
    }
    throw error;
  }
}

export async function addProductImage(
  adminId: string,
  productId: string,
  input: ProductImageInput,
) {
  try {
    return await getDb().transaction(async (transaction) => {
      await assertAdmin(transaction, adminId);
      const [product] = await transaction
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);
      if (!product) {
        throw new CatalogManagementError(
          "PRODUCT_NOT_FOUND",
          "El producto no existe.",
        );
      }
      const [image] = await transaction
        .insert(productImages)
        .values({
          ...input,
          productId,
        })
        .returning({ id: productImages.id });
      return image;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CatalogManagementError(
        "DUPLICATE_VALUE",
        "Esa imagen ya está registrada en el catálogo.",
      );
    }
    throw error;
  }
}

export async function updateProductImage(
  adminId: string,
  imageId: string,
  input: ProductImageMetadata,
) {
  return getDb().transaction(async (transaction) => {
    await assertAdmin(transaction, adminId);
    const [updated] = await transaction
      .update(productImages)
      .set(input)
      .where(eq(productImages.id, imageId))
      .returning({ id: productImages.id });
    if (!updated) {
      throw new CatalogManagementError(
        "IMAGE_NOT_FOUND",
        "La imagen no existe.",
      );
    }
    return updated;
  });
}

export async function removeProductImage(adminId: string, imageId: string) {
  return getDb().transaction(async (transaction) => {
    await assertAdmin(transaction, adminId);
    const [removed] = await transaction
      .delete(productImages)
      .where(eq(productImages.id, imageId))
      .returning({
        id: productImages.id,
        storagePath: productImages.storagePath,
      });
    if (!removed) {
      throw new CatalogManagementError(
        "IMAGE_NOT_FOUND",
        "La imagen no existe.",
      );
    }
    return removed;
  });
}

export async function createProduct(
  adminId: string,
  input: ProductInput & { variant: VariantInput },
) {
  try {
    return await getDb().transaction(async (transaction) => {
      await assertAdmin(transaction, adminId);
      const [category] = await transaction
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.id, input.categoryId))
        .limit(1);
      if (!category) {
        throw new CatalogManagementError(
          "CATEGORY_NOT_FOUND",
          "La categoría seleccionada no existe.",
        );
      }

      const { variant, ...productInput } = input;
      const [product] = await transaction
        .insert(products)
        .values(productInput)
        .returning({ id: products.id });
      const [createdVariant] = await transaction
        .insert(productVariants)
        .values({
          compareAtPriceInCop: variant.compareAtPriceInCop,
          isActive: variant.isActive,
          name: variant.name,
          priceInCop: variant.priceInCop,
          productId: product.id,
          sku: variant.sku,
        })
        .returning({ id: productVariants.id });
      await transaction.insert(inventory).values({
        lowStockThreshold: variant.lowStockThreshold,
        quantity: variant.initialQuantity,
        variantId: createdVariant.id,
      });
      if (variant.initialQuantity > 0) {
        await transaction.insert(inventoryMovements).values({
          actorAdminId: adminId,
          quantityDelta: variant.initialQuantity,
          reason: "Inventario inicial de la variante",
          referenceId: product.id,
          referenceType: "product_creation",
          resultingQuantity: variant.initialQuantity,
          type: "purchase",
          variantId: createdVariant.id,
        });
      }
      return product;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CatalogManagementError(
        "DUPLICATE_VALUE",
        "El slug del producto o el SKU ya está en uso.",
      );
    }
    throw error;
  }
}

export async function updateProduct(
  adminId: string,
  productId: string,
  input: ProductInput,
) {
  try {
    return await getDb().transaction(async (transaction) => {
      await assertAdmin(transaction, adminId);
      const [updated] = await transaction
        .update(products)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(products.id, productId))
        .returning({ id: products.id });
      if (!updated) {
        throw new CatalogManagementError(
          "PRODUCT_NOT_FOUND",
          "El producto no existe.",
        );
      }
      return updated;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CatalogManagementError(
        "DUPLICATE_VALUE",
        "Ya existe un producto con ese slug.",
      );
    }
    throw error;
  }
}

export async function createVariant(
  adminId: string,
  productId: string,
  input: VariantInput,
) {
  try {
    return await getDb().transaction(async (transaction) => {
      await assertAdmin(transaction, adminId);
      const [product] = await transaction
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, productId))
        .limit(1);
      if (!product) {
        throw new CatalogManagementError(
          "PRODUCT_NOT_FOUND",
          "El producto no existe.",
        );
      }
      const [variant] = await transaction
        .insert(productVariants)
        .values({
          compareAtPriceInCop: input.compareAtPriceInCop,
          isActive: input.isActive,
          name: input.name,
          priceInCop: input.priceInCop,
          productId,
          sku: input.sku,
        })
        .returning({ id: productVariants.id });
      await transaction.insert(inventory).values({
        lowStockThreshold: input.lowStockThreshold,
        quantity: input.initialQuantity,
        variantId: variant.id,
      });
      if (input.initialQuantity > 0) {
        await transaction.insert(inventoryMovements).values({
          actorAdminId: adminId,
          quantityDelta: input.initialQuantity,
          reason: "Inventario inicial de la variante",
          referenceId: productId,
          referenceType: "variant_creation",
          resultingQuantity: input.initialQuantity,
          type: "purchase",
          variantId: variant.id,
        });
      }
      return variant;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CatalogManagementError(
        "DUPLICATE_VALUE",
        "Ese SKU ya está en uso.",
      );
    }
    throw error;
  }
}

export async function updateVariant(
  adminId: string,
  variantId: string,
  input: Omit<VariantInput, "initialQuantity">,
) {
  try {
    return await getDb().transaction(async (transaction) => {
      await assertAdmin(transaction, adminId);
      const [updated] = await transaction
        .update(productVariants)
        .set({
          compareAtPriceInCop: input.compareAtPriceInCop,
          isActive: input.isActive,
          name: input.name,
          priceInCop: input.priceInCop,
          sku: input.sku,
          updatedAt: new Date(),
        })
        .where(eq(productVariants.id, variantId))
        .returning({ id: productVariants.id });
      if (!updated) {
        throw new CatalogManagementError(
          "VARIANT_NOT_FOUND",
          "La variante no existe.",
        );
      }
      await transaction
        .update(inventory)
        .set({
          lowStockThreshold: input.lowStockThreshold,
          updatedAt: new Date(),
        })
        .where(eq(inventory.variantId, variantId));
      return updated;
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new CatalogManagementError(
        "DUPLICATE_VALUE",
        "Ese SKU ya está en uso.",
      );
    }
    throw error;
  }
}
