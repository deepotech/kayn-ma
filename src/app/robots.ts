import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/dashboard/',
                '/admin/',
                '/post',
                '/*?*utm_*',
                '/*?*fbclid=*',
                '/*?*gclid=*',
                '/*?*ref=*',
            ],
        },
        sitemap: 'https://www.cayn.ma/sitemap.xml',
    };
}
