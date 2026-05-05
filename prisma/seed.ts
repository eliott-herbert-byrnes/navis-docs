/**
 * Default Prisma seed: no-op by design.
 *
 * Self-hosted installs provision an organization on first sign-in
 * (`src/features/auth/lib/ensure-default-org-for-user.ts`).
 *
 * For the full wiping demo dataset (requires DEMO_* env vars), run:
 *   pnpm exec tsx prisma/seed-demo.ts
 */
async function main() {
  console.log(
    "[prisma seed] skipped — org is created on first sign-in when no membership exists.",
  );
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
