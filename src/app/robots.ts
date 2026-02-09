import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/_next/',
                '/dashboard/',
                '/admin/',
                '/*?*', // Block all query parameters (filters, pagination, search)
            ],
        },
        sitemap: 'https://www.cayn.ma/sitemap.xml',
    };
}
