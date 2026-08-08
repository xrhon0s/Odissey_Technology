import type { PublicStoreSettings } from "@/features/store/store-settings";
import { formatCurrency } from "@/lib/format-currency";

import { sendTransactionalEmail } from "./email-client";

type BaseOrderNotification = {
  customerEmail: string;
  customerName: string;
  orderId: string;
  reference: string;
  settings: Pick<PublicStoreSettings, "storeName" | "supportEmail">;
  totalInCop: number;
};

type OrderStatusNotification = BaseOrderNotification & {
  estimatedDeliveryAt?: Date | null;
  shippingCarrier?: string | null;
  status: "cancelled" | "confirmed" | "delivered" | "preparing" | "shipped";
  trackingNumber?: string | null;
  trackingUrl?: string | null;
};

const statusContent = {
  cancelled: {
    detail:
      "No fue posible confirmar el pago. Si crees que se trata de un error, responde este correo.",
    title: "Tu pedido no fue confirmado",
  },
  confirmed: {
    detail: "Confirmamos tu pedido y comenzaremos a prepararlo.",
    title: "Pedido confirmado",
  },
  delivered: {
    detail:
      "Marcamos tu pedido como entregado. Gracias por comprar con nosotros.",
    title: "Pedido entregado",
  },
  preparing: {
    detail: "Tu pedido está siendo preparado para despacho.",
    title: "Estamos preparando tu pedido",
  },
  shipped: {
    detail: "Tu pedido ya fue entregado a la transportadora.",
    title: "Tu pedido está en camino",
  },
} as const;

export async function notifyOrderCreated(input: BaseOrderNotification) {
  const orderUrl = buildOrderUrl(input.reference);
  const customerText = [
    `Hola ${input.customerName}, recibimos tu pedido ${input.reference}.`,
    `Total: ${formatCurrency(input.totalInCop)}.`,
    "Conserva la referencia para consultar el pedido y completar el pago.",
    orderUrl,
  ].join("\n");
  const deliveries = [
    sendTransactionalEmail({
      html: renderEmail({
        actionLabel: "Consultar mi pedido",
        actionUrl: orderUrl,
        body: `Recibimos tu pedido <strong>${escapeHtml(input.reference)}</strong> por ${escapeHtml(formatCurrency(input.totalInCop))}. Conserva la referencia para consultar el estado y completar el pago.`,
        storeName: input.settings.storeName,
        title: `Hola ${escapeHtml(input.customerName)}, tu pedido fue creado`,
      }),
      idempotencyKey: `order-${input.orderId}-created-customer`,
      replyTo: input.settings.supportEmail,
      subject: `${input.reference} · Pedido recibido`,
      text: customerText,
      to: input.customerEmail,
    }),
  ];

  if (input.settings.supportEmail) {
    deliveries.push(
      sendTransactionalEmail({
        html: renderEmail({
          body: `Entró el pedido <strong>${escapeHtml(input.reference)}</strong> de ${escapeHtml(input.customerName)} por ${escapeHtml(formatCurrency(input.totalInCop))}.`,
          storeName: input.settings.storeName,
          title: "Nuevo pedido recibido",
        }),
        idempotencyKey: `order-${input.orderId}-created-admin`,
        subject: `${input.reference} · Nuevo pedido`,
        text: `Nuevo pedido ${input.reference} de ${input.customerName} por ${formatCurrency(input.totalInCop)}.`,
        to: input.settings.supportEmail,
      }),
    );
  }

  return Promise.all(deliveries);
}

export function notifyOrderStatus(input: OrderStatusNotification) {
  const content = statusContent[input.status];
  const orderUrl = buildOrderUrl(input.reference);
  const shipmentDetails =
    input.status === "shipped" && input.shippingCarrier && input.trackingNumber
      ? `<p style="margin:16px 0 0"><strong>Transportadora:</strong> ${escapeHtml(input.shippingCarrier)}<br><strong>Guía:</strong> ${escapeHtml(input.trackingNumber)}${input.estimatedDeliveryAt ? `<br><strong>Entrega estimada:</strong> ${escapeHtml(input.estimatedDeliveryAt.toLocaleDateString("es-CO"))}` : ""}</p>`
      : "";

  return sendTransactionalEmail({
    html: renderEmail({
      actionLabel:
        input.status === "shipped" && input.trackingUrl
          ? "Rastrear envío"
          : "Consultar mi pedido",
      actionUrl:
        input.status === "shipped" && input.trackingUrl
          ? input.trackingUrl
          : orderUrl,
      body: `${escapeHtml(content.detail)}${shipmentDetails}`,
      storeName: input.settings.storeName,
      title: content.title,
    }),
    idempotencyKey: `order-${input.orderId}-status-${input.status}`,
    replyTo: input.settings.supportEmail,
    subject: `${input.reference} · ${content.title}`,
    text: `${content.title}. ${content.detail} Consulta: ${orderUrl}`,
    to: input.customerEmail,
  });
}

function buildOrderUrl(reference: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl.replace(/\/$/, "")}/pedido?reference=${encodeURIComponent(reference)}`;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '"': "&quot;",
        "&": "&amp;",
        "'": "&#039;",
        "<": "&lt;",
        ">": "&gt;",
      })[character] ?? character,
  );
}

function renderEmail(input: {
  actionLabel?: string;
  actionUrl?: string;
  body: string;
  storeName: string;
  title: string;
}) {
  const action =
    input.actionLabel && input.actionUrl
      ? `<p style="margin:28px 0 0"><a href="${escapeHtml(input.actionUrl)}" style="display:inline-block;background:#071b35;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:700">${escapeHtml(input.actionLabel)}</a></p>`
      : "";

  return `<!doctype html><html lang="es"><body style="margin:0;background:#f5f7fa;font-family:Arial,sans-serif;color:#071b35"><div style="max-width:620px;margin:0 auto;padding:32px 16px"><div style="background:#071b35;color:#fff;padding:18px 24px;border-radius:18px 18px 0 0;font-weight:800">${escapeHtml(input.storeName)}</div><div style="background:#fff;padding:28px 24px;border-radius:0 0 18px 18px"><h1 style="margin:0 0 16px;font-size:25px">${input.title}</h1><div style="font-size:16px;line-height:1.65;color:#42526a">${input.body}</div>${action}</div></div></body></html>`;
}
