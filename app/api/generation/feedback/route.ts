import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { generationId, note } = await request.json();
  if (!generationId) return NextResponse.json({ error: 'Brak generationId' }, { status: 400 });

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await supabase
    .from('generations')
    .update({ feedback: 'not_my_style', feedback_note: note || null })
    .eq('id', generationId)
    .eq('user_id', userData.id);

  return NextResponse.json({ ok: true });
}
