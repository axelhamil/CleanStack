import { expect, test } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Next\.js Clean Architecture/i);
  });

  test("login page loads successfully", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
  });

  test("register page loads successfully", async ({ page }) => {
    await page.goto("/register");

    await expect(page.locator("input[name='name']")).toBeVisible();
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[name='password']")).toBeVisible();
  });
});
