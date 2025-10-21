import {
  ChevronUp,
  Home,
  Inbox,
  Database,
  Settings,
  Users,
  UserPlus,
  CreditCard,
  User2,
  Lightbulb,
  LucideShip,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "./ui/separator";
import { Fragment } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { homePath, invitePath, subscriptionPath } from "@/app/paths";
import { getSessionUser, isOrgAdminOrOwner } from "@/lib/auth";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme/theme-switcher";
import { OrgBadge } from "@/features/org/components/org-bade";
import { Button } from "./ui/button";
import Link from "next/link";

const items = [
  {
    title: "Home",
    url: homePath(),
    icon: Home,
  },
  {
    title: "Errors",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Ideas",
    url: "#",
    icon: Lightbulb,
    separator: true,
  },
  {
    title: "Process Database",
    url: "#",
    icon: Database,
    isAdmin: true,
  },
  {
    title: "Userbase",
    url: "#",
    icon: Users,
    separator: true,
    isAdmin: true,
  },
  {
    title: "Invite",
    url: invitePath(),
    icon: UserPlus,
    isAdmin: true,
  },
  {
    title: "Subscription",
    url: subscriptionPath(),
    icon: CreditCard,
    isAdmin: false,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
    isAdmin: true,
  },
];

export async function AppSidebar() {
  const user = await getSessionUser();

  if (!user) return <div className="h-full invisible" aria-hidden></div>;
  const isAdmin = await isOrgAdminOrOwner(user.userId);

  return (
    <Sidebar variant="floating">
      <SidebarContent>
        <SidebarGroup className="flex flex-col gap-2 h-full">

          <SidebarGroupLabel>
            <div className="flex flex-row gap-2 items-center">
              <LucideShip className="w-4 h-4" />
              <OrgBadge />
            </div>
            
          </SidebarGroupLabel>
          <Separator />
          <SidebarGroupContent>
            <SidebarMenu>
              {items
                .filter((item) => (item.isAdmin ? isAdmin : true))
                .map((item) =>
                  item.separator ? (
                    <Fragment key={item.title}>
                      <SidebarMenuItem
                        key={item.title}
                        className={cn(item.isAdmin && !isAdmin && "hidden")}
                      >
                        <SidebarMenuButton asChild>
                          <a href={item.url}>
                            <item.icon />
                            <span>{item.title}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <Separator />
                    </Fragment>
                  ) : (
                    <SidebarMenuItem
                      key={item.title}
                      className={cn(item.isAdmin && !isAdmin && "hidden")}
                    >
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User2 /> {user.email.split("@")[0]}
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <ThemeSwitcher />
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem>
                  <Button variant="ghost" className="flex flex-row justify-start w-full h-6">
                    <Link href="/" className="text-sm font-normal cursor-default">Support</Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                <Button variant="ghost" className="flex flex-row justify-start w-full h-6">
                    <Link href="/" className="text-sm font-normal cursor-default">Documentation</Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Button variant="ghost" className="flex flex-row justify-start w-full h-6">
                    <Link href="/" className="text-sm font-normal cursor-default">Feedback</Link>
                  </Button>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem>
                  <Button onClick={signOutAction} variant="ghost" className="flex flex-row justify-start w-full h-6">
                    <p className="text-sm font-normal">Logout</p>
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
