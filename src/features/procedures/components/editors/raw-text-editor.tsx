"use client";

import {
  useEditor,
  EditorContent,
  JSONContent,
  Content,
  EditorContext,
} from "@tiptap/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TextSelection, EditorState } from "@tiptap/pm/state";

// --- Tiptap Core Extensions ---
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import { Image } from "@tiptap/extension-image";
import { Selection } from "@tiptap/extensions";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import { Button } from "@/components/tiptap-ui-primitive/button";

// --- UI Primitives ---
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/image-upload-node/image-upload-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";
import "@/components/tiptap-node/steps-node/steps-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import { ColorHighlightPopover } from "@/components/tiptap-ui/color-highlight-popover";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

import "./tiptap-styles.css";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import {
  createProcedureImageUploadHandler,
  MAX_FILE_SIZE,
} from "@/lib/tiptap-utils";
import {
  StepBody,
  StepItem,
  StepsContainer,
  StepTitle,
} from "@/components/tiptap-node/steps-node/steps-container-extension";

type ProcedureContent = {
  tiptap?: JSONContent;
};

type RawTextEditorProps = {
  procedureId: string;
  content: ProcedureContent;
  onChange: (content: ProcedureContent) => void;
  isPreview: boolean;
  /** Hostname-based demo org: forces read-only regardless of editing mode */
  isDemo?: boolean;
};

