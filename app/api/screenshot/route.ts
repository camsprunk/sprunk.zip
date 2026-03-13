import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url param required' }, { status: 400 });
  }

  const microlinkUrl =
    `https://api.microlink.io/?url=${encodeURIComponent(url)}` +
    `&screenshot=true&meta=true&embed=screenshot.url`;

  try {
    const headers: Record<string, string> = {};
    if (process.env.MICROLINK_API_KEY) {
      headers['x-api-key'] = process.env.MICROLINK_API_KEY;
    }

    const res = await fetch(microlinkUrl, { headers });
    const data = await res.json();

    return NextResponse.json({
      screenshotUrl: data?.data?.screenshot?.url ?? null,
      title: data?.data?.title ?? null,
      favicon: data?.data?.logo?.url ?? null,
    });
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
}
