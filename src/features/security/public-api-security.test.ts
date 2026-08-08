import { describe, expect, it } from "vitest";

import { readBoundedJson } from "./public-api-security";

describe("readBoundedJson", () => {
  it("parses a bounded JSON request", async () => {
    await expect(
      readBoundedJson(
        new Request("https://example.com", {
          body: JSON.stringify({ ok: true }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
      ),
    ).resolves.toEqual({ ok: true });
  });

  it("rejects oversized bodies before parsing", async () => {
    await expect(
      readBoundedJson(
        new Request("https://example.com", {
          body: JSON.stringify({ content: "x".repeat(200) }),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
        64,
      ),
    ).rejects.toMatchObject({
      code: "PAYLOAD_TOO_LARGE",
    });
  });

  it("rejects invalid JSON", async () => {
    await expect(
      readBoundedJson(
        new Request("https://example.com", {
          body: "{not-json}",
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }),
      ),
    ).rejects.toMatchObject({
      code: "INVALID_JSON",
    });
  });

  it("rejects requests that are not JSON", async () => {
    await expect(
      readBoundedJson(
        new Request("https://example.com", {
          body: "ok=true",
          headers: { "Content-Type": "text/plain" },
          method: "POST",
        }),
      ),
    ).rejects.toMatchObject({
      code: "UNSUPPORTED_MEDIA_TYPE",
    });
  });
});
