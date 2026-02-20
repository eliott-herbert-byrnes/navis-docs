import { describe, expect, it } from "vitest";
import { generatePlainTextFromTiptap } from "@/features/procedures/utils/generate-plain-text-from-tiptap";

describe("generatePlainTextFromTiptap", () => {
  it("extracts heading, paragraph, and code text from step-style ordered list content", () => {
    const content = {
      tiptap: {
        type: "doc",
        content: [
          {
            type: "orderedList",
            attrs: { listType: "steps" },
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Step 1" }],
                  },
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Open the dashboard." }],
                  },
                  {
                    type: "codeBlock",
                    content: [{ type: "text", text: "pnpm dev" }],
                  },
                  {
                    type: "image",
                    attrs: { src: "https://example.com/one.png" },
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "heading",
                    attrs: { level: 2 },
                    content: [{ type: "text", text: "Step 2" }],
                  },
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Verify the result." }],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const text = generatePlainTextFromTiptap(content as never);

    expect(text).toContain("Step 1");
    expect(text).toContain("Open the dashboard.");
    expect(text).toContain("pnpm dev");
    expect(text).toContain("Step 2");
    expect(text).toContain("Verify the result.");
  });
});
