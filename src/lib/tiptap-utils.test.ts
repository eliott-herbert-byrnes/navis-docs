import { describe, expect, it } from "vitest";
import {
  extractManagedImagePathsFromContent,
  extractManagedPathFromImageSrc,
} from "@/lib/tiptap-utils";

describe("tiptap image path helpers", () => {
  it("extracts managed path from proxy URL", () => {
    const src =
      "/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2Fproc-1%2Fabc.png";
    expect(extractManagedPathFromImageSrc(src)).toBe(
      "orgs/org-1/procedures/proc-1/abc.png",
    );
  });

  it("collects unique managed image paths from tiptap content", () => {
    const content = {
      tiptap: {
        type: "doc",
        content: [
          {
            type: "image",
            attrs: {
              src: "/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2Fproc-1%2Fone.png",
            },
          },
          {
            type: "paragraph",
            content: [
              {
                type: "image",
                attrs: {
                  src: "/api/procedure-images?path=orgs%2Forg-1%2Fprocedures%2Fproc-1%2Ftwo.png",
                },
              },
            ],
          },
          {
            type: "image",
            attrs: { src: "https://example.com/unmanaged.png" },
          },
        ],
      },
    };

    const paths = extractManagedImagePathsFromContent(content);
    expect(paths).toEqual(
      new Set([
        "orgs/org-1/procedures/proc-1/one.png",
        "orgs/org-1/procedures/proc-1/two.png",
      ]),
    );
  });
});
