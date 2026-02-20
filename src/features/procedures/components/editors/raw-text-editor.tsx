"use client";

import {
  useEditor,
  EditorContent,
  JSONContent,
  Content,
  EditorContext,
} from "@tiptap/react";
import { useEffect, useMemo, useRef } from "react";

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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        orderedList: false,
        horizontalRule: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
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
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange({ tiptap: json });
    },
  });

  // const insertStep = useCallback(() => {
  //   if (!editor || !editor.isEditable) return;

  //   const { $from } = editor.state.selection;
  //   let orderedListDepth: number | null = null;

  //   for (let depth = $from.depth; depth > 0; depth--) {
  //     if ($from.node(depth).type.name === "orderedList") {
  //       orderedListDepth = depth;
  //       break;
  //     }
  //   }

  //   if (orderedListDepth !== null) {
  //     const orderedListNode = $from.node(orderedListDepth);
  //     const isStepList = orderedListNode.attrs?.listType === "steps";
  //     const currentListItemIndex = $from.index(orderedListDepth);
  //     const nextStepNumber = currentListItemIndex + 2;

  //     const didConvertToStepList =
  //       isStepList ||
  //       editor
  //         .chain()
  //         .focus()
  //         .updateAttributes("orderedList", { listType: "steps" })
  //         .run();

  //     if (!didConvertToStepList) return;

  //     const didSplitListItem = editor
  //       .chain()
  //       .focus()
  //       .splitListItem("listItem")
  //       .run();
  //     if (!didSplitListItem) return;

  //     editor
  //       .chain()
  //       .focus()
  //       .insertContent(`Step ${nextStepNumber}`)
  //       .enter()
  //       .run();
  //     return;
  //   }

  //   editor
  //     .chain()
  //     .focus()
  //     .insertContent({
  //       type: "orderedList",
  //       attrs: { listType: "steps" },
  //       content: [
  //         {
  //           type: "listItem",
  //           content: [
  //             {
  //               type: "paragraph",
  //               content: [{ type: "text", text: "Step 1" }],
  //             },
  //             { type: "paragraph" },
  //           ],
  //         },
  //       ],
  //     })
  //     .run();
  // }, [editor]);

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
        </div>
      </div>
      {/* </div> */}
    </EditorContext.Provider>
  );
}
