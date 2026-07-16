type TransactionalEmail = {
  html: string;
  idempotencyKey: string;
  replyTo?: string | null;
  subject: string;
  text: string;
  to: string;
};

export type EmailDeliveryResult =
  | { status: "sent" }
  | { reason: "missing_configuration"; status: "skipped" }
  | { reason: "provider_error"; status: "failed" };

type EmailRuntime = {
  apiKey?: string;
  fetcher?: typeof fetch;
  from?: string;
};

export async function sendTransactionalEmail(
  email: TransactionalEmail,
  runtime: EmailRuntime = {},
): Promise<EmailDeliveryResult> {
  const apiKey = runtime.apiKey ?? process.env.RESEND_API_KEY;
  const from = runtime.from ?? process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return { reason: "missing_configuration", status: "skipped" };
  }

  try {
    const response = await (runtime.fetcher ?? fetch)(
      "https://api.resend.com/emails",
      {
        body: JSON.stringify({
          from,
          html: email.html,
          reply_to: email.replyTo || undefined,
          subject: email.subject,
          text: email.text,
          to: [email.to],
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": email.idempotencyKey,
        },
        method: "POST",
        signal: AbortSignal.timeout(8_000),
      },
    );

    return response.ok
      ? { status: "sent" }
      : { reason: "provider_error", status: "failed" };
  } catch {
    return { reason: "provider_error", status: "failed" };
  }
}
