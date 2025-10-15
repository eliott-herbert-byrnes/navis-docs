import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { stripe } from "@/lib/stripe";
  import { toCurrencyFromCent } from "@/utils/currency";
  import { LucideCheck } from "lucide-react";
  import { CheckoutSessionForm } from "./checkout-session-form";
  import { getStripeCustomerByOrg } from "../queries/get-stripe-customer";
  
  type Plan = "business" | "enterprise";
  
  type PricesProps = {
    orgSlug: string | null | undefined;
    productId: string;
    activePlan: string | null | undefined;
    targetPlan: Plan;
    activeSubscription: boolean;
  };
  
  const Prices = async ({
    orgSlug,
    productId,
    activePlan,
    targetPlan,
    activeSubscription,
  }: PricesProps) => {
    const prices = await stripe.prices.list({
      active: true,
      product: productId,
    });
  
    return prices.data.map((price) => (
      <CheckoutSessionForm
        key={price.id}
        orgSlug={orgSlug}
        priceId={price.id}
        activePlan={activePlan}
        targetPlan={targetPlan}
        activeSubscription={activeSubscription}
      >
        <span className="font-bold text-lg">
          {toCurrencyFromCent(price.unit_amount || 0, price.currency)}
        </span>
        &nbsp;/&nbsp;<span>{price.recurring?.interval}</span>
      </CheckoutSessionForm>
    ));
  };
  
  type ProductsProps = {
    orgSlug: string | null | undefined;
  };
  
  const Products = async ({ orgSlug }: ProductsProps) => {
    const products = await stripe.products.list({ active: true });
  
    const stripeCustomer = await getStripeCustomerByOrg(orgSlug);
  
    let subscriptionStatus = stripeCustomer?.stripeSubscriptionStatus;
    if (stripeCustomer?.stripeSubscriptionId) {
      try {
        const sub = await stripe.subscriptions.retrieve(
          stripeCustomer.stripeSubscriptionId
        );
        subscriptionStatus = sub.status;
      } catch {
        // ignore and use DB status
      }
    }
  
    const activeSubscription = subscriptionStatus === "active";
    const activePlan = stripeCustomer?.plan;
  
    return (
      <div className="flex-1 flex justify-center items-center gap-x-4">
        {products.data.map((product) => {
          const targetPlan: Plan = product.name
            .toLowerCase()
            .includes("enterprise")
            ? "enterprise"
            : "business";
  
          return (
            <Card key={product.id}>
              <CardHeader>
                <CardTitle>
                  {product.name}
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
                <Prices
                  orgSlug={orgSlug}
                  productId={product.id}
                  activePlan={activePlan}
                  targetPlan={targetPlan}
                  activeSubscription={activeSubscription}
                />
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };
  
  export { Products };