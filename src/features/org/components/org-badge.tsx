import { Badge } from "@/components/ui/badge";
import { getSessionContext } from "@/lib/auth";

const OrgBadge = async () => {
  const ctx = await getSessionContext()
  return <Badge className=" text-neutral-900 rounded-sm dark:bg-brand">{ctx?.org?.name ?? ""}</Badge>
}

export { OrgBadge };
