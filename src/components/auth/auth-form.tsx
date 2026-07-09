"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { signInAction, signUpAction, type AuthActionState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GoodJobsLogoMark } from "@/components/brand/goodjobs-logo";

const initialState: AuthActionState = {
  ok: false,
  message: "",
};

export function AuthForm() {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="gap-4 text-center">
        <GoodJobsLogoMark className="mx-auto size-14" iconClassName="size-14" />
        <div>
          <CardTitle className="text-2xl">{mode === "sign-in" ? "登录 GoodJobs" : "注册 GoodJobs"}</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "sign-in" ? "继续管理你的秋招进度、面试和提醒。" : "创建账号后，你的数据会通过 Supabase RLS 隔离保护。"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <form action={formAction} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">邮箱</FieldLabel>
              <Input id="email" name="email" type="email" placeholder="name@example.com" autoComplete="email" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">密码</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="至少 6 位"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
              <FieldDescription>请使用你能长期访问的邮箱。</FieldDescription>
            </Field>
          </FieldGroup>

          {state.message ? (
            <p className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>{state.message}</p>
          ) : null}

          <Button type="submit" disabled={isPending}>
            {isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : null}
            {mode === "sign-in" ? "登录" : "注册"}
          </Button>
        </form>

        <Separator />

        <Button variant="outline" onClick={() => setMode((value) => (value === "sign-in" ? "sign-up" : "sign-in"))}>
          {mode === "sign-in" ? "还没有账号？注册" : "已有账号？登录"}
        </Button>
      </CardContent>
    </Card>
  );
}
