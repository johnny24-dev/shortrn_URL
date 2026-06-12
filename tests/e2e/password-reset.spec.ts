import { expect, test } from "@playwright/test";

test("supports the forgot-password and reset-password flow", async ({
  page,
}) => {
  await page.goto("/login");

  await expect(page.getByRole("link", { name: /forgot password/i })).toHaveAttribute(
    "href",
    "/forgot-password",
  );

  await page.route("**/api/password-reset/request", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("/forgot-password");
  await expect(
    page.getByRole("heading", { name: /forgot your password/i }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(
    page.getByRole("button", { name: /send reset link/i }),
  ).toBeVisible();

  await page.getByLabel("Email").fill("user@example.com");
  await page.getByRole("button", { name: /send reset link/i }).click();
  await expect(
    page.getByText(/we sent a reset link/i),
  ).toBeVisible();

  await page.route("**/api/password-reset/confirm", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("/reset-password?token=test-token");
  await expect(
    page.getByRole("heading", { name: /set a new password/i }),
  ).toBeVisible();
  await expect(page.getByLabel("New password")).toBeVisible();
  await page.getByLabel("New password").fill("new-password-123");
  await page.getByLabel("Confirm password").fill("new-password-123");
  await page.getByRole("button", { name: /update password/i }).click();
  await expect(page.getByText(/password updated/i)).toBeVisible();
});
