import { JsonObject } from "@prisma/client/runtime/library";

export function generatePlainTextFromTiptap(contentJSON: JsonObject): string {
    if (!contentJSON || typeof contentJSON !== "object") {
      return "";
    }
  
    let text = "";
  
    function extractText(node: JsonObject): void {
      if (!node) return;
  
      if (node.text) {
        text += node.text;
      }
  
      if (Array.isArray(node.content)) {
        node.content.forEach((child) => {
          if (typeof child === "object" && child !== null) {
            extractText(child as JsonObject);
            if (
              (child as { type?: string }).type === "paragraph" ||
              (child as { type?: string }).type === "heading" ||
            (child as { type?: string }).type === "listItem"
          ) {
            text += "\n";
          }
          }
        });
      }
    }
  
    extractText(contentJSON.tiptap as JsonObject);
  
    return text.trim();
  }