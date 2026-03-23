import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabaseAdmin
    .from('users').select('id, stripe_subscription_id').eq('clerk_user_id', userId).single();

  if (user) {
    // Anuluj subskrypcję Stripe przed usunięciem konta
    if ((user as any).stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel((user as any).stripe_subscription_id);
      } catch (stripeErr) {
        console.error('Błąd anulowania Stripe przy usuwaniu konta:', stripeErr);
        // Kontynuuj usuwanie nawet przy błędzie Stripe
      }
    }
    await supabaseAdmin.from('calendar_topics').delete().eq('user_id', user.id);
    await supabaseAdmin.from('brand_kits').delete().eq('user_id', user.id);
    await supabaseAdmin.from('generations').delete().eq('user_id', user.id);
    await supabaseAdmin.from('users').delete().eq('id', user.id);
  }

  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);

  return NextResponse.json({ success: true });
}