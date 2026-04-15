import { getSessionContext } from "@/lib/auth"
import { AuthProvider } from "./auth-context"

export async function AsyncAuthContextLoader({ children }: { children: React.ReactNode }) {
    const ctx = await getSessionContext()
    // Safety net for the edge case of an invalid JWT passing the proxy cookie check.
    // Falls back to isAdmin: false rather than throwing, so client components don't crash.
    return (
        <AuthProvider
            isAdmin={ctx?.isAdmin ?? false}
            hasActiveAccess={ctx?.hasActiveAccess ?? false}
        >
            {children}
        </AuthProvider>
    )
}