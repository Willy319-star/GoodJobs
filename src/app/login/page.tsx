import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { SupabaseSetupNotice } from "@/components/auth/supabase-setup-notice";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <SupabaseSetupNotice />
      </main>
    );
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <AuthForm />
    </main>
  );
}