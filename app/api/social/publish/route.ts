import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content, platforms, scheduleDate, imageUrl, generationId } = await req.json();

  if (!content || !platforms?.length) {
    return NextResponse.json({ error: 'Brakuje tresci lub platform' }, { status: 400 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, ayrshare_profile_key, subscription_plan')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!user.ayrshare_profile_key) {
    return NextResponse.json({ error: 'Social media nie polazone. Przejdz do Ustawien.' }, { status: 400 });
  }

  if (user.subscription_plan === 'free') {
    return NextResponse.json({ error: 'Publikacja dostepna w planie Starter i Pro' }, { status: 403 });
  }

  const body: Record<string, unknown> = {
    post: content,
    platforms,
    profileKeys: [user.ayrshare_profile_key],
  };

  if (scheduleDate) body.scheduleDate = scheduleDate;
  if (imageUrl) body.mediaUrls = [imageUrl];

  const response = await fetch('https://app.zernio.com/api/post', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ZERNIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Zernio publish error:', err);
    return NextResponse.json({ error: 'Blad publikacji. Sprawdz polaczenie z social media.' }, { status: 500 });
  }

  const data = await response.json();

  if (generationId) {
    void supabase
      .from('generations')
      .update({
        published_at: scheduleDate || new Date().toISOString(),
        published_platforms: platforms,
        ayrshare_post_id: data.id,
      })
      .eq('id', generationId);
  }

  return NextResponse.json({ success: true, postId: data.id });
}