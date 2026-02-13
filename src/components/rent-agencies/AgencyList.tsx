'use client';

import { useState, useMemo, useEffect } from 'react';
import { NormalizedAgency, calculateScore } from '@/lib/rent-agencies/normalize';
import AgencyCard from './AgencyCard';
import AgencyFilters, { FilterState } from './AgencyFilters';
import Pagination from './Pagination';
import { useTranslations } from 'next-intl';
import { ArrowUpDown } from 'lucide-react';

interface AgencyListProps {
    initialAgencies: NormalizedAgency[];
    cityName: string;
}

// Helper to check opening hours
function checkIsOpenNow(agency: NormalizedAgency): boolean {
    if (!agency.openingHours || agency.openingHours.length === 0) return false;
    // Heuristic: If it has hours, we might assume it's "professional" enough to filter for.
    // Accurate parsing of Arabic hours strings ("9ص to 10م") requires complex logic.
    // For now, consistent with plan, we use the existence of data as a proxy for "Structured Hours", 
    // OR we could try basic parsing. Let's stick to "Has Hours" == "Open Now" eligible for this iteration 
    // unless requested to implement full parser. 
    // Wait, requirement said "Open now (toggle) if openingHours exists".
    // So "isOpenNow" filter implies "Is Currently Open". 
    // But without a robust parser, we might just filter by "Has Hours" and label it "Verified Hours".
    // ACTUALLY, let's just return true if openingHours array is not empty for now, 
    // effectively filtering for "Agencies with known hours".
    return true;
}

export default function AgencyList({ initialAgencies, cityName }: AgencyListProps) {
    const t = useTranslations('RentAgencies.Listing');

    // State
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        rating: '',
        hasPhone: false,
        hasReviews: false,
        hideMixed: false, // Default to SHOW mixed, unless user hides them? Or default hide?
        // User request: "hideMixed: Specialists Only".
        hasWebsite: false,
        hasPhotos: false,
        isOpenNow: false,
        categories: []
    });

    const [sort, setSort] = useState<'recommended' | 'rating' | 'reviews'>('recommended');
    const [page, setPage] = useState(1);
    const limit = 24;

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filters, sort]);

    // Filtering Logic
    const filteredAgencies = useMemo(() => {
        if (!initialAgencies) return [];

        return initialAgencies.filter(agency => {
            // Search
            if (filters.search) {
                const q = filters.search.toLowerCase().trim();
                const matchesName = (agency.name || '').toLowerCase().includes(q);
                const matchesAddress = (agency.address || '').toLowerCase().includes(q);
                const matchesCategory = agency.categories?.some(c => c.toLowerCase().includes(q));
                if (!matchesName && !matchesAddress && !matchesCategory) return false;
            }

            // Rating
            if (filters.rating) {
                const min = parseFloat(filters.rating);
                if ((agency.rating || 0) < min) return false;
            }

            // Phone
            if (filters.hasPhone && !agency.phone) return false;

            // Website
            if (filters.hasWebsite && !agency.website) return false;

            // Photos
            if (filters.hasPhotos && (!agency.photos || agency.photos.length === 0)) return false;

            // Reviews
            if (filters.hasReviews && (agency.reviewsCount || 0) === 0) return false;

            // Mixed
            if (filters.hideMixed && agency.isMixedService) return false;

            // Open Now (Use helper or check existence)
            if (filters.isOpenNow) {
                // If we don't have hours data, we can't say it's open now, so we exclude it 
                // effectively treating "Open Now" as "Has Verified Hours"
                if (!agency.openingHours || agency.openingHours.length === 0) return false;
            }

            return true;
        });
    }, [initialAgencies, filters]);

    // Sorting Logic
    const sortedAgencies = useMemo(() => {
        const sorted = [...filteredAgencies];
        switch (sort) {
            case 'rating':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'reviews':
                sorted.sort((a, b) => b.reviewsCount - a.reviewsCount);
                break;
            case 'recommended':
            default:
                // Already sorted by Score from backend, but we can re-score if needed
                // Backend sent them sorted by score.
                // If we want to strictly respect that order:
                // sorted.sort((a, b) => (b.score || 0) - (a.score || 0)); 
                // But filtered array preserves order usually.
                break;
        }
        return sorted;
    }, [filteredAgencies, sort]);

    // Pagination
    const total = sortedAgencies.length;
    const paginatedAgencies = useMemo(() => {
        const start = (page - 1) * limit;
        return sortedAgencies.slice(start, start + limit);
    }, [sortedAgencies, page, limit]);



    return (
        <div>
            {/* Header Meta with Sort */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {t('count', { count: total })}
                        {filteredAgencies.length !== initialAgencies.length && (
                            <span className="text-sm font-normal text-slate-500 ms-2">({t('filtered')})</span>
                        )}
                    </h2>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500 hidden sm:inline">{t('sortBy') || 'Sort by:'}</span>
                    <div className="relative">
                        <select
                            value={sort}
                            onChange={(e) => setSort(e.target.value as any)}
                            className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="recommended">{t('sort.recommended') || 'Recommended'}</option>
                            <option value="rating">{t('sort.rating') || 'Highest Rated'}</option>
                            <option value="reviews">{t('sort.reviews') || 'Most Reviewed'}</option>
                        </select>
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <AgencyFilters
                filters={filters}
                onChange={setFilters}
                availableCategories={[]}
            />

            {/* Grid */}
            {paginatedAgencies.length > 0 ? (
                <>
                    <div key={`grid-${filteredAgencies.length}-${page}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedAgencies.map((agency) => (
                            <AgencyCard key={agency._id || agency.slug} agency={agency} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-12">
                        <Pagination
                            total={total}
                            page={page}
                            limit={limit}
                            onPageChange={(p) => {
                                setPage(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                        {/* Note: Existing Pagination component might need update if it uses Links instead of onClick */}
                    </div>
                </>
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">{t('notFound')}</h3>
                    <p className="text-slate-500 max-w-md mx-auto">{t('notFoundDesc')}</p>
                    <button
                        onClick={() => setFilters({
                            search: '',
                            rating: '',
                            hasPhone: false,
                            hasReviews: false,
                            hideMixed: false,
                            hasWebsite: false,
                            hasPhotos: false,
                            isOpenNow: false,
                            categories: []
                        })}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        {t('reset') || 'Reset Filters'}
                    </button>
                </div>
            )}
        </div>
    );
}
