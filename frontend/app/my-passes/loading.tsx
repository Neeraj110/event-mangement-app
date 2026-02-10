export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 bg-muted border-b border-border animate-pulse" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-4">
          <div className="h-10 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-6 bg-muted rounded w-2/3 animate-pulse" />
        </div>
        <div className="h-12 bg-muted rounded mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3 bg-card border border-border rounded-lg p-6 animate-pulse">
              <div className="h-56 bg-muted rounded-lg" />
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
