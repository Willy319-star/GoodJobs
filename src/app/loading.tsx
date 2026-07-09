import { GoodJobsLogoMark } from "@/components/brand/goodjobs-logo";

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(239,246,255,0.75)_0%,rgba(255,255,255,1)_220px)] text-foreground">
      <header className="border-b border-blue-100 bg-background/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <GoodJobsLogoMark />
            <SkeletonBlock className="h-5 w-24" />
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <SkeletonBlock className="h-10 w-36 rounded-lg" />
            <SkeletonBlock className="h-9 w-80 rounded-lg" />
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <SkeletonBlock className="size-9 rounded-md" />
            <SkeletonBlock className="h-5 w-36" />
            <SkeletonBlock className="h-9 w-20 rounded-md" />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <section className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <SkeletonBlock className="h-9 w-64" />
              <SkeletonBlock className="h-5 w-[min(560px,80vw)]" />
            </div>
            <SkeletonBlock className="h-11 w-28 rounded-md" />
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between">
                  <SkeletonBlock className="h-5 w-20" />
                  <SkeletonBlock className="size-6 rounded" />
                </div>
                <div className="mt-10 flex items-end gap-3">
                  <SkeletonBlock className="h-10 w-12" />
                  <SkeletonBlock className="mb-1 h-5 w-14" />
                </div>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            {[0, 1].map((card) => (
              <div key={card} className="rounded-lg border bg-card p-6">
                <SkeletonBlock className="h-6 w-28" />
                <div className="mt-6 space-y-4">
                  {[0, 1, 2].map((row) => (
                    <div key={row} className="flex items-center gap-3 rounded-md border p-4">
                      <SkeletonBlock className="size-10 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <SkeletonBlock className="h-5 w-40" />
                        <SkeletonBlock className="h-4 w-28" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}
