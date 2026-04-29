import { isDemoContext } from "@/lib/demo";
import { AIChatDrawer } from "./chat-drawer";

/** Server-only wrapper: skips rendering the AI chat UI on the demo host (no client bundle for drawer). */
export async function AIChatDrawerServer() {
  if (await isDemoContext()) return null;
  return <AIChatDrawer />;
}
