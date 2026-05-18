import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthProvider, getDbProvider } from '@/lib/db/server';

// DELETE /api/auth/local/mcp-keys/[id] — revoke an MCP key
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getServerAuthProvider().getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await getDbProvider().deleteMcpKey(id, user.id);
  return NextResponse.json({ data: { success: true } });
}
