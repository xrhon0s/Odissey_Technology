import { randomUUID } from "node:crypto";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export const PRODUCT_IMAGES_BUCKET = "product-images";
export const MAX_PRODUCT_IMAGE_BYTES = 3 * 1024 * 1024;

const imageExtensions = {
  "image/avif": "avif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type ProductImageFileInfo = {
  size: number;
  type: string;
};

export class ProductImageStorageError extends Error {
  constructor(
    public readonly code:
      "INVALID_FILE" | "STORAGE_NOT_CONFIGURED" | "STORAGE_OPERATION_FAILED",
    message: string,
  ) {
    super(message);
    this.name = "ProductImageStorageError";
  }
}

export function validateProductImageFile(file: ProductImageFileInfo) {
  const extension = imageExtensions[file.type as keyof typeof imageExtensions];
  if (!extension) {
    throw new ProductImageStorageError(
      "INVALID_FILE",
      "Usa una imagen JPG, PNG, WebP o AVIF.",
    );
  }
  if (file.size <= 0 || file.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new ProductImageStorageError(
      "INVALID_FILE",
      "La imagen debe pesar máximo 3 MB.",
    );
  }
  return { extension };
}

export async function uploadProductImage(productId: string, file: File) {
  const { extension } = validateProductImageFile(file);
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new ProductImageStorageError(
      "STORAGE_NOT_CONFIGURED",
      "Configura Supabase antes de subir imágenes.",
    );
  }

  const storagePath = `${productId}/${randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });
  if (error) {
    throw new ProductImageStorageError(
      "STORAGE_OPERATION_FAILED",
      "No fue posible subir la imagen a Supabase Storage.",
    );
  }

  const { data } = supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return { storagePath, url: data.publicUrl };
}

export async function deleteProductImageFile(storagePath: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    throw new ProductImageStorageError(
      "STORAGE_NOT_CONFIGURED",
      "Supabase Storage no está configurado.",
    );
  }
  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .remove([storagePath]);
  if (error) {
    throw new ProductImageStorageError(
      "STORAGE_OPERATION_FAILED",
      "No fue posible retirar el archivo de Supabase Storage.",
    );
  }
}
