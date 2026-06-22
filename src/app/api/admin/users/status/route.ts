import { type NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/app/api/_lib/with-auth";
import { toggleUserActiveSchema } from "@/lib/schemas";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * POST /api/admin/users/status
 * Activa o desactiva un usuario (profiles.is_active). Requiere service-role
 * porque la RLS no permite que un usuario modifique el perfil de otro.
 * Gateado a super_admin.
 */
export const POST = withAuth(
  async (req: NextRequest, user) => {
    const body = await req.json();
    const parsed = toggleUserActiveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.flatten(),
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }

    const { userId, isActive } = parsed.data;

    // Evita que el super_admin se desactive a sí mismo y se bloquee.
    if (userId === user.id && !isActive) {
      return NextResponse.json(
        {
          success: false,
          error: "No puedes desactivar tu propia cuenta",
          code: "SELF_DEACTIVATION",
        },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message, code: "UPDATE_FAILED" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: { userId, isActive } });
  },
  { requireRole: ["super_admin"] },
);
