import { withAuth } from "@/app/api/_lib/with-auth";
import { createAuthUser } from "@/lib/supabase/admin";
import { createServerSB } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  first_name: z.string().min(1).max(100).optional(),
  middle_name: z.string().max(100).optional(),
  last_name1: z.string().max(100).optional(),
  last_name2: z.string().max(100).optional(),
  role: z.enum(["asociado", "jefe_operador"]).default("asociado"),
  parent_id: z.string().uuid().optional(),
});

export const POST = withAuth(
  async (req: NextRequest, user) => {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

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

    const {
      email,
      password,
      first_name,
      middle_name,
      last_name1,
      last_name2,
      role,
      parent_id,
    } = parsed.data;

    try {
      // Paso 1: Crear usuario en auth.users con SERVICE ROLE
      const newUser = await createAuthUser(email, password, {
        first_name,
        middle_name,
        last_name1,
        last_name2,
      });

      if (!newUser) {
        throw new Error("User creation returned null");
      }

      // Paso 2: El trigger handle_new_user() ya creó el perfil básico.
      // Paso 3: Actualizar perfil con role y parent_id
      const supabase = await createServerSB();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          role,
          parent_id: parent_id || null,
          first_name,
          middle_name,
          last_name1,
          last_name2,
        })
        .eq("id", newUser.id);

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
        { success: true, data: { user_id: newUser.id, email } },
        { status: 201 }
      );
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err.message, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }
  },
  { requireRole: ["super_admin"] } // Solo Super Admin puede registrar
);
