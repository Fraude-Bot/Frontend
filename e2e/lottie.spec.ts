import { expect, test } from "@playwright/test";

test("loads the 404 lottie animation in 404 page", async ({ page }) => {
  await page.goto("/404");

  await expect(page.locator(".lottie-player.lottie-404")).toBeVisible();
});

test("loads the lottie animation when searching for reports", async ({ page }) => {
  let releaseSearch = () => {};
  const pendingSearch = new Promise<void>((resolve) => {
    releaseSearch = resolve;
  });

  await page.route("**/api/public/reports/**", async (route) => {
    await pendingSearch;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        total: 0,
        page: 1,
        count: 0,
      }),
    });
  });

  await page.goto("/busqueda?q=000000000000000000000000000000000000000");
  await expect(page.locator(".lottie-player.lottie-robot")).toBeVisible();
  releaseSearch();
});

test("loads the lottie animation when no reports are found", async ({ page }) => {
  await page.route("**/api/public/reports/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: [],
        total: 0,
        page: 1,
        count: 0,
      }),
    });
  });

  await page.goto("/busqueda?q=000000000000000000000000000000000000000");

  await expect(page.locator(".lottie-player.lottie-not-found")).toBeVisible();
});