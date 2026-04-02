import { createClient } from '@supabase/supabase-js';

async function checkSupabase(): Promise<boolean> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
      .limit(1);
    return !error;
  } catch {
    return false;
  }
}

async function checkClaude(): Promise<boolean> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/models', {
      headers: { 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
      cache: 'no-store',
    });
    return res.status !== 500 && res.status !== 503;
  } catch {
    return false;
  }
}

async function checkStripe(): Promise<boolean> {
  try {
    const res = await fetch('https://api.stripe.com/v1/balance', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY || ''}` },
      cache: 'no-store',
    });
    return res.status !== 500 && res.status !== 503;
  } catch {
    return false;
  }
}

export default async function StatusPage() {
  const [supabase, claude, stripe] = await Promise.allSettled([
    checkSupabase(),
    checkClaude(),
    checkStripe(),
  ]);

  const services = [
    { name: 'Baza danych', result: supabase },
    { name: 'Generator AI', result: claude },
    { name: 'Płatności', result: stripe },
  ];

  const allOk = services.every(s => s.result.status === 'fulfilled' && s.result.value === true);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Status systemu PostujTo
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.4)', marginBottom: 32 }}>
          Ostatnia weryfikacja: {new Date().toLocaleString('pl-PL')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {services.map(({ name, result }) => {
            const ok = result.status === 'fulfilled' && result.value === true;
            return (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '14px 18px' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: ok ? '#4ade80' : '#f87171', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: ok ? '#4ade80' : '#f87171', display: 'inline-block' }} />
                  {ok ? 'Działa' : 'Problem'}
                </span>
              </div>
            );
          })}
        </div>

        {allOk ? (
          <p style={{ fontSize: 14, color: '#4ade80', fontWeight: 600 }}>✅ Wszystkie systemy działają prawidłowo.</p>
        ) : (
          <p style={{ fontSize: 14, color: '#fbbf24', fontWeight: 600 }}>⚠️ Występują problemy z częścią usług. Pracujemy nad naprawą.</p>
        )}

        <a href="/" style={{ display: 'inline-block', marginTop: 24, fontSize: 13, color: 'rgba(240,240,245,0.4)', textDecoration: 'none' }}>
          ← Powrót do PostujTo
        </a>
      </div>
    </div>
  );
}
