import { z } from "zod";

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
