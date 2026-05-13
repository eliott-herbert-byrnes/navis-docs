import { PageContainer } from "@/components/ui/page-container";

export function DemoNotAvailable({ feature }: { feature: string }) {
  return (
    <PageContainer>
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <h2 className="font-serif text-2xl">
          {`${feature}`} is not part of the demo
        </h2>
        <p className="text-muted-foreground">
          Sign up for the full experience.
        </p>
      </div>
    </PageContainer>
  );
}
