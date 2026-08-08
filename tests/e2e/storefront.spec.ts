import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/catalogo",
  "/carrito",
  "/checkout",
  "/pedido",
  "/cuenta/acceder",
  "/cuenta/recuperar",
];

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

test("customer account offers optional registration and login", async ({
  page,
}) => {
  await page.goto("/cuenta/acceder");

  await expect(
    page.getByRole("heading", { name: "Inicia sesión" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Crea tu cuenta" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Crear cuenta" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Olvidé mi contraseña" }),
  ).toHaveCount(0);
});

test("password recovery does not promise automatic email", async ({ page }) => {
  await page.goto("/cuenta/recuperar");

  await expect(
    page.getByRole("heading", { name: "Recuperación no disponible" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar enlace" })).toHaveCount(
    0,
  );
});

test("customer registration keeps data and explains password progress", async ({
  page,
}) => {
  await page.goto("/cuenta/acceder");

  const registration = page
    .getByRole("heading", { name: "Crea tu cuenta" })
    .locator("..");
  const fullName = registration.getByLabel("Nombre completo");
  const phone = registration.getByLabel("Celular");
  const email = registration.getByLabel("Correo electrónico");
  const password = registration.getByLabel("Contraseña", { exact: true });
  const confirmation = registration.getByLabel("Repetir contraseña");
  const submit = registration.getByRole("button", { name: "Crear cuenta" });

  await fullName.fill("David Sánchez");
  await phone.fill("3126485885");
  await email.fill("cliente@example.com");
  await password.fill("12345678");
  await confirmation.fill("87654321");

  await expect(registration.getByText("Mínimo 8 caracteres")).toContainText(
    "Cumplido.",
  );
  await expect(registration.getByText("Al menos una letra")).toContainText(
    "Pendiente.",
  );
  await expect(
    registration.getByText("Ambas contraseñas coinciden"),
  ).toContainText("Pendiente.");
  await expect(submit).toBeDisabled();
  await expect(fullName).toHaveValue("David Sánchez");
  await expect(phone).toHaveValue("3126485885");
  await expect(email).toHaveValue("cliente@example.com");

  await password.fill("odissey2026");
  await confirmation.fill("odissey2026");

  await expect(registration.getByText("Al menos una letra")).toContainText(
    "Cumplido.",
  );
  await expect(
    registration.getByText("Ambas contraseñas coinciden"),
  ).toContainText("Cumplido.");
  await expect(submit).toBeEnabled();
});

test("customer account entry is visible from the storefront", async ({
  page,
}) => {
  await page.goto("/");

  const accountLink = page.getByRole("link", {
    name: "Acceder o crear mi cuenta",
  });
  await expect(accountLink).toBeVisible();
  await accountLink.click();
  await expect(page).toHaveURL(/\/cuenta\/acceder$/);
});

test("customer order history stays protected without a session", async ({
  page,
}) => {
  await page.goto("/cuenta");

  await expect(page).toHaveURL(/\/cuenta\/acceder$/);
  await expect(
    page.getByRole("heading", { name: "Compra con menos pasos." }),
  ).toBeVisible();
});

test("public pages expose canonical and structured SEO data", async ({
  page,
}) => {
  await page.goto("/");

  const homeCanonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  expect(new URL(homeCanonical ?? "").pathname).toBe("/");
  const storeStructuredData = await page
    .locator('script[type="application/ld+json"]')
    .textContent();
  expect(storeStructuredData).toContain('"@type":"Organization"');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /opengraph-image/,
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );

  await page.goto("/catalogo?search=audifonos");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  const catalogCanonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute("href");
  expect(new URL(catalogCanonical ?? "").pathname).toBe("/catalogo");

  await page.goto("/carrito");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
});

test("category and product pages are indexable commerce documents", async ({
  page,
}) => {
  await page.goto("/categoria/audifonos");
  await expect(page).toHaveURL(/\/categoria\/audifonos$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Audífonos" }),
  ).toBeVisible();

  await page.goto("/producto/audifonos-bluetooth-nova");
  await expect(page).toHaveURL(/\/producto\/audifonos-bluetooth-nova$/);

  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  expect(structuredData.join(" ")).toContain('"@type":"Product"');
  expect(structuredData.join(" ")).toContain('"priceCurrency":"COP"');
  expect(structuredData.join(" ")).toContain('"@type":"BreadcrumbList"');
});

test("SEO discovery endpoints are available", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("User-Agent:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(sitemap.headers()["content-type"]).toContain("application/xml");
  expect(await sitemap.text()).toContain("/producto/audifonos-bluetooth-nova");

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect(await manifest.json()).toMatchObject({
    lang: "es-CO",
    name: "Odissey Technology",
  });

  for (const imagePath of ["/opengraph-image", "/twitter-image"]) {
    const image = await request.get(imagePath);
    expect(image.ok()).toBe(true);
    expect(image.headers()["content-type"]).toContain("image/png");
  }
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
