import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = 'sprunk_session';

export function middleware(req: NextRequest) {
  // Cookie-based session — set after first successful Basic Auth.
  // This fixes iOS Safari which doesn't forward Basic Auth credentials
  // on client-side fetch() calls, breaking /api/state on mobile.
  const session = req.cookies.get(SESSION_COOKIE)?.value;
  if (session === 'ok') {
    return NextResponse.next();
  }

  // Fall back to Basic Auth header (browser's first request)
  const auth = req.headers.get('authorization') ?? '';
  if (auth.startsWith('Basic ')) {
    const decoded = atob(auth.slice(6));
    const [username, ...rest] = decoded.split(':');
    const password = rest.join(':');
    if (username === process.env.SPRUNK_USERNAME && password === process.env.SPRUNK_PASSWORD) {
      const res = NextResponse.next();
      res.cookies.set(SESSION_COOKIE, 'ok', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
      return res;
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="sprunk.zip", charset="UTF-8"' },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
