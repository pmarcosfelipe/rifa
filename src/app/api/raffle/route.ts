// import { NextResponse } from 'next/server';
// import { siteConfig } from '@/lib/config';
// import { fetchGoogleSheetsEntries, type RaffleEntry, writeGoogleSheetsEntry } from '@/lib/googleSheets';

// const memoryEntries = new Map<number, RaffleEntry>();

// function expireEntries(entries: RaffleEntry[]) {
//   const now = new Date();
//   return entries.map((entry) => {
//     if (entry.status === 'reserved' && entry.expires_at && new Date(entry.expires_at) < now) {
//       return { ...entry, status: 'available', reserved_at: null, expires_at: null, name: '', phone: '', group: '', proof_url: null };
//     }
//     return entry;
//   });
// }

// function getLocalEntries() {
//   return Array.from(memoryEntries.values()).sort((a, b) => a.number - b.number);
// }

// function reserveNumber(payload: { number: number; name: string; phone: string; group: string }) {
//   const existing = memoryEntries.get(payload.number);
//   if (existing && ['reserved', 'paid', 'pending'].includes(existing.status)) {
//     throw new Error('Número indisponível');
//   }

//   const now = new Date().toISOString();
//   const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
//   const entry: RaffleEntry = {
//     id: String(payload.number),
//     number: payload.number,
//     name: payload.name,
//     phone: payload.phone,
//     group: payload.group,
//     status: 'reserved',
//     reserved_at: now,
//     expires_at: expiresAt,
//     created_at: now,
//   };

//   memoryEntries.set(payload.number, entry);
//   return entry;
// }

// export async function GET() {
//   const googleSheetsEntries = await fetchGoogleSheetsEntries();
//   if (googleSheetsEntries.length > 0) {
//     return NextResponse.json({ entries: expireEntries(googleSheetsEntries) });
//   }

//   return NextResponse.json({ entries: expireEntries(getLocalEntries()) });
// }

// export async function POST(request: Request) {
//   const body = await request.json();
//   const { number, name, phone, group } = body;

//   if (!number || !name || !phone || !group) {
//     return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 });
//   }

//   try {
//     const entry = reserveNumber({ number, name, phone, group });
//     const writeResult = await writeGoogleSheetsEntry({
//       action: 'reserve',
//       number,
//       name,
//       phone,
//       group,
//       status: 'reserved',
//       reserved_at: entry.reserved_at || new Date().toISOString(),
//     });
//     if (!writeResult.ok) {
//       return NextResponse.json({ entry, config: siteConfig, warning: writeResult.error });
//     }
//     return NextResponse.json({ entry, config: siteConfig });
//   } catch (error) {
//     return NextResponse.json({ error: error instanceof Error ? error.message : 'Número indisponível' }, { status: 400 });
//   }
// }
