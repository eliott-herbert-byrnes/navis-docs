import { beforeEach, describe, expect, it, vi } from "vitest";

const mockProcedureFindUnique = vi.fn();
const mockProcedureChunkDeleteMany = vi.fn();
const mockExecuteRaw = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    procedure: {
      findUnique: (...args: unknown[]) => mockProcedureFindUnique(...args),
    },
    procedureChunk: {
      deleteMany: (...args: unknown[]) => mockProcedureChunkDeleteMany(...args),
    },
    $executeRaw: (...args: unknown[]) => mockExecuteRaw(...args),
  },
}));

vi.mock("@/lib/demo", () => ({
  isDemoContext: vi.fn().mockResolvedValue(false),
}));

vi.mock("@/lib/deploy-mode", () => ({
  isCloud: vi.fn().mockReturnValue(true),
  isSelfHosted: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/ai/embeddings", () => ({
  generateEmbedding: vi.fn(),
}));

import { generateProcedureEmbeddings } from "@/features/ai/actions/generate-embeddings";

describe("generateProcedureEmbeddings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips embedding work on cloud", async () => {
    await generateProcedureEmbeddings("proc-1");

    expect(mockProcedureFindUnique).not.toHaveBeenCalled();
    expect(mockProcedureChunkDeleteMany).not.toHaveBeenCalled();
    expect(mockExecuteRaw).not.toHaveBeenCalled();
  });
});
