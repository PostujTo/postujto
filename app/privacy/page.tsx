'use client';

import Link from 'next/link';

const LAST_UPDATED = '6 marca 2026';
const EMAIL = 'hello@postujto.com';

export default function PrivacyPage() {
  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-dm-sans), sans-serif; background: #0a0a0f; color: #f0f0f5; }
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,240,245,0.7); cursor: pointer; font-family: var(--font-dm-sans), sans-serif; font-weight: 500; transition: all 0.2s ease; text-decoration: none; display: inline-flex; align-items: center; }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); color: #f0f0f5; }
        .legal-section { margin-bottom: 40px; }
        .legal-section h2 { font-family: var(--font-poppins), sans-serif; font-size: 18px; font-weight: 700; color: #f0f0f5; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .legal-section p { font-size: 14px; color: rgba(240,240,245,0.65); line-height: 1.85; margin-bottom: 12px; }
        .legal-section ul { padding-left: 20px; margin-bottom: 12px; }
        .legal-section ul li { font-size: 14px; color: rgba(240,240,245,0.65); line-height: 1.85; margin-bottom: 6px; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        .data-table th { text-align: left; font-size: 11px; font-weight: 600; color: rgba(240,240,245,0.35); text-transform: uppercase; letter-spacing: 0.08em; padding: 8px 12px; background: rgba(255,255,255,0.03); }
        .data-table td { font-size: 13px; color: rgba(240,240,245,0.6); padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05); vertical-align: top; line-height: 1.6; }
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

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <main style={{ flex: 1, maxWidth: 760, margin: '0 auto', width: '100%', padding: '56px 24px 100px' }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Dokumenty prawne</p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              Polityka <span className="gradient-text">prywatności</span>
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.3)' }}>Ostatnia aktualizacja: {LAST_UPDATED}</p>
          </div>

          <div className="legal-section">
            <h2>1. Administrator danych osobowych</h2>
            <p>Administratorem Twoich danych osobowych jest PostujTo, prowadzący serwis dostępny pod adresem postujto.com (dalej: „Administrator").</p>
            <p>Kontakt z Administratorem w sprawach dotyczących danych osobowych: <a href={`mailto:${EMAIL}`} style={{ color: '#a5b4fc' }}>{EMAIL}</a></p>
          </div>

          <div className="legal-section">
            <h2>2. Jakie dane zbieramy i w jakim celu</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dane</th>
                    <th>Cel</th>
                    <th>Podstawa prawna</th>
                    <th>Odbiorcy</th>
                    <th>Okres przechowywania</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Adres email, imię', 'Rejestracja i obsługa konta', 'Art. 6 ust. 1 lit. b RODO (umowa)', 'Clerk, Supabase', 'Do usunięcia konta + 30 dni'],
                    ['Dane płatnicze (obsługuje Stripe)', 'Przetwarzanie płatności', 'Art. 6 ust. 1 lit. b RODO (umowa)', 'Stripe', 'Zgodnie z polityką Stripe'],
                    ['Historia generowań, Brand Kit', 'Świadczenie usługi', 'Art. 6 ust. 1 lit. b RODO (umowa)', 'Supabase, Anthropic', 'Do usunięcia konta'],
                    ['Logi serwera, adres IP', 'Bezpieczeństwo i diagnostyka', 'Art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes)', 'Vercel, Cloudflare', '90 dni'],
                    ['Cookies analityczne', 'Analiza ruchu (Cloudflare Analytics)', 'Art. 6 ust. 1 lit. a RODO (zgoda)', 'Cloudflare', 'Do wycofania zgody'],
                  ].map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => <td key={j}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>Nie sprzedajemy, nie wynajmujemy ani nie udostępniamy Twoich danych osobom trzecim w celach marketingowych.</p>
          </div>

          <div className="legal-section">
            <h2>3. Podmioty przetwarzające dane (procesorzy)</h2>
            <p>W celu świadczenia usługi korzystamy z następujących podwykonawców:</p>
            <ul>
              <li><strong style={{color:'#f0f0f5'}}>Clerk</strong> — uwierzytelnianie i zarządzanie kontami użytkowników (USA, standardowe klauzule umowne)</li>
              <li><strong style={{color:'#f0f0f5'}}>Supabase</strong> — przechowywanie danych (Frankfurt, UE)</li>
              <li><strong style={{color:'#f0f0f5'}}>Stripe</strong> — obsługa płatności (USA, standardowe klauzule umowne)</li>
              <li><strong style={{color:'#f0f0f5'}}>Anthropic (Claude API)</strong> — generowanie treści AI (USA, standardowe klauzule umowne). Treści zapytań nie są wykorzystywane do trenowania modeli AI.</li>
              <li><strong style={{color:'#f0f0f5'}}>Resend</strong> — wysyłka emaili transakcyjnych (USA, standardowe klauzule umowne)</li>
              <li><strong style={{color:'#f0f0f5'}}>Vercel</strong> — hosting aplikacji (USA/UE, standardowe klauzule umowne)</li>
              <li><strong style={{color:'#f0f0f5'}}>Cloudflare</strong> — CDN i analytics (USA, standardowe klauzule umowne)</li>
              <li><strong style={{color:'#f0f0f5'}}>inFakt</strong> — fakturowanie (Polska)</li>
            </ul>
            <p>Wszystkie podmioty przetwarzające dane poza UE stosują odpowiednie zabezpieczenia (standardowe klauzule umowne lub decyzja o adekwatności).</p>
          </div>

          <div className="legal-section">
            <h2>4. Twoje prawa</h2>
            <p>Zgodnie z RODO przysługują Ci następujące prawa:</p>
            <ul>
              <li><strong style={{color:'#f0f0f5'}}>Prawo dostępu</strong> — możesz poprosić o kopię swoich danych.</li>
              <li><strong style={{color:'#f0f0f5'}}>Prawo do sprostowania</strong> — możesz poprosić o korektę nieprawidłowych danych.</li>
              <li><strong style={{color:'#f0f0f5'}}>Prawo do usunięcia</strong> — możesz poprosić o usunięcie swoich danych („prawo do bycia zapomnianym").</li>
              <li><strong style={{color:'#f0f0f5'}}>Prawo do ograniczenia przetwarzania</strong> — możesz poprosić o ograniczenie przetwarzania w określonych przypadkach.</li>
              <li><strong style={{color:'#f0f0f5'}}>Prawo do przenoszenia danych</strong> — możesz otrzymać swoje dane w formacie CSV/JSON.</li>
              <li><strong style={{color:'#f0f0f5'}}>Prawo do sprzeciwu</strong> — możesz sprzeciwić się przetwarzaniu opartemu na prawnie uzasadnionym interesie.</li>
              <li><strong style={{color:'#f0f0f5'}}>Prawo do wycofania zgody</strong> — możesz wycofać zgodę na cookies analityczne w dowolnym momencie.</li>
            </ul>
            <p>Aby skorzystać z powyższych praw, skontaktuj się z nami: <a href={`mailto:${EMAIL}`} style={{ color: '#a5b4fc' }}>{EMAIL}</a>. Odpowiadamy w ciągu 30 dni.</p>
            <p>Masz również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO), ul. Stawki 2, 00-193 Warszawa.</p>
          </div>

          <div className="legal-section">
            <h2>5. Cookies</h2>
            <p>Używamy następujących rodzajów plików cookies:</p>
            <ul>
              <li><strong style={{color:'#f0f0f5'}}>Niezbędne</strong> — wymagane do działania serwisu (sesja, uwierzytelnianie). Nie wymagają zgody.</li>
              <li><strong style={{color:'#f0f0f5'}}>Analityczne</strong> — Cloudflare Analytics (anonimowe statystyki ruchu). Wymagają zgody.</li>
            </ul>
            <p>Możesz zarządzać cookies przez ustawienia przeglądarki lub banner cookies wyświetlany przy pierwszej wizycie. Wycofanie zgody na cookies analityczne nie wpływa na funkcjonowanie serwisu.</p>
            <p>Nie używamy cookies reklamowych ani śledzących profil użytkownika na potrzeby reklam.</p>
          </div>

          <div className="legal-section">
            <h2>6. Bezpieczeństwo danych</h2>
            <p>Stosujemy następujące środki techniczne i organizacyjne w celu ochrony Twoich danych:</p>
            <ul>
              <li>Szyfrowanie połączeń HTTPS (TLS 1.3)</li>
              <li>Dane przechowywane w szyfrowanych bazach danych (Supabase, Frankfurt)</li>
              <li>Dane kart płatniczych nie są przechowywane przez PostujTo — obsługuje je wyłącznie Stripe (PCI DSS Level 1)</li>
              <li>Dostęp do danych produkcyjnych ograniczony do niezbędnego minimum</li>
              <li>Regularne kopie zapasowe danych</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>7. Zmiany polityki prywatności</h2>
            <p>Zastrzegamy sobie prawo do zmiany niniejszej Polityki prywatności. O istotnych zmianach poinformujemy Cię drogą mailową z co najmniej 14-dniowym wyprzedzeniem.</p>
            <p>Aktualna wersja Polityki prywatności jest zawsze dostępna pod adresem postujto.com/privacy.</p>
          </div>
        </main>

        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.2)' }}>© 2026 PostujTo.com</p>
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