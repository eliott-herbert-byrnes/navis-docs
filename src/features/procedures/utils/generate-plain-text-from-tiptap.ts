import { JsonObject } from "@prisma/client/runtime/client";

export function generatePlainTextFromTiptap(contentJSON: JsonObject): string {
  if (!contentJSON || typeof contentJSON !== "object") {
    return "";
  }

  // Detect format and extract accordingly
  if(contentJSON.flow){
    return extractTextFromFlow(contentJSON.flow as JsonObject, contentJSON);
  } else if (contentJSON.tiptap) {
    return extractTextFromTiptap(contentJSON);
  } else if (Array.isArray(contentJSON.steps)) {
    return extractTextFromSteps(contentJSON.steps);
  } else if (contentJSON.yesno) {
    return extractTextFromYesNo(contentJSON.yesno as JsonObject);
  }

  return "";
}

// 1. RAW: Tiptap format (original logic)
function extractTextFromTiptap(contentJSON: JsonObject): string {
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

// 2. STEPS: Step-by-step format
function extractTextFromSteps(steps: unknown[]): string {
  let text = "";

  for (const step of steps) {
    if (typeof step === "object" && step !== null) {
      const stepObj = step as {
        id?: string;
        title?: string;
        description?: string;
        isExpanded?: boolean;
      };

      if (stepObj.title) {
        text += stepObj.title + "\n\n";
      }

      if (stepObj.description) {
        text += stepObj.description + "\n\n";
      }
    }
  }

  return text.trim();
}

// 3. FLOW: Flowchart format
function extractTextFromFlow(flow: JsonObject, contentJSON?: JsonObject): string {
  let text = "";

  if (Array.isArray(flow.nodes)) {
    for (const node of flow.nodes) {
      if (typeof node === "object" && node !== null) {
        const nodeObj = node as {
          type?: string;
          data?: { label?: string; description?: string };
        };

        // Add node type as context
        if (nodeObj.type) {
          const typeLabel =
            nodeObj.type.charAt(0).toUpperCase() + nodeObj.type.slice(1);
          text += `[${typeLabel}] `;
        }

        // Add label
        if (nodeObj.data?.label) {
          text += nodeObj.data.label;
        }

        // Add description if available
        if (nodeObj.data?.description) {
          text += "\n" + nodeObj.data.description;
        }

        text += "\n\n";
      }
    }
  }

  // Optionally include edge information
  if (Array.isArray(flow.edges)) {
    text += "\nProcedure Flow:\n";
    for (const edge of flow.edges) {
      if (typeof edge === "object" && edge !== null) {
        const edgeObj = edge as {
          source?: string;
          target?: string;
          label?: string;
        };

        if (edgeObj.source && edgeObj.target) {
          text += `${edgeObj.source} → ${edgeObj.target}`;
          if (edgeObj.label) {
            text += ` (${edgeObj.label})`;
          }
          text += "\n";
        }
      }
    }
  }

  
  if(contentJSON){
    const tiptapText = extractTextFromTiptap(contentJSON).trim();
    if(tiptapText.length > 0){
      const combined = text.trim() + "\n\n" + tiptapText;
      return combined.trim()
    }
  }

  return text.trim();
}

// 4. YESNO: Decision tree format
function extractTextFromYesNo(yesno: JsonObject): string {
  let text = "";

  if (Array.isArray(yesno.nodes)) {
    for (const node of yesno.nodes) {
      if (typeof node === "object" && node !== null) {
        const nodeObj = node as {
          id?: string;
          question?: string;
          description?: string;
          isEndNode?: boolean;
          endMessage?: string;
          yesNodeId?: string;
          noNodeId?: string;
        };

        // Add question
        if (nodeObj.question) {
          text += nodeObj.question + "\n";
        }

        // Add description
        if (nodeObj.description) {
          text += nodeObj.description + "\n";
        }

        // Add end message if it's an end node
        if (nodeObj.isEndNode && nodeObj.endMessage) {
          text += "Outcome: " + nodeObj.endMessage + "\n";
        }

        // Add decision paths
        if (nodeObj.yesNodeId || nodeObj.noNodeId) {
          text += "Decisions: ";
          if (nodeObj.yesNodeId) text += `Yes → ${nodeObj.yesNodeId} `;
          if (nodeObj.noNodeId) text += `No → ${nodeObj.noNodeId}`;
          text += "\n";
        }

        text += "\n";
      }
    }
  }

  return text.trim();
}
