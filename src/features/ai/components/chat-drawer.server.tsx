import { isAiEnabled } from "@/lib/ai/ai-enabled";
import { isDemoContext } from "@/lib/demo";
import { AIChatDrawer } from "./chat-drawer";

/** Server-only wrapper: skips rendering the AI chat UI on demo/cloud (no client bundle for drawer). */
export async function AIChatDrawerServer() {
  if (await isDemoContext()) return null;
  if (!isAiEnabled()) return null;
  return <AIChatDrawer />;
}
