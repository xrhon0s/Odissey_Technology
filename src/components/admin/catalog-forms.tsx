"use client";

import Image from "next/image";
import { useActionState } from "react";

import {
  addProductImageAction,
  createCategoryAction,
  createProductAction,
  createVariantAction,
  removeProductImageAction,
  type CatalogActionState,
  updateCategoryAction,
  updateProductImageAction,
  updateProductAction,
  updateVariantAction,
} from "@/app/admin/productos/actions";

const initialState: CatalogActionState = {};
const inputClass =
  "h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950";
const textareaClass =
  "min-h-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950";
const labelClass = "grid gap-1 text-sm font-semibold text-slate-700";

function Result({ state }: { state: CatalogActionState }) {
  if (!state.error && !state.success) return null;
  return (
    <p
      role="status"
      className={`text-sm ${state.error ? "text-red-700" : "text-emerald-700"}`}
    >
      {state.error ?? state.success}
    </p>
  );
}

function SubmitButton({ pending, text }: { pending: boolean; text: string }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:bg-slate-400"
    >
      {pending ? "Guardando…" : text}
    </button>
  );
}

export function CategoryCreateForm() {
  const [state, action, pending] = useActionState(
    createCategoryAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 className="text-lg font-bold text-slate-950">Nueva categoría</h2>
      <label className={labelClass}>
        Nombre
        <input name="name" required maxLength={120} className={inputClass} />
      </label>
      <label className={labelClass}>
        Slug
        <input
          name="slug"
          required
          maxLength={140}
          placeholder="cables-y-adaptadores"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Descripción
        <textarea
          name="description"
          maxLength={500}
          className={textareaClass}
        />
      </label>
      <label className={labelClass}>
        Orden
        <input
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={0}
          required
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input name="isActive" type="checkbox" defaultChecked /> Activa en la
        tienda
      </label>
      <SubmitButton pending={pending} text="Crear categoría" />
      <Result state={state} />
    </form>
  );
}

export function CategoryEditForm({
  category,
}: {
  category: {
    description: string | null;
    id: string;
    isActive: boolean;
    name: string;
    slug: string;
    sortOrder: number;
  };
}) {
  const [state, action, pending] = useActionState(
    updateCategoryAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="grid gap-3 rounded-lg border border-slate-200 p-4"
    >
      <input type="hidden" name="categoryId" value={category.id} />
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_90px]">
        <label className={labelClass}>
          Nombre
          <input
            name="name"
            required
            defaultValue={category.name}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Slug
          <input
            name="slug"
            required
            defaultValue={category.slug}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Orden
          <input
            name="sortOrder"
            type="number"
            min={0}
            required
            defaultValue={category.sortOrder}
            className={inputClass}
          />
        </label>
      </div>
      <label className={labelClass}>
        Descripción
        <textarea
          name="description"
          maxLength={500}
          defaultValue={category.description ?? ""}
          className={textareaClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={category.isActive}
        />
        Visible en la tienda
      </label>
      <SubmitButton pending={pending} text="Guardar categoría" />
      <Result state={state} />
    </form>
  );
}

type CategoryOption = { id: string; name: string; isActive: boolean };

function ProductFields({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product?: {
    categoryId: string;
    compatibility: string | null;
    description: string;
    isFeatured: boolean;
    name: string;
    slug: string;
    status: "draft" | "active" | "archived";
    warranty: string | null;
  };
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Nombre
          <input
            name="name"
            required
            maxLength={180}
            defaultValue={product?.name}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Slug
          <input
            name="slug"
            required
            maxLength={200}
            defaultValue={product?.slug}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Categoría
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId}
            className={inputClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.isActive ? "" : " (inactiva)"}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Estado
          <select
            name="status"
            defaultValue={product?.status ?? "draft"}
            className={inputClass}
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="archived">Archivado</option>
          </select>
        </label>
      </div>
      <label className={labelClass}>
        Descripción
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={5000}
          defaultValue={product?.description}
          className={textareaClass}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Compatibilidad
          <textarea
            name="compatibility"
            maxLength={500}
            defaultValue={product?.compatibility ?? ""}
            className={textareaClass}
          />
        </label>
        <label className={labelClass}>
          Garantía
          <textarea
            name="warranty"
            maxLength={500}
            defaultValue={product?.warranty ?? ""}
            className={textareaClass}
          />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          name="isFeatured"
          type="checkbox"
          defaultChecked={product?.isFeatured}
        />{" "}
        Producto destacado
      </label>
    </>
  );
}

function VariantFields({
  includeQuantity,
  variant,
}: {
  includeQuantity: boolean;
  variant?: {
    compareAtPriceInCop: number | null;
    isActive: boolean;
    lowStockThreshold: number | null;
    name: string;
    priceInCop: number;
    sku: string;
  };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className={labelClass}>
        Nombre de variante
        <input
          name="variantName"
          required
          maxLength={160}
          defaultValue={variant?.name}
          placeholder="Negro / 1 metro"
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        SKU
        <input
          name="sku"
          required
          maxLength={80}
          defaultValue={variant?.sku}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Precio COP
        <input
          name="priceInCop"
          type="number"
          min={1}
          required
          defaultValue={variant?.priceInCop}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Precio anterior COP
        <input
          name="compareAtPriceInCop"
          type="number"
          min={1}
          defaultValue={variant?.compareAtPriceInCop ?? ""}
          className={inputClass}
        />
      </label>
      {includeQuantity && (
        <label className={labelClass}>
          Inventario inicial
          <input
            name="initialQuantity"
            type="number"
            min={0}
            required
            defaultValue={0}
            className={inputClass}
          />
        </label>
      )}
      <label className={labelClass}>
        Alerta de stock
        <input
          name="lowStockThreshold"
          type="number"
          min={0}
          required
          defaultValue={variant?.lowStockThreshold ?? 5}
          className={inputClass}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={variant?.isActive ?? true}
        />{" "}
        Variante disponible
      </label>
    </div>
  );
}

