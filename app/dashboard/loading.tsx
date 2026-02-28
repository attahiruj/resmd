export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bg animate-pulse">
      {/* Skeleton navbar */}
      <div className="h-[60px] border-b border-border bg-surface flex items-center px-5 gap-3">
        <div className="h-4 w-16 bg-surface-2 rounded" />
        <div className="ml-auto flex items-center gap-3">
          <div className="h-3 w-28 bg-surface-2 rounded" />
          <div className="h-3 w-12 bg-surface-2 rounded" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Skeleton header row */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-surface-2 rounded-md" />
            <div className="h-3 w-40 bg-surface-2 rounded-md" />
          </div>
          <div className="h-8 w-28 bg-surface-2 rounded-lg" />
        </div>

        {/* Skeleton variant cards */}
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-48 bg-surface-2 rounded" />
                <div className="h-3 w-32 bg-surface-2 rounded" />
              </div>
              <div className="flex gap-1">
                <div className="w-8 h-8 bg-surface-2 rounded-lg" />
                <div className="w-8 h-8 bg-surface-2 rounded-lg" />
                <div className="w-8 h-8 bg-surface-2 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
