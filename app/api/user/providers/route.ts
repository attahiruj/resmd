import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthProvider, getDbProvider } from '@/lib/db/server';
import { encryptApiKey } from '@/lib/crypto';
import type { AdapterType } from '@/lib/db/interfaces';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getServerAuthProvider().getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.is_anonymous) return NextResponse.json({ providers: [] });

  const providers = await getDbProvider().listUserProviders(user.id);
  return NextResponse.json({ providers });
}

export async function POST(req: NextRequest) {
  const user = await getServerAuthProvider().getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.is_anonymous)
    return NextResponse.json({ error: 'Account required' }, { status: 403 });

  const { name, adapterType, baseUrl, key } = await req.json();

  if (!name || !adapterType || !baseUrl || !key) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }
  if (adapterType !== 'openai' && adapterType !== 'anthropic') {
    return NextResponse.json({ error: 'Invalid adapterType' }, { status: 400 });
  }

  let encryptedKey: string;
  try {
    encryptedKey = encryptApiKey(key as string);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Encryption failed';
    if (msg.includes('ENCRYPTION_KEY')) {
      return NextResponse.json(
        {
          error:
            'Server is missing ENCRYPTION_KEY. Generate one with: ' +
            "node -e \"console.log(require('crypto').randomBytes(32).toString('base64'))\"" +
            ' and set it as ENCRYPTION_KEY in your environment.',
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const keyStr = key as string;
  const keyPreview = keyStr.slice(0, 8) + '****';

  const id = await getDbProvider().createUserProvider(
    user.id,
    name as string,
    adapterType as AdapterType,
    baseUrl as string,
    encryptedKey,
    keyPreview
  );

  const providers = await getDbProvider().listUserProviders(user.id);
  const created = providers.find((p) => p.id === id);
  return NextResponse.json({ provider: created }, { status: 201 });
}
