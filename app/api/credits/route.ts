import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client z service role (pełny dostęp)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Pobierz ID zalogowanego użytkownika
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Nie zalogowany' },
        { status: 401 }
      );
    }


    // Pobierz użytkownika z Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('credits_remaining, credits_total, subscription_plan, onboarding_completed')
      .eq('clerk_user_id', userId)
      .single();


    if (error) {
      console.error('Błąd pobierania użytkownika:', error);
      return NextResponse.json(
        { error: 'Nie znaleziono użytkownika' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      remaining: user.credits_remaining,
      total: user.credits_total,
      plan: user.subscription_plan,
      onboarding_completed: user.onboarding_completed ?? false,
    });
  } catch (error: any) {
    console.error('Błąd API:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}