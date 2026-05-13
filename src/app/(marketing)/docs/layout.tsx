import { Separator } from "@/components/ui/separator";

import { DocsSidebar } from "./_components/docs-sidebar";
import { docs } from "./_content/docs";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="sm:grid sm:col-span-24 sm:grid-cols-24">
      <DocsSidebar articles={docs} />
      <main className="sm:col-span-14 sm:col-start-8 lg:col-span-16 lg:col-start-5 p-4">
        {children}
      </main>
    </div>
  );
}
