export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 bg-muted border-b border-border animate-pulse" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-6 bg-muted rounded w-2/3 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-8 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="h-12 bg-muted rounded mb-6 animate-pulse" />
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse border-b border-border" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
