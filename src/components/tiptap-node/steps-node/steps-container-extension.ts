import { Node } from "@tiptap/core";

export const StepsContainer = Node.create({
  name: "stepsContainer",
  group: "block",
  content: "stepItem+",
  isolating: true,
  defining: true,
  parseHTML() {
    return [{ tag: "div[data-steps-container]" }];
  },
  renderHTML() {
    return ["div", { "data-steps-container": "" }, 0];
  },
});

export const StepItem = Node.create({
  name: "stepItem",
  content: "stepTitle stepBody",
  parseHTML() {
    return [{ tag: "div[data-step-item]" }];
  },
  renderHTML() {
    return ["div", { "data-step-item": "" }, 0];
  },
});

export const StepTitle = Node.create({
  name: "stepTitle",
  content: "inline*",
  marks: "bold italic strike underline link highlight code",
  parseHTML() {
    return [{ tag: "p[data-step-title]" }];
  },
  renderHTML() {
    return ["p", { "data-step-title": "" }, 0];
  },
});

export const StepBody = Node.create({
  name: "stepBody",
  content: "block+",
  isolating: true,
  parseHTML() {
    return [{ tag: "div[data-step-body]" }];
  },
  renderHTML() {
    return ["div", { "data-step-body": "" }, 0];
  },
});
