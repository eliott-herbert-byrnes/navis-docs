/**
 * Deploy mode (same env as client: `NEXT_PUBLIC_DEPLOY_MODE`). Values: `"cloud"` | `"self-hosted"`.
 */
export const isCloud = () => process.env.NEXT_PUBLIC_DEPLOY_MODE === "cloud";

export const isSelfHosted = () =>
  process.env.NEXT_PUBLIC_DEPLOY_MODE === "self-hosted";
