import { test, expect } from "@playwright/test";

test.describe("Subscription", () => {
  test("shows self-hosted subscription management for admins", async ({
    page,
  }) => {
    await page.goto("/subscription");

    await expect(page.getByRole("heading", { name: "Subscription" })).toBeVisible();
    await expect(
      page.getByText(/Manage the subscription for this organization/i),
    ).toBeVisible();
    await expect(
      page.getByText(/This deployment runs on your infrastructure/i),
    ).toBeVisible();
  });
});
