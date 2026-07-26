import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/catalogo", "/carrito", "/checkout", "/pedido"];

for (const route of publicRoutes) {
  test(`${route} renders without horizontal overflow`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    const response = await page.goto(route);

    expect(response?.ok()).toBeTruthy();
    await expect(page.locator("main")).toBeVisible();
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
  });
}

test("the skip link moves focus to the main content", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", {
    name: "Saltar al contenido principal",
  });
  await expect(skipLink).toBeFocused();
  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("order lookup exposes labelled controls and validation", async ({
  page,
}) => {
  await page.goto("/pedido");

  await expect(page.getByLabel("Referencia del pedido")).toBeVisible();
  await expect(page.getByLabel("Correo usado en la compra")).toBeVisible();
  await page.getByRole("button", { name: "Consultar pedido" }).click();
  await expect(page.getByLabel("Referencia del pedido")).toBeFocused();
});

test("a customer can add a product and reach the checkout form", async ({
  page,
}) => {
  await page.goto("/catalogo");

  await page.getByRole("heading", { name: "Audífonos Bluetooth Nova" }).click();
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Audífonos Bluetooth Nova",
    }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Agregar al carrito" }).click();
  await expect(page.getByText("Blanco fue agregado al carrito.")).toBeVisible();
  await page
    .getByRole("link", { name: "Carrito, 1 producto", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: "Tu carrito" })).toBeVisible();

  await page.getByRole("link", { name: "Continuar al checkout" }).click();
  await expect(page.getByLabel("Nombre completo")).toBeVisible();
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByRole("radiogroup", { name: "Entrega" })).toBeVisible();
  await expect(
    page.getByRole("radiogroup", { name: "Forma de pago" }),
  ).toBeVisible();
});

test("admin remains closed without an authenticated session", async ({
  page,
}) => {
  await page.goto("/admin");

  await expect(
    page.getByRole("heading", { name: "Panel administrativo" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
});

test("security headers and bounded JSON are active", async ({ request }) => {
  const pageResponse = await request.get("/");
  expect(pageResponse.headers()["x-content-type-options"]).toBe("nosniff");
  expect(pageResponse.headers()["x-frame-options"]).toBe("DENY");
  expect(pageResponse.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );

  const apiResponse = await request.post("/api/orders/status", {
    data: "not-json",
    headers: { "Content-Type": "text/plain" },
  });
  expect(apiResponse.status()).toBe(415);
});
