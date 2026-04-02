import { Badge } from "@/components/ui/badge";
import { getSessionContext } from "@/lib/auth";

const OrgBadge = async () => {
  const ctx = await getSessionContext()
  return <Badge className="bg-background text-black dark:text-primary">{ctx?.org?.name ?? ""}</Badge>
}

export { OrgBadge };
