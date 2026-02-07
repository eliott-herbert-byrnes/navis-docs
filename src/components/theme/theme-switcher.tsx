"use client";

import { useTheme } from "next-themes";
import { Button } from "../ui/button";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  return (
    <>
      <Button
        variant="ghost"
        className="flex flex-row justify-start p-4 w-full rounded-none"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <p className="text-sm font-normal">Switch Themes</p>
      </Button>
    </>
  );
};

export { ThemeSwitcher };
