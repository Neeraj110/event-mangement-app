export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 bg-muted border-b border-border animate-pulse" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-6 space-y-2 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-8 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-card border border-border rounded-lg p-6 space-y-4 animate-pulse">
            <div className="h-64 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
          <div className="lg:col-span-2 bg-card border border-border rounded-lg p-6 animate-pulse">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded border-b border-border" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
