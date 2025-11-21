'use server';

import { signOut } from "@/auth";
import { signInPath } from "@/app/paths";

export async function signOutAction(): Promise<void> {
    await signOut({ redirectTo: signInPath() });
}