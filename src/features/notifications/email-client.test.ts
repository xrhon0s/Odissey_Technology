import { describe, expect, it, vi } from "vitest";

import { sendTransactionalEmail } from "./email-client";

const email = {
  html: "<p>Pedido creado</p>",
  idempotencyKey: "order-created-test",
  subject: "Pedido creado",
  text: "Pedido creado",
  to: "cliente@example.com",
};

describe("sendTransactionalEmail", () => {
  it("skips delivery when configuration is missing", async () => {
    expect(
      await sendTransactionalEmail(email, { apiKey: "", from: "" }),
    ).toEqual({ reason: "missing_configuration", status: "skipped" });
  });

  it("sends through the Resend REST endpoint", async () => {
    const fetcher = vi.fn(async () => new Response(null, { status: 200 }));

    expect(
      await sendTransactionalEmail(email, {
        apiKey: "re_test",
        fetcher,
        from: "Odissey <ventas@example.com>",
      }),
    ).toEqual({ status: "sent" });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
