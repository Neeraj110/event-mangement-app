export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-16 border-b border-border bg-background" />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-xl border border-border p-8">
            <div className="mb-8 text-center">
              <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-2 animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 mx-auto animate-pulse" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-4 bg-muted rounded w-20 mb-2 animate-pulse" />
                  <div className="h-10 bg-muted rounded animate-pulse" />
                </div>
              ))}
              <div className="h-10 bg-blue-600/30 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
