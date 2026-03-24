import { Separator } from "./separator";

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
      <div className="flex flex-row justify-between my-auto">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-medium font-serif">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
          {breadcrumbs && (
            <div className="flex items-center gap-2 mt-1">{breadcrumbs}</div>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 mt-5">{actions}</div>}
      </div>
      <Separator className="my-6 mb-8" />
    </>
  );
};

export { Heading };
