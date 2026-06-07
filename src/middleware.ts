import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Permitir webhooks sin autenticación
  if (req.nextUrl.pathname.startsWith("/api/webhooks/")) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            res.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const isAuthRoute = req.nextUrl.pathname.startsWith("/(auth)") ||
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/register";

  const isDashboardRoute = req.nextUrl.pathname.startsWith("/(dashboard)") ||
    (req.nextUrl.pathname !== "/login" &&
      req.nextUrl.pathname !== "/register" &&
      req.nextUrl.pathname !== "/");

  // Si no está autenticado y quiere entrar al dashboard, redirigir a login
  if (!user && !isAuthRoute && req.nextUrl.pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si está autenticado y quiere entrar a auth, redirigir a dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
