import { getSessionUser, getUserOrg } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST() {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({error: 'Unauthorized'}, {status: 401});

    const org = await getUserOrg(user.userId);
    if (!org?.stripeCustomerId) return NextResponse.json({error: 'No customer'}, {status: 400});

    const session = await stripe.billingPortal.sessions.create({
        customer: org.stripeCustomerId,
        return_url: `${process.env.NEXTAUTH_URL}/settings/billing`,
    });

    return NextResponse.json({url: session.url})
}