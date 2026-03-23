import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const fiveDaysAgo = new Date();
  fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // Pobierz userów którzy:
  // 1. Nie byli aktywni przez 5+ dni
  // 2. Mają email
  // 3. Nie dostali reengagement emaila w ciągu ostatnich 7 dni LUB nigdy nie dostali
  const { data: users, error } = await supabase
    .from('users')
    .select('id, email')
    .lt('last_active_at', fiveDaysAgo.toISOString())
    .or(`reengagement_sent_at.is.null,reengagement_sent_at.lt.${sevenDaysAgo}`)
    .not('email', 'is', null)
    .limit(50);

  if (error || !users?.length) {
    return new Response('OK - no users to reengage', { status: 200 });
  }

  for (const user of users) {
    try {
      const { data: brandKit } = await supabase
        .from('brand_kits')
        .select('company_name, industry')
        .eq('user_id', user.id)
        .single();

      if (!brandKit?.company_name) continue;

      // Próba pobrania tematów dla branży — fallback gdy tabela nie istnieje
      const { data: inspirations } = await supabase
        .from('industry_inspirations')
        .select('title')
        .eq('industry_slug', brandKit.industry)
        .limit(3);

      const topics: string[] = inspirations?.map((i: { title: string }) => i.title) ?? [
        'Co nowego u nas — zajrzyj za kulisy',
        'Najczęstsze pytanie jakie dostajemy od klientów',
        'Dlaczego klienci do nas wracają?',
      ];

      await resend.emails.send({
        from: 'PostujTo <hello@postujto.com>',
        to: user.email,
        subject: `${escHtml(brandKit.company_name)} — masz nowe tematy postów czekające na Ciebie`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #1a1a1a;">Hej! Twój profil czeka 👋</h2>
            <p style="color: #444;">Przygotowałem 3 tematy postów dla <strong>${escHtml(brandKit.company_name)}</strong> na najbliższe dni:</p>
            <ul style="background: #f9f9f9; border-radius: 8px; padding: 16px 24px; color: #333;">
              ${topics.map((t: string) => `<li style="margin-bottom: 8px;">${escHtml(t)}</li>`).join('')}
            </ul>
            <p style="color: #444;">Każdy post gotowy w 30 sekund — jedno kliknięcie wystarczy.</p>
            <a href="https://www.postujto.com/app"
               style="display: inline-block; background: #6C47FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
              Generuj posty teraz →
            </a>
            <p style="color: #888; font-size: 12px; margin-top: 24px;">
              PostujTo — Autopilot Marketingowy dla Polskich Firm<br>
              <a href="https://www.postujto.com/settings" style="color: #888;">Zarządzaj powiadomieniami</a>
            </p>
          </div>
        `,
      });

      await supabase
        .from('users')
        .update({ reengagement_sent_at: new Date().toISOString() })
        .eq('id', user.id);

    } catch (err) {
      console.error(`Reengagement failed for user ${user.id}:`, err);
    }
  }

  return new Response(`OK - sent to ${users.length} users`, { status: 200 });
}
