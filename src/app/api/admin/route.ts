// import { NextResponse } from 'next/server';
// import bcrypt from 'bcryptjs';
// import { siteConfig } from '@/lib/config';
// import { writeGoogleSheetsEntry } from '@/lib/googleSheets';

// export async function POST(request: Request) {
//   const body = await request.json();
//   const { action, id, number, email, password, status } = body;

//   if (action === 'login') {
//     if (email !== siteConfig.adminEmail) {
//       return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
//     }

//     const expectedPassword = process.env.ADMIN_PASSWORD || '123456';
//     const valid = password === expectedPassword || (typeof siteConfig.adminPasswordHash === 'string' && (await bcrypt.compare(password, siteConfig.adminPasswordHash)));

//     if (!valid) {
//       return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
//     }

//     return NextResponse.json({ ok: true });
//   }

//   if (action === 'update') {
//     const numericNumber = Number(number ?? id);
//     const result = await writeGoogleSheetsEntry({
//       action: 'update',
//       id,
//       number: Number.isFinite(numericNumber) ? numericNumber : undefined,
//       status,
//       confirmed_at: status === 'paid' ? new Date().toISOString() : null,
//       reserved_at: body.reserved_at ?? null,
//       name: body.name ?? '',
//       phone: body.phone ?? '',
//       group: body.group ?? '',
//       proof: body.proof ?? body.proof_url ?? '',
//     });

//     if (!result.ok) {
//       return NextResponse.json({ error: result.error || 'Falha ao atualizar o Google Sheets' }, { status: 500 });
//     }

//     return NextResponse.json({ ok: true, data: result.data });
//   }

//   return NextResponse.json({ error: 'Ação inválida' }, { status: 400 });
// }
