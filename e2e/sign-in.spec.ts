import { test, expect } from "@playwright/test";
import { E2E_USER_EMAIL } from "./helpers/seed";

test.describe("Sign in", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("completes email OTP sign-in", async ({ page }) => {
    await page.goto("/auth/sign-in");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

    await page.getByPlaceholder("captain.scott@example.com").fill(E2E_USER_EMAIL);
    await page.getByRole("button", { name: /Email me a code/i }).click();
    await expect(page.getByText("Enter verification code")).toBeVisible();

    const otpResponse = await page.request.get(
      `/api/e2e/otp?email=${encodeURIComponent(E2E_USER_EMAIL)}`,
    );
    expect(otpResponse.ok()).toBeTruthy();
    const { code } = (await otpResponse.json()) as { code: string };

    await page.locator("#otp").fill(code);
    await page.getByRole("button", { name: "Verify" }).click();

    await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: /Dashboard/i })).toBeVisible();
  });
});
