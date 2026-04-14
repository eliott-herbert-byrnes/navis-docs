import OpenAI from "openai";

export function getOpenAI(apiKey?: string) {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("No OpenAI API key available");
  }
  return new OpenAI({ apiKey: key });
}

export async function generateEmbedding(
  text: string,
  openAiApiKey?: string,
): Promise<number[]> {
  const response = await getOpenAI(openAiApiKey).embeddings.create({
    model: "text-embedding-3-small",
    input: text.substring(0, 8000),
  });
  return response.data[0].embedding;
}
