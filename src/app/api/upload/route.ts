import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
    console.log('[Upload API] Received upload request');

    try {
        const body = await request.json();
        const { images } = body;

        console.log('[Upload API] Images count:', images?.length || 0);

        if (!images || !Array.isArray(images) || images.length === 0) {
            console.log('[Upload API] Error: No images provided');
            return NextResponse.json(
                { success: false, error: 'No images provided' },
                { status: 400 }
            );
        }

        if (images.length > 8) {
            console.log('[Upload API] Error: Too many images');
            return NextResponse.json(
                { success: false, error: 'Maximum 8 images allowed' },
                { status: 400 }
            );
        }

        // Log first image type for debugging (truncated)
        const firstImg = images[0];
        console.log('[Upload API] First image type:', typeof firstImg);
        console.log('[Upload API] First image starts with:', firstImg?.substring?.(0, 50) || 'N/A');

        const uploadPromises = images.map(async (base64Image: string, index: number) => {
            try {
                console.log(`[Upload API] Uploading image ${index + 1}...`);

                const result = await cloudinary.uploader.upload(base64Image, {
                    folder: 'cayn/listings',
                    transformation: [
                        { width: 1200, height: 900, crop: 'limit' },
                        { quality: 'auto:good' },
                        { fetch_format: 'auto' }
                    ]
                });

                console.log(`[Upload API] Image ${index + 1} uploaded:`, result.secure_url);

                return {
                    url: result.secure_url,
                    publicId: result.public_id,
                    index
                };
            } catch (err: any) {
                console.error(`[Upload API] Error uploading image ${index}:`, err.message || err);
                return null;
            }
        });

        const results = await Promise.all(uploadPromises);
        const successfulUploads = results.filter(r => r !== null);

        console.log('[Upload API] Successful uploads:', successfulUploads.length);

        if (successfulUploads.length === 0) {
            return NextResponse.json(
                { success: false, error: 'All image uploads failed' },
                { status: 500 }
            );
        }

        // Sort by original index to maintain order
        successfulUploads.sort((a, b) => a!.index - b!.index);

        const uploadedImages = successfulUploads.map(r => ({
            url: r!.url,
            publicId: r!.publicId
        }));

        console.log('[Upload API] Returning images:', uploadedImages);

        return NextResponse.json({
            success: true,
            images: uploadedImages,
            count: uploadedImages.length
        });
    } catch (error: any) {
        console.error('[Upload API] Upload error:', error.message || error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to upload images' },
            { status: 500 }
        );
    }
}
