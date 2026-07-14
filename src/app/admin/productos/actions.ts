"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  CatalogManagementError,
  addProductImage,
  categoryInputSchema,
  createCategory,
  createProduct,
  createProductInputSchema,
  createVariant,
  productImageMetadataSchema,
  productInputSchema,
  removeProductImage,
  updateCategory,
  updateProduct,
  updateProductImage,
  updateVariant,
  variantInputSchema,
} from "@/features/admin/catalog-management";
import { requireAdmin } from "@/features/admin/admin-access";
import {
  deleteProductImageFile,
  ProductImageStorageError,
  uploadProductImage,
} from "@/features/admin/product-image-storage";

export type CatalogActionState = { error?: string; success?: string };

const idSchema = z.uuid();

function checkbox(formData: FormData, name: string) {
  return formData.get(name) === "on";
}

function productFormValues(formData: FormData) {
  return {
    categoryId: formData.get("categoryId"),
    compatibility: formData.get("compatibility"),
    description: formData.get("description"),
    isFeatured: checkbox(formData, "isFeatured"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    warranty: formData.get("warranty"),
  };
}

function variantFormValues(formData: FormData, includeQuantity = true) {
  return {
    compareAtPriceInCop: formData.get("compareAtPriceInCop"),
    initialQuantity: includeQuantity ? formData.get("initialQuantity") : 0,
    isActive: checkbox(formData, "isActive"),
    lowStockThreshold: formData.get("lowStockThreshold"),
    name: formData.get("variantName"),
    priceInCop: formData.get("priceInCop"),
    sku: formData.get("sku"),
  };
}

function actionError(error: unknown) {
  return error instanceof CatalogManagementError ||
    error instanceof ProductImageStorageError
    ? error.message
    : "No fue posible guardar los cambios del catálogo.";
}

export async function createCategoryAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const input = categoryInputSchema.safeParse({
    description: formData.get("description"),
    isActive: checkbox(formData, "isActive"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!input.success) return { error: "Revisa los datos de la categoría." };

  try {
    await createCategory(admin.id, input.data);
    revalidatePath("/admin/productos");
    return { success: "Categoría creada correctamente." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function updateCategoryAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const categoryId = idSchema.safeParse(formData.get("categoryId"));
  const input = categoryInputSchema.safeParse({
    description: formData.get("description"),
    isActive: checkbox(formData, "isActive"),
    name: formData.get("name"),
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!categoryId.success || !input.success) {
    return { error: "Revisa los datos de la categoría." };
  }
  try {
    await updateCategory(admin.id, categoryId.data, input.data);
    revalidatePath("/admin");
    revalidatePath("/admin/productos");
    revalidatePath("/catalogo");
    return { success: "Categoría actualizada correctamente." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function createProductAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const input = createProductInputSchema.safeParse({
    ...productFormValues(formData),
    variant: variantFormValues(formData),
  });
  if (!input.success) {
    return {
      error: input.error.issues[0]?.message ?? "Revisa los datos del producto.",
    };
  }

  let productId: string;
  try {
    const product = await createProduct(admin.id, input.data);
    productId = product.id;
  } catch (error) {
    return { error: actionError(error) };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/productos");
  redirect(`/admin/productos/${productId}`);
}

export async function updateProductAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const productId = idSchema.safeParse(formData.get("productId"));
  const input = productInputSchema.safeParse(productFormValues(formData));
  if (!productId.success || !input.success) {
    return { error: "Revisa los datos generales del producto." };
  }

  try {
    await updateProduct(admin.id, productId.data, input.data);
    revalidatePath("/admin");
    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${productId.data}`);
    revalidatePath(`/producto/${input.data.slug}`);
    return { success: "Producto actualizado correctamente." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function createVariantAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const productId = idSchema.safeParse(formData.get("productId"));
  const input = variantInputSchema.safeParse(variantFormValues(formData));
  if (!productId.success || !input.success) {
    return {
      error: input.success
        ? "El producto no es válido."
        : (input.error.issues[0]?.message ?? "Revisa la variante."),
    };
  }

  try {
    await createVariant(admin.id, productId.data, input.data);
    revalidatePath("/admin");
    revalidatePath("/admin/inventario");
    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${productId.data}`);
    return { success: "Variante creada con su inventario inicial." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function updateVariantAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const variantId = idSchema.safeParse(formData.get("variantId"));
  const productId = idSchema.safeParse(formData.get("productId"));
  const input = variantInputSchema.safeParse(
    variantFormValues(formData, false),
  );
  if (!variantId.success || !productId.success || !input.success) {
    return {
      error: input.success
        ? "La variante no es válida."
        : (input.error.issues[0]?.message ?? "Revisa la variante."),
    };
  }

  try {
    const variant = {
      compareAtPriceInCop: input.data.compareAtPriceInCop,
      isActive: input.data.isActive,
      lowStockThreshold: input.data.lowStockThreshold,
      name: input.data.name,
      priceInCop: input.data.priceInCop,
      sku: input.data.sku,
    };
    await updateVariant(admin.id, variantId.data, variant);
    revalidatePath("/admin");
    revalidatePath("/admin/inventario");
    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${productId.data}`);
    return { success: "Variante actualizada correctamente." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

function imageFormValues(formData: FormData) {
  return {
    altText: formData.get("altText"),
    sortOrder: formData.get("sortOrder"),
  };
}

export async function addProductImageAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const productId = idSchema.safeParse(formData.get("productId"));
  const metadata = productImageMetadataSchema.safeParse(
    imageFormValues(formData),
  );
  const file = formData.get("image");
  if (!productId.success || !metadata.success || !(file instanceof File)) {
    return {
      error:
        metadata.error?.issues[0]?.message ?? "Selecciona una imagen válida.",
    };
  }
  let uploaded: Awaited<ReturnType<typeof uploadProductImage>> | undefined;
  try {
    uploaded = await uploadProductImage(productId.data, file);
    await addProductImage(admin.id, productId.data, {
      ...metadata.data,
      ...uploaded,
    });
    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${productId.data}`);
    revalidatePath("/catalogo");
    return { success: "Imagen agregada al producto." };
  } catch (error) {
    if (uploaded) {
      await deleteProductImageFile(uploaded.storagePath).catch(() => undefined);
    }
    return { error: actionError(error) };
  }
}

export async function updateProductImageAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const productId = idSchema.safeParse(formData.get("productId"));
  const imageId = idSchema.safeParse(formData.get("imageId"));
  const input = productImageMetadataSchema.safeParse(imageFormValues(formData));
  if (!productId.success || !imageId.success || !input.success) {
    return {
      error:
        input.error?.issues[0]?.message ?? "Revisa los datos de la imagen.",
    };
  }
  try {
    await updateProductImage(admin.id, imageId.data, input.data);
    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${productId.data}`);
    revalidatePath("/catalogo");
    return { success: "Imagen actualizada correctamente." };
  } catch (error) {
    return { error: actionError(error) };
  }
}

export async function removeProductImageAction(
  _state: CatalogActionState,
  formData: FormData,
): Promise<CatalogActionState> {
  const admin = await requireAdmin();
  const productId = idSchema.safeParse(formData.get("productId"));
  const imageId = idSchema.safeParse(formData.get("imageId"));
  if (!productId.success || !imageId.success) {
    return { error: "La imagen seleccionada no es válida." };
  }
  let removed: Awaited<ReturnType<typeof removeProductImage>>;
  try {
    removed = await removeProductImage(admin.id, imageId.data);
    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${productId.data}`);
    revalidatePath("/catalogo");
  } catch (error) {
    return { error: actionError(error) };
  }

  try {
    await deleteProductImageFile(removed.storagePath);
    return { success: "Imagen retirada del catálogo y del almacenamiento." };
  } catch {
    return {
      success:
        "Imagen retirada del catálogo. El archivo pendiente puede limpiarse después.",
    };
  }
}
