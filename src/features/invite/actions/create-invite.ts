"use server";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { sha256 } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { limiter } from "@/lib/ratelimit";
import { OrgMembershipRole } from "@prisma/client";
import { randomBytes } from "crypto";
import { headers } from "next/headers";
import { z } from "zod";

const schema = z.object({
  email: z.email().min(1, { message: "Is Required" }).max(191),
});

export const createInvitation = async (
  _actionState: ActionState,
  formData: FormData,
) => {

  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const ip = (await headers()).get("x-forwarded-for") ||
    (await headers()).get("cf-connecting-ip") ||
    "anon"
    const { success } = await limiter.limit(`invite:${ip}`);
    if (!success) {
      return toActionState(
        "ERROR",
        "Too many requests",
        formData
      );
    }

    const org = await getUserOrg(user.userId);
    if (!org) {
      return toActionState("ERROR", "No organization found", formData);
    }

    const mem = await prisma.orgMembership.findFirst({
      where: {
        orgId: org.id,
        userId: user.userId,
      },
    });

    if (!mem || !["OWNER", "ADMIN"].includes(mem.role)) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const rawEmail = String(formData.get("email") ?? "");
    const email = schema.parse({ email: rawEmail.toLowerCase().trim() }).email;

    const existingPending = await prisma.invitation.findFirst({
      where: {
        orgId: org.id,
        email: email,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });

    if (existingPending) {
      return toActionState(
        "ERROR",
        "Invite already pending for this email",
        formData
      );
    }

    const rawToken = randomBytes(24).toString("base64url");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const role: OrgMembershipRole = "MEMBER";

    await prisma.invitation.create({
      data: {
        orgId: org.id,
        email,
        role: role,
        tokenHash,
        expiresAt,
        invitedByUserId: user.userId,
        status: "PENDING",
      },
    });

    const link = `${process.env.NEXTAUTH_URL}/accept-invite?token=${rawToken}`;
    console.log(link);
    return toActionState("SUCCESS", "Invite created", formData);
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
