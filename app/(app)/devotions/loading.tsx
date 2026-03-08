export default function DevotionsLoading() {
    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="h-8 w-32 bg-muted animate-pulse rounded-md" />
                    <div className="h-5 w-24 bg-muted/60 animate-pulse rounded-md" />
                </div>

                {/* Layout: Main List (1fr) + Calendar Sidebar (280px) */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
                    <div>
                        {/* Search/Filter Bar */}
                        <div className="rounded-xl border border-border bg-card p-4 mb-4 h-16 animate-pulse" />

                        {/* Devotion Cards */}
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="rounded-xl border border-border bg-card p-5 h-32 animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Calendar Sidebar */}
                    <div className="space-y-4">
                        <div className="h-4 w-48 bg-muted/60 animate-pulse rounded-md" />
                        <div className="rounded-xl border border-border bg-card p-4 h-64 animate-pulse" />
                        <div className="flex gap-2">
                            <div className="h-8 w-10 bg-muted animate-pulse rounded-md" />
                            <div className="h-8 w-10 bg-muted animate-pulse rounded-md" />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
