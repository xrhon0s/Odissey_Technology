export const DEFAULT_STORE_SETTINGS = {
  announcement: "Envíos a toda Colombia",
  businessCity: null,
  legalName: null,
  notificationAddress: null,
  storeName: "Odissey Technology",
  supportEmail: null,
  taxId: null,
  whatsappEnabled: false,
  whatsappNumber: null,
} as const;

export type PublicStoreSettings = {
  announcement: string;
  businessCity: string | null;
  legalName: string | null;
  notificationAddress: string | null;
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
