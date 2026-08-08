export const DEFAULT_STORE_SETTINGS = {
  announcement: "Envíos a toda Colombia",
  bancolombiaAccountNumber: "23652931391",
  bancolombiaEnabled: true,
  bancolombiaKey: "@davids700",
  businessCity: null,
  cashOnDeliveryEnabled: true,
  daviplataEnabled: false,
  legalName: null,
  notificationAddress: null,
  nequiEnabled: true,
  nequiKey: "@NEQUIDAV5700",
  nequiNumber: "3126485885",
  storeName: "Odissey Technology",
  supportEmail: null,
  taxId: null,
  whatsappEnabled: false,
  whatsappNumber: null,
} as const;

export type PublicStoreSettings = {
  announcement: string;
  bancolombiaAccountNumber: string | null;
  bancolombiaEnabled: boolean;
  bancolombiaKey: string | null;
  businessCity: string | null;
  cashOnDeliveryEnabled: boolean;
  daviplataEnabled: boolean;
  legalName: string | null;
  notificationAddress: string | null;
  nequiEnabled: boolean;
  nequiKey: string | null;
  nequiNumber: string | null;
  storeName: string;
  supportEmail: string | null;
  taxId: string | null;
  whatsappEnabled: boolean;
  whatsappNumber: string | null;
};

export function buildWhatsAppUrl(
  settings: Pick<
    PublicStoreSettings,
    "storeName" | "whatsappEnabled" | "whatsappNumber"
  >,
) {
  if (!settings.whatsappEnabled || !settings.whatsappNumber) return null;

  const message = `Hola, quiero recibir información sobre los productos de ${settings.storeName}.`;
  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function buildPaymentProofWhatsAppUrl(
  settings: Pick<PublicStoreSettings, "whatsappEnabled" | "whatsappNumber">,
  order: {
    paymentMethodName: string;
    reference: string;
    totalInCop: number;
  },
) {
  if (!settings.whatsappEnabled || !settings.whatsappNumber) return null;

  const formattedTotal = new Intl.NumberFormat("es-CO", {
    currency: "COP",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(order.totalInCop);
  const message = [
    "Hola, ya realicé el pago de mi pedido.",
    `Referencia: ${order.reference}`,
    `Valor: ${formattedTotal}`,
    `Método: ${order.paymentMethodName}`,
    "Adjunto el comprobante para su verificación.",
  ].join("\n");

  return `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
