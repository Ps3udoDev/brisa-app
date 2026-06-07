import { createServerSB } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";

type Handler = (
  req: NextRequest,
  user: User
) => Promise<NextResponse> | NextResponse;

export function withAuth(
  handler: Handler,
  options?: { requireRole?: string[] }
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const supabase = await createServerSB();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    if (options?.requireRole) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile || !options.requireRole.includes(profile.role)) {
        return NextResponse.json(
          { success: false, error: "Forbidden", code: "INSUFFICIENT_ROLE" },
          { status: 403 }
        );
      }
    }

    return handler(req, user);
  };
}
