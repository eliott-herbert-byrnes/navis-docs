import { test, expect } from "@playwright/test";
import {
  E2E_DEPARTMENT_ID,
  E2E_TEAM_ID,
  resetE2eDraftProcedures,
} from "./helpers/seed";

test.describe("Create procedure", () => {
  test.beforeEach(async () => {
    await resetE2eDraftProcedures();
  });

  test("creates a draft procedure from procedure base", async ({ page }) => {
    const title = `E2E Procedure ${Date.now()}`;

    await page.goto("/procedure-base/create");
    await expect(
      page.getByRole("heading", { name: "Create Procedure" }),
    ).toBeVisible();

    await page.getByRole("combobox").nth(0).click();
    await page.getByRole("option", { name: "Operations" }).click();
    await page.getByRole("combobox").nth(1).click();
    await page.getByRole("option", { name: "General" }).click();

    await page.locator("#procedureTitle").fill(title);
    await page.locator("#procedureDescription").fill("Created by Playwright");

    await page.getByRole("button", { name: "Submit" }).click();

    await page.waitForURL(
      new RegExp(
        `/departments/${E2E_DEPARTMENT_ID}/${E2E_TEAM_ID}/procedures/[^/]+/edit`,
      ),
      { timeout: 30_000 },
    );

    await expect(page.getByRole("button", { name: "Publish" })).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });
});
