import { NextResponse } from 'next/server';
import { fetchGoogleSheetsEntries, writeGoogleSheetsEntry } from '@/lib/googleSheets';

export async function GET() {
  try {
    const entries = await fetchGoogleSheetsEntries();
    console.log('entries...', entries);
    return NextResponse.json({ entries });
  } catch {
    return NextResponse.json({ entries: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body?.number && body?.action !== 'update' && body?.action !== 'upload') {
    return NextResponse.json({ error: 'Número inválido' }, { status: 400 });
  }

  const reservedAt = body.reserved_at || new Date().toISOString();

  const payload = {
    action: body.action || 'reserve',
    number: body.number,
    name: body.name || '',
    phone: body.phone || '',
    group: body.group || '',
    status: body.status || 'reserved',
    proof: body.proof || body.proof_url || '',
    reserved_at: reservedAt,
  };

  console.log('POST', payload);

  const result = await writeGoogleSheetsEntry(payload);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, data: result.data });
}
