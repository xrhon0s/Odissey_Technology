import { z } from "zod";

import type { PublicStoreSettings } from "@/features/store/store-settings";

export const manualPaymentMethodValues = [
  "nequi",
  "daviplata",
  "bancolombia_transfer",
  "cash_on_delivery",
] as const;

export const manualPaymentMethodSchema = z.enum(manualPaymentMethodValues);

export type ManualPaymentMethod = z.infer<typeof manualPaymentMethodSchema>;

export type ManualPaymentMethodOption = {
  code: ManualPaymentMethod;
  description: string;
  name: string;
  requiresMetropolitanDelivery: boolean;
};

export const manualPaymentMethods: ManualPaymentMethodOption[] = [
  {
    code: "nequi",
    description: "Transfiere desde Nequi y comparte el comprobante.",
    name: "Nequi",
    requiresMetropolitanDelivery: false,
  },
  {
    code: "daviplata",
    description: "Transfiere desde DaviPlata y comparte el comprobante.",
    name: "DaviPlata",
    requiresMetropolitanDelivery: false,
  },
  {
    code: "bancolombia_transfer",
    description: "Transferencia a una cuenta Bancolombia.",
    name: "Bancolombia",
    requiresMetropolitanDelivery: false,
  },
  {
    code: "cash_on_delivery",
    description:
      "Paga en efectivo al recibir dentro del área metropolitana de Medellín.",
    name: "Efectivo contraentrega",
    requiresMetropolitanDelivery: true,
  },
];

type PaymentAvailabilitySettings = Pick<
  PublicStoreSettings,
  | "bancolombiaEnabled"
  | "cashOnDeliveryEnabled"
  | "daviplataEnabled"
  | "nequiEnabled"
>;

export function isManualPaymentMethodAvailable(
  method: ManualPaymentMethod,
  settings: PaymentAvailabilitySettings,
) {
  return {
    bancolombia_transfer: settings.bancolombiaEnabled,
    cash_on_delivery: settings.cashOnDeliveryEnabled,
    daviplata: settings.daviplataEnabled,
    nequi: settings.nequiEnabled,
  }[method];
}

export function getAvailableManualPaymentMethods(
  settings: PaymentAvailabilitySettings,
) {
  return manualPaymentMethods.filter((method) =>
    isManualPaymentMethodAvailable(method.code, settings),
  );
}

export type PaymentInstructionsData = {
  details: Array<{ label: string; value: string }>;
  message: string;
  qrImage: {
    alt: string;
    height: number;
    src: string;
    width: number;
  } | null;
  title: string;
};

type PaymentInstructionSettings = Pick<
  PublicStoreSettings,
  "bancolombiaAccountNumber" | "bancolombiaKey" | "nequiKey" | "nequiNumber"
>;

export function buildPaymentInstructions(
  method: ManualPaymentMethod,
  settings: PaymentInstructionSettings,
): PaymentInstructionsData | null {
  if (method === "cash_on_delivery") {
    return {
      details: [],
      message:
        "Ten disponible el valor exacto en efectivo. Confirmaremos contigo la entrega antes de despachar.",
      qrImage: null,
      title: "Pago al recibir",
    };
  }

  if (method === "nequi") {
    return {
      details: [
        ...(settings.nequiNumber
          ? [{ label: "Número Nequi", value: settings.nequiNumber }]
          : []),
        ...(settings.nequiKey
          ? [{ label: "Llave Bre-B", value: settings.nequiKey }]
          : []),
      ],
      message:
        "Escanea el QR o transfiere directamente. Verifica el destinatario antes de confirmar el pago.",
      qrImage: {
        alt: "QR Bre-B para pagar por Nequi",
        height: 1450,
        src: "/images/payments/nequi-qr.png",
        width: 820,
      },
      title: "Paga por Nequi",
    };
  }

  if (method === "bancolombia_transfer") {
    return {
      details: [
        ...(settings.bancolombiaAccountNumber
          ? [
              {
                label: "Cuenta de ahorros Bancolombia",
                value: settings.bancolombiaAccountNumber,
              },
            ]
          : []),
        ...(settings.bancolombiaKey
          ? [{ label: "Llave Bre-B", value: settings.bancolombiaKey }]
          : []),
      ],
      message:
        "Escanea el QR o transfiere a la cuenta de ahorros. Verifica el destinatario antes de confirmar el pago.",
      qrImage: {
        alt: "QR Bre-B para pagar por Bancolombia",
        height: 850,
        src: "/images/payments/bancolombia-qr.png",
        width: 720,
      },
      title: "Paga por Bancolombia",
    };
  }

  return null;
}

export const valleDeAburraMunicipalities = [
  "Barbosa",
  "Girardota",
  "Copacabana",
  "Bello",
  "Medellín",
  "Itagüí",
  "Envigado",
  "Sabaneta",
  "La Estrella",
  "Caldas",
] as const;

function normalizeLocation(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLocaleLowerCase("es-CO");
}

const normalizedMetropolitanMunicipalities = new Set(
  valleDeAburraMunicipalities.map(normalizeLocation),
);

type PaymentEligibilityInput = {
  address?: { city: string; department: string };
  paymentMethod: ManualPaymentMethod;
  shippingMethodCode: string;
};

export function isPaymentMethodEligible(input: PaymentEligibilityInput) {
  if (input.paymentMethod !== "cash_on_delivery") return true;
  if (input.shippingMethodCode === "recogida-local") return true;
  if (!input.address) return false;

  return (
    normalizeLocation(input.address.department) === "antioquia" &&
    normalizedMetropolitanMunicipalities.has(
      normalizeLocation(input.address.city),
    )
  );
}
