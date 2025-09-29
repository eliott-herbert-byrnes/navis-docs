"use client";

import { ThemeSwitcher } from "./theme/theme-switcher";
import { Separator } from "./ui/separator";
import { useAuth } from "@/features/auth/hooks/use-auth";

const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return (
    <aside className="hidden md:block border-r p-3">
      <div className="h-full invisible" aria-hidden></div>
    </aside>
  )

  return (
    <aside className="hidden md:block border-r p-3">
      <nav className="space-y-2">
        <a className="block rounded-lg px-3 py-1">Navis Docs</a>
        <Separator className="my-4" />
        <a className="block rounded-lg px-3 py-1">Dashboard</a>
        <a className="block rounded-lg px-3 py-1">Departments</a>
        <Separator className="my-4" />
        <ThemeSwitcher />
      </nav>
    </aside>
  );
};

export { Sidebar };
