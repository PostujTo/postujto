import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client z service role (pełny dostęp)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  // Pobierz webhook secret z ENV
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  // Pobierz headery
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Pobierz body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Weryfikuj webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Obsługa eventów
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // Utwórz użytkownika w Supabase
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_user_id: id,
          email: email_addresses[0].email_address,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          subscription_plan: 'free',
          credits_total: 5,
          credits_remaining: 5,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return new Response('Error creating user', { status: 500 });
      }


      // Wyślij onboarding email
      try {
        const firstName = first_name || 'tam';
        const email = email_addresses[0].email_address;
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'PostujTo <hello@postujto.com>',
            to: email,
            subject: 'Witaj w PostujTo! Oto jak zacząć 🚀',
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

    <!-- Logo -->
    <div style="margin-bottom:40px;">
      <span style="font-size:24px;font-weight:800;color:#f0f0f5;letter-spacing:-0.02em;">Postuj<span style="background:linear-gradient(135deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">To</span></span>
    </div>

    <!-- Hero -->
    <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:20px;padding:40px 36px;margin-bottom:32px;">
      <p style="font-size:32px;margin:0 0 16px;">👋</p>
      <h1 style="font-size:26px;font-weight:800;color:#f0f0f5;margin:0 0 12px;line-height:1.2;">Hej ${firstName}!<br/>Witaj w PostujTo.</h1>
      <p style="font-size:16px;color:rgba(240,240,245,0.6);line-height:1.7;margin:0 0 28px;">Właśnie dołączyłeś do grona właścicieli firm, którzy oszczędzają <strong style="color:#a5b4fc;">10 godzin tygodniowo</strong> na tworzeniu treści social media.</p>
      <a href="https://postujto.com/app" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#a855f7);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:15px;font-weight:700;">✨ Wygeneruj pierwszy post →</a>
    </div>

    <!-- Steps -->
    <div style="margin-bottom:32px;">
      <h2 style="font-size:18px;font-weight:700;color:#f0f0f5;margin:0 0 20px;">Jak zacząć w 3 krokach:</h2>
      ${[
        { n: '1', emoji: '🎨', title: 'Skonfiguruj Brand Kit', desc: 'Dodaj nazwę firmy, kolory i przykładowe posty — Claude będzie pisał w Twoim stylu.', href: 'https://postujto.com/settings', cta: 'Otwórz ustawienia' },
        { n: '2', emoji: '✍️', title: 'Wygeneruj pierwszy post', desc: 'Wpisz temat, wybierz platformę i kliknij Generuj. Gotowe w 8 sekund.', href: 'https://postujto.com/app', cta: 'Otwórz generator' },
        { n: '3', emoji: '📅', title: 'Zaplanuj miesiąc', desc: 'Użyj kalendarza treści żeby wygenerować 30 postów na 30 dni jednym kliknięciem.', href: 'https://postujto.com/calendar', cta: 'Otwórz kalendarz' },
      ].map(s => `
        <div style="display:flex;gap:16px;margin-bottom:20px;padding:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;">
          <div style="width:36px;height:36px;border-radius:50%;background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.4);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#a5b4fc;flex-shrink:0;text-align:center;line-height:36px;">${s.n}</div>
          <div style="flex:1;">
            <p style="font-size:15px;font-weight:700;color:#f0f0f5;margin:0 0 4px;">${s.emoji} ${s.title}</p>
            <p style="font-size:13px;color:rgba(240,240,245,0.5);line-height:1.5;margin:0 0 10px;">${s.desc}</p>
            <a href="${s.href}" style="font-size:13px;color:#818cf8;text-decoration:none;font-weight:600;">${s.cta} →</a>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Free credits reminder -->
    <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:14px;padding:20px 24px;margin-bottom:32px;">
      <p style="font-size:14px;color:rgba(240,240,245,0.8);margin:0;line-height:1.6;">🎁 <strong style="color:#4ade80;">Masz 5 darmowych kredytów</strong> na start. Jeśli spodobają Ci się wyniki, przejdź na plan Starter (79 zł/msc) — unlimited postów i obrazy AI.</p>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:24px;">
      <p style="font-size:13px;color:rgba(240,240,245,0.25);margin:0 0 8px;">PostujTo.com · Wykonane z ❤️ w Polsce</p>
      <p style="font-size:12px;color:rgba(240,240,245,0.2);margin:0;">Dostałeś tę wiadomość bo właśnie założyłeś konto w PostujTo.</p>
    </div>
  </div>
</body>
</html>`,
          }),
        });
      } catch (emailErr) {
        console.error('Błąd wysyłki onboarding email:', emailErr);
        // Nie blokuj rejestracji jeśli email się nie wyśle
      }

      return new Response('User created', { status: 200 });
    } catch (err) {
      console.error('Error:', err);
      return new Response('Internal server error', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    try {
      // Zaktualizuj użytkownika w Supabase
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          email: email_addresses[0].email_address,
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || null,
        })
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return new Response('Error updating user', { status: 500 });
      }

      return new Response('User updated', { status: 200 });
    } catch (err) {
      console.error('Error:', err);
      return new Response('Internal server error', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    try {
      // Usuń użytkownika z Supabase
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Error deleting user from Supabase:', error);
        return new Response('Error deleting user', { status: 500 });
      }

      return new Response('User deleted', { status: 200 });
    } catch (err) {
      console.error('Error:', err);
      return new Response('Internal server error', { status: 500 });
    }
  }

  return new Response('Event not handled', { status: 200 });
}