import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"

type CardCompactProps = {
    className?: string;
    header?: React.ReactNode;
    content?: React.ReactNode;
    footer?: React.ReactNode;
    children?: React.ReactNode;
}

const CardCompact = ({className, header, content, footer, children}: CardCompactProps) => {
    return (
        <Card className={className}>
            <CardHeader>{header}</CardHeader>
            <CardContent>{content}</CardContent>
            {footer && <CardFooter>{footer}</CardFooter>}
            {children}
        </Card>
    )
}

export { CardCompact }