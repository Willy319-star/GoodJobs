import { GoodJobsLogoMark } from "@/components/brand/goodjobs-logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SupabaseSetupNotice() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="gap-4 text-center">
        <GoodJobsLogoMark className="mx-auto size-14" iconClassName="size-14" />
        <div>
          <CardTitle className="text-2xl">需要配置 Supabase</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            GoodJobs 的登录功能已经接好，但还需要在项目根目录创建 .env.local，并填入 Supabase 项目的 URL 和 publishable key。
          </p>
        </div>
      </CardHeader>
      <CardContent className="rounded-md bg-muted p-4 font-mono text-xs leading-6 text-muted-foreground">
        <p>NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-publishable-key</p>
      </CardContent>
    </Card>
  );
}
