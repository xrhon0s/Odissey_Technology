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
        storeName: storeSettings.storeName,
        supportEmail: storeSettings.supportEmail,
        whatsappEnabled: storeSettings.whatsappEnabled,
        whatsappNumber: storeSettings.whatsappNumber,
      })
      .from(storeSettings)
      .where(eq(storeSettings.id, STORE_SETTINGS_ID))
      .limit(1);

    return settings ?? DEFAULT_STORE_SETTINGS;
  },
);
