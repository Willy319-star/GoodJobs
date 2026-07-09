import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-sm">
        <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <SearchX data-icon="inline-start" />
        </span>
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight">没有找到这个页面</h1>
          <p className="text-sm leading-6 text-muted-foreground">这条记录可能已经删除，或你没有访问权限。</p>
        </div>
        <Link href="/dashboard" className={buttonVariants()}>回到首页</Link>
      </div>
    </main>
  );
}