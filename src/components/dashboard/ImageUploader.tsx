'use client';

import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';

interface UploadedImage {
    url: string;
    publicId?: string;
}

interface ImageUploaderProps {
    images: UploadedImage[];
    onImagesChange: (images: UploadedImage[]) => void;
    maxImages?: number;
    locale: string;
}

// Convert File to base64
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

export default function ImageUploader({ images, onImagesChange, maxImages = 8, locale }: ImageUploaderProps) {
    const isRtl = locale === 'ar';
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
        }
        // Reset input to allow selecting same file again
        e.target.value = '';
    };

    const handleFiles = async (files: File[]) => {
        // Filter valid image files
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        // Limit to remaining slots
        const remainingSlots = maxImages - images.length;
        const filesToUpload = imageFiles.slice(0, remainingSlots);

        if (filesToUpload.length === 0) {
            setError(isRtl ? `الحد الأقصى ${maxImages} صور` : `Maximum ${maxImages} images`);
            return;
        }

        setUploading(true);
        setError(null);
        setUploadProgress(0);

        const newUploadedImages: UploadedImage[] = [];

        try {
            let completed = 0;
            const total = filesToUpload.length;

            for (const file of filesToUpload) {
                try {
                    const base64 = await fileToBase64(file);

                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ images: [base64] }),
                    });

                    const result = await response.json();

                    if (!response.ok || !result.success) {
                        throw new Error(result.error);
                    }

                    if (result.images && result.images.length > 0) {
                        const uploadedImage = result.images[0];
                        newUploadedImages.push(uploadedImage);

                        onImagesChange([...images, ...newUploadedImages]);
                    }
                } catch (err: any) {
                    console.error(`Failed to upload ${file.name}:`, err);
                }

                completed++;
                setUploadProgress(Math.round((completed / total) * 100));
            }
        } catch (err: any) {
            console.error('Upload process error:', err);
            setError(err.message || (isRtl ? 'فشل تحميل الصور' : 'Échec du téléchargement'));
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index);
        onImagesChange(updated);
    };

    // Drag & Drop
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    return (
        <div className="space-y-4">
            {/* Error display */}
            {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                    <X className="h-4 w-4" />
                    {error}
                </div>
            )}

            {/* Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && inputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors
                    ${uploading ? 'cursor-wait opacity-70' : 'cursor-pointer'}
                    ${isDragging
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                        : 'border-gray-300 dark:border-zinc-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }
                `}
            >
                <input
                    type="file"
                    ref={inputRef}
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                />

                {uploading ? (
                    <>
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-3" />
                        <p className="text-gray-900 dark:text-white font-medium mb-1">
                            {isRtl ? 'جاري التحميل...' : 'Téléchargement en cours...'}
                        </p>
                        <div className="w-48 h-2 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mb-3">
                            <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-gray-900 dark:text-white font-medium mb-1">
                            {isRtl ? 'اضغط أو اسحب الصور هنا' : 'Cliquez ou glissez les images ici'}
                        </p>
                        <p className="text-sm text-gray-500">
                            {images.length} / {maxImages} {isRtl ? 'صور مختارة' : 'images sélectionnées'}
                        </p>
                    </>
                )}
            </div>

            {/* Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                        <div key={img.publicId || img.url || idx} className="relative aspect-[4/3] group rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800">
                            <img
                                src={img.url}
                                alt={`Preview ${idx}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Fallback for broken images
                                    (e.target as HTMLImageElement).src = '/images/placeholder-car.jpg';
                                }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            {idx === 0 && (
                                <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow">
                                    {isRtl ? 'الرئيسية' : 'Main'}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
