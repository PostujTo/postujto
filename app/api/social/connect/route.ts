import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase
    .from('users')
    .select('id, ayrshare_profile_key')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  if (user.ayrshare_profile_key) {
    return NextResponse.json({ profileKey: user.ayrshare_profile_key, existing: true });
  }

  const response = await fetch('https://app.zernio.com/api/profiles/profile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ZERNIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: userId }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Zernio profile create error:', err);
    return NextResponse.json({ error: 'Nie udalo sie polaczyc z Zernio' }, { status: 500 });
  }

  const data = await response.json();
  const profileKey = data.profileKey;

  if (!profileKey) {
    return NextResponse.json({ error: 'Brak profileKey w odpowiedzi Zernio' }, { status: 500 });
  }

  await supabase
    .from('users')
    .update({ ayrshare_profile_key: profileKey })
    .eq('id', user.id);

  return NextResponse.json({ profileKey, existing: false });
}