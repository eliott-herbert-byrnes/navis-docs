import { ProcessStyle } from "@prisma/client";

export const getInitialContentForStyle = (style: ProcessStyle) => {
  switch (style) {
    case "STEPS":
      return { steps: [{ heading: "", description: "" }] };
    case "RAW":
      return {
        tiptap: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [],
            },
          ],
        },
      };
    case "FLOW":
      return { nodes: [], edges: [] };
    case "YESNO":
      return {
        cards: [{ id: "1", question: "", yesNext: null, noNext: null }],
      };
    default:
      return {};
  }
};
