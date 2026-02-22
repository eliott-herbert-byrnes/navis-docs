import { describe, expect, it } from "vitest";
import { generatePlainTextFromTiptap } from "@/features/procedures/utils/generate-plain-text-from-tiptap";

describe("generatePlainTextFromTiptap", () => {
  it("extracts title and rich body text from custom stepsContainer nodes", () => {
    const content = {
      tiptap: {
        type: "doc",
        content: [
          {
            type: "stepsContainer",
            content: [
              {
                type: "stepItem",
                content: [
                  {
                    type: "stepTitle",
                    content: [{ type: "text", text: "Open the dashboard" }],
                  },
                  {
                    type: "stepBody",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "Navigate to the admin panel." }],
                      },
                      {
                        type: "codeBlock",
                        attrs: { language: null },
                        content: [{ type: "text", text: "pnpm dev" }],
                      },
                    ],
                  },
                ],
              },
              {
                type: "stepItem",
                content: [
                  {
                    type: "stepTitle",
                    content: [{ type: "text", text: "Verify the result" }],
                  },
                  {
                    type: "stepBody",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "Check the confirmation banner." }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    const text = generatePlainTextFromTiptap(content as never);

    expect(text).toContain("Open the dashboard");
    expect(text).toContain("Navigate to the admin panel.");
    expect(text).toContain("pnpm dev");
    expect(text).toContain("Verify the result");
    expect(text).toContain("Check the confirmation banner.");
    expect(text).not.toContain("add new step");
  });

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
                    type: "paragraph",
                    content: [{ type: "text", text: "Use the admin credentials." }],
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
    expect(text).toContain("Use the admin credentials.");
    expect(text).toContain("pnpm dev");
    expect(text).toContain("Step 2");
    expect(text).toContain("Verify the result.");
    expect(text).not.toContain("add new step");
  });
});
