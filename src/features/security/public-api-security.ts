import { consumeRateLimit } from "@/db/queries/rate-limits";

import { getRequestIdentity, type RateLimitPolicy } from "./rate-limit";

const MAX_JSON_BODY_BYTES = 64 * 1024;

export class InvalidRequestBodyError extends Error {
  constructor(
    public readonly code:
      "INVALID_JSON" | "PAYLOAD_TOO_LARGE" | "UNSUPPORTED_MEDIA_TYPE",
  ) {
    super(code);
    this.name = "InvalidRequestBodyError";
  }
}

export async function readBoundedJson(
  request: Request,
  maxBytes = MAX_JSON_BODY_BYTES,
): Promise<unknown> {
  const contentType = request.headers.get("content-type");
  if (!contentType?.toLowerCase().startsWith("application/json")) {
    throw new InvalidRequestBodyError("UNSUPPORTED_MEDIA_TYPE");
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new InvalidRequestBodyError("PAYLOAD_TOO_LARGE");
  }
  if (!request.body) throw new InvalidRequestBodyError("INVALID_JSON");

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let body = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      bytesRead += value.byteLength;
      if (bytesRead > maxBytes) {
        await reader.cancel();
        throw new InvalidRequestBodyError("PAYLOAD_TOO_LARGE");
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return JSON.parse(body) as unknown;
  } catch (error) {
    if (error instanceof InvalidRequestBodyError) throw error;
    throw new InvalidRequestBodyError("INVALID_JSON");
  }
}

export async function enforceRateLimit(
  request: Request,
  policy: RateLimitPolicy,
  identity?: string,
) {
  const result = await consumeRateLimit({
    identity: identity ?? getRequestIdentity(request),
    policy,
  });

  if ("configurationMissing" in result) {
    return Response.json(
      {
        code: "SECURITY_CONFIGURATION_MISSING",
        message: "El servicio no está disponible temporalmente.",
        ok: false,
      },
      { headers: { "Cache-Control": "no-store" }, status: 503 },
    );
  }
  if (result.allowed) return null;

  return Response.json(
    {
      code: "RATE_LIMITED",
      message: "Has realizado demasiados intentos. Espera un momento.",
      ok: false,
    },
    {
      headers: {
        "Cache-Control": "no-store",
        "Retry-After": String(result.retryAfterSeconds),
      },
      status: 429,
    },
  );
}

export function invalidBodyResponse(error: InvalidRequestBodyError) {
  return Response.json(
    {
      code: error.code,
      message:
        error.code === "PAYLOAD_TOO_LARGE"
          ? "La solicitud supera el tamaño permitido."
          : error.code === "UNSUPPORTED_MEDIA_TYPE"
            ? "La solicitud debe enviarse como JSON."
            : "La solicitud no contiene JSON válido.",
      ok: false,
    },
    {
      headers: { "Cache-Control": "no-store" },
      status:
        error.code === "PAYLOAD_TOO_LARGE"
          ? 413
          : error.code === "UNSUPPORTED_MEDIA_TYPE"
            ? 415
            : 400,
    },
  );
}
