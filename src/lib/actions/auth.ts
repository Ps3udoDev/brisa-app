"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSB } from "@/lib/supabase/server";

type SignInResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Public server action.
 *
 * This action is intentionally callable without an existing session because
 * it is the login entry point. Do not add an auth/session check here.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  const supabase = await createServerSB();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error) {
    /**
     * Avoid returning Supabase's raw error message directly.
     * This prevents leaking auth details and keeps the login response generic.
     */
    return {
      success: false,
      error: "Invalid email or password.",
    };
  }

  // Bloquear el acceso a cuentas desactivadas (is_active = false).
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .single();

  if (profile && profile.is_active === false) {
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Tu cuenta está desactivada. Contacta a un administrador.",
    };
  }

  revalidatePath("/", "layout");

  return {
    success: true,
  };
}

/**
 * Actualiza el correo y/o la contraseña del usuario autenticado vía Supabase
 * Auth (sobre su propia cuenta). Cambiar el correo dispara un email de
 * confirmación según la configuración del proyecto.
 */
export async function updateAccount(input: {
  email?: string;
  password?: string;
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSB();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "No autenticado" };
  }

  const updates: { email?: string; password?: string } = {};
  if (input.email) updates.email = input.email.trim().toLowerCase();
  if (input.password) updates.password = input.password;

  if (Object.keys(updates).length === 0) {
    return { success: false, error: "Nada que actualizar" };
  }

  const { error } = await supabase.auth.updateUser(updates);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}

export async function signOut() {
  const supabase = await createServerSB();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getSession() {
  const supabase = await createServerSB();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    return {
      user,
      profile: null,
    };
  }

  return {
    user,
    profile,
  };
}
