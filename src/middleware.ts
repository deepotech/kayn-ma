import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['ar', 'fr'],

    // Used when no locale matches
    defaultLocale: 'fr',

    // Always prefix to ensure consistent routing /fr/... /ar/...
    localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const host = request.headers.get('host') || '';
    const xForwardedProto = request.headers.get('x-forwarded-proto');
    const isProduction = process.env.NODE_ENV === 'production';
    const debug = process.env.DEBUG_REDIRECTS === '1';

    // A. Debug Mode
    if (debug) {
        console.log('[Middleware Debug]', {
            url: request.url,
            pathname,
            host,
            xForwardedProto,
            headers: Object.fromEntries(request.headers)
        });
    }

    // B. Canonical Host Strategy (Force WWW)
    // Only apply in production to avoid breaking localhost
    if (isProduction && host === 'cayn.ma') {
        const url = new URL(`https://www.cayn.ma${pathname}${search}`);
        if (debug) console.log('Redirecting to canonical:', url.toString());
        return NextResponse.redirect(url, 301);
    }

    // C. Fix HTTPS Loop behind Railway Proxy
    // Trust x-forwarded-proto
    if (isProduction && xForwardedProto === 'http') {
        const url = new URL(`https://${host}${pathname}${search}`);
        if (debug) console.log('Redirecting to HTTPS:', url.toString());
        return NextResponse.redirect(url, 301);
    }

    // D. Locale Redirects
    // Safety nets are handled by next-intl if configured correctly, but we keep the logic
    // of ensuring we don't double redirect. 
    // We delegate to next-intl middleware for all i18n routing.

    // Explicitly exclude API/Next internals if they slipped through matcher
    if (pathname.startsWith('/api') || pathname.startsWith('/_next')) {
        return NextResponse.next();
    }

    return intlMiddleware(request);
}

export const config = {
    // Matcher regex to catch all pages but exclude statics/api
    // This replaces the manual list to be more robust
    matcher: ['/((?!api|_next|.*\\..*).*)']
};
