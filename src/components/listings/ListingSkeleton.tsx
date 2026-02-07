import { Skeleton } from "@/components/ui/Skeleton";

export default function ListingSkeleton() {
    return (
        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden h-full dark:bg-zinc-900 dark:border-zinc-800">
            {/* Image Skeleton */}
            <div className="aspect-[4/3] w-full bg-gray-200 dark:bg-zinc-800 animate-pulse relative">
                <div className="absolute top-3 end-3 h-6 w-16 bg-gray-300 dark:bg-zinc-700 rounded-lg"></div>
                <div className="absolute top-3 start-3 h-8 w-8 bg-gray-300 dark:bg-zinc-700 rounded-full"></div>
            </div>

            {/* Content Skeleton */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <Skeleton className="h-6 w-3/4 rounded-md" />

                {/* Location & Seller */}
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/3 rounded-md" />
                    <Skeleton className="h-5 w-1/4 rounded-full" />
                </div>

                {/* Price */}
                <Skeleton className="h-7 w-1/2 rounded-md mt-2" />

                {/* Metadata */}
                <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800 mt-2">
                    <Skeleton className="h-4 w-1/4 rounded-md" />
                    <Skeleton className="h-4 w-1/4 rounded-md" />
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <Skeleton className="h-10 rounded-lg" />
                    <Skeleton className="h-10 rounded-lg" />
                </div>
            </div>
        </div>
    );
}