export function ProductCreateForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const [state, action, pending] = useActionState(
    createProductAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5"
    >
      <h2 className="text-xl font-bold text-slate-950">Nuevo producto</h2>
      <ProductFields categories={categories} />
      <div className="border-t border-slate-200 pt-5">
        <h3 className="mb-4 font-bold text-slate-950">Primera variante</h3>
        <VariantFields includeQuantity />
      </div>
      <SubmitButton pending={pending} text="Crear producto" />
      <Result state={state} />
    </form>
  );
}

export function ProductEditForm({
  categories,
  product,
}: {
  categories: CategoryOption[];
  product: Parameters<typeof ProductFields>[0]["product"] & { id: string };
}) {
  const [state, action, pending] = useActionState(
    updateProductAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="grid gap-5 rounded-xl border border-slate-200 bg-white p-5"
    >
      <input type="hidden" name="productId" value={product.id} />
      <h2 className="text-xl font-bold text-slate-950">Información general</h2>
      <ProductFields categories={categories} product={product} />
      <SubmitButton pending={pending} text="Guardar producto" />
      <Result state={state} />
    </form>
  );
}

export function VariantCreateForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(
    createVariantAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="grid gap-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5"
    >
      <input type="hidden" name="productId" value={productId} />
      <h3 className="font-bold text-slate-950">Agregar variante</h3>
      <VariantFields includeQuantity />
      <SubmitButton pending={pending} text="Crear variante" />
      <Result state={state} />
    </form>
  );
}

export function VariantEditForm({
  productId,
  variant,
}: {
  productId: string;
  variant: Parameters<typeof VariantFields>[0]["variant"] & {
    id: string;
    quantity: number;
    reservedQuantity: number;
  };
}) {
  const [state, action, pending] = useActionState(
    updateVariantAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5"
    >
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="variantId" value={variant.id} />
      <div>
        <h3 className="font-bold text-slate-950">{variant.name}</h3>
        <p className="mt-1 text-xs text-slate-500">
          Existencia: {variant.quantity} · Reservadas:{" "}
          {variant.reservedQuantity}
        </p>
      </div>
      <VariantFields includeQuantity={false} variant={variant} />
      <SubmitButton pending={pending} text="Guardar variante" />
      <Result state={state} />
    </form>
  );
}

type ProductImageValue = {
  altText: string;
  id: string;
  sortOrder: number;
  url: string;
};

function ImageMetadataFields({ image }: { image?: ProductImageValue }) {
  return (
    <div className="grid flex-1 gap-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
        <label className={labelClass}>
          Texto alternativo
          <input
            name="altText"
            required
            minLength={3}
            maxLength={240}
            defaultValue={image?.altText}
            placeholder="Vista frontal del producto"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Orden
          <input
            name="sortOrder"
            type="number"
            min={0}
            required
            defaultValue={image?.sortOrder ?? 0}
            className={inputClass}
          />
        </label>
      </div>
    </div>
  );
}

export function ProductImageCreateForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(
    addProductImageAction,
    initialState,
  );
  return (
    <form
      action={action}
      className="grid gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5"
    >
      <input type="hidden" name="productId" value={productId} />
      <h3 className="font-bold text-slate-950">Agregar imagen</h3>
      <label className={labelClass}>
        Archivo
        <input
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          required
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:font-semibold"
        />
        <span className="text-xs font-normal text-slate-500">
          JPG, PNG, WebP o AVIF; máximo 3 MB.
        </span>
      </label>
      <ImageMetadataFields />
      <SubmitButton pending={pending} text="Subir imagen" />
      <Result state={state} />
    </form>
  );
}

export function ProductImageEditForm({
  image,
  productId,
}: {
  image: ProductImageValue;
  productId: string;
}) {
  const [updateState, updateAction, updating] = useActionState(
    updateProductImageAction,
    initialState,
  );
  const [removeState, removeAction, removing] = useActionState(
    removeProductImageAction,
    initialState,
  );
  return (
    <article className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 md:grid-cols-[180px_1fr]">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={image.url}
          alt={image.altText}
          fill
          sizes="180px"
          className="object-cover"
        />
      </div>
      <div className="grid gap-3">
        <form action={updateAction} className="grid gap-4">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="imageId" value={image.id} />
          <ImageMetadataFields image={image} />
          <SubmitButton pending={updating} text="Guardar imagen" />
          <Result state={updateState} />
        </form>
        <form action={removeAction}>
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="imageId" value={image.id} />
          <button
            type="submit"
            disabled={removing}
            className="text-sm font-bold text-red-700 hover:text-red-900 disabled:text-slate-400"
          >
            {removing ? "Retirando…" : "Retirar del catálogo"}
          </button>
          <Result state={removeState} />
        </form>
      </div>
    </article>
  );
}
