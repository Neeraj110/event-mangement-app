export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 bg-muted border-b border-border animate-pulse" />
      <div className="h-96 bg-muted animate-pulse" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
              <div className="h-12 bg-muted rounded animate-pulse" />
              <div className="h-20 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="lg:col-span-1 space-y-4 sticky top-20">
            <div className="h-80 bg-muted rounded-lg animate-pulse border border-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
