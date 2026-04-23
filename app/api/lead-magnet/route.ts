import { NextRequest } from 'next/server';
import { industries, INDUSTRY_TOPICS } from '@/lib/industries';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug') ?? '';
  const industry = industries.find(i => i.slug === slug);

  if (!industry) {
    return new Response('Not found', { status: 404 });
  }

  const topics = (INDUSTRY_TOPICS[slug] ?? []).slice(0, 30);

  const rows = topics
    .map((t, i) => `<tr><td class="num">${i + 1}.</td><td>${t.title}</td></tr>`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>30 tematów postów — ${industry.name} — PostujTo</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: "Helvetica Neue", Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 40px; max-width: 720px; margin: 0 auto; }
  .logo { font-size: 20px; font-weight: 800; color: #6366f1; margin-bottom: 8px; }
  h1 { font-size: 26px; font-weight: 800; margin-bottom: 6px; line-height: 1.2; }
  .subtitle { font-size: 14px; color: #666; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; }
  tr { border-bottom: 1px solid #f0f0f0; }
  td { padding: 12px 8px; font-size: 15px; line-height: 1.5; vertical-align: top; }
  .num { width: 36px; color: #6366f1; font-weight: 700; white-space: nowrap; }
  .footer { margin-top: 40px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
  @media print {
    body { padding: 20px; }
    .print-btn { display: none; }
  }
  .print-btn { display: block; margin: 32px auto 0; padding: 12px 28px; background: #6366f1; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
</style>
</head>
<body>
  <div class="logo">PostujTo</div>
  <h1>30 tematów postów<br>dla branży: ${industry.name}</h1>
  <p class="subtitle">Gotowe tematy — skopiuj, wklej do generatora i publikuj.</p>
  <table>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <p class="footer">Wygenerowano przez PostujTo.pl • Więcej tematów i gotowe posty: postujto.pl</p>
  <button class="print-btn" onclick="window.print()">Zapisz jako PDF (drukuj)</button>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="tematy-${slug}.html"`,
    },
  });
}
