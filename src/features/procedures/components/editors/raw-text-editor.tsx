"use client";

import {
  useEditor,
  EditorContent,
  JSONContent,
  Content,
  EditorContext,
} from "@tiptap/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { TextSelection } from "@tiptap/pm/state";

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
import { OrderedListExtended } from "@/components/tiptap-node/list-node/ordered-list-step-extension";
import { ListItemExtended } from "@/components/tiptap-node/list-node/list-item-step-extension";
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension";
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/image-node/image-node.scss";
import "@/components/tiptap-node/image-upload-node/image-upload-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button";
import {
  ColorHighlightPopover,
  // ColorHighlightPopoverButton,
} from "@/components/tiptap-ui/color-highlight-popover";
import {
  LinkPopover,
  // LinkContent,
  // LinkButton,
} from "@/components/tiptap-ui/link-popover";
import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";

// --- Hooks ---
// import { useWindowSize } from "@/hooks/use-window-size"
// import { useIsBreakpoint } from "@/hooks/use-is-breakpoint"

// --- Icons ---
import "./tiptap-styles.css";
// import { useCursorVisibility } from "@/hooks/use-cursor-visibility";
import { Spacer } from "@/components/tiptap-ui-primitive/spacer";
import { createProcedureImageUploadHandler, MAX_FILE_SIZE } from "@/lib/tiptap-utils";

type ProcedureContent = {
  tiptap?: JSONContent;
};

type RawTextEditorProps = {
  procedureId: string;
  content: ProcedureContent;
  onChange: (content: ProcedureContent) => void;
  isPreview: boolean;
};

type StepsListMeta = {
  pos: number;
  childCount: number;
  nodeSize: number;
};

