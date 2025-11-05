export interface ProcessChunk {
  chunkIndex: number;
  chunkText: string;
}

export function chunkProcessContent(
  contentText: string,
  maxChunkSize: number = 600
): ProcessChunk[] {
  const chunks: ProcessChunk[] = [];

  const paragraphs = contentText.split(/\n\n+/);

  let currentChunk = "";
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) continue;

    if (currentChunk && currentChunk.length + trimmed.length > maxChunkSize) {
      chunks.push({
        chunkIndex: chunkIndex++,
        chunkText: currentChunk.trim(),
      });
      currentChunk = trimmed;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + trimmed;
    }
  }

  if (currentChunk) {
    chunks.push({
      chunkIndex: chunkIndex,
      chunkText: currentChunk.trim(),
    });
  }

  return chunks;
}
