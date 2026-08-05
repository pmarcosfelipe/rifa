export type RaffleStatus = 'available' | 'reserved' | 'paid' | 'pending';

export type RaffleEntry = {
  id: string;
  number: number;
  name: string;
  phone: string;
  group: string;
  status: RaffleStatus;
  proof_url?: string | null;
  reserved_at?: string | null;
  confirmed_at?: string | null;
  expires_at?: string | null;
  created_at?: string | null;
};

function normalizeStatus(value?: string | null): RaffleStatus {
  const normalized = (value ?? '').toString().trim().toLowerCase();

  switch (normalized) {
    case 'reserved':
    case 'reservado':
    case 'reserva':
      return 'reserved';
    case 'paid':
    case 'pago':
    case 'vendido':
    case 'sold':
      return 'paid';
    case 'pending':
    case 'pendente':
    case 'aguarda':
    case 'aguardando':
    case 'waiting':
      return 'pending';
    default:
      return 'available';
  }
}

function getFirstValue(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }

  return '';
}

function buildEntryFromObject(row: Record<string, unknown>): RaffleEntry | null {
  console.log('row', row);
  const numberValue = Number(getFirstValue(row, ['number', 'numero', 'Number', 'Número', 'NÚMERO', 'num', 'Num']) || getFirstValue(row, ['Number', 'Numero', 'numero', 'número']));

  if (!Number.isFinite(numberValue)) {
    return null;
  }

  return {
    id: String(numberValue),
    number: numberValue,
    name: getFirstValue(row, ['name', 'nome', 'Name', 'Nome']) || '',
    phone: getFirstValue(row, ['phone', 'telefone', 'Phone', 'Telefone']) || '',
    group: getFirstValue(row, ['group', 'grupo', 'Group', 'Grupo']) || '',
    status: normalizeStatus(getFirstValue(row, ['status', 'Status', 'STATUS', 'estado', 'Estado'])),
    proof_url: getFirstValue(row, ['proof_url', 'proofUrl', 'proof', 'comprovativo', 'Comprovativo']) || null,
    reserved_at: getFirstValue(row, ['reserved_at', 'reservedAt', 'timestamp', 'Timestamp', 'timestamp_reserva', 'reserva_at', 'Reservado']) || null,
    confirmed_at: getFirstValue(row, ['confirmed_at', 'confirmedAt', 'confirmed', 'Confirmado']) || null,
    expires_at: getFirstValue(row, ['expires_at', 'expiresAt', 'expires', 'Expira']) || null,
    created_at: getFirstValue(row, ['created_at', 'createdAt', 'created', 'Criado']) || null,
  };
}

function normalizePayload(payload: unknown): any[] {
  console.log('dasdas', Array.isArray(payload));

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (item && typeof item === 'object') {
          return buildEntryFromObject(item as Record<string, unknown>);
        }
        return null;
      })
      .filter((entry): entry is RaffleEntry => Boolean(entry));
  }

  if (payload && typeof payload === 'object') {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>');
    const objectPayload = payload as Record<string, unknown>;

    if (Array.isArray(objectPayload.rows)) {
      return objectPayload.rows
        .map((item) => {
          if (item && typeof item === 'object') {
            return buildEntryFromObject(item as Record<string, unknown>);
          }
          return null;
        })
        .filter((entry): entry is RaffleEntry => Boolean(entry));
    }

    if (Array.isArray(objectPayload.entries)) {
      return normalizePayload(objectPayload.entries);
    }
  }

  return [];
}

export async function fetchGoogleSheetsEntries(): Promise<RaffleEntry[]> {
  const endpoints = [process.env.GOOGLE_SHEETS_WRITE_URL, process.env.GOOGLE_SHEETS_URL, process.env.GOOGLE_SHEETS_JSON_URL].filter((value): value is string => Boolean(value));

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, { cache: 'no-store' });

      if (!response.ok) {
        continue;
      }

      const text = await response.text();
      if (!text) {
        continue;
      }

      const payload = JSON.parse(text);
      return normalizePayload(payload);
    } catch {
      continue;
    }
  }

  return [];
}

function normalizeGoogleSheetsError(data: string) {
  const text = data.trim();
  if (!text) {
    return 'A URL do Apps Script não respondeu corretamente.';
  }

  if (text.includes('<!DOCTYPE html>') || text.includes('Página não encontrada') || text.includes('drive.google.com')) {
    return 'A URL do Apps Script está incorreta ou ainda não foi publicada corretamente.';
  }

  return text;
}

export async function writeGoogleSheetsEntry(payload: Record<string, unknown>) {
  console.log('writeGoogleSheetsEntry... ', payload);
  const endpoint = process.env.GOOGLE_SHEETS_WRITE_URL || process.env.GOOGLE_SHEETS_URL || process.env.GOOGLE_SHEETS_JSON_URL || '';

  if (!endpoint) {
    return { ok: false, error: 'Defina GOOGLE_SHEETS_WRITE_URL com a URL publicada do Apps Script.' };
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.text();

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: response.ok ? undefined : normalizeGoogleSheetsError(data),
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Erro inesperado' };
  }
}
