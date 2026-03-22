import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/AppHeader';
import { industries, INDUSTRY_TOPICS } from '@/lib/industries';
import { GOLDEN_PATTERNS } from '@/lib/prompts';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = industries.find(i => i.slug === slug);
  if (!industry) return {};
  return {
    title: industry.metaTitle,
    description: industry.metaDescription,
    openGraph: { title: industry.metaTitle, description: industry.metaDescription },
  };
}

export async function generateStaticParams() {
  return industries.map(i => ({ slug: i.slug }));
}

const TYPE_LABELS = { pain: '🔴 Ból klienta', result: '🟢 Rezultat', relation: '🟡 Kulisy' };
const PLATFORM_COLORS = { facebook: '#1877F2', instagram: '#E1306C', tiktok: '#010101' };
const PLATFORM_LABELS = { facebook: 'Facebook', instagram: 'Instagram', tiktok: 'TikTok' };

export default async function IndustryLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = industries.find(i => i.slug === slug);
  if (!industry) notFound();

  const pattern = GOLDEN_PATTERNS[slug];
  const topics = INDUSTRY_TOPICS[slug] ?? [];

  const s = {
    section: { maxWidth: 760, margin: '0 auto', padding: '64px 24px' },
    sectionNarrow: { maxWidth: 760, margin: '0 auto', padding: '48px 24px' },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', marginBottom: 12, letterSpacing: '-0.01em' } as React.CSSProperties,
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px' } as React.CSSProperties,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5' }}>
      <AppHeader />

      {/* ── 1. HERO ── */}
      <section style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px 56px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20, lineHeight: 1 }}>{industry.icon}</div>
        <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 36, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {industry.headline}
        </h1>
        <p style={{ fontSize: 18, color: 'rgba(240,240,245,0.6)', marginBottom: 36, lineHeight: 1.6 }}>
          {industry.subheadline}
        </p>
        <Link href="/sign-up" style={{ display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 17, textDecoration: 'none', transition: 'opacity 0.2s' }}>
          Zacznij za darmo →
        </Link>
        <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.3)', marginTop: 12 }}>
          5 postów gratis • Bez karty kredytowej
        </p>
      </section>

      {/* ── 2. BÓL BRANŻY ── */}
      {pattern && (
        <section style={{ background: 'rgba(99,102,241,0.06)', borderTop: '1px solid rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={s.sectionNarrow}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Znasz to uczucie?</p>
            <p style={{ fontSize: 20, color: '#f0f0f5', lineHeight: 1.7, marginBottom: 20 }}>
              😔 {pattern.pain}
            </p>
            <p style={{ fontSize: 18, color: '#a5b4fc', lineHeight: 1.7 }}>
              ✨ {pattern.dream}
            </p>
          </div>
        </section>
      )}

      {/* ── 3. PRZYKŁADOWE POSTY ── */}
      <section style={s.section}>
        <h2 style={s.h2}>Tak wyglądają posty dla branży {industry.name}</h2>
        <p style={{ color: 'rgba(240,240,245,0.4)', fontSize: 15, marginBottom: 28 }}>
          Realne przykłady wygenerowane przez PostujTo — gotowe do publikacji.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {industry.examplePosts.map((post, i) => (
            <div key={i} style={{ ...s.card, borderLeft: `3px solid ${PLATFORM_COLORS[post.platform]}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: PLATFORM_COLORS[post.platform], textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {PLATFORM_LABELS[post.platform]}
                </span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.8)', lineHeight: 1.7, margin: 0 }}>{post.content}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. ZŁOTE TEMATY ── */}
      {topics.length > 0 && (
        <section style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={s.section}>
            <h2 style={s.h2}>Tematy postów dla branży {industry.name}</h2>
            <p style={{ color: 'rgba(240,240,245,0.4)', fontSize: 15, marginBottom: 28 }}>
              Kliknij temat — a PostujTo wygeneruje gotowy post w 30 sekund.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topics.map((topic, i) => (
                <Link
                  key={i}
                  href={`/app?topic=${encodeURIComponent(topic.title)}&industry=${slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: 'rgba(240,240,245,0.85)', textDecoration: 'none', fontSize: 14, lineHeight: 1.4, transition: 'border-color 0.15s' }}
                >
                  <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.35)', whiteSpace: 'nowrap' }}>
                    {TYPE_LABELS[topic.type]}
                  </span>
                  <span style={{ flex: 1 }}>{topic.title}</span>
                  <span style={{ flexShrink: 0, color: '#6366f1', fontSize: 16 }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. JAK TO DZIAŁA ── */}
      <section style={s.section}>
        <h2 style={{ ...s.h2, textAlign: 'center' }}>Jak to działa?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 32 }}>
          {[
            { icon: '📝', step: '1', title: 'Opisz swoją firmę', desc: 'Wpisz nazwę, branżę i ton komunikacji — raz, na zawsze.' },
            { icon: '🎯', step: '2', title: 'Wybierz temat i platformę', desc: 'FB, Instagram lub TikTok. Wybierz gotowy temat lub wpisz własny.' },
            { icon: '✅', step: '3', title: 'Gotowy post w 30 sekund', desc: 'Claude generuje 3 wersje posta. Skopiuj i wrzuć na social media.' },
          ].map(s2 => (
            <div key={s2.step} style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>{s2.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Krok {s2.step}</div>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 8 }}>{s2.title}</p>
              <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.45)', lineHeight: 1.6 }}>{s2.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. SOCIAL PROOF ── */}
      <section style={{ background: 'rgba(99,102,241,0.05)', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ ...s.sectionNarrow, textAlign: 'center' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(240,240,245,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20 }}>
            Co mówią przedsiębiorcy z branży {industry.name}?
          </p>
          <p style={{ fontSize: 28, color: '#fbbf24', marginBottom: 16 }}>★★★★★</p>
          <blockquote style={{ fontSize: 18, color: 'rgba(240,240,245,0.85)', lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 20px' }}>
            "{industry.socialProof.quote}"
          </blockquote>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{industry.socialProof.name}</p>
          <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.4)' }}>{industry.socialProof.business}</p>
        </div>
      </section>

      {/* ── 7. CENNIK / CTA ── */}
      <section style={s.section}>
        <h2 style={{ ...s.h2, textAlign: 'center' }}>Wybierz swój plan</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginTop: 32 }}>
          {[
            { name: 'Free', price: '0 zł', desc: '5 postów po rejestracji', color: 'rgba(255,255,255,0.06)', cta: 'Zacznij za darmo', href: '/sign-up' },
            { name: 'Starter', price: '79 zł/msc', desc: 'Unlimited posty • Brand Kit • Obrazy AI', color: 'rgba(99,102,241,0.15)', cta: 'Wybierz Starter', href: '/pricing', highlight: true },
            { name: 'Pro', price: '199 zł/msc', desc: 'Wszystko ze Starter + auto-obrazy • watermark', color: 'rgba(168,85,247,0.1)', cta: 'Wybierz Pro', href: '/pricing' },
          ].map(plan => (
            <div key={plan.name} style={{ background: plan.color, border: plan.highlight ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '24px 20px', textAlign: 'center' }}>
              <p style={{ fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 4 }}>{plan.name}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: plan.highlight ? '#a5b4fc' : '#fff', marginBottom: 8 }}>{plan.price}</p>
              <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.45)', marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>
              <Link href={plan.href} style={{ display: 'block', padding: '10px 16px', background: plan.highlight ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(240,240,245,0.3)', marginTop: 20 }}>
          Nie potrzebujesz karty — zacznij za darmo
        </p>
      </section>

      {/* ── 8. FAQ ── */}
      <section style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={s.section}>
          <h2 style={s.h2}>Często zadawane pytania</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { q: 'Czy mogę przetestować bez płatności?', a: 'Tak, plan Free daje 5 postów gratis. Bez karty kredytowej, bez zobowiązań.' },
              { q: 'Jak długo trwa generowanie posta?', a: 'Około 30 sekund. Claude analizuje Twój Brand Kit i generuje 3 gotowe wersje posta.' },
              { q: 'Czy posty są po polsku?', a: 'Tak, PostujTo działa wyłącznie po polsku, z uwzględnieniem polskich realiów rynkowych.' },
              { q: 'Mogę anulować subskrypcję w dowolnym momencie?', a: 'Tak, bez żadnych opłat za rezygnację. Anulowanie przez panel klienta w ustawieniach.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 6 }}>{item.q}</p>
                <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.55)', lineHeight: 1.6, margin: 0 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section style={{ textAlign: 'center', padding: '56px 24px 80px' }}>
        <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.3)', marginBottom: 20 }}>Dołącz do setek polskich przedsiębiorców, którzy oszczędzają czas na social mediach</p>
        <Link href="/sign-up" style={{ display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>
          Zacznij za darmo →
        </Link>
      </section>
    </div>
  );
}
