export default function LocationsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border bg-background" />
      <div className="border-b border-border py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-12 bg-muted rounded w-1/2 mx-auto mb-6 animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4 mx-auto animate-pulse" />
            <div className="h-4 bg-muted rounded w-4/5 mx-auto animate-pulse" />
          </div>
        </div>
      </div>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i}>
                <div className="relative rounded-lg overflow-hidden bg-muted h-48 mb-4 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-muted rounded animate-pulse" />
                    <div className="h-16 bg-muted rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
