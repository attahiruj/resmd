export default function EditorLoading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg animate-pulse">
      {/* Skeleton toolbar */}
      <div className="h-[60px] border-b border-border bg-surface flex-shrink-0 flex items-center px-5 gap-3">
        <div className="h-4 w-16 bg-surface-2 rounded" />
        <div className="w-px h-5 bg-border" />
        <div className="h-4 w-36 bg-surface-2 rounded" />
        <div className="ml-auto flex items-center gap-2">
          <div className="w-9 h-9 bg-surface-2 rounded-full" />
          <div className="w-9 h-9 bg-surface-2 rounded-full" />
          <div className="w-px h-5 bg-border" />
          <div className="w-20 h-8 bg-surface-2 rounded-lg" />
          <div className="w-8 h-8 bg-surface-2 rounded-full" />
        </div>
      </div>

      {/* Desktop skeleton split pane */}
      <div className="hidden md:flex flex-1 min-h-0 p-8">
        <div className="flex flex-1 overflow-hidden rounded-xl border border-border">
          <div className="flex-1 bg-editor-bg" />
          <div className="w-1 bg-border flex-shrink-0" />
          <div className="flex-1 bg-surface-2" />
        </div>
      </div>

      {/* Mobile skeleton */}
      <div className="md:hidden flex-1 bg-editor-bg" />
    </div>
  )
}
