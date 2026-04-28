import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// In Next.js 16, "middleware" was renamed to "proxy" — this file is `proxy.ts`.
// This is only an *optimistic* check (cookie presence). Real session
// verification happens in `app/admin/layout.tsx` server component.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("restaurant_session");
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
