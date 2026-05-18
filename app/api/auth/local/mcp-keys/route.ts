import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { randomUUID } from 'crypto';
import { getServerAuthProvider, getDbProvider } from '@/lib/db/server';

// GET /api/auth/local/mcp-keys — list user's MCP keys
export async function GET() {
  const user = await getServerAuthProvider().getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keys = await getDbProvider().listMcpKeys(user.id);
  return NextResponse.json({ data: keys });
}

// POST /api/auth/local/mcp-keys — create a new MCP key
export async function POST(req: NextRequest) {
  const user = await getServerAuthProvider().getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name } = body;
  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 });
  }

  const rawKey = randomBytes(32).toString('hex');
  const keyHash = createHash('sha256').update(rawKey).digest('hex');
  const keyId = randomUUID();

  await getDbProvider().createMcpKey(user.id, name.trim(), keyHash, keyId);

  return NextResponse.json({
    data: { id: keyId, name: name.trim(), key: rawKey },
  });
}
