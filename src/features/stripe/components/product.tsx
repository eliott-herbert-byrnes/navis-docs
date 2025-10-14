import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { stripe } from "@/lib/stripe";
import { toCurrencyFromCent } from "@/utils/currency";
import { LucideCheck } from "lucide-react";
import { CheckoutSessionForm } from "./checkout-session-form";
import { Badge } from "@/components/ui/badge";
import { Organization } from "@prisma/client";

type PricesProps = {
    orgSlug: string | null | undefined;
    productId: string;
}

const Prices = async ({ orgSlug, productId }: PricesProps) => {
    const prices = await stripe.prices.list({
        active: true,
        product: productId,
    })

    return (
        <div className="flex gap-x-2">
            {prices.data.map((price) => (
                <CheckoutSessionForm key={price.id} orgSlug={orgSlug} priceId={price.id}>
                    <span className="font-bold text-lg">
                        {toCurrencyFromCent(price.unit_amount || 0, price.currency)}
                    </span>
                    &nbsp;/&nbsp;<span>{price.recurring?.interval}</span>
                </CheckoutSessionForm>
            ))}
        </div>
    )
}

type ProductsProps = {
    orgSlug: string | null | undefined;
    org: Organization;
}

const Products = async ({ orgSlug, org }: ProductsProps) => {
    const products = await stripe.products.list({
        active: true,
    })

    const activeProduct = products.data.find((product) => product.id === org.stripeSubscriptionId);
    const activePlan = activeProduct?.metadata.plan;

    return (
        <div className="flex-1 flex justify-center items-center gap-x-4">
        {products.data.map((product) => (
            <Card key={product.id}>
                <CardHeader>
                    <CardTitle>{product.name}
                        {activePlan === product.metadata.plan && <Badge  className="ml-1" variant="outline">Active</Badge>}
                    </CardTitle>
                    <CardDescription>{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {product.marketing_features.map((feature) => (
                        <div key={feature.name} className="flex gap-x-2">
                            <LucideCheck /> {feature.name}
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <Prices orgSlug={orgSlug}
                    productId={product.id} />
                </CardFooter>
            </Card>
        ))}
        </div>
    )
}

export { Products }