export default function SettingsLoading() {
    return (
        <main className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-6 py-12">
                <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
                <div className="h-5 w-64 bg-muted/60 animate-pulse rounded-md mt-2 mb-8" />

                <div className="space-y-6">
                    <div className="rounded-2xl border border-border bg-card p-6 h-[400px] animate-pulse" />
                </div>
            </div>
        </main>
    );
}
