"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { CardCompact } from "@/components/ui/auth-card";
import { InvitationDeleteButton } from "./invitation-delete-button";
import { InvitationPagination } from "./invitation-pagination";
import { format } from "date-fns/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetInvites } from "../hooks/use-invite-queries";
import { trpc } from "@/trpc/client";
import { Loader2 } from "lucide-react";

type InvitationListProps = {
  orgId: string;
  search?: string;
  page?: number;
};

const InvitationList = ({ orgId, search, page = 1 }: InvitationListProps) => {
  const { data, isLoading } = useGetInvites(orgId, search, page, 10);
  const { data: usersData } = trpc.users.getUsersByIds.useQuery(
    {
      userIds: data?.data.invites.map((inv) => inv.invitedByUserId ?? "") ?? [],
    },
    {
      enabled: !!data?.data.invites.length,
    },
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const invites = data?.data.invites ?? [];
  const pagination = data?.data.pagination ?? {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  if (!invites.length) {
    return (
      <EmptyState
        title="No invitations found"
        body="Invite your team members to your organization"
      />
    );
  }

  const invitedByUserMap = Object.fromEntries(
    (usersData?.data ?? []).map((user) => [user.id, user]),
  );

  return (
    <>
      {/* Mobile: cards */}
      <div className="md:hidden px-4 space-y-3">
        {invites.map((inv) => (
          <CardCompact
            key={inv.email}
            title={inv.email}
            description={`Invited by: ${invitedByUserMap[inv.invitedByUserId ?? ""]?.name ?? "Deleted User"}`}
            content={
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Invited At</span>
                  <span>{format(inv.createdAt, "yyyy-MM-dd, HH:mm")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span>
                    {inv.status === "PENDING"
                      ? "Pending"
                      : inv.status === "ACCEPTED"
                        ? "Accepted"
                        : inv.status === "EXPIRED"
                          ? "Expired"
                          : inv.status === "REVOKED"
                            ? "Revoked"
                            : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Invited By</span>
                  <span>
                    {invitedByUserMap[inv.invitedByUserId ?? ""]?.name ??
                      "Deleted User"}
                  </span>
                </div>
              </div>
            }
            footer={
              <div className="flex justify-end w-full">
                <InvitationDeleteButton email={inv.email} orgId={orgId} />
              </div>
            }
            className="w-full"
          />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Invited At</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.map((invitation) => {
              const deleteButton = (
                <InvitationDeleteButton
                  email={invitation.email}
                  orgId={orgId}
                />
              );

              const buttons = <>{deleteButton}</>;

              return (
                <TableRow key={invitation.email}>
                  <TableCell>{invitation.email}</TableCell>
                  <TableCell>
                    {format(invitation.createdAt, "yyyy-MM-dd, HH:mm")}
                  </TableCell>
                  <TableCell>
                    {invitedByUserMap[invitation.invitedByUserId ?? ""]?.name ??
                      "Deleted User"}
                  </TableCell>
                  <TableCell>
                    {invitation.status === "PENDING"
                      ? "Pending"
                      : invitation.status === "ACCEPTED"
                        ? "Accepted"
                        : invitation.status === "EXPIRED"
                          ? "Expired"
                          : invitation.status === "REVOKED"
                            ? "Revoked"
                            : "Unknown"}
                  </TableCell>
                  <TableCell className="flex justify-end gap-x-2">
                    {buttons}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <InvitationPagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
      />
    </>
  );
};

export { InvitationList };
