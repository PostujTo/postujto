import { Resend } from 'resend';

const FROM = 'PostujTo Alerty <alerty@postujto.com>';
const getResend = () => new Resend(process.env.RESEND_API_KEY);
const getTo = () => process.env.ALERT_EMAIL ?? 'hello@postujto.com';

function baseTemplate(title: string, color: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#13131a;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
    <div style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:28px 32px;">
      <div style="font-size:22px;font-weight:800;color:white;letter-spacing:-0.02em;">PostujTo.com</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:4px;">System alertów</div>
    </div>
    <div style="padding:24px 32px 0;">
      <span style="display:inline-block;padding:5px 14px;background:${color}22;border:1px solid ${color}55;border-radius:100px;font-size:12px;font-weight:600;color:${color};letter-spacing:0.05em;text-transform:uppercase;">${title}</span>
    </div>
    <div style="padding:20px 32px 32px;color:rgba(240,240,245,0.85);font-size:15px;line-height:1.7;">
      ${body}
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.06);padding:18px 32px;text-align:center;">
      <span style="font-size:12px;color:rgba(240,240,245,0.25);">PostujTo.com · Automatyczny alert · ${new Date().toLocaleString('pl-PL')}</span>
    </div>
  </div>
</body>
</html>`;
}

function row(label: string, value: string, valueColor?: string): string {
  return `<tr style="border-top:1px solid rgba(255,255,255,0.06);">
    <td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">${label}:</td>
    <td style="padding:10px 0;font-weight:600;text-align:right;${valueColor ? `color:${valueColor};` : ''}">${value}</td>
  </tr>`;
}

export async function sendNewSubscriptionAlert(data: {
  email: string; plan: string; amount: number; currency: string;
}) {
  await getResend().emails.send({
    from: FROM, to: getTo(),
    subject: `💰 Nowa subskrypcja — ${data.plan}`,
    html: baseTemplate('Nowa subskrypcja', '#22c55e', `
      <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#f0f0f5;">Nowy płatny użytkownik! 🎉</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">Email:</td><td style="padding:10px 0;font-weight:600;text-align:right;">${data.email}</td></tr>
        ${row('Plan', data.plan, '#a5b4fc')}
        ${row('Kwota', `${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}`, '#4ade80')}
      </table>
    `),
  });
}

export async function sendNewRegistrationAlert(data: {
  name: string; email: string;
}) {
  await getResend().emails.send({
    from: FROM, to: getTo(),
    subject: `🎉 Nowy użytkownik: ${data.name}`,
    html: baseTemplate('Nowa rejestracja', '#6366f1', `
      <p style="margin:0 0 20px;font-size:20px;font-weight:700;color:#f0f0f5;">Nowy użytkownik w PostujTo! 🎉</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">Imię i nazwisko:</td><td style="padding:10px 0;font-weight:600;text-align:right;">${data.name}</td></tr>
        ${row('Email', data.email)}
        ${row('Data', new Date().toLocaleString('pl-PL', { timeZone: 'Europe/Warsaw' }))}
      </table>
    `),
  });
}

export async function sendCancellationAlert(data: {
  email: string; plan: string; endsAt: string;
}) {
  await getResend().emails.send({
    from: FROM, to: getTo(),
    subject: `⚠️ Anulowanie subskrypcji — ${data.email}`,
    html: baseTemplate('Anulowanie', '#f59e0b', `
      <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#f0f0f5;">Użytkownik anulował subskrypcję</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">Email:</td><td style="padding:10px 0;font-weight:600;text-align:right;">${data.email}</td></tr>
        ${row('Plan', data.plan)}
        ${row('Dostęp do', data.endsAt, '#fbbf24')}
      </table>
    `),
  });
}

export async function sendPaymentFailedAlert(data: {
  email: string; amount: number; currency: string; reason: string;
}) {
  await getResend().emails.send({
    from: FROM, to: getTo(),
    subject: `❌ Nieudana płatność — ${data.email}`,
    html: baseTemplate('Błąd płatności', '#ef4444', `
      <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#f0f0f5;">Płatność nie powiodła się</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">Email:</td><td style="padding:10px 0;font-weight:600;text-align:right;">${data.email}</td></tr>
        ${row('Kwota', `${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}`)}
        ${row('Powód', data.reason, '#f87171')}
      </table>
    `),
  });
}

export async function sendAnthropicCostAlert(data: {
  cost: number; threshold: number; period: string;
}) {
  await getResend().emails.send({
    from: FROM, to: getTo(),
    subject: `🤖 Anthropic API — przekroczono $${data.threshold}`,
    html: baseTemplate('Próg kosztów API', '#a855f7', `
      <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#f0f0f5;">Koszty Anthropic API przekroczyły próg</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">Aktualny koszt:</td><td style="padding:10px 0;font-weight:700;text-align:right;color:#c084fc;">$${data.cost.toFixed(2)}</td></tr>
        ${row('Próg alertu', `$${data.threshold}`)}
        ${row('Okres', data.period)}
      </table>
      <p style="margin:20px 0 0;font-size:13px;color:rgba(240,240,245,0.4);">Sprawdź <a href="https://console.anthropic.com" style="color:#a5b4fc;">console.anthropic.com</a> aby zobaczyć szczegóły.</p>
    `),
  });
}

export async function sendSupabaseAlert(data: {
  type: 'storage' | 'connections'; current: number; limit: number; percent: number;
}) {
  const label = data.type === 'storage' ? 'Storage' : 'Połączenia DB';
  const unit = data.type === 'storage' ? 'MB' : '';
  await getResend().emails.send({
    from: FROM, to: getTo(),
    subject: `🗄️ Supabase ${label} — ${data.percent}% limitu`,
    html: baseTemplate(`Supabase ${label}`, '#06b6d4', `
      <p style="margin:0 0 20px;font-size:18px;font-weight:700;color:#f0f0f5;">Supabase zbliża się do limitu</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">Typ:</td><td style="padding:10px 0;font-weight:600;text-align:right;">${label}</td></tr>
        ${row('Obecne użycie', `${data.current} ${unit}`)}
        ${row('Limit', `${data.limit} ${unit}`)}
        ${row('Wykorzystanie', `${data.percent}%`, '#22d3ee')}
      </table>
    `),
  });
}

export async function sendWeeklyReport(data: {
  newUsers: number; totalUsers: number;
  newSubscriptions: number; totalSubscriptions: number;
  totalGenerations: number; weekGenerations: number;
  revenue: number;
}) {
  await getResend().emails.send({
    from: FROM, to: getTo(),
    subject: `📊 Tygodniowy raport PostujTo — ${new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}`,
    html: baseTemplate('Raport tygodniowy', '#6366f1', `
      <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#f0f0f5;">Podsumowanie tygodnia</p>

      <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:rgba(240,240,245,0.35);text-transform:uppercase;letter-spacing:0.1em;">Użytkownicy</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">Nowi w tym tygodniu:</td><td style="padding:10px 0;font-weight:700;text-align:right;color:#4ade80;">+${data.newUsers}</td></tr>
        ${row('Łącznie', String(data.totalUsers))}
      </table>

      <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:rgba(240,240,245,0.35);text-transform:uppercase;letter-spacing:0.1em;">Subskrypcje</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">Nowe w tym tygodniu:</td><td style="padding:10px 0;font-weight:700;text-align:right;color:#4ade80;">+${data.newSubscriptions}</td></tr>
        ${row('Aktywne łącznie', String(data.totalSubscriptions))}
      </table>

      <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:rgba(240,240,245,0.35);text-transform:uppercase;letter-spacing:0.1em;">Generacje</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:10px 0;color:rgba(240,240,245,0.5);font-size:14px;">Ten tydzień:</td><td style="padding:10px 0;font-weight:700;text-align:right;color:#a5b4fc;">${data.weekGenerations}</td></tr>
        ${row('Łącznie', String(data.totalGenerations))}
      </table>

      <div style="background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.25);border-radius:14px;padding:20px;text-align:center;">
        <div style="font-size:13px;color:rgba(240,240,245,0.5);margin-bottom:6px;">MRR (szacunkowy)</div>
        <div style="font-size:32px;font-weight:800;color:#a5b4fc;">${data.revenue.toFixed(0)} PLN</div>
      </div>
    `),
  });
}