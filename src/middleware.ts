import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// List of paths that don't require authentication
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/',
  '/_next',
  '/static',
  '/favicon.ico'
];

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

// Debug function to log request details
function logRequestDetails(request: NextRequest, message: string, details?: any) {
  console.log(`[Middleware] ${message}`, {
    path: request.nextUrl.pathname,
    method: request.method,
    ...(details && { details }),
  });
}

export async function middleware(request: NextRequest) {
  logRequestDetails(request, 'Request received');
  const { pathname } = request.nextUrl;

  // Check if the path exactly matches a public path
  const isPublicPath = publicPaths.some(path =>
    path === pathname || // Exact match
    (path !== '/' && pathname.startsWith(path + '/')) || // Subpath match for non-root paths
    (path === '/' && pathname === '/') // Root path exact match
  );

  if (isPublicPath) {
    logRequestDetails(request, 'Public path access granted');
    return NextResponse.next();
  }

  let token: string | undefined;
  let isBearer = false;

  // Check for Bearer token in Authorization header
  const authHeader = request.headers.get('Authorization');
  logRequestDetails(request, 'Authorization header', { authHeader });

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
    isBearer = true;
    logRequestDetails(request, 'Bearer token found');
  } else {
    // Fallback to cookie token
    token = request.cookies.get('token')?.value;
    logRequestDetails(request, 'Cookie token check', { found: !!token });
  }

  if (!token) {
    logRequestDetails(request, 'No token found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    logRequestDetails(request, 'Token verified', { user: payload });

    // Check admin routes
    if (pathname.startsWith('/api/admin') && !payload.isAdmin) {
      logRequestDetails(request, 'Admin access denied');
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Create a new request with the modified headers
    const newHeaders = new Headers(request.headers);
    newHeaders.set('x-user-id', payload.id.toString());
    newHeaders.set('x-user-email', payload.email);
    newHeaders.set('x-user-is-admin', payload.isAdmin.toString());
    newHeaders.set('x-user-json', JSON.stringify(payload));

    // Create response with modified headers
    const response = NextResponse.next({
      request: {
        ...request,
        headers: newHeaders,
      },
    });

    // If not using Bearer token, set cookie
    if (!isBearer) {
      response.cookies.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 // 24 hours
      });
    }

    logRequestDetails(request, 'Request authorized', {
      headers: Object.fromEntries(newHeaders.entries()),
    });

    return response;
  } catch (error) {
    logRequestDetails(request, 'Token verification failed', { error });
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
