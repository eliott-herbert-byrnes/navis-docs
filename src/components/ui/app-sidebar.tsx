import { User2 } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "./separator";
import { Fragment } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { signOutAction } from "@/features/auth/actions/sign-out";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "../theme/theme-switcher";
import { Button } from "./button";
import Link from "next/link";
import { items } from "@/config/navigation";
import Image from "next/image";
import { getSessionContext } from "@/lib/auth";

export async function AppSidebar() {
  const ctx = await getSessionContext()
  if (!ctx) return <div className="h-full invisible" aria-hidden />
  const { isAdmin } = ctx;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarContent>
        <SidebarGroup className="flex flex-col gap-2 h-full">
          <SidebarGroupContent>
            <SidebarMenu>
              <div className="flex flex-row gap-2 items-center pt-2 mb-2 mt-1">
                {/* <LucideShip className="w-4.5 h-4.5 ml-2" /> */}
                <Image src="/navis-docs-logo-square-2-svg.svg" alt="Navis Docs Logo" className="rounded-xs mx-auto" width="30" height="30" />
                <span className="text-sm group-data-[collapsible=icon]:hidden">
                  Navis Docs
                </span>
              </div>
              <Separator />
              {items
                .filter((item) =>
                  "isAdmin" in item && item.isAdmin ? isAdmin : true,
                )
                .map((item) =>
                  "separator" in item && item.separator ? (
                    <Fragment key={item.title}>
                      <SidebarMenuItem
                        key={item.title}
                        className={cn(
                          "isAdmin" in item &&
                          item.isAdmin &&
                          !isAdmin &&
                          "hidden",
                        )}
                      >
                        <SidebarMenuButton asChild tooltip={item.title}>
                          <Link href={item.path}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <Separator />
                    </Fragment>
                  ) : (
                    <SidebarMenuItem
                      key={item.title}
                      className={cn(
                        "isAdmin" in item &&
                        item.isAdmin &&
                        !isAdmin &&
                        "hidden",
                      )}
                    >
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link href={item.path}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
                )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu className="border-1 rounded-sm">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <span className="flex size-4 shrink-0 items-center justify-center">
                    <User2 />
                  </span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="translate-x-4">
                <DropdownMenuItem asChild>
                  <ThemeSwitcher />
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-4 w-full rounded-none"
                  >
                    <Link
                      href="/"
                      className="text-sm font-normal cursor-default ml-2"
                    >
                      Support
                    </Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-4 w-full rounded-none"
                  >
                    <Link
                      href="/"
                      className="text-sm font-normal cursor-default ml-2"
                    >
                      Documentation
                    </Link>
                  </Button>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-4 w-full rounded-none"
                  >
                    <Link
                      href="/"
                      className="text-sm font-normal cursor-default ml-2"
                    >
                      Feedback
                    </Link>
                  </Button>
                </DropdownMenuItem>
                <Separator />
                <DropdownMenuItem asChild>
                  <Button
                    variant="ghost"
                    className="flex flex-row justify-start p-4 w-full rounded-none"
                    type="submit"
                    onClick={signOutAction}
                  >
                    <p className="text-sm font-normal ml-2">Logout</p>
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
