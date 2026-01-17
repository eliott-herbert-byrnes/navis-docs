import { Separator } from "./ui/separator";

type HeadingProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
};

const Heading = ({
  title,
  description,
  actions,
  breadcrumbs,
}: HeadingProps) => {
  return (
    <>
      <div className="p-2 flex flex-row justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
          {breadcrumbs && (
            <div className="flex items-center gap-2 mt-1">{breadcrumbs}</div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <Separator className="my-4" />
    </>
  );
};

export { Heading };
