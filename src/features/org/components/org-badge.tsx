import { Badge } from "@/components/ui/badge";
import { getSessionContext } from "@/lib/auth";

const OrgBadge = async () => {
  const ctx = await getSessionContext();
  return <Badge variant="outline">{ctx?.org?.name ?? ""}</Badge>;
};

export { OrgBadge };
