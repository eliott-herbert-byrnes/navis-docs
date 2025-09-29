'use client';

import {SessionProvider} from "next-auth/react";
import { ThemeProvider } from "@/components/theme/theme-provider";

const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <SessionProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </SessionProvider>
    )
}

export {Providers};