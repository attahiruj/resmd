export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bg animate-pulse">
      {/* Skeleton navbar */}
      <div className="h-[52px] border-b border-border bg-surface flex items-center px-5 gap-2">
        <div className="h-4 w-16 bg-surface-2 rounded" />
        <div className="ml-auto">
          <div className="w-8 h-8 bg-surface-2 rounded-full" />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Skeleton header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="h-5 w-28 bg-surface-2 rounded-md" />
            <div className="flex items-center gap-2.5 mt-2">
              <div className="w-24 h-1.5 bg-surface-2 rounded-full" />
              <div className="h-3 w-16 bg-surface-2 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-24 bg-surface-2 rounded-lg" />
            <div className="h-9 w-28 bg-surface-2 rounded-lg" />
          </div>
        </div>

        {/* Skeleton search + controls bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 h-10 bg-surface-2 rounded-lg" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-28 bg-surface-2 rounded-lg" />
            <div className="h-10 w-20 bg-surface-2 rounded-lg" />
          </div>
        </div>

        {/* Skeleton grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* "New Resume" placeholder */}
          <div className="border-2 border-dashed border-border rounded-xl h-[220px]" />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl overflow-hidden"
            >
              <div className="h-40 bg-surface-2" />
              <div className="p-4 space-y-2">
                <div className="h-3.5 w-3/4 bg-surface-2 rounded" />
                <div className="h-3 w-1/2 bg-surface-2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
