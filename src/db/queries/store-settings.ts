import { eq } from "drizzle-orm";
import { cache } from "react";

import {
  DEFAULT_STORE_SETTINGS,
  type PublicStoreSettings,
} from "@/features/store/store-settings";

import { getDb } from "..";
import { storeSettings } from "../schema";

export const STORE_SETTINGS_ID = "default";

export const getPublicStoreSettings = cache(
  async (): Promise<PublicStoreSettings> => {
    const [settings] = await getDb()
      .select({
        announcement: storeSettings.announcement,
        bancolombiaAccountNumber: storeSettings.bancolombiaAccountNumber,
        bancolombiaEnabled: storeSettings.bancolombiaEnabled,
        bancolombiaKey: storeSettings.bancolombiaKey,
        businessCity: storeSettings.businessCity,
        cashOnDeliveryEnabled: storeSettings.cashOnDeliveryEnabled,
        daviplataEnabled: storeSettings.daviplataEnabled,
        legalName: storeSettings.legalName,
        notificationAddress: storeSettings.notificationAddress,
        nequiEnabled: storeSettings.nequiEnabled,
        nequiKey: storeSettings.nequiKey,
        nequiNumber: storeSettings.nequiNumber,
        storeName: storeSettings.storeName,
        supportEmail: storeSettings.supportEmail,
        taxId: storeSettings.taxId,
        whatsappEnabled: storeSettings.whatsappEnabled,
        whatsappNumber: storeSettings.whatsappNumber,
      })
      .from(storeSettings)
      .where(eq(storeSettings.id, STORE_SETTINGS_ID))
      .limit(1);

    return settings ?? DEFAULT_STORE_SETTINGS;
  },
);
