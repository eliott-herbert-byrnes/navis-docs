import { Badge } from "@/components/ui/badge";
import { getSessionUser, getUserOrg } from "@/lib/auth";

const OrgBadge = async () => {
  const user = await getSessionUser();
  const org = await getUserOrg(user?.userId ?? "");
  return (
    <Badge variant="default">
      {org?.org?.name ?? ""}
    </Badge>
  );
};

export { OrgBadge };