export function RawTextEditor({
  procedureId,
  content,
  onChange,
  isPreview,
}: RawTextEditorProps) {
  const initialContent = content?.tiptap || {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
  const toolbarRef = useRef<HTMLDivElement>(null);
  const uploadProcedureImage = useMemo(
    () => createProcedureImageUploadHandler(procedureId),
    [procedureId],
  );
  const pendingStepExitPosRef = useRef<number | null>(null);

  const buildStepListItem = useCallback((stepNumber: number): JSONContent => {
    return {
      type: "listItem",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: `Step ${stepNumber}` }],
        },
        { type: "paragraph" },
      ],
    };
  }, []);

  const getStepsListContext = useCallback((editorInstance: any) => {
    const { $from } = editorInstance.state.selection;
    let orderedListDepth: number | null = null;
    let listItemDepth: number | null = null;
    let paragraphDepth: number | null = null;

    for (let depth = $from.depth; depth > 0; depth--) {
      const nodeName = $from.node(depth).type.name;
      if (orderedListDepth === null && nodeName === "orderedList") orderedListDepth = depth;
      if (listItemDepth === null && nodeName === "listItem") listItemDepth = depth;
      if (paragraphDepth === null && nodeName === "paragraph") paragraphDepth = depth;
    }

    if (orderedListDepth === null) return null;

    const orderedListNode = $from.node(orderedListDepth);
    if (orderedListNode.attrs?.listType !== "steps") return null;

    return {
      $from,
      orderedListDepth,
      listItemDepth,
      paragraphDepth,
      orderedListNode,
      orderedListPos: $from.before(orderedListDepth),
    };
  }, []);

  const findFirstStepsList = useCallback((editorInstance: any): StepsListMeta | null => {
    let result: StepsListMeta | null = null;
    editorInstance.state.doc.descendants((node: any, pos: number) => {
      if (result) return false;
      if (node.type.name === "orderedList" && node.attrs?.listType === "steps") {
        result = { pos, childCount: node.childCount, nodeSize: node.nodeSize };
        return false;
      }
      return true;
    });
    return result;
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        orderedList: false,
        listItem: false,
        horizontalRule: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      ListItemExtended,
      OrderedListExtended,
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
    editable: !isPreview,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4",
      },
      handleKeyDown: (_view, event) => {
        if (!editor || !editor.isEditable) return false;

        if (event.key !== "Enter") {
          pendingStepExitPosRef.current = null;
          return false;
        }

        const context = getStepsListContext(editor);
        if (!context || context.listItemDepth === null) {
          pendingStepExitPosRef.current = null;
          return false;
        }

        const {
          $from,
          orderedListDepth,
          listItemDepth,
          paragraphDepth,
          orderedListNode,
          orderedListPos,
        } = context;

        if ($from.parent.type.name === "heading") {
          const listItemNode = $from.node(listItemDepth);
          const listItemPos = $from.before(listItemDepth);
          let childOffset = 0;
          let paragraphPos: number | null = null;

          for (let i = 0; i < listItemNode.childCount; i++) {
            const childNode = listItemNode.child(i);
            if (childNode.type.name === "paragraph") {
              paragraphPos = listItemPos + 1 + childOffset;
              break;
            }
            childOffset += childNode.nodeSize;
          }

          const tr = editor.state.tr;
          if (paragraphPos === null) {
            const insertPos = listItemPos + listItemNode.nodeSize - 1;
            tr.insert(insertPos, editor.state.schema.nodes.paragraph.create());
            tr.setSelection(TextSelection.create(tr.doc, insertPos + 1));
          } else {
            tr.setSelection(TextSelection.create(tr.doc, paragraphPos + 1));
          }

          editor.view.dispatch(tr);
          pendingStepExitPosRef.current = null;
          event.preventDefault();
          return true;
        }

        if (paragraphDepth === null || $from.parent.type.name !== "paragraph") {
          pendingStepExitPosRef.current = null;
          return false;
        }

        const listItemNode = $from.node(listItemDepth);
        const isCurrentParagraphEmpty = $from.parent.content.size === 0;
        const isLastStep = $from.index(orderedListDepth) === orderedListNode.childCount - 1;
        const isLastParagraphInStep = $from.index(listItemDepth) === listItemNode.childCount - 1;

        if (!isCurrentParagraphEmpty || !isLastStep || !isLastParagraphInStep) {
          pendingStepExitPosRef.current = null;
          return false;
        }

        const currentPos = $from.pos;
        if (pendingStepExitPosRef.current !== currentPos) {
          pendingStepExitPosRef.current = currentPos;
          event.preventDefault();
          return true;
        }

        const exitPos = orderedListPos + orderedListNode.nodeSize;
        const tr = editor.state.tr;
        tr.insert(exitPos, editor.state.schema.nodes.paragraph.create());
        tr.setSelection(TextSelection.create(tr.doc, exitPos + 1));
        editor.view.dispatch(tr);
        pendingStepExitPosRef.current = null;
        event.preventDefault();
        return true;
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange({ tiptap: json });
    },
  });

  const createStepsListAtCursor = useCallback(() => {
    if (!editor || !editor.isEditable) return;
    editor
      .chain()
      .focus()
      .insertContent({
        type: "orderedList",
        attrs: { listType: "steps" },
        content: [buildStepListItem(1)],
      })
      .run();
  }, [buildStepListItem, editor]);

  const appendStepAtEndOfCurrentStepsList = useCallback(() => {
    if (!editor || !editor.isEditable) return;

    const stepsList = findFirstStepsList(editor);
    if (!stepsList) return;

    const insertPos = stepsList.pos + stepsList.nodeSize - 1;
    const nextStepNumber = stepsList.childCount + 1;
    const didInsert = editor
      .chain()
      .focus()
      .insertContentAt(insertPos, buildStepListItem(nextStepNumber))
      .setTextSelection(insertPos + 3)
      .run();

    if (didInsert) pendingStepExitPosRef.current = null;
  }, [buildStepListItem, editor, findFirstStepsList]);

  const insertStep = useCallback(() => {
    if (!editor || !editor.isEditable) return;
    const context = getStepsListContext(editor);
    if (context) return;
    createStepsListAtCursor();
  }, [createStepsListAtCursor, editor, getStepsListContext]);

  const hasStepList = useMemo(() => {
    if (!editor) return false;
    return !!findFirstStepsList(editor);
  }, [editor, findFirstStepsList, content?.tiptap]);

  // const insertImageFromUrl = useCallback(() => {
  //   if (!editor || !editor.isEditable) return;

  //   const url = window.prompt("Enter an image URL");
  //   if (!url) return;

  //   editor.chain().focus().setImage({ src: url }).run();
  // }, [editor]);

  // const rect = useCursorVisibility({
  //   editor,
  //   overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  // })

  useEffect(() => {
    if (!editor || !content?.tiptap) return;
    if (JSON.stringify(editor!.getJSON()) !== JSON.stringify(content?.tiptap)) {
      editor!.commands.setContent(content.tiptap as Content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreview);
    }
  }, [isPreview, editor]);

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

  if (isPreview) {
    return (
      <div className="border rounded-md p-4 bg-background">
        <EditorContent editor={editor} />
      </div>
    );
  }

  return (
    <EditorContext.Provider value={{ editor }}>
      {/* Editor */}
      <div className="space-y-3">
        {/* Toolbar */}
        <Toolbar className="rounded-md" ref={toolbarRef}>
          <Spacer />
          {/* Undo/Redo */}
          <ToolbarGroup>
            <UndoRedoButton action="undo" />
            <UndoRedoButton action="redo" />
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Headings */}
          <ToolbarGroup>
            <HeadingDropdownMenu levels={[1, 2, 3]} />
            <ListDropdownMenu types={["bulletList", "orderedList"]} />
            {/* Experimental Steps, revisit later */}
            {/* <Button
              type="button"
              data-style="ghost"
              tooltip="Insert Step"
              onClick={insertStep}
              disabled={!editor.isEditable}
            >
              <span className="tiptap-button-text">Step</span>
            </Button> */}
            <CodeBlockButton />
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Text Editor Buttons */}
          <ToolbarGroup>
            <MarkButton type="bold" />
            <MarkButton type="italic" />
            <MarkButton type="strike" />
            <MarkButton type="code" />
            <MarkButton type="underline" />
            <ToolbarSeparator />
            <ImageUploadButton />
            {/* Experimental Steps, revisit later */}
            {/* <Button
              type="button"
              data-style="ghost"
              tooltip="Image URL"
              onClick={insertImageFromUrl}
              disabled={!editor.can().chain().focus().setImage({ src: "https://" }).run()}
            >
              <span className="tiptap-button-text">URL</span>
            </Button> */}
            <Button
              type="button"
              data-style="ghost"
              tooltip="Horizontal Rule"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              disabled={!editor.can().chain().focus().setHorizontalRule().run()}
            >
              <span className="flex items-center justify-center font-black text-1xl tiptap-button-text text-center">
                ⎯
              </span>
            </Button>
            <ColorHighlightPopover />
            <LinkPopover />
          </ToolbarGroup>

          <ToolbarSeparator />

          {/* Text Align */}
          <ToolbarGroup>
            <TextAlignButton align="left" />
            <TextAlignButton align="center" />
            <TextAlignButton align="right" />
            <TextAlignButton align="justify" />
          </ToolbarGroup>
          <Spacer />
        </Toolbar>
        <div className="rounded-md bg-background">
          <EditorContent editor={editor} />
          {editor.isEditable && hasStepList ? (
            <div className="px-4 pb-4">
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={appendStepAtEndOfCurrentStepsList}
              >
                add new step
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {/* </div> */}
    </EditorContext.Provider>
  );
}
