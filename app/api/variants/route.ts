import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { createVariant, getUserVariants } from '@/lib/variantService'
import { LIMITS } from '@/lib/limits'

// GET /api/variants — list authenticated user's variants
export async function GET() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const variants = await getUserVariants(user.id)
    return NextResponse.json({ data: variants })
  } catch {
    return NextResponse.json({ error: 'Failed to load variants' }, { status: 500 })
  }
}

// POST /api/variants — create a new variant
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Check free tier variant limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single()

    if (!profile?.is_pro) {
      const existing = await getUserVariants(user.id)
      if (existing.length >= LIMITS.FREE_VARIANTS) {
        return NextResponse.json(
          { error: 'Variant limit reached for free plan', code: 'limit_reached' },
          { status: 402 }
        )
      }
    }

    const body = await req.json()
    const { title = 'My Resume', rawContent = '', templateId = 'minimal' } = body

    const variant = await createVariant(user.id, title, rawContent, templateId)
    return NextResponse.json({ data: variant })
  } catch {
    return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 })
  }
}
