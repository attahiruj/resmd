import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getVariant, saveSnapshot } from '@/lib/variantService'

interface Params {
  params: { id: string }
}

// POST /api/variants/[id]/snapshots — save a snapshot
export async function POST(req: NextRequest, { params }: Params) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const variant = await getVariant(params.id)
    if (!variant || variant.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { rawContent, message, templateId } = await req.json()
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const snapshot = await saveSnapshot(params.id, rawContent, message.trim(), templateId)
    return NextResponse.json({ data: snapshot })
  } catch {
    return NextResponse.json({ error: 'Failed to save snapshot' }, { status: 500 })
  }
}
