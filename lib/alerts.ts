import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const FROM = 'PostujTo Monitoring <alerty@postujto.com>';
const getResend = () => new Resend(process.env.RESEND_API_KEY);
const getTo = () => process.env.ALERT_EMAIL!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface UsageAlertParams {
  userId: string;
  email: string;
  plan: string;
  monthlyCount: number;
}

export async function sendUsageAlert({
  userId,
  email,
  plan,
  monthlyCount,
}: UsageAlertParams) {
  const severity = monthlyCount >= 500 ? '🔴' : monthlyCount >= 300 ? '🟡' : '🟢';
  const month = new Date().toLocaleString('pl-PL', { month: 'long', year: 'numeric' });

  try {
    await getResend().emails.send({
      from: FROM,
      to: getTo(),
      subject: `${severity} Anomalia użycia — ${monthlyCount} generacji w ${month}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">PostujTo — Alert użycia</h2>

          <p>Użytkownik osiągnął próg <strong>${monthlyCount} generacji</strong> w bieżącym miesiącu.</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px 12px; font-weight: bold;">User ID</td>
              <td style="padding: 8px 12px;">${userId}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold;">Email</td>
              <td style="padding: 8px 12px;">${email}</td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px 12px; font-weight: bold;">Plan</td>
              <td style="padding: 8px 12px;">${plan}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold;">Generacji w miesiącu</td>
              <td style="padding: 8px 12px;"><strong>${monthlyCount}</strong></td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px 12px; font-weight: bold;">Szacowany koszt API</td>
              <td style="padding: 8px 12px;">~${(monthlyCount * 0.02).toFixed(2)} zł</td>
            </tr>
          </table>

          ${monthlyCount >= 500 ? `
          <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <strong>⚠️ Wysokie użycie</strong><br>
            Rozważ kontakt z użytkownikiem lub weryfikację czy to normalne użycie.
          </div>
          ` : ''}

          <p style="color: #666; font-size: 12px;">
            Sprawdź w Supabase: generations WHERE user_id = '${userId}' AND created_at >= date_trunc('month', now())
          </p>
        </div>
      `,
    });
  } catch (err) {
    // Błąd alertu nie powinien przerywać generacji
    console.error('Błąd wysyłania alertu użycia:', err);
  }
}

export async function sendDailyUsageReport() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generacje z ostatnich 24h
  const { count: dailyCount } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString());

  // Wyślij tylko jeśli były jakieś generacje wczoraj
  if (!dailyCount || dailyCount === 0) return;

  // Generacje z bieżącego miesiąca
  const { count: monthlyCount } = await supabase
    .from('generations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString());

  // Top 5 użytkowników w miesiącu (pobierz 500 ostatnich do zliczenia)
  const { data: topUsers } = await supabase
    .from('generations')
    .select('user_id, users!inner(email, subscription_plan)')
    .gte('created_at', startOfMonth.toISOString())
    .limit(500);

  // Zlicz per user_id
  const userCounts: Record<string, { count: number; email: string; plan: string }> = {};
  topUsers?.forEach((g: any) => {
    const id = g.user_id;
    if (!userCounts[id]) {
      userCounts[id] = {
        count: 0,
        email: g.users?.email || id,
        plan: g.users?.subscription_plan || '?',
      };
    }
    userCounts[id].count++;
  });

  const sorted = Object.entries(userCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5);

  const month = new Date().toLocaleString('pl-PL', { month: 'long', year: 'numeric' });

  try {
    await getResend().emails.send({
      from: FROM,
      to: getTo(),
      subject: `📊 Dzienny raport PostujTo — ${dailyCount} generacji wczoraj`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6366f1;">PostujTo — Dzienny raport</h2>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px 12px; font-weight: bold;">Generacji wczoraj</td>
              <td style="padding: 8px 12px; font-size: 18px;"><strong>${dailyCount}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold;">Generacji w ${month}</td>
              <td style="padding: 8px 12px;"><strong>${monthlyCount}</strong></td>
            </tr>
            <tr style="background: #f5f5f5;">
              <td style="padding: 8px 12px; font-weight: bold;">Szacowany koszt API (msc)</td>
              <td style="padding: 8px 12px;">~${((monthlyCount || 0) * 0.02).toFixed(2)} zł</td>
            </tr>
          </table>

          ${sorted.length > 0 ? `
          <h3>Top użytkownicy w ${month}:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #6366f1; color: white;">
              <td style="padding: 8px 12px;">#</td>
              <td style="padding: 8px 12px;">Email</td>
              <td style="padding: 8px 12px;">Plan</td>
              <td style="padding: 8px 12px;">Generacji</td>
            </tr>
            ${sorted.map(([, data], i) => `
            <tr style="background: ${i % 2 === 0 ? '#f9f9f9' : 'white'};">
              <td style="padding: 8px 12px;">${i + 1}</td>
              <td style="padding: 8px 12px;">${data.email}</td>
              <td style="padding: 8px 12px;">${data.plan}</td>
              <td style="padding: 8px 12px;"><strong>${data.count}</strong></td>
            </tr>
            `).join('')}
          </table>
          ` : ''}
        </div>
      `,
    });
  } catch (err) {
    console.error('Błąd wysyłania dziennego raportu:', err);
  }
}
