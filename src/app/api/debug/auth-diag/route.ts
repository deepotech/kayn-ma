import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const headersList = Object.fromEntries(request.headers);
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');

    // Safety: Mask the actual cookie value
    const maskedSession = sessionCookie
        ? `${sessionCookie.value.substring(0, 10)}...`
        : 'none';

    return NextResponse.json({
        diagnostics: {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            url: request.url,
            host: request.headers.get('host'),
            xForwardedProto: request.headers.get('x-forwarded-proto'),
            xForwardedHost: request.headers.get('x-forwarded-host'),
            cookiePresent: !!sessionCookie,
            cookieValueMasked: maskedSession,
            cookieDomainVar: process.env.COOKIE_DOMAIN || 'not-set',
            nextPublicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'not-set',
        },
        headers: headersList
    }, { status: 200 });
}
