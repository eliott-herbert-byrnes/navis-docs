import { inngest } from "@/inngest/client";
import { OrgMembershipRole, RolloutRoleFilter } from "@prisma/client";
import { render } from "@react-email/render";
import React from "react";
import { getResend } from "@/lib/resend";
import { prisma } from "@/lib/prisma";
import { ProcedureRolloutEmail } from "@/emails/procedure-rollout";

const FROM_EMAIL = "Navis Docs <no-reply@app.navisdocs.com>";
const BATCH_SIZE = 50;

export type ProcedureRolloutEvent = {
  data: {
    rolloutId: string;
    procedureId: string;
    versionId: string;
    orgId: string;
    notifyRoleFilter: RolloutRoleFilter;
    emailOnPublish: boolean;
    emailRoleFilter: RolloutRoleFilter | null;
    newsOnPublish: boolean;
    procedureTitle: string;
    teamId: string;
    createdBy: string;
  };
};

function isUserInScopeForFilter(
  role: OrgMembershipRole,
  filter: RolloutRoleFilter,
): boolean {
  if (filter === RolloutRoleFilter.ALL_USERS) return true;
  if (filter === RolloutRoleFilter.ADMINS_ONLY) {
    return role === OrgMembershipRole.OWNER || role === OrgMembershipRole.ADMIN;
  }
  if (filter === RolloutRoleFilter.MEMBERS_ONLY) {
    return role === OrgMembershipRole.MEMBER;
  }
  return false;
}

export const eventProcedureRollout = inngest.createFunction(
  {
    id: "procedure-roll-out",
  },
  {
    event: "procedure/roll-out",
  },
  async ({ event }) => {
    const {
      rolloutId,
      procedureId,
      orgId,
      emailOnPublish,
      emailRoleFilter,
      newsOnPublish,
      procedureTitle,
      teamId,
      createdBy,
    } = event.data;

    if (emailOnPublish && emailRoleFilter) {
      const procedure = await prisma.procedure.findUnique({
        where: { id: procedureId },
        select: {
          title: true,
          team: {
            select: {
              name: true,
              department: { select: { name: true } },
            },
          },
          category: { select: { name: true } },
        },
      });

      const teamName = procedure?.team?.name ?? null;
      const departmentName = procedure?.team?.department?.name ?? null;
      const categoryName = procedure?.category?.name ?? null;

      const memberships = await prisma.orgMembership.findMany({
        where: { orgId },
        include: { user: { select: { email: true } } },
      });

      const recipients = memberships
        .filter((m) => isUserInScopeForFilter(m.role, emailRoleFilter))
        .map((m) => m.user.email)
        .filter(Boolean);

      if (recipients.length > 0) {
        const subject = `Procedure published: ${procedure?.title ?? procedureTitle}`;
        const html = await render(
          React.createElement(ProcedureRolloutEmail, {
            procedureTitle: procedure?.title ?? procedureTitle,
            categoryName,
            departmentName,
            teamName,
          }),
        );

        const resend = getResend();

        for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
          const batchRecipients = recipients.slice(i, i + BATCH_SIZE);
          const batchPayload = batchRecipients.map((to) => ({
            from: FROM_EMAIL,
            to,
            subject,
            html,
          }));
          await resend.batch.send(batchPayload, {
            idempotencyKey: `${rolloutId}:email:batch-${i}`,
          });
        }
      }
    }

    if (newsOnPublish) {
      const existingRollout = await prisma.procedureRollout.findUnique({
        where: { id: rolloutId },
        select: { newsPostId: true },
      });
      if (existingRollout?.newsPostId) {
        // Idempotency: already created news post for this rollout
      } else {
        const procedure = await prisma.procedure.findUnique({
          where: { id: procedureId },
          select: {
            title: true,
          },
        });
        const title = procedure?.title ?? procedureTitle;
        const newsTitle = `New Procedure Published: ${title}`;
        const bodyText = `A new procedure "${title}" has been published and is available for you to read. Please review it and mark as read.`;
        const bodyJSON = {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: bodyText }],
            },
          ],
        };
        const newsPost = await prisma.newsPost.create({
          data: {
            teamId,
            title: newsTitle,
            bodyJSON,
            pinned: false,
            createdBy,
          },
        });
        await prisma.procedureRollout.update({
          where: { id: rolloutId },
          data: { newsPostId: newsPost.id },
        });
      }
    }

    return { eventId: rolloutId };
  },
);
