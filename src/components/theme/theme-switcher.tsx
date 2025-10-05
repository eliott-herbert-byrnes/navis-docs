"use client";

import { useTheme } from "next-themes";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  return (
    <>
        <span
          className=""
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          Switch Themes
        </span>

    </>
  );
};

export { ThemeSwitcher };

// <Button
//   variant="outline"
//   size="icon"
//   onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
// >
//   <LucideSun className="h-4 w-4 rotate-0 scale-100 transition-transform transition-opacity duration-1500 dark:-rotate-90 dark:scale-0 dark:opacity-0" />
//   <LucideMoon className="absolute h-4 w-4 rotate-90 scale-0 opacity-0 transition-transform transition-opacity duration-1500 dark:rotate-0 dark:scale-100 dark:opacity-100" />

//   <span className="sr-only">Toggle theme</span>
// </Button>
