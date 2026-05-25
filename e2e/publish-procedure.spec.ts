import { test, expect } from "@playwright/test";
import {
  E2E_DEPARTMENT_ID,
  E2E_TEAM_ID,
  resetE2eDraftProcedures,
} from "./helpers/seed";

test.describe("Publish procedure", () => {
  test.beforeEach(async () => {
    await resetE2eDraftProcedures();
  });

  test("publishes a newly created draft procedure", async ({ page }) => {
    const title = `E2E Publish ${Date.now()}`;

    await page.goto("/procedure-base/create");
    await page.getByRole("combobox").nth(0).click();
    await page.getByRole("option", { name: "Operations" }).click();
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "General" }).click();
    await page.locator("#procedureTitle").fill(title);
    await page.locator("#procedureDescription").fill("Publish flow test");
    await page.getByRole("button", { name: "Submit" }).click();

    await page.waitForURL(/\/edit$/, { timeout: 30_000 });
    await page.getByRole("button", { name: "Publish" }).click();

    await page.waitForURL(/\/procedures\/[^/]+$/, { timeout: 30_000 });
    await expect(page.getByText(/Published/i)).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();

    await page.goto(
      `/departments/${E2E_DEPARTMENT_ID}/${E2E_TEAM_ID}/procedures`,
    );
    await expect(page.getByText(title)).toBeVisible();
  });
});
