import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  if (!_client) _client = new OpenAI({ apiKey });
  return _client;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8000),
  });
  return response.data[0].embedding;
}
