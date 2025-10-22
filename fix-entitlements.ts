import { prisma } from "@/lib/prisma";

async function fixEntitlements() {
    await prisma.organization.updateMany({
        where: {plan: "enterprise"},
        data: {entitlementsJSON: {}}
    })
    console.log("Fixed entitlements for enterprise organizations");
}

fixEntitlements().finally(() => prisma.$disconnect());