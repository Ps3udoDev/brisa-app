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
  password: string
): Promise<SignInResult> {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      success: false,
      error: "Email and password are required.",
    };
  }

  const supabase = await createServerSB();

  const { error } = await supabase.auth.signInWithPassword({
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

  revalidatePath("/", "layout");

  return {
    success: true,
  };
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