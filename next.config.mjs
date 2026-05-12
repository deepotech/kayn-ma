import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '/**',
            },
            // Google Maps / Places photo CDN domains
            {
                protocol: 'https',
                hostname: 'streetviewpixels-pa.googleapis.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'maps.googleapis.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh5.googleusercontent.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'geo0.ggpht.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'geo1.ggpht.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'geo2.ggpht.com',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'geo3.ggpht.com',
                pathname: '/**',
            },
        ],
    },
};

export default withNextIntl(nextConfig);
