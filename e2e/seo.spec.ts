import { expect, test } from "@playwright/test";

test.describe("public profile SEO", () => {
  test("exposes crawlable metadata for a reported scammer", async ({ page }) => {
    await page.route("**/api/public/scammers/seo-test", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "seo-test",
          name: "SEO Test Profile",
          country: "MX",
          reports: 3,
          profile_picture: null,
          products: ["Crypto", "Marketplace"],
          status: true,
          created_at: "2026-08-10T00:00:00.000Z",
        }),
      });
    });
    await page.route(
      "**/api/public/scammers/seo-test/calendar/*",
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({}),
        });
      },
    );

    await page.goto("/estafadores/seo-test");

    await expect(
      page.getByRole("heading", { name: "SEO Test Profile" }),
    ).toBeVisible();
    await expect(page).toHaveTitle(
      "SEO Test Profile: reportes de fraude | FraudeBot",
    );
    await expect(
      page.locator(
        'meta[name="description"][content*="SEO Test Profile"]',
      ),
    ).toHaveAttribute("content", /3 reportes comunitarios.*Crypto, Marketplace/);
    await expect(
      page.locator(
        'meta[name="robots"][content="index,follow,max-image-preview:large"]',
      ),
    ).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "http://localhost:4173/estafadores/seo-test",
    );

    const structuredData = JSON.parse(
      (await page
        .locator('script[type="application/ld+json"]')
        .textContent()) ?? "{}",
    );
    expect(structuredData).toMatchObject({
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: "SEO Test Profile",
      },
    });
  });

  test("marks missing profiles as noindex", async ({ page }) => {
    await page.route("**/api/public/organizations/missing-seo", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({ message: "Not found" }),
      });
    });

    await page.goto("/empresas/missing-seo");

    await expect(
      page.getByRole("heading", { name: "Perfil no encontrado" }),
    ).toBeVisible();
    await expect(
      page.locator('meta[name="robots"][content="noindex,follow"]'),
    ).toHaveCount(1);
  });

  test("publishes crawler directives", async ({ request }) => {
    const response = await request.get("/robots.txt");

    expect(response.ok()).toBe(true);
    const body = await response.text();
    expect(body).toContain("User-agent: *");
    expect(body).toContain("Disallow: /reportar");
    expect(body).toContain("Disallow: /api/");
  });
});
