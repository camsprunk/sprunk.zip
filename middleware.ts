import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';

  if (auth.startsWith('Basic ')) {
    const decoded = atob(auth.slice(6));
    // decoded is "username:password" — take everything after the first colon
    const [username, ...rest] = decoded.split(':');
    const password = rest.join(':');
    if (username === process.env.SPRUNK_USERNAME && password === process.env.SPRUNK_PASSWORD) {
      return NextResponse.next();
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
