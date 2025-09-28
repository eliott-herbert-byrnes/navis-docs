import { ThemeSwitcher } from "./theme/theme-switcher";
import { Separator } from "./ui/separator";

const Sidebar = () => {
  return (
    <nav className="space-y-2">
      <a className="block rounded-lg px-3 py-1">Navis Docs</a>
      <Separator className="my-4" />
      <a className="block rounded-lg px-3 py-1">Dashboard</a>
      <a className="block rounded-lg px-3 py-1">Departments</a>
      <Separator className="my-4" />
      <ThemeSwitcher />
    </nav>
  );
};

export { Sidebar };
