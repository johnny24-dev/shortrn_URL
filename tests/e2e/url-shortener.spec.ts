import { expect, test } from "@playwright/test";

test("routes the landing page URL through registration", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /short links that stay easy to manage/i,
    }),
  ).toBeVisible();

  await page.getByLabel("Destination URL").fill("https://example.com/long-url");
  await page.getByRole("button", { name: /continue/i }).click();

  await expect(page).toHaveURL(/\/register\?url=/);
  await expect(
    page.getByRole("heading", { name: /create your account/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /log in/i }),
  ).toHaveAttribute("href", /\/login\?url=/);
});
