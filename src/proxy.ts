import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

export function proxy(request: NextRequest) {
  // Read locale from NEXT_LOCALE cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  // Validate against supported locales, fall back to default
  const locale =
    cookieLocale && (routing.locales as readonly string[]).includes(cookieLocale)
      ? cookieLocale
      : routing.defaultLocale;

  // Pass through with the X-NEXT-INTL-LOCALE header so next-intl
  // server-side APIs (getMessages, getTranslations) resolve correctly
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-intl-locale', locale);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
