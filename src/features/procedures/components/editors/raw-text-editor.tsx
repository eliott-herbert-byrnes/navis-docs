"use client";

import {
  useEditor,
  EditorContent,
  JSONContent,
  Content,
  EditorContext,
} from "@tiptap/react";
import { useEffect, useRef } from "react";

// --- Tiptap Core Extensions ---
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import { Selection } from "@tiptap/extensions";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";

// --- UI Primitives ---
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar";

// --- Tiptap Node ---
import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/list-node/list-node.scss";
import "@/components/tiptap-node/heading-node/heading-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu";
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button";
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

type ProcedureContent = {
  tiptap?: JSONContent;
};

type RawTextEditorProps = {
  content: ProcedureContent;
  onChange: (content: ProcedureContent) => void;
  isPreview: boolean;
};

export function RawTextEditor({
  content,
  onChange,
  isPreview,
}: RawTextEditorProps) {
  const initialContent = content?.tiptap || {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
  const toolbarRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Typography,
      Selection,
      Highlight.configure({ multicolor: true }),
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
