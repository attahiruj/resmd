import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getVariant, getUserProfile } from '@/lib/variantService'
import { parseResume } from '@/lib/parser'
import { getTemplate, getPdfComponent } from '@/lib/templates'

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { variantId } = body as { variantId: string }

    if (!variantId) {
      return NextResponse.json({ error: 'variantId is required' }, { status: 400 })
    }

    const variant = await getVariant(variantId)
    if (!variant) {
      return NextResponse.json({ error: 'Variant not found' }, { status: 404 })
    }
    if (variant.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const profile = await getUserProfile(user.id)
    const isPro = profile?.isPro ?? false

    const resume = parseResume(variant.rawContent)
    const template = getTemplate(variant.templateId)
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const PdfComponent = await getPdfComponent(variant.templateId)
    const doc = React.createElement(PdfComponent, { resume, isPro })
    const buffer = await renderToBuffer(doc as React.ReactElement)
    const uint8 = new Uint8Array(buffer)

    const safeTitle = variant.title.replace(/[^a-z0-9\-_ ]/gi, '').trim() || 'resume'

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF export error:', err)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
