import { isSelfHosted } from "@/lib/deploy-mode";
import { TRPCError } from "@trpc/server";

export const AI_SELF_HOSTED_ONLY_USER =
  "AI features are available on self-hosted Navis Docs only.";

export const AI_SELF_HOSTED_ONLY_ADMIN =
  "AI chat and AI import are available on self-hosted Navis Docs. See the self-hosting guide in the README.";

export function isAiEnabled(): boolean {
  return isSelfHosted();
}

/** Use at the top of tRPC mutations/queries and server actions that must not run on cloud. */
export function assertAiEnabled(): void {
  if (!isAiEnabled()) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: AI_SELF_HOSTED_ONLY_USER,
    });
  }
}
