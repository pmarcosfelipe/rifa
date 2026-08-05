import { NextResponse } from 'next/server';
import { writeGoogleSheetsEntry } from '@/lib/googleSheets';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const number = formData.get('number') as string | null;

  if (!file || !number) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  const result = await writeGoogleSheetsEntry({
    action: 'upload',
    number: Number(number),
    proof_url: file.name,
    status: 'pending',
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, url: file.name });
}