export function RawTextEditor({
  procedureId,
  content,
  onChange,
  isPreview,
  isDemo = false,
}: RawTextEditorProps) {
  const readOnly = isPreview || isDemo;
  const initialContent = content?.tiptap || {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
  const toolbarRef = useRef<HTMLDivElement>(null);
  const uploadProcedureImage = useMemo(
    () => createProcedureImageUploadHandler(procedureId),
    [procedureId],
  );
  const pendingStepExitRef = useRef<number | null>(null);
  const [stepEditorContext, setStepEditorContext] = useState<
    "none" | "stepTitle" | "stepBody"
  >("none");

  // Defined before useEditor so they can be safely referenced in editorProps
  // and onSelectionUpdate without stale-closure issues.
  const getStepContext = useCallback((editorOrView: { state: EditorState }) => {
    const { $from } = editorOrView.state.selection;
    let containerDepth: number | null = null;
    let itemDepth: number | null = null;
    let titleDepth: number | null = null;
    let bodyDepth: number | null = null;

    for (let d = $from.depth; d > 0; d--) {
      const name = $from.node(d).type.name;
      if (containerDepth === null && name === "stepsContainer")
        containerDepth = d;
      if (itemDepth === null && name === "stepItem") itemDepth = d;
      if (titleDepth === null && name === "stepTitle") titleDepth = d;
      if (bodyDepth === null && name === "stepBody") bodyDepth = d;
    }

    if (containerDepth === null) return null;

    return {
      $from,
      containerDepth,
      itemDepth,
      titleDepth,
      bodyDepth,
      containerNode: $from.node(containerDepth),
      containerPos: $from.before(containerDepth),
      itemNode: itemDepth !== null ? $from.node(itemDepth) : null,
      itemPos: itemDepth !== null ? $from.before(itemDepth) : null,
    };
  }, []);

  const findFirstStepsContainer = useCallback(
    (editorOrView: {
      state: EditorState;
    }): { pos: number; nodeSize: number; childCount: number } | null => {
      let result: { pos: number; nodeSize: number; childCount: number } | null =
        null;
      editorOrView.state.doc.descendants((node, pos) => {
        if (result) return false;
        if (node.type.name === "stepsContainer") {
          result = {
            pos,
            nodeSize: node.nodeSize,
            childCount: node.childCount,
          };
          return false;
        }
        return true;
      });
      return result;
    },
    [],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        horizontalRule: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      StepsContainer,
      StepItem,
      StepTitle,
      StepBody,
      Typography,
      Selection,
      HorizontalRule,
      Highlight.configure({ multicolor: true }),
      Image,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 1,
        upload: uploadProcedureImage,
        onError: (error) => console.error("Upload failed:", error),
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Placeholder.configure({
        placeholder: "Start writing your procedure documentation...",
      }),
    ],
    content: initialContent,
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: "pt-16 sm:pt-0 max-w-none focus:outline-none p-4",
      },
      handleKeyDown: (_view, event) => {
        if (!_view.editable) return false;

        if (event.key !== "Enter") {
          pendingStepExitRef.current = null;
          return false;
        }

        const ctx = getStepContext(_view);
        if (!ctx) {
          pendingStepExitRef.current = null;
          return false;
        }

        // Case 1: Enter in stepTitle → move cursor into stepBody
        if (
          ctx.titleDepth !== null &&
          ctx.itemDepth !== null &&
          ctx.itemPos !== null &&
          ctx.itemNode !== null
        ) {
          // stepItem layout: [stepTitle, stepBody]
          // stepBodyPos = itemPos + 1 (open tag) + stepTitle.nodeSize
          const stepTitleNode = ctx.itemNode.child(0);
          const stepBodyPos = ctx.itemPos + 1 + stepTitleNode.nodeSize;
          const tr = _view.state.tr;
          // stepBodyPos + 1 = first position inside stepBody (before its first child)
          tr.setSelection(TextSelection.create(tr.doc, stepBodyPos + 1));
          _view.dispatch(tr);
          pendingStepExitRef.current = null;
          event.preventDefault();
          return true;
        }

        // Case 2: Enter in stepBody
        if (ctx.bodyDepth !== null) {
          const { $from, containerNode, containerPos, containerDepth } = ctx;

          // Only intercept Enter in paragraph nodes
          if ($from.parent.type.name !== "paragraph") {
            pendingStepExitRef.current = null;
            return false;
          }

          const isCurrentParagraphEmpty = $from.parent.content.size === 0;
          const isLastItem =
            ctx.itemDepth !== null
              ? $from.index(containerDepth) === containerNode.childCount - 1
              : false;
          const stepBodyNode = $from.node(ctx.bodyDepth);
          const isLastParagraphInBody =
            $from.index(ctx.bodyDepth) === stepBodyNode.childCount - 1;

          // Non-empty paragraph or not at the exit point → default behavior
          if (
            !isCurrentParagraphEmpty ||
            !isLastItem ||
            !isLastParagraphInBody
          ) {
            pendingStepExitRef.current = null;
            return false;
          }

          // First Enter on the empty exit paragraph → swallow and wait
          const currentPos = $from.pos;
          if (pendingStepExitRef.current !== currentPos) {
            pendingStepExitRef.current = currentPos;
            event.preventDefault();
            return true;
          }

          // Second Enter → insert paragraph after the stepsContainer and exit
          const exitPos = containerPos + containerNode.nodeSize;
          const tr = _view.state.tr;
          tr.insert(exitPos, _view.state.schema.nodes.paragraph.create());
          tr.setSelection(TextSelection.create(tr.doc, exitPos + 1));
          _view.dispatch(tr);
          pendingStepExitRef.current = null;
          event.preventDefault();
          return true;
        }

        pendingStepExitRef.current = null;
        return false;
      },
    },
    onSelectionUpdate: ({ editor: e }) => {
      const ctx = getStepContext(e);
      if (!ctx) return setStepEditorContext("none");
      if (ctx.titleDepth !== null) return setStepEditorContext("stepTitle");
      if (ctx.bodyDepth !== null) return setStepEditorContext("stepBody");
      setStepEditorContext("none");
    },
    onUpdate: ({ editor: e }) => {
      const json = e.getJSON();
      onChange({ tiptap: json });
    },
  });

  const createStepsContainerAtCursor = useCallback(() => {
    if (!editor || !editor.isEditable) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "stepsContainer",
        content: [
          {
            type: "stepItem",
            content: [
              {
                type: "stepTitle",
                content: [{ type: "text", text: "Step 1" }],
              },
              { type: "stepBody", content: [{ type: "paragraph" }] },
            ],
          },
        ],
      })
      .run();
  }, [editor]);

  const appendStepAtEnd = useCallback(() => {
    if (!editor || !editor.isEditable) return;
    const container = findFirstStepsContainer(editor);
    if (!container) return;
    const nextNumber = container.childCount + 1;
    const insertPos = container.pos + container.nodeSize - 1;
    editor
      .chain()
      .focus()
      .insertContentAt(insertPos, {
        type: "stepItem",
        content: [
          {
            type: "stepTitle",
            content: [{ type: "text", text: `Step ${nextNumber}` }],
          },
          { type: "stepBody", content: [{ type: "paragraph" }] },
        ],
      })
      .setTextSelection(insertPos + 2)
      .run();
  }, [editor, findFirstStepsContainer]);

  const hasStepsContainer = useMemo(() => {
    if (!editor) return false;
    return !!findFirstStepsContainer(editor);
  }, [editor, findFirstStepsContainer, content?.tiptap]);

  useEffect(() => {
    if (!editor || !content?.tiptap) return;
    if (JSON.stringify(editor!.getJSON()) !== JSON.stringify(content?.tiptap)) {
      editor!.commands.setContent(content.tiptap as Content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [readOnly, editor]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="rounded-sm bg-background shadow-none">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="space-y-2">
        {/* Toolbar */}
        <Toolbar
          className="rounded-sm shadow-none border max-w-2/3 mx-auto"
          ref={toolbarRef}
        >
          <Spacer />
          <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3]} />
            <ListDropdownMenu types={["bulletList", "orderedList"]} />
            {/* Disabled for MVP */}
            {/* <Button
              type="button"
              data-style="ghost"
              tooltip="Insert Step"
              onClick={createStepsContainerAtCursor}
              disabled={!editor.isEditable}
            >
              <span className="tiptap-button-text">Step</span>
            </Button> */}
            <CodeBlockButton
              disabled={stepEditorContext === "stepTitle"}
              tooltip={
                stepEditorContext === "stepTitle"
                  ? "Code blocks not available in step title — use inline code or move to step body"
                  : "Code Block"
              }
            />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="strike" />
            <MarkButton type="code" />
            <MarkButton type="underline" />
            <ToolbarSeparator />
            <ImageUploadButton />
            <Button
              type="button"
              data-style="ghost"
              tooltip="Horizontal Rule"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              disabled={!editor.can().chain().focus().setHorizontalRule().run()}
            >
              <span className="flex items-center justify-center font-black text-xl tiptap-button-text text-center">
                ⎯
              </span>
            </Button>
            <ColorHighlightPopover />
            <LinkPopover />
          </ToolbarGroup>

          <ToolbarSeparator />

          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>
          <Spacer />
        </Toolbar>

        <div className="rounded-md bg-background min-h-[400px]">
          <EditorContent editor={editor} />
          {editor.isEditable && hasStepsContainer ? (
            <div className="px-4 pb-4">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={appendStepAtEnd}
              >
                + add new step
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </EditorContext.Provider>
  );
}
