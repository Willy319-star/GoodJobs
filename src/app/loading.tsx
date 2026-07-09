import { GoodJobsLogoMark } from "@/components/brand/goodjobs-logo";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,rgba(37,99,235,0.12),transparent_30%),linear-gradient(180deg,rgba(239,246,255,0.9)_0%,rgba(255,255,255,1)_260px)] text-foreground">
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-blue-50">
        <div className="h-full w-1/2 animate-pulse bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600" />
      </div>
      <header className="border-b border-blue-100/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-2.5 px-4 sm:px-6 lg:px-8">
          <GoodJobsLogoMark />
          <span className="text-lg font-semibold tracking-tight text-slate-950">GoodJobs</span>
          <span className="ml-3 text-sm text-muted-foreground">正在同步最新数据...</span>
        </div>
      </header>
    </div>
  );
}
