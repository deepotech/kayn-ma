'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Grid } from 'lucide-react';

interface ImageGalleryProps {
    images: Array<{ url: string; publicId?: string } | string>;
    alt: string;
}

// Normalize image to URL string, filtering out invalid entries
function normalizeImages(images: Array<{ url: string; publicId?: string } | string>): string[] {
    if (!images || !Array.isArray(images)) return [];

    return images
        .map(img => {
            if (typeof img === 'string') {
                return img;
            }
            if (img && typeof img === 'object' && img.url) {
                return img.url;
            }
            return null;
        })
        .filter((url): url is string => {
            // Filter out blob URLs, empty strings, and null
            if (!url) return false;
            if (url.startsWith('blob:')) return false;
            if (url.trim() === '') return false;
            return true;
        });
}

const PLACEHOLDER = '/images/placeholder-car.jpg';

export default function ImageGallery({ images, alt }: ImageGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    // Normalize all images to URL strings
    const normalizedImages = normalizeImages(images);

    const handleImageError = (url: string) => {
        setFailedImages(prev => new Set(prev).add(url));
    };

    const getImageSrc = (url: string) => {
        return failedImages.has(url) ? PLACEHOLDER : url;
    };

    const openLightbox = (index: number) => {
        setCurrentIndex(index);
        setIsOpen(true);
    };

    const closeLightbox = () => {
        setIsOpen(false);
    };

    const goToPrevious = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? normalizedImages.length - 1 : prev - 1));
    };

    const goToNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === normalizedImages.length - 1 ? 0 : prev + 1));
    };

    if (normalizedImages.length === 0) {
        return (
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-zinc-800 dark:to-zinc-900 rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🚗</span>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Bento Grid (Hidden on Mobile) */}
            <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-2 h-[450px] w-full rounded-2xl overflow-hidden cursor-pointer" onClick={() => openLightbox(0)}>
                {/* Main Image - Takes half space */}
                <div className="col-span-2 row-span-2 relative group">
                    <Image
                        src={getImageSrc(normalizedImages[0])}
                        alt={alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1280px) 100vw, 50vw"
                        priority
                        onError={() => handleImageError(normalizedImages[0])}
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Secondary Images Grid */}
                {normalizedImages.slice(1, 5).map((url, index) => (
                    <div key={index} className="relative group overflow-hidden">
                        <Image
                            src={getImageSrc(url)}
                            alt={`${alt} - ${index + 2}`}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="25vw"
                            onError={() => handleImageError(url)}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />

                        {/* Overlay on the last item if there are more images */}
                        {index === 3 && normalizedImages.length > 5 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg backdrop-blur-[2px]">
                                +{normalizedImages.length - 5}
                            </div>
                        )}
                    </div>
                ))}

                {/* Fill empty cells if less than 5 images */}
                {normalizedImages.length < 5 && Array.from({ length: 5 - normalizedImages.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-100 dark:bg-zinc-800 relative flex items-center justify-center text-gray-400">
                        <span className="text-2xl">🚗</span>
                    </div>
                ))}
            </div>

            {/* "Show All Photos" Button for Desktop */}
            <button
                onClick={() => openLightbox(0)}
                className="hidden lg:flex absolute bottom-6 right-6 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg shadow-lg font-medium text-sm items-center gap-2 hover:scale-105 transition-transform"
            >
                <Grid className="h-4 w-4" />
                Show all photos
            </button>


            {/* Mobile Slider (Hidden on Desktop) */}
            <div className="lg:hidden relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-100 dark:bg-zinc-800 group">
                <Image
                    src={getImageSrc(normalizedImages[currentIndex])}
                    alt={`${alt} - Image ${currentIndex + 1}`}
                    fill
                    className="object-cover"
                    priority={currentIndex === 0}
                    sizes="100vw"
                    onError={() => handleImageError(normalizedImages[currentIndex])}
                />

                {/* Navigation Arrows (Mobile) */}
                {normalizedImages.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute start-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full transition-opacity hover:bg-black/70"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute end-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 backdrop-blur-sm text-white rounded-full transition-opacity hover:bg-black/70"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}

                {/* Mobile Image Counter */}
                <div className="absolute bottom-3 end-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    {currentIndex + 1} / {normalizedImages.length}
                </div>
            </div>


            {/* Lightbox / Fullscreen Gallery */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white z-50 rounded-full hover:bg-white/10"
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>

                    <div className="relative w-full h-full max-w-5xl max-h-[80vh] mx-4">
                        <Image
                            src={getImageSrc(normalizedImages[currentIndex])}
                            alt={`${alt} - Fullscreen ${currentIndex + 1}`}
                            fill
                            className="object-contain"
                            priority
                            quality={100}
                            onError={() => handleImageError(normalizedImages[currentIndex])}
                        />
                    </div>

                    <button
                        onClick={goToNext}
                        className="absolute right-4 p-4 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:block"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>

                    {/* Bottom strip for mobile nav in lightbox */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 sm:hidden">
                        <button onClick={goToPrevious} className="p-3 bg-white/10 rounded-full text-white"><ChevronLeft /></button>
                        <button onClick={goToNext} className="p-3 bg-white/10 rounded-full text-white"><ChevronRight /></button>
                    </div>

                    <div className="absolute bottom-4 text-white/50 text-sm">
                        {currentIndex + 1} / {normalizedImages.length}
                    </div>
                </div>
            )}
        </>
    );
}
