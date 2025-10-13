import { getSessionUser, getUserOrg } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

const PLAN_TO_PRICE = {
    business: process.env.STRIPE_PRICE_BUSINESS!,
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE!,
}

export async function POST(request: Request) {
    const {plan} = await request.json();
    if(!['business', 'enterprise'].includes(plan)) {
        return NextResponse.json({error: 'Invalid plan'}, {status: 400});
    }

    const user = await getSessionUser();
    if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    const org = await getUserOrg(user.userId);
    if (!org?.stripeCustomerId) return NextResponse.json({error: 'Org missing customer'}, {status: 400});

    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: org.stripeCustomerId,
        line_items: [{price: PLAN_TO_PRICE[plan as keyof typeof PLAN_TO_PRICE], quantity: 1}],
        allow_promotion_codes: true,
        client_reference_id: org.id,
        success_url: `${process.env.NEXTAUTH_URL}/settings/billing?success=1`,
        cancel_url: `${process.env.NEXTAUTH_URL}/settings/billing?canceled=1`,
    })

    return NextResponse.json({url: session.url})
}