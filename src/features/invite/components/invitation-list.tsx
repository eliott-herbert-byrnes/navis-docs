import { EmptyState } from "@/components/empty-state";
import { getInvites } from "../queries/get-invites";
import { CardCompact } from "@/components/auth-card";
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

type InvitationListProps = {
  orgId: string;
  search?: string;
  page?: number;
};

const InvitationList = async ({
  orgId,
  search,
  page = 1,
}: InvitationListProps) => {
  const { invites, pagination } = await getInvites({
    orgId,
    search,
    page,
    pageSize: 10,
  });

  if (!invites.length) {
    return (
      <EmptyState
        title="No invitations found"
        body="Invite your team members to your organization"
      />
    );
  }

  return (
    <>
      {/* Mobile: cards */}
      <div className="md:hidden px-4 space-y-3">
        {invites.map((inv) => (
          <CardCompact
            key={inv.email}
            title={inv.email}
            description={`Invited by: ${inv.invitedByUserId ? `${inv.invitedByUserId}` : "Deleted User"}`}
            content={
              <div className="flex flex-col gap-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Invited At</span>
                  <span>{format(inv.createdAt, "yyyy-MM-dd, HH:mm")}</span>
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
                    {invitation.invitedByUserId
                      ? `${invitation.invitedByUserId}`
                      : "Deleted User"}
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
