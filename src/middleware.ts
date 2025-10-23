import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow dashboard API requests
  if (request.nextUrl.pathname.startsWith('/api/dashboard')) {
    const response = NextResponse.next();

    // Add CORS headers if needed
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/dashboard/:path*',
};
