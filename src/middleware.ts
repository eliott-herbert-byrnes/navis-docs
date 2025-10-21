import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";
import { auth } from "./auth.config";

export async function middleware(req: NextRequest) {
    const {pathname} = req.nextUrl;
    if(pathname.startsWith("/api/auth")) {
        return NextResponse.next();
    }
    const session = await auth();
    if(!session?.user?.email || !session.user.id) {
        return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|auth|favicon.ico|.*\\..*).*)"],
}