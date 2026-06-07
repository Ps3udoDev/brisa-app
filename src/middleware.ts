import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/", "/login"];
  const isPublicPath = publicPaths.includes(req.nextUrl.pathname);

  // Permitir webhooks sin autenticación
  if (req.nextUrl.pathname.startsWith("/api/webhooks/")) {
    return res;
  }

  // Permitir API routes de auth (login se maneja en server actions, pero por si acaso)
  if (req.nextUrl.pathname.startsWith("/api/auth/")) {
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
  } = await supabase.auth.getUser();

  // Si está autenticado y visita la landing o login, redirigir al dashboard
  if (user && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Si no está autenticado y visita una ruta protegida, redirigir a login
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
