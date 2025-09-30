import { Card, CardContent, CardFooter, CardHeader } from "./ui/card"

type AuthCardProps = {
    className?: string;
    header: React.ReactNode;
    content: React.ReactNode;
    footer?: React.ReactNode;
}

const AuthCard = ({className, header, content, footer}: AuthCardProps) => {
    return (
        <Card className={className}>
            <CardHeader>{header}</CardHeader>
            <CardContent>{content}</CardContent>
            {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
    )
}

export { AuthCard }