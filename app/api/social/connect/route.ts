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

  // Nowy format klucza zaczyna się od "prof_" — jeśli już istnieje, zwróć
  if (user.ayrshare_profile_key?.startsWith('prof_')) {
    return NextResponse.json({ profileKey: user.ayrshare_profile_key, existing: true });
  }

  // Stary format lub brak klucza — utwórz nowy profil przez Zernio v1
  const response = await fetch('https://zernio.com/api/v1/profiles', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.ZERNIO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: userId }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('Zernio profile create error:', err);
    return NextResponse.json({ error: 'Nie udało się połączyć z Zernio' }, { status: 500 });
  }

  const data = await response.json();
  const profileId = data.profile?._id;

  if (!profileId) {
    return NextResponse.json({ error: 'Brak profileId w odpowiedzi Zernio' }, { status: 500 });
  }

  await supabase
    .from('users')
    .update({ ayrshare_profile_key: profileId })
    .eq('id', user.id);

  return NextResponse.json({ profileKey: profileId, existing: false });
}
