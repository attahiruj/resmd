import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthProvider, getDbProvider } from '@/lib/db/server';

export const dynamic = 'force-dynamic';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getServerAuthProvider().getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await getDbProvider().deleteUserProvider(id, user.id);
  return new NextResponse(null, { status: 204 });
}
