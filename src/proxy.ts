import { NextResponse, type NextRequest } from "next/server";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
  "admin@hatkholabazar.com"
)
  .toLowerCase()
  .trim();

function getSessionToken(request: NextRequest): string | undefined {
  const directToken =
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value ||
    request.cookies.get("better-auth.session")?.value ||
    request.cookies.get("better-auth.session_data")?.value ||
    request.cookies.get("__Secure-better-auth.session_data")?.value;

  if (directToken) return directToken;

  const allCookies = request.cookies.getAll();
  const sessionCookie = allCookies.find(
    (c) =>
      c.name.includes("better-auth") &&
      (c.name.includes("session") || c.name.includes("token") || c.name.includes("data")) &&
      Boolean(c.value)
  );
  if (sessionCookie?.value) return sessionCookie.value;

  const cookieHeader = request.headers.get("cookie") || "";
  if (
    cookieHeader.includes("better-auth.session_token=") ||
    cookieHeader.includes("__Secure-better-auth.session_token=") ||
    cookieHeader.includes("better-auth.session_data=") ||
    cookieHeader.includes("hatkhola_admin_token=")
  ) {
    return "session_present";
  }

  return undefined;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken = getSessionToken(request);
  const adminCookie = request.cookies.get("hatkhola_admin_token")?.value;

  const isAdminRoute =
    pathname.startsWith("/admin") || pathname.startsWith("/dashboard");
  const isProfileRoute =
    pathname.startsWith("/profile") || pathname.startsWith("/account");

  // 1. Protection for Profile & Account routes
  if (isProfileRoute) {
    if (!sessionToken && !adminCookie) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // 2. Protection for Admin & Dashboard routes
  if (isAdminRoute) {
    // If unauthenticated, redirect to admin login
    if (!sessionToken && !adminCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Fast-path: if validated admin cookie is present, allow access
    if (adminCookie) {
      return NextResponse.next();
    }

    // Verify session data from Better Auth
    try {
      const sessionRes = await fetch(
        `${request.nextUrl.origin}/api/auth/get-session`,
        {
          headers: {
            cookie: request.headers.get("cookie") || "",
          },
          cache: "no-store",
        }
      );

      if (sessionRes.ok) {
        const sessionData = await sessionRes.json();
        const user = sessionData?.user;
        const isUserAdmin =
          user &&
          (user.role === "admin" ||
            user.email?.toLowerCase().trim() === ADMIN_EMAIL);

        if (isUserAdmin) {
          const response = NextResponse.next();
          response.cookies.set("hatkhola_admin_token", "admin", {
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
            sameSite: "lax",
          });
          return response;
        }
      }
    } catch {
      // In case of error during verification, conceal admin routes
    }

    // Normal customer account attempting to access private admin console:
    // Conceal endpoint with 404 Not Found to prevent discovery
    return NextResponse.rewrite(new URL("/not-found", request.url), {
      status: 404,
    });
  }

  return NextResponse.next();
}

// Support both proxy and middleware export conventions
export const middleware = proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/account/:path*",
  ],
};
