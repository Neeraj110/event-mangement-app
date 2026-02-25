export function EventCardSkeleton() {
    return (
        <div className="group block h-full animate-pulse">
            <div className="relative h-full bg-card border border-border/50 rounded-xl sm:rounded-[2rem] overflow-hidden">
                {/* Image Section Skeleton */}
                <div className="relative aspect-[4/3] bg-muted" />

                {/* Content Section Skeleton */}
                <div className="p-4 sm:p-6 flex flex-col">
                    <div className="mb-4">
                        <div className="h-4 w-20 bg-muted rounded-full mb-2" />
                        <div className="h-6 w-full bg-muted rounded mb-2" />
                        <div className="h-6 w-3/4 bg-muted rounded mb-2" />
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-4 h-4 bg-muted rounded-full" />
                            <div className="h-4 w-32 bg-muted rounded" />
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="h-3 w-12 bg-muted rounded" />
                            <div className="h-6 w-16 bg-muted rounded" />
                        </div>
                        <div className="h-10 w-28 bg-muted rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}
