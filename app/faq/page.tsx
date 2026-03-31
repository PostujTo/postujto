'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQ_ITEMS = [
  {
    category: 'Ogólne',
    emoji: '💡',
    questions: [
      {
        q: 'Czym jest PostujTo?',
        a: 'PostujTo to polska platforma do generowania postów w mediach społecznościowych przy pomocy AI. Wpisujesz temat, wybierasz platformę (Facebook, Instagram, TikTok) i ton — Claude generuje 3 gotowe wersje posta z hashtagami i opisem grafiki. Oszczędzasz nawet 10 godzin tygodniowo na tworzeniu treści.'
      },
      {
        q: 'Dla kogo jest PostujTo?',
        a: 'PostujTo jest skierowane do małych firm, freelancerów i przedsiębiorców, którzy chcą prowadzić aktywne social media bez zatrudniania copywritera. Działa świetnie dla restauracji, salonów kosmetycznych, sklepów internetowych, agencji nieruchomości i wielu innych branż.'
      },
      {
        q: 'W jakim języku generowane są posty?',
        a: 'Wszystkie posty generowane są w języku polskim, z uwzględnieniem polskich zwrotów marketingowych, polskiego prawa reklamowego i lokalnych okazji (Dzień Matki, Mikołajki, Black Friday itp.). Posty brzmią naturalnie — nie jak tłumaczenie z angielskiego.'
      },
    ]
  },
  {
    category: 'Plany i płatności',
    emoji: '💳',
    questions: [
      {
        q: 'Czy mogę przetestować PostujTo za darmo?',
        a: 'Tak! Po założeniu konta otrzymujesz 5 darmowych kredytów — każdy kredyt to jedno generowanie 3 wersji posta. Nie wymagamy karty kredytowej przy rejestracji.'
      },
      {
        q: 'Czym różni się plan Starter od Pro?',
        a: 'Plan Starter (79 zł/msc) zawiera unlimited generowanie postów, obrazy AI i Brand Kit. Plan Pro (199 zł/msc) dodaje automatyczne generowanie 3 obrazów do każdego posta, podpis marki (logo) na obrazach oraz priorytetowe generowanie. Dla większości małych firm plan Starter w zupełności wystarczy.'
      },
      {
        q: 'Czy mogę anulować subskrypcję w dowolnym momencie?',
        a: 'Tak, możesz anulować subskrypcję w dowolnym momencie przez Panel → Subskrypcja. Po anulowaniu zachowujesz dostęp do końca opłaconego okresu rozliczeniowego. Po jego zakończeniu konto wraca do planu Free.'
      },
      {
        q: 'Jaka jest polityka zwrotów?',
        a: 'Przy pierwszym zakupie subskrypcji przysługuje Ci prawo do zwrotu w ciągu 14 dni, pod warunkiem że usługa nie była używana (nie wygenerowano żadnego posta). Jeśli aktywowałeś usługę i wygenerowałeś posty, prawo odstąpienia nie przysługuje — zgodnie z art. 38 pkt 13 ustawy o prawach konsumenta. Przy odnowieniach subskrypcji zwroty nie przysługują — płatność za nowy okres jest bezzwrotna.'
      },
      {
        q: 'Czy wystawiacie faktury?',
        a: 'Tak, faktura VAT jest automatycznie wystawiana przy każdej płatności i wysyłana na adres email podany przy rejestracji.'
      },
    ]
  },
  {
    category: 'Funkcje',
    emoji: '⚙️',
    questions: [
      {
        q: 'Co to jest Brand Kit?',
        a: 'Brand Kit to profil Twojej marki w PostujTo. Możesz zapisać nazwę firmy, kolory marki, styl graficzny, ton komunikacji i przykładowe posty. Dzięki temu Claude generuje posty spójne z Twoją marką — nie generyczne, ale napisane Twoim głosem.'
      },
      {
        q: 'Jak działa kalendarz treści?',
        a: 'Kalendarz treści pozwala zaplanować posty na cały miesiąc. Claude generuje 30 tematów dopasowanych do Twojej branży i nadchodzących okazji, a następnie tworzy gotowe posty dla każdego dnia. Możesz eksportować wszystko do CSV lub kopiować serię na tydzień jednym kliknięciem.'
      },
      {
        q: 'Czy mogę generować obrazy do postów?',
        a: 'Tak, w planach Starter i Pro możesz generować obrazy AI (Recraft V3) do każdego posta. W planie Pro obrazy są generowane automatycznie — 3 obrazy od razu po wygenerowaniu postów. W planie Starter generujesz obrazy ręcznie, jeden kliknięciem przy każdym poście.'
      },
      {
        q: 'Czy posty są zapisywane?',
        a: 'Tak, każde generowanie jest automatycznie zapisywane w Panelu użytkownika. Możesz przeglądać historię, dodawać do ulubionych, oceniać wersje gwiazdkami i śledzić wyniki postów (lajki, zasięg, komentarze).'
      },
    ]
  },
  {
    category: 'Prywatność i bezpieczeństwo',
    emoji: '🔒',
    questions: [
      {
        q: 'Czy moje dane są bezpieczne?',
        a: 'Tak. Dane przechowujemy na serwerach Supabase (Frankfurt, UE). Płatności obsługuje Stripe — nie przechowujemy danych kart płatniczych. Logowanie odbywa się przez Clerk z obsługą 2FA. Wszystkie połączenia są szyfrowane (HTTPS).'
      },
      {
        q: 'Czy PostujTo przetwarza moje posty do trenowania AI?',
        a: 'Nie. Treści generowane przez PostujTo nie są używane do trenowania modeli AI. Dane przesyłane do Claude API są przetwarzane wyłącznie w celu wygenerowania odpowiedzi i nie są zatrzymywane przez Anthropic do celów treningowych (zgodnie z polityką API Anthropic).'
      },
      {
        q: 'Jak skontaktować się z supportem?',
        a: 'Napisz do nas na hello@postujto.com. Odpowiadamy w dni robocze do 24 godzin. Możesz też śedzić nas na TikTok i Instagram @reklamyzpostujto, gdzie regularnie publikujemy porady i aktualizacje.'
      },
    ]
  },
];

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<string | null>(null);

  const toggle = (key: string) => setOpenIdx(prev => prev === key ? null : key);

  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-dm-sans), sans-serif; background: #0a0a0f; color: #f0f0f5; }
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,240,245,0.7); cursor: pointer; font-family: var(--font-dm-sans), sans-serif; font-weight: 500; transition: all 0.2s ease; text-decoration: none; display: inline-flex; align-items: center; }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); color: #f0f0f5; }
        .btn-primary:hover { filter: brightness(1.15); transform: translateY(-1px); }
        .faq-item { border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; transition: border-color 0.2s; }
        .faq-item:hover { border-color: rgba(99,102,241,0.25); }
        .faq-item.open { border-color: rgba(99,102,241,0.4); }
        .faq-btn { width: 100%; text-align: left; background: rgba(255,255,255,0.02); border: none; cursor: pointer; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16; font-family: var(--font-dm-sans), sans-serif; color: #f0f0f5; transition: background 0.2s; }
        .faq-btn:hover { background: rgba(255,255,255,0.04); }
        .faq-btn.open { background: rgba(99,102,241,0.08); }
        .faq-answer { padding: 0 24px 20px; color: rgba(240,240,245,0.65); font-size: 14px; line-height: 1.8; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease-out forwards; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
        .btn-primary { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; font-weight: 700; transition: all 0.3s ease; position: relative; overflow: hidden; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
        .btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); opacity: 0; transition: opacity 0.3s ease; }
        .btn-primary:hover::after { opacity: 1; }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #f0f0f5; font-weight: 600; transition: all 0.3s ease; backdrop-filter: blur(10px); cursor: pointer; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
      `}</style>

      {/* BG */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>


        <main style={{ flex: 1, maxWidth: 800, margin: '0 auto', width: '100%', padding: '64px 24px 100px' }}>

          {/* Hero */}
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Pomoc</p>
            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Często zadawane <span className="gradient-text">pytania</span>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(240,240,245,0.45)', maxWidth: 480, margin: '0 auto' }}>
              Nie znalazłeś odpowiedzi? Napisz do nas na{' '}
              <a href="mailto:hello@postujto.com" style={{ color: '#a5b4fc', textDecoration: 'none' }}>hello@postujto.com</a>
            </p>
          </div>

          {/* FAQ Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {FAQ_ITEMS.map((category, ci) => (
              <div key={ci} className="fade-up" style={{ animationDelay: `${ci * 0.08}s` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <span style={{ fontSize: 20 }}>{category.emoji}</span>
                  <h2 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: 'rgba(240,240,245,0.9)' }}>{category.category}</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {category.questions.map((item, qi) => {
                    const key = `${ci}-${qi}`;
                    const isOpen = openIdx === key;
                    return (
                      <div key={qi} className={`faq-item ${isOpen ? 'open' : ''}`}>
                        <button className={`faq-btn ${isOpen ? 'open' : ''}`} onClick={() => toggle(key)}>
                          <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5 }}>{item.q}</span>
                          <span style={{ fontSize: 18, color: isOpen ? '#a5b4fc' : 'rgba(240,240,245,0.3)', transition: 'all 0.2s', transform: isOpen ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
                        </button>
                        {isOpen && (
                          <div className="faq-answer">{item.a}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          </main>

        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.2)' }}>© 2026 PostujTo.com · Wykonane z ❤️ w Polsce</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {[['Regulamin', '/terms'], ['Polityka prywatności', '/privacy'], ['FAQ', '/faq']].map(([label, href]) => (
                <Link key={href} href={href} style={{ fontSize: 13, color: 'rgba(240,240,245,0.3)', textDecoration: 'none' }}>{label}</Link>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}