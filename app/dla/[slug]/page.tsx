import { notFound } from 'next/navigation';
import Link from 'next/link';
import { industries, INDUSTRY_TOPICS } from '@/lib/industries';
import { GOLDEN_PATTERNS } from '@/lib/prompts';
import { PricingSection } from './PricingSection';

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
    section: { maxWidth: 900, margin: '0 auto', padding: '64px 24px' },
    sectionNarrow: { maxWidth: 900, margin: '0 auto', padding: '48px 24px' },
    h2: { fontFamily: '"Poppins", sans-serif', fontWeight: 800, fontSize: 28, color: '#fff', marginBottom: 12, letterSpacing: '-0.01em' } as React.CSSProperties,
    card: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px 24px' } as React.CSSProperties,
  };

  return (
    <div style={{ background: '#0a0a0f', fontFamily: '"DM Sans", sans-serif', color: '#f0f0f5' }}>

      {/* ── 1. HERO ── */}
      <section className="dla-hero-section" style={{ padding: '80px 24px 56px' }}>
        <div className="dla-hero-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* Left — tekst */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 100, padding: '6px 16px', fontSize: 13, color: 'rgba(240,240,245,0.7)', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, background: '#6366f1', borderRadius: '50%', display: 'inline-block' }} />
              PostujTo dla branży {industry.name}
            </div>
            <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>{industry.icon}</div>
            <h1 style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 800, color: '#fff', marginBottom: 16, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
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
          </div>

          {/* Right — przykładowy post */}
          {industry.examplePosts[0] && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, backdropFilter: 'blur(8px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: PLATFORM_COLORS[industry.examplePosts[0].platform], textTransform: 'uppercase', letterSpacing: '0.08em', background: (PLATFORM_COLORS[industry.examplePosts[0].platform] + '18'), padding: '4px 10px', borderRadius: 6 }}>
                  {PLATFORM_LABELS[industry.examplePosts[0].platform]}
                </span>
              </div>
              <p style={{ fontSize: 15, color: 'rgba(240,240,245,0.85)', lineHeight: 1.75, margin: 0 }}>
                {industry.examplePosts[0].content}
              </p>
              <div style={{ marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(99,102,241,0.1)', borderRadius: 8, padding: '6px 12px' }}>
                <span style={{ fontSize: 11, color: '#a5b4fc', fontWeight: 600 }}>✨ Wygenerowany przez AI w 30 sek</span>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── STATYSTYKI ── */}
      <section style={{ background: 'rgba(99,102,241,0.06)', borderTop: '1px solid rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '32px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[
            { value: '12h', label: 'tygodniowo oszczędzasz' },
            { value: '30', label: 'postów w 5 minut' },
            { value: '5 min', label: 'czas generowania' },
            { value: '21', label: 'branż obsługiwanych' },
          ].map(stat => (
            <div key={stat.value} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#a5b4fc' }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.5)', marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 2. BÓL BRANŻY ── */}
      {pattern && (
        <section style={{ background: 'rgba(99,102,241,0.06)', borderTop: '1px solid rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="dla-section-narrow" style={s.sectionNarrow}>
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
      <section className="dla-section" style={s.section}>
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
          <div className="dla-section" style={s.section}>
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
      <section className="dla-section" style={s.section}>
        <h2 style={{ ...s.h2, textAlign: 'center' }}>Jak to działa?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 32 }}>
          {[
            { icon: '📝', step: '1', title: 'Opisz swoją firmę', desc: 'Wpisz nazwę, branżę i ton komunikacji — raz, na zawsze.' },
            { icon: '🎯', step: '2', title: 'Wybierz temat i platformę', desc: 'FB, Instagram lub TikTok. Wybierz gotowy temat lub wpisz własny.' },
            { icon: '✅', step: '3', title: 'Jeden klik — post idzie sam', desc: 'Claude generuje 3 wersje posta. Jeden klik i post trafia automatycznie na Facebook, Instagram i TikTok.' },
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
        <div className="dla-section-narrow" style={{ ...s.sectionNarrow, textAlign: 'center' }}>
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
      <PricingSection />

      {/* ── 8. FAQ ── */}
      <section style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="dla-section" style={s.section}>
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
      <section className="dla-footer-section" style={{ textAlign: 'center', padding: '56px 24px 80px' }}>
        <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.3)', marginBottom: 20 }}>Dołącz do setek polskich przedsiębiorców, którzy oszczędzają czas na social mediach</p>
        <Link href="/sign-up" style={{ display: 'inline-block', padding: '16px 40px', background: 'linear-gradient(135deg,#6366f1,#a855f7)', borderRadius: 14, color: '#fff', fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>
          Zacznij za darmo →
        </Link>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <span style={{ fontFamily: '"Poppins", sans-serif', fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              Postuj<span style={{ background: 'linear-gradient(135deg,#6366f1,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>To</span>
            </span>
            <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.3)', marginTop: 6 }}>
              © 2026 PostujTo.com · Wykonane z ❤️ w Polsce
            </p>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'Cennik', href: '/pricing' },
              { label: 'Regulamin', href: '/terms' },
              { label: 'Prywatność', href: '/privacy' },
              { label: 'FAQ', href: '/faq' },
            ].map(link => (
              <Link key={link.label} href={link.href} style={{ fontSize: 14, color: 'rgba(240,240,245,0.4)', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
