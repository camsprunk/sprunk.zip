import { NextRequest, NextResponse } from 'next/server';
import { loadAppState, saveAppState } from '@/lib/db';

export async function GET() {
  try {
    const state = await loadAppState();
    return NextResponse.json(state);
  } catch (e) {
    console.error('Failed to load state from DB', e);
    return NextResponse.json({ tiles: [], folders: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const state = await req.json();
    await saveAppState(state);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Failed to save state to DB', e);
    return NextResponse.json({ error: 'save failed' }, { status: 500 });
  }
}
