"use server";
import { homePath, signInPath } from "@/app/paths"
import { toActionState } from "@/components/form/utils/to-action-state"
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"
import { redirect } from "next/navigation"

export const createCustomerPortal = async (orgSlug: string) => {
    const user = await getSessionUser()
    if(!user) {
        redirect(signInPath())
    }

    if(!orgSlug) {
        redirect(homePath())
    }

    await isOrgAdminOrOwner(user.userId)

    const stripeCustomer = await prisma.organization.findUnique({
        where: {
            slug: orgSlug
        }
    })

    if(!stripeCustomer) {
        return toActionState("ERROR", "Organization not found");
    }

    const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomer.stripeCustomerId as string,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
    })

    if(!session.url){
        return toActionState("ERROR", "Session URL could not be created")
    }

    redirect(session.url)
}