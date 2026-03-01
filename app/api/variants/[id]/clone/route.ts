import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import {
  cloneVariant,
  getUserVariants,
  getUserProfile,
} from '@/lib/variantService';
import { LIMITS } from '@/lib/limits';

// POST /api/variants/[id]/clone — clone an existing variant into a new one
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const profile = await getUserProfile(user.id);

    // Check free tier variant limit
    if (!profile?.isPro) {
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

    const body = await req.json();
    const { title } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const variant = await cloneVariant(id, title.trim(), user.id);
    return NextResponse.json({ data: variant });
  } catch {
    return NextResponse.json(
      { error: 'Failed to clone variant' },
      { status: 500 }
    );
  }
}
