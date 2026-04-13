/**
 * Server-side deploy mode. Use `NEXT_PUBLIC_DEPLOY_MODE` in client components for UI.
 */
export const isCloud = () => process.env.DEPLOY_MODE !== "self-hosted";
export const isSelfHosted = () => process.env.DEPLOY_MODE === "self-hosted";
