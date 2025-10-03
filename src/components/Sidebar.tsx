"use client";

import { signOutAction } from "@/features/auth/actions/sign-out";
import { ThemeSwitcher } from "./theme/theme-switcher";
import { Separator } from "./ui/separator";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Button } from "./ui/button";
import { invitePath } from "@/app/paths";
import Link from "next/link";

const Sidebar = () => {
  const { user } = useAuth();
  if (!user)
    return (
      <aside className="hidden md:block border-r p-3">
        <div className="h-full invisible" aria-hidden></div>
      </aside>
    );

  return (
    <aside className="hidden md:block border-r p-3">
      <nav className="flex flex-col space-y-2">
        <a className="block rounded-lg px-3 py-1">Navis Docs</a>
        <Separator className="my-4" />
        <a className="block rounded-lg px-3 py-1">Dashboard</a>
        <a className="block rounded-lg px-3 py-1">Departments</a>
        <Separator className="my-4" />
        <Link href={invitePath()}><span>Invitations</span></Link>
        <ThemeSwitcher />
        <Button onClick={signOutAction}>Sign Out</Button>
      </nav>
    </aside>
  );
};

export { Sidebar };
