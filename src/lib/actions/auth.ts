"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthActionState = {
  ok: boolean;
  message: string;
};

type CredentialsResult =
  | { ok: true; email: string; password: string }
  | { ok: false; message: string };

function getCredentials(formData: FormData): CredentialsResult {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "请输入邮箱和密码。" };
  }

  if (password.length < 6) {
    return { ok: false, message: "密码至少需要 6 位。" };
  }

  return { ok: true, email, password };
}

function ensureSupabaseConfigured(): AuthActionState | null {
  if (!hasSupabaseEnv()) {
    return { ok: false, message: "请先配置 Supabase 环境变量。" };
  }

  return null;
}

export async function signInAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const configError = ensureSupabaseConfigured();
  if (configError) {
    return configError;
  }

  const credentials = getCredentials(formData);

  if (!credentials.ok) {
    return { ok: false, message: credentials.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return { ok: false, message: "登录失败，请检查邮箱和密码。" };
  }

  redirect("/dashboard");
}

export async function signUpAction(_previousState: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const configError = ensureSupabaseConfigured();
  if (configError) {
    return configError;
  }

  const credentials = getCredentials(formData);

  if (!credentials.ok) {
    return { ok: false, message: credentials.message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) {
    return { ok: false, message: "注册失败，请确认邮箱格式正确，或稍后再试。" };
  }

  return { ok: true, message: "注册成功。请检查邮箱确认邮件，或直接尝试登录。" };
}

export async function signOutAction() {
  if (!hasSupabaseEnv()) {
    redirect("/login");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}