import { ProcessStyle } from "@prisma/client";

export const getInitialContentForStyle = (style: ProcessStyle) => {
  switch (style) {
    case "STEPS":
      return { steps: [{ text: "" }] };
    case "RAW":
      return { blocks: [{ type: "paragraph", text: "" }] };
    case "FLOW":
      return { nodes: [], edges: [] }; 
    case "YESNO":
      return { cards: [{ question: "", yes: null, no: null }] };
    default:
      return {};
  }
};
