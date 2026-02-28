import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getVariant, updateVariantContent, deleteVariant } from '@/lib/variantService'

interface Params {
  params: { id: string }
}

// GET /api/variants/[id] — fetch single variant
export async function GET(_req: NextRequest, { params }: Params) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const variant = await getVariant(params.id)
    if (!variant || variant.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ data: variant })
  } catch {
    return NextResponse.json({ error: 'Failed to load variant' }, { status: 500 })
  }
}

// PATCH /api/variants/[id] — autosave update
export async function PATCH(req: NextRequest, { params }: Params) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const variant = await getVariant(params.id)
    if (!variant || variant.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { rawContent, templateId, title } = await req.json()
    await updateVariantContent(params.id, rawContent, templateId, title)
    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 })
  }
}

// DELETE /api/variants/[id] — delete a variant
export async function DELETE(_req: NextRequest, { params }: Params) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const variant = await getVariant(params.id)
    if (!variant || variant.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await deleteVariant(params.id)
    return NextResponse.json({ data: { success: true } })
  } catch {
    return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 })
  }
}
