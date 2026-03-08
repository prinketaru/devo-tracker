export default function PrayerLoading() {
    return (
        <main className="min-h-screen bg-background px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
                    <div className="h-5 w-96 bg-muted/60 animate-pulse rounded-md mt-2" />
                </div>

                <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-sm">
                    {/* Prayer form + filter tabs skeleton */}
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="h-24 w-full bg-muted/30 animate-pulse rounded-xl" />
                        <div className="flex gap-2">
                            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                            <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                        </div>
                    </div>

                    {/* Prayer cards */}
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-xl border border-border bg-muted/10 p-4 h-20 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
