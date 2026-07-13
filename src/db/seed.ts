import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getServerEnv } from "@/config/env";

import { categories, inventory, products, productVariants } from "./schema";

if (
  process.env.NODE_ENV === "production" ||
  process.env.SEED_DEMO_DATA !== "true"
) {
  throw new Error(
    "Demo seed refused. Set SEED_DEMO_DATA=true outside production to continue.",
  );
}

const categoryRows = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "Audífonos",
    slug: "audifonos",
    description: "Audio personal para trabajo, estudio y entretenimiento.",
    sortOrder: 1,
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    name: "Cargadores",
    slug: "cargadores",
    description: "Carga confiable para tus dispositivos de uso diario.",
    sortOrder: 2,
  },
  {
    id: "10000000-0000-4000-8000-000000000003",
    name: "Cables y adaptadores",
    slug: "cables-y-adaptadores",
    description: "Conectividad práctica para casa, oficina y viaje.",
    sortOrder: 3,
  },
] as const;

const productRows = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    categoryId: categoryRows[0].id,
    name: "Audífonos Bluetooth Nova",
    slug: "audifonos-bluetooth-nova",
    description:
      "Audífonos inalámbricos compactos con estuche de carga y controles táctiles.",
    compatibility: "Dispositivos con Bluetooth 5.0 o superior.",
    warranty: "Garantía de 6 meses por defectos de fabricación.",
    status: "active" as const,
    isFeatured: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    categoryId: categoryRows[0].id,
    name: "Audífonos USB-C Pulse",
    slug: "audifonos-usb-c-pulse",
    description:
      "Audio por cable USB-C con micrófono integrado para llamadas claras.",
    compatibility:
      "Teléfonos, tabletas y computadores con salida de audio USB-C.",
    warranty: "Garantía de 3 meses por defectos de fabricación.",
    status: "active" as const,
    isFeatured: false,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    categoryId: categoryRows[1].id,
    name: "Cargador rápido USB-C 20W",
    slug: "cargador-rapido-usb-c-20w",
    description:
      "Adaptador compacto de carga rápida para dispositivos compatibles con Power Delivery.",
    compatibility:
      "iPhone, Android y accesorios compatibles con USB Power Delivery.",
    warranty: "Garantía de 6 meses por defectos de fabricación.",
    status: "active" as const,
    isFeatured: true,
  },
  {
    id: "20000000-0000-4000-8000-000000000004",
    categoryId: categoryRows[2].id,
    name: "Cable trenzado USB-C",
    slug: "cable-trenzado-usb-c",
    description:
      "Cable reforzado para carga y transferencia de datos, pensado para uso diario.",
    compatibility: "Dispositivos con puerto USB-C.",
    warranty: "Garantía de 3 meses por defectos de fabricación.",
    status: "active" as const,
    isFeatured: false,
  },
] as const;

const variantRows = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    productId: productRows[0].id,
    sku: "DEMO-NOVA-BLK",
    name: "Negro",
    optionValues: { color: "Negro" },
    priceInCop: 89900,
    compareAtPriceInCop: 109900,
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    productId: productRows[0].id,
    sku: "DEMO-NOVA-WHT",
    name: "Blanco",
    optionValues: { color: "Blanco" },
    priceInCop: 89900,
    compareAtPriceInCop: 109900,
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    productId: productRows[1].id,
    sku: "DEMO-PULSE-USBC",
    name: "Negro",
    optionValues: { color: "Negro", conector: "USB-C" },
    priceInCop: 39900,
    compareAtPriceInCop: null,
  },
  {
    id: "30000000-0000-4000-8000-000000000004",
    productId: productRows[2].id,
    sku: "DEMO-PD-20W",
    name: "20W",
    optionValues: { potencia: "20W" },
    priceInCop: 59900,
    compareAtPriceInCop: 69900,
  },
  {
    id: "30000000-0000-4000-8000-000000000005",
    productId: productRows[3].id,
    sku: "DEMO-USBC-1M",
    name: "1 metro",
    optionValues: { longitud: "1 metro", color: "Negro" },
    priceInCop: 29900,
    compareAtPriceInCop: null,
  },
] as const;

async function seedDemoCatalog() {
  const client = postgres(getServerEnv().DATABASE_URL, { max: 1 });
  const database = drizzle(client);

  try {
    await database.transaction(async (transaction) => {
      for (const category of categoryRows) {
        await transaction
          .insert(categories)
          .values(category)
          .onConflictDoUpdate({
            target: categories.id,
            set: { ...category, updatedAt: new Date() },
          });
      }

      for (const product of productRows) {
        await transaction
          .insert(products)
          .values(product)
          .onConflictDoUpdate({
            target: products.id,
            set: { ...product, updatedAt: new Date() },
          });
      }

      for (const variant of variantRows) {
        await transaction
          .insert(productVariants)
          .values(variant)
          .onConflictDoUpdate({
            target: productVariants.id,
            set: { ...variant, updatedAt: new Date() },
          });

        await transaction
          .insert(inventory)
          .values({ variantId: variant.id, quantity: 12, lowStockThreshold: 3 })
          .onConflictDoUpdate({
            target: inventory.variantId,
            set: { quantity: 12, reservedQuantity: 0, lowStockThreshold: 3 },
          });
      }
    });

    console.info("Demo catalog seed completed successfully");
  } finally {
    await client.end();
  }
}

void seedDemoCatalog().catch(() => {
  console.error("Demo catalog seed failed");
  process.exitCode = 1;
});
