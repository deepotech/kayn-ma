import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
    // A list of all locales that are supported
    locales: ['ar', 'fr'],

    // Used when no locale matches
    defaultLocale: 'fr'
});

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Safety net: Redirect unlocalized dashboard paths to default locale
    // Matches /dashboard and /dashboard/* but NOT /fr/dashboard or /ar/dashboard
    if (pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone();
        url.pathname = `/fr${pathname}`;
        return NextResponse.redirect(url);
    }

    // Safety net: Redirect unlocalized login paths
    if (pathname === '/login' && !pathname.match(/^\/(ar|fr)\//)) {
        const url = request.nextUrl.clone();
        url.pathname = '/fr/login';
        return NextResponse.redirect(url);
    }

    // Safety net: Redirect unlocalized rent-agencies paths
    if (pathname.startsWith('/rent-agencies') && !pathname.match(/^\/(ar|fr)\//)) {
        const url = request.nextUrl.clone();
        url.pathname = `/fr${pathname}`;
        return NextResponse.redirect(url);
    }

    return intlMiddleware(request);
}

export const config = {
    // Match internationalized pathnames and also catch unlocalized dashboard/login/rent-agencies for redirect
    matcher: ['/', '/(ar|fr)/:path*', '/dashboard/:path*', '/login', '/rent-agencies/:path*']
};
