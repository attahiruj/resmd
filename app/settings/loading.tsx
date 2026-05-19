export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-6 space-y-4"
          >
            <div className="h-5 w-32 bg-surface-2 rounded animate-pulse" />
            <div className="h-4 w-full bg-surface-2 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-surface-2 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
