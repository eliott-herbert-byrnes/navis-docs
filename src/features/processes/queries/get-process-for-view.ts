"use server";
import { onboardingPath, signInPath } from "@/app/paths";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const getProcessForView = async (processId: string) => {
    const user = await getSessionUser();

    if(!user){
        redirect(signInPath());
    }

    const org = await getUserOrg(user.userId);
    if(!org){
        redirect(onboardingPath());
    }

    const process = await prisma.process.findUnique({
        where: { id: processId },
        include: {
            publishedVersion: true,
            team: true,
            category: true,
        },
    });

    if(!process){
        return null;
    }

    return process;
}