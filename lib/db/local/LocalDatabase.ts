import { createClient, type Client } from '@libsql/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { mkdirSync } from 'fs';

let _client: Client | null = null;

export function getLocalDb(): Client {
  if (_client) return _client;

  const dataDir = join(process.cwd(), 'data');
  mkdirSync(dataDir, { recursive: true });

  _client = createClient({
    url: `file:${join(dataDir, 'local.db')}`,
  });

  // Run schema synchronously on startup (fire-and-forget; errors surface on first query)
  const schema = readFileSync(
    join(process.cwd(), 'lib/db/local/schema.sql'),
    'utf-8'
  );
  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  Promise.all(statements.map((sql) => _client!.execute(sql))).catch((err) => {
    console.error('[LocalDB] Schema init error:', err);
  });

  return _client;
}
