export const DEFAULT_STORE_SETTINGS = {
  announcement: "Envíos a toda Colombia",
  storeName: "Odissey Technology",
  supportEmail: null,
  whatsappEnabled: false,
  whatsappNumber: null,
} as const;

export type PublicStoreSettings = {
  announcement: string;
  storeName: string;
  supportEmail: string | null;
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
