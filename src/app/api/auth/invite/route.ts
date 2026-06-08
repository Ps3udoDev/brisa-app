import { withAuth } from "@/app/api/_lib/with-auth";
import { inviteUserByEmail } from "@/lib/supabase/admin";
import { createServerSB } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.email(),
  role: z.enum(["asociado", "jefe_operador"]).default("asociado"),
  parent_id: z.uuid().optional(),
  first_name: z.string().optional(),
});

export const POST = withAuth(
  async (req: NextRequest, user) => {
    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.flatten(),
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { email, role, parent_id, first_name } = parsed.data;

    try {
      // Invitar usuario por email (service role)
      const invitedUser = await inviteUserByEmail(email, {
        first_name,
        role,
        parent_id,
      });

      if (!invitedUser) {
        throw new Error("Invitation returned null");
      }

      // Actualizar perfil con role y parent_id
      const supabase = await createServerSB();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role,
          parent_id: parent_id || null,
          first_name,
        })
        .eq("id", invitedUser.id);

      if (updateError) {
        return NextResponse.json(
          {
            success: false,
            error: updateError.message,
            code: "PROFILE_UPDATE_FAILED",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { success: true, data: { user_id: invitedUser.id, email } },
        { status: 201 }
      );
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }
  },
  { requireRole: ["super_admin"] }
);
