import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Never throw at import time. This only runs when called.
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  if (!_client) _client = new Anthropic({ apiKey });
  return _client;
}
