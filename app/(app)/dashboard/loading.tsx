export default function DashboardLoading() {
    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-5xl mx-auto px-6 py-12">
                {/* Header section matching DashboardPage */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <div className="h-9 w-64 bg-muted animate-pulse rounded-md" />
                        <div className="h-5 w-80 bg-muted/60 animate-pulse rounded-md mt-2" />
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
                        <div className="h-10 w-48 bg-[#f0a531]/50 animate-pulse rounded-md" />
                    </div>
                </div>

                {/* Verse of the Day + Current Streak */}
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-card p-6 h-48 animate-pulse" />
                    <div className="rounded-2xl border border-border bg-card p-6 h-48 animate-pulse" />
                </div>

                {/* Recent Devotions + Prayer row */}
                <section className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
                    <div className="rounded-2xl border border-border bg-card p-6 h-96 animate-pulse" />
                    <div className="rounded-2xl border border-border bg-card p-6 h-96 animate-pulse" />
                </section>

                {/* Stats Row */}
                <div className="mt-6">
                    <div className="rounded-2xl border border-border bg-card p-6 h-40 animate-pulse" />
                </div>
            </div>
        </main>
    );
}
