export default function EditorLoading() {
  return (
    <div className="flex flex-col h-dvh overflow-hidden bg-bg animate-pulse">
      {/* Skeleton toolbar */}
      <div className="h-[52px] border-b border-border bg-surface flex-shrink-0 flex items-center px-5 gap-2">
        <div className="h-4 w-16 bg-surface-2 rounded" />
        <div className="w-px h-4 bg-border mx-1.5" />
        <div className="h-8 w-36 bg-surface-2 rounded-lg" />
        <div className="w-7 h-7 bg-surface-2 rounded-lg" />
        <div className="ml-auto flex items-center gap-2">
          <div className="h-3 w-20 bg-surface-2 rounded hidden sm:block" />
          <div className="h-8 w-28 bg-surface-2 rounded-lg" />
          <div className="w-8 h-8 bg-surface-2 rounded-full" />
        </div>
      </div>

      {/* Mobile tab bar (<xl) */}
      <div className="xl:hidden h-12 border-b border-border bg-surface flex-shrink-0 px-2 gap-1 flex items-center">
        <div className="flex-1 h-7 bg-surface-2 rounded-full" />
        <div className="flex-1 h-7 bg-surface-2 rounded-full" />
      </div>

      {/* Mobile skeleton body (<xl) */}
      <div className="xl:hidden flex-1 bg-editor-bg" />

      {/* Desktop split-pane body (≥xl) */}
      <div className="hidden xl:flex flex-1 min-h-0 p-4 gap-3">
        {/* Variants rail (collapsed) */}
        <div className="bg-surface border border-border rounded-xl flex-shrink-0 w-8" />

        {/* Split pane */}
        <div className="flex flex-1 overflow-hidden rounded-xl border border-border">
          <div className="w-1/2 bg-editor-bg" />
          <div className="w-1 bg-border flex-shrink-0" />
          <div className="flex-1 bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
