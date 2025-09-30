import { Card } from "./ui/card";

type EmptyStateProps = {
    title?: string;
    body?: string;
    cta?: React.ReactNode;
}

const EmptyState = ({ title, body, cta }: EmptyStateProps) => {
    return (
        <Card className="p-6 text-center">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{body}</p>
            {cta && <div className="mt-4">{cta}</div>}
        </Card>
    )
}

export { EmptyState };