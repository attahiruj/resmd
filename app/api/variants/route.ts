import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createVariant, getUserVariants } from '@/lib/variantService';
import { LIMITS } from '@/lib/limits';

// GET /api/variants — list authenticated user's variants
export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const variants = await getUserVariants(user.id);
    return NextResponse.json({ data: variants });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load variants' },
      { status: 500 }
    );
  }
}

// POST /api/variants — create a new variant
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Check guest variant limit
    if (user.is_anonymous) {
      const existing = await getUserVariants(user.id);
      if (existing.length >= LIMITS.GUEST_VARIANTS) {
        return NextResponse.json(
          {
            error: 'Sign up to create more resumes',
            code: 'guest_limit_reached',
          },
          { status: 402 }
        );
      }
    }

    // Check free tier variant limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', user.id)
      .single();

    if (!profile?.is_pro) {
      const existing = await getUserVariants(user.id);
      if (existing.length >= LIMITS.FREE_VARIANTS) {
        return NextResponse.json(
          {
            error: 'Variant limit reached for free plan',
            code: 'limit_reached',
          },
          { status: 402 }
        );
      }
    }

    // Ensure a profile row exists (anonymous users may not have one if the trigger missed them)
    if (user.is_anonymous) {
      await supabase
        .from('profiles')
        .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true });
    }

    const body = await req.json();
    const {
      title = 'My Resume',
      rawContent = '',
      templateId = 'minimal',
    } = body;

    const variant = await createVariant(user.id, title, rawContent, templateId);
    return NextResponse.json({ data: variant });
  } catch (err) {
    console.error('[POST /api/variants]', err);
    return NextResponse.json(
      { error: 'Failed to create variant' },
      { status: 500 }
    );
  }
}
