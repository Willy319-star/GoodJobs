"use server";

import { headers } from "next/headers";
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

const INVITE_CODE_PATTERN = /^GJ-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

function normalizeInviteCode(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toUpperCase();
}

function isEmailLike(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getCredentials(formData: FormData): CredentialsResult {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "请输入邮箱和密码。" };
  }

  if (!isEmailLike(email)) {
    return { ok: false, message: "邮箱格式不正确，请检查是否多了空格、中文符号或少了 @。" };
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

function getSignUpErrorMessage(message: string) {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("invalid") && lowerMessage.includes("email")) {
    return "邮箱格式不正确，请检查是否多了空格、中文符号或少了 @。";
  }

  if (lowerMessage.includes("already") || lowerMessage.includes("registered") || lowerMessage.includes("exists")) {
    return "这个邮箱可能已经注册过，请直接登录。";
  }

  if (lowerMessage.includes("signup") && lowerMessage.includes("disabled")) {
    return "当前 Supabase 项目没有开启注册，请在 Authentication 设置里开启。";
  }

  if (lowerMessage.includes("password")) {
    return "密码不符合要求，请至少使用 6 位，并避免过于简单。";
  }

  return `注册失败：${message}`;
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

  const inviteCode = normalizeInviteCode(formData.get("inviteCode"));

  if (!inviteCode) {
    return { ok: false, message: "请输入邀请码。" };
  }

  if (!INVITE_CODE_PATTERN.test(inviteCode)) {
    return { ok: false, message: "邀请码格式不正确，应类似 GJ-ABCD-1234。" };
  }

  const supabase = await createClient();
  const { data: isAvailable, error: inviteError } = await supabase.rpc("is_invite_code_available", {
    invite_code: inviteCode,
  });

  if (inviteError) {
    return { ok: false, message: "邀请码功能还没有初始化，请先在 Supabase 运行 0007_invite_codes.sql。" };
  }

  if (!isAvailable) {
    return { ok: false, message: "邀请码无效或已经被使用。" };
  }

  const origin = (await headers()).get("origin") ?? "https://good-jobs.vercel.app";
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: {
      emailRedirectTo: `${origin}/dashboard`,
    },
  });

  if (error) {
    return { ok: false, message: getSignUpErrorMessage(error.message) };
  }

  if (data.user?.id) {
    const { data: claimed, error: claimError } = await supabase.rpc("claim_invite_code", {
      invite_code: inviteCode,
      claim_user_id: data.user.id,
    });

    if (claimError || !claimed) {
      return { ok: false, message: "注册成功，但邀请码核销失败，请联系管理员处理。" };
    }
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
