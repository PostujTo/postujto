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
    return NextResponse.json({ error: 'Brakuje treści lub platform' }, { status: 400 });
  }
  if (typeof content !== 'string' || content.length > 10000) {
    return NextResponse.json({ error: 'Treść posta zbyt długa (max 10 000 znaków)' }, { status: 400 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, ayrshare_profile_key, subscription_plan')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (!user.ayrshare_profile_key) {
    return NextResponse.json({ error: 'Social media nie połączone. Przejdź do Ustawień.' }, { status: 400 });
  }

  // Stary format klucza (pre-migracja) — wymuś reconnect
  if (!user.ayrshare_profile_key.startsWith('prof_')) {
    return NextResponse.json({
      error: 'Wymagane ponowne połączenie z social media. Przejdź do Ustawień → Publikacja automatyczna i kliknij „Połącz ponownie".',
      requiresReconnect: true,
    }, { status: 400 });
  }

  if (user.subscription_plan === 'free') {
    return NextResponse.json({ error: 'Publikacja dostępna w planie Starter i Pro' }, { status: 403 });
  }

  // Pobierz accountIds dla tego profilu
  const accountsRes = await fetch(
    `https://zernio.com/api/v1/accounts?profileId=${user.ayrshare_profile_key}`,
    { headers: { Authorization: `Bearer ${process.env.ZERNIO_API_KEY}` } }
  );

  if (!accountsRes.ok) {
    const err = await accountsRes.text();
    console.error('Zernio accounts error:', err);
    return NextResponse.json({ error: 'Błąd pobierania kont social media.' }, { status: 500 });
  }

  const { accounts } = await accountsRes.json();
  const platformMap: Record<string, string> = {};
  for (const account of (accounts || [])) {
    platformMap[account.platform] = account._id;
  }

  const newPlatforms = platforms
    .filter((p: string) => platformMap[p])
    .map((p: string) => ({ platform: p, accountId: platformMap[p] }));

  if (newPlatforms.length === 0) {
    return NextResponse.json({ error: 'Brak połączonych platform. Sprawdź ustawienia.' }, { status: 400 });
  }

  const body: Record<string, unknown> = {
    content,
    platforms: newPlatforms,
  };

  if (scheduleDate) {
    body.scheduledFor = scheduleDate;
    body.timezone = 'Europe/Warsaw';
  } else {
    body.publishNow = true;
  }

  if (imageUrl) {
    body.mediaItems = [{ type: 'image', url: imageUrl }];
  }

  const response = await fetch('https://zernio.com/api/v1/posts', {
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
    return NextResponse.json({ error: 'Błąd publikacji. Sprawdź połączenie z social media.' }, { status: 500 });
  }

  const data = await response.json();
  const postId = data.post?._id ?? data.id;

  if (generationId) {
    void supabase
      .from('generations')
      .update({
        published_at: scheduleDate || new Date().toISOString(),
        published_platforms: platforms,
        ayrshare_post_id: postId,
      })
      .eq('id', generationId);
  }

  return NextResponse.json({ success: true, postId });
}
