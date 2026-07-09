"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-md bg-destructive/10 text-destructive">
          <AlertTriangle data-icon="inline-start" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight">页面暂时无法加载</h1>
          <p className="text-sm leading-6 text-muted-foreground">可能是网络、登录状态或数据库连接暂时异常。你可以重试一次。</p>
        </div>
        <Button onClick={reset}>重新加载</Button>
      </div>
    </main>
  );
}