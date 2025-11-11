"use server";

import {
  ActionState,
  fromErrorToActionState,
  toActionState,
} from "@/components/form/utils/to-action-state";
import { createAuditLog } from "@/features/audit/utils/audit";
import { getSessionUser, getUserOrg, isOrgAdminOrOwner } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createLimiter, getLimitByUser } from "@/lib/rate-limiter";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).max(100),
  address: z.string().min(1, { message: "Address is required" }).max(255),
  phone: z.string().min(1, { message: "Phone is required" }).max(20),
  email: z.string().email({ message: "Invalid email" }).optional(),
  website: z.string().url({ message: "Invalid URL" }).optional().or(z.literal("")),
});

export const createAddress = async (
  _actionState: ActionState,
  formData: FormData
) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return toActionState("ERROR", "Unauthorized", formData);
    }

    const { success } = await getLimitByUser(
      createLimiter,
      user.userId,
      "address-create"
    );
    if (!success) {
      return toActionState("ERROR", "Too many requests", formData);
    }

    const isAdmin = await isOrgAdminOrOwner(user.userId);
    if (!isAdmin) {
      return toActionState("ERROR", "Forbidden", formData);
    }

    const org = await getUserOrg(user.userId);
    if (!org.org) {
      return toActionState("ERROR", "No organization found", formData);
    }

    const parsed = inputSchema.parse({
      name: String(formData.get("name") ?? "").trim(),
      address: String(formData.get("address") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim() || undefined,
      website: String(formData.get("website") ?? "").trim() || undefined,
    });

    const created = await prisma.address.create({
      data: {
        name: parsed.name,
        address: parsed.address,
        phone: parsed.phone,
        email: parsed.email,
        website: parsed.website || null,
      },
    });

    await createAuditLog({
      orgId: org.org?.id ?? "",
      actorId: user.userId,
      action: "ADDRESS_CREATED",
      entityType: "ADDRESS",
      entityId: created.id,
      afterJSON: JSON.parse(JSON.stringify(created)),
    });

    revalidatePath("/departments/[departmentId]/[teamId]/processes/address");

    return toActionState("SUCCESS", "Address created successfully", formData, {
      address: created,
    });
  } catch (error) {
    return fromErrorToActionState(error, formData);
  }
};