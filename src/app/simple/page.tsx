import { Suspense } from "react";
import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";

function SimpleEditorFallback() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6 text-sm text-muted-foreground">
      Loading editor…
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<SimpleEditorFallback />}>
      <SimpleEditor />
    </Suspense>
  );
}
