import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url param required' }, { status: 400 });
  }

  const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;

  try {
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'tweet not found' }, { status: 404 });
    }
    const data = await res.json();
    return NextResponse.json({
      html: data.html ?? null,
      author: data.author_name ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
}
