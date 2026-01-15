import { expect, test } from "@playwright/test";
import { generateUniqueEmail, testUsers } from "./fixtures/test-data";

test.describe("Authentication", () => {
  test("should redirect unauthenticated users from dashboard to login", async ({
    page,
  }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
  });

  test("should navigate from login to register page", async ({ page }) => {
    await page.goto("/login");

    await page.click("text=Sign up");

    await expect(page).toHaveURL("/register");
  });

  test("should navigate from register to login page", async ({ page }) => {
    await page.goto("/register");

    await page.click("text=Sign in");

    await expect(page).toHaveURL("/login");
  });

  test("should show validation error for invalid email", async ({ page }) => {
    await page.goto("/login");

    await page.fill("input[type='email']", "invalid-email");
    await page.fill("input[type='password']", "password123");
    await page.click("button[type='submit']");

    await expect(page.locator("text=Invalid email")).toBeVisible();
  });

  test("should show validation error for short password", async ({ page }) => {
    await page.goto("/login");

    await page.fill("input[type='email']", "test@example.com");
    await page.fill("input[type='password']", "short");
    await page.click("button[type='submit']");

    await expect(
      page.locator("text=Password must be at least 8 characters"),
    ).toBeVisible();
  });

  test("should sign up new user and redirect to dashboard", async ({
    page,
  }) => {
    const uniqueEmail = generateUniqueEmail();

    await page.goto("/register");

    await page.fill("input[name='name']", testUsers.newUser.name);
    await page.fill("input[type='email']", uniqueEmail);
    await page.fill("input[name='password']", testUsers.newUser.password);
    await page.fill(
      "input[name='confirmPassword']",
      testUsers.newUser.password,
    );

    await page.click("button[type='submit']");

    await expect(page).toHaveURL("/dashboard", { timeout: 10000 });
  });

  test("should show error for password mismatch on register", async ({
    page,
  }) => {
    await page.goto("/register");

    await page.fill("input[name='name']", "Test User");
    await page.fill("input[type='email']", "test@example.com");
    await page.fill("input[name='password']", "Password123!");
    await page.fill("input[name='confirmPassword']", "DifferentPassword123!");

    await page.click("button[type='submit']");

    await expect(page.locator("text=Passwords don't match")).toBeVisible();
  });
});
