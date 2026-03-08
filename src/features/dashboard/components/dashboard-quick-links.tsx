import Link from "next/link";
import {
  invitePath,
  procedureBasePath,
  settingsPath,
  errorsPath,
  ideasPath,
  homePath,
} from "@/app/paths";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Database, Settings, Inbox, Lightbulb, Layers } from "lucide-react";

type DashboardQuickLinksProps = { openErrors: number; newIdeas: number };

export function DashboardQuickLinks({ openErrors, newIdeas }: DashboardQuickLinksProps) {
  const links = [
    { label: "Invite a Team Member", path: invitePath(), icon: UserPlus, badge: null },
    { label: "Create a Department", path: homePath(), icon: Layers, badge: null },
    { label: "Create a Procedure", path: procedureBasePath(), icon: Database, badge: null },
    { label: "Error Reports", path: errorsPath(), icon: Inbox, badge: openErrors > 0 ? openErrors : null },
    { label: "Ideas", path: ideasPath(), icon: Lightbulb, badge: newIdeas > 0 ? newIdeas : null },
    { label: "Organisation Settings", path: settingsPath(), icon: Settings, badge: null },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {links.map((link) => (
        <Link key={link.label} href={link.path}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardContent className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-3">
                <link.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{link.label}</span>
              </div>
              {link.badge !== null && (
                <Badge variant="destructive">{link.badge}</Badge>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}