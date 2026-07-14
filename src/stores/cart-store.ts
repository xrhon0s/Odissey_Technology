"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { clampCartQuantity } from "@/features/cart/cart-rules";

export type CartItem = {
  availableQuantity: number;
  imageAlt: string | null;
  imageUrl: string | null;
  productName: string;
  productSlug: string;
  quantity: number;
  sku: string;
  unitPriceInCop: number;
  variantId: string;
  variantName: string;
};

type CartState = {
  addItem: (item: CartItem) => void;
  clear: () => void;
  hasHydrated: boolean;
  items: CartItem[];
  removeItem: (variantId: string) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setQuantity: (variantId: string, quantity: number) => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      addItem: (item) =>
        set((state) => {
          if (item.availableQuantity < 1) return state;

          const existingItem = state.items.find(
            (currentItem) => currentItem.variantId === item.variantId,
          );
          const quantity = clampCartQuantity(
            (existingItem?.quantity ?? 0) + item.quantity,
            item.availableQuantity,
          );
          const nextItem = { ...item, quantity };

          return {
            items: existingItem
              ? state.items.map((currentItem) =>
                  currentItem.variantId === item.variantId
                    ? nextItem
                    : currentItem,
                )
              : [...state.items, nextItem],
          };
        }),
      clear: () => set({ items: [] }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setQuantity: (variantId, requestedQuantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.variantId === variantId
              ? {
                  ...item,
                  quantity: clampCartQuantity(
                    requestedQuantity,
                    item.availableQuantity,
                  ),
                }
              : item,
          ),
        })),
    }),
    {
      name: "odissey-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      version: 1,
    },
  ),
);
