"use server";

import { homePath, signInPath } from "@/app/paths";
import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { getSessionUser, getUserOrg } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrgMembershipRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

const createOrganizationSchema = z.object({
  name: z.string().min(6).max(191),
});

export const createOrganization = async (
  _ActionState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const user = await getSessionUser();
  if (!user) {
    redirect(signInPath());
  }

  const ExistingOrg = await getUserOrg(user.userId);
  if (ExistingOrg) redirect(homePath());

  try {
    const rawName = String(formData.get("name") ?? "");
    const { name } = createOrganizationSchema.parse({ name: rawName.trim() });

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const orgName = await prisma.organization.findFirst({
      where: { slug },
    });

    if (orgName) {
      return toActionState("ERROR", "Organization already exists", formData);
    }

    const org = await prisma.organization.create({
      data: {
        name,
        slug,
        ownerUserId: user.userId,
        plan: "business",
        entitlementsJSON: {
          maxProcesses: 100,
          maxDepartments: 3,
          maxTeamsPerDepartment: 1,
        },
      },
    });

    await prisma.orgMembership.create({
      data: {
        orgId: org.id,
        userId: user.userId,
        role: OrgMembershipRole.OWNER,
      },
    });

    const customer = await stripe.customers.create({
      email: user.email,
      name: org.name,
      metadata: {orgId: org.id, orgSlug: org.slug},
    });

    return toActionState(
      "SUCCESS",
      "Organization created successfully",
      formData,
      {
        org,
        redirect: homePath(),
      }
    );
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};
