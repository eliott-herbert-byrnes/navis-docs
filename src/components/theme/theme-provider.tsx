"use client";

import { ThemeProvider as BaseThemeProvider } from "next-themes";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <BaseThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </BaseThemeProvider>
    )
}

export { ThemeProvider };