import {NextResponse} from "next/server";
import type {NextRequest} from "next/server";

export function middleware(req: NextRequest) {
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|auth|favicon.ico).*)"],
}