import { chromium, type FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";
import { E2E_USER_EMAIL, seedE2eFixtures } from "./helpers/seed";

const authFile = path.join(__dirname, ".auth", "admin.json");

async function fetchOtp(baseURL: string, email: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(
      `${baseURL}/api/e2e/otp?email=${encodeURIComponent(email)}`,
    );
    if (response.ok) {
      const body = (await response.json()) as { code?: string };
      if (body.code) return body.code;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for OTP for ${email}`);
}

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL ?? "http://127.0.0.1:3000";

  await seedE2eFixtures();

  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/auth/sign-in`);
  await page.getByPlaceholder("captain.scott@example.com").fill(E2E_USER_EMAIL);
  await page.getByRole("button", { name: /Email me a code/i }).click();
  await page.getByText("Enter verification code").waitFor();

  const code = await fetchOtp(baseURL, E2E_USER_EMAIL);
  await page.locator("#otp").fill(code);
  await page.getByRole("button", { name: "Verify" }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

  await page.context().storageState({ path: authFile });
  await browser.close();
}

export default globalSetup;
