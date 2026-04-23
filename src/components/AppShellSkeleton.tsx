function SkeletonBlock({ className }: { className: string }) {
  return <div className={`pulse-skeleton ${className}`} />;
}

export default function AppShellSkeleton() {
  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto lg:shell-desktop">
        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="rail-card rounded-[28px] p-5">
            <SkeletonBlock className="h-3 w-20 rounded-full" />
            <SkeletonBlock className="mt-4 h-8 w-28 rounded-2xl" />
            <SkeletonBlock className="mt-3 h-16 w-full rounded-[20px]" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock key={index} className="h-12 w-full rounded-[18px]" />
              ))}
            </div>
          </div>
        </aside>

        <div className="ios-shell feed-frame relative min-h-[100dvh] overflow-hidden rounded-[36px] border border-white/60 p-4 lg:min-h-[880px] lg:rounded-[32px] lg:p-6">
          <SkeletonBlock className="h-14 w-full rounded-[22px]" />
          <div className="mt-4 flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} className="h-20 min-w-[88px] flex-1 rounded-[24px]" />
            ))}
          </div>
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="ios-card rounded-[28px] p-5">
                <div className="flex items-center gap-3">
                  <SkeletonBlock className="h-11 w-11 rounded-full" />
                  <div className="flex-1">
                    <SkeletonBlock className="h-4 w-32 rounded-full" />
                    <SkeletonBlock className="mt-2 h-3 w-44 rounded-full" />
                  </div>
                </div>
                <SkeletonBlock className="mt-5 h-20 w-full rounded-[20px]" />
                <SkeletonBlock className="mt-4 h-52 w-full rounded-[22px]" />
                <div className="mt-4 flex gap-4">
                  <SkeletonBlock className="h-5 w-16 rounded-full" />
                  <SkeletonBlock className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="rail-card rounded-[28px] p-5">
            <SkeletonBlock className="h-3 w-24 rounded-full" />
            <SkeletonBlock className="mt-4 h-24 w-full rounded-[20px]" />
            <SkeletonBlock className="mt-3 h-28 w-full rounded-[20px]" />
            <SkeletonBlock className="mt-3 h-24 w-full rounded-[20px]" />
          </div>
        </aside>
      </div>
    </div>
  );
}
