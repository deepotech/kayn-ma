export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
            {/* Header Skeleton */}
            <div className="mb-8">
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-32 mb-4"></div>
                <div className="h-10 bg-slate-200 dark:bg-zinc-800 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 overflow-hidden h-full flex flex-col">
                        <div className="h-48 bg-slate-200 dark:bg-zinc-800 w-full"></div>
                        <div className="p-5 flex-1 space-y-4">
                            <div className="h-6 bg-slate-200 dark:bg-zinc-800 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/2"></div>
                            <div className="flex gap-2 pt-2">
                                <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded w-1/3"></div>
                                <div className="h-8 bg-slate-200 dark:bg-zinc-800 rounded w-1/3"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
