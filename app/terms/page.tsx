'use client';

import Link from 'next/link';

const LAST_UPDATED = '1 marca 2025';
const COMPANY = 'PostujTo';
const EMAIL = 'hello@postujto.com';
const DOMAIN = 'postujto.com';

export default function TermsPage() {
  return (
    <>
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-dm-sans), sans-serif; background: #0a0a0f; color: #f0f0f5; }
        .font-family: var(--font-poppins), sans-serif;
        .gradient-text { background: linear-gradient(135deg, #6366f1, #a855f7, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-ghost { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: rgba(240,240,245,0.7); cursor: pointer; font-family: var(--font-dm-sans), sans-serif; font-weight: 500; transition: all 0.2s ease; text-decoration: none; display: inline-flex; align-items: center; }
        .btn-ghost:hover { background: rgba(255,255,255,0.09); color: #f0f0f5; }
        .legal-section { margin-bottom: 40px; }
        .legal-section h2 { font-family: var(--font-poppins), sans-serif; font-size: 18px; font-weight: 700; color: #f0f0f5; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .legal-section p { font-size: 14px; color: rgba(240,240,245,0.65); line-height: 1.85; margin-bottom: 12px; }
        .legal-section ul { padding-left: 20px; margin-bottom: 12px; }
        .legal-section ul li { font-size: 14px; color: rgba(240,240,245,0.65); line-height: 1.85; margin-bottom: 6px; }
        .highlight-box { padding: 16px 20px; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; margin-bottom: 16px; }
        .highlight-box p { color: rgba(240,240,245,0.75) !important; margin-bottom: 0 !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span className="font-display" style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: '#f0f0f5' }}>
                Postuj<span className="gradient-text">To</span>
              </span>
            </Link>
            <Link href="/" className="btn-ghost" style={{ padding: '8px 16px', borderRadius: 10, fontSize: 13 }}>← Wróć</Link>
          </div>
        </header>

        <main style={{ flex: 1, maxWidth: 760, margin: '0 auto', width: '100%', padding: '56px 24px 100px' }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Dokumenty prawne</p>
            <h1 className="font-display" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              <span className="gradient-text">Regulamin</span> serwisu
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.3)' }}>Ostatnia aktualizacja: {LAST_UPDATED}</p>
          </div>

          <div className="legal-section">
            <h2>§1. Postanowienia ogólne</h2>
            <p>Niniejszy Regulamin określa zasady korzystania z serwisu internetowego <strong style={{color:'#f0f0f5'}}>{DOMAIN}</strong> (dalej: „Serwis"), prowadzonego przez PostujTo (dalej: „Usługodawca" lub „my"), dostępnego pod adresem https://{DOMAIN}.</p>
            <p>Korzystając z Serwisu, akceptujesz niniejszy Regulamin w całości. Jeśli nie zgadzasz się z jego treścią, nie korzystaj z Serwisu.</p>
            <p>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.</p>
          </div>

          <div className="legal-section">
            <h2>§2. Definicje</h2>
            <ul>
              <li><strong style={{color:'#f0f0f5'}}>Użytkownik</strong> — osoba fizyczna lub prawna korzystająca z Serwisu po założeniu konta.</li>
              <li><strong style={{color:'#f0f0f5'}}>Usługa</strong> — narzędzie do generowania treści w mediach społecznościowych przy użyciu AI, dostępne w ramach wybranych planów.</li>
              <li><strong style={{color:'#f0f0f5'}}>Konto</strong> — indywidualne konto Użytkownika w Serwisie.</li>
              <li><strong style={{color:'#f0f0f5'}}>Kredyt</strong> — jednostka rozliczeniowa umożliwiająca jedno generowanie postów w planie Free.</li>
              <li><strong style={{color:'#f0f0f5'}}>Subskrypcja</strong> — płatny dostęp do rozszerzonych funkcji Serwisu w ramach planu Starter lub Pro.</li>
              <li><strong style={{color:'#f0f0f5'}}>Treści wygenerowane</strong> — posty, hashtagi i opisy grafik tworzone przez AI na żądanie Użytkownika.</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>§3. Rejestracja i konto</h2>
            <p>Do korzystania z pełnej funkcjonalności Serwisu wymagane jest założenie konta. Rejestracja jest bezpłatna.</p>
            <p>Użytkownik zobowiązuje się do podania prawdziwych danych podczas rejestracji oraz do aktualizacji tych danych w przypadku ich zmiany.</p>
            <p>Jedno konto może być używane wyłącznie przez jedną osobę. Zakaz udostępniania konta osobom trzecim.</p>
            <p>Usługodawca może zablokować lub usunąć konto Użytkownika, który narusza postanowienia Regulaminu, bez uprzedniego powiadomienia.</p>
          </div>

          <div className="legal-section">
            <h2>§4. Plany i płatności</h2>
            <p>Serwis oferuje następujące plany:</p>
            <ul>
              <li><strong style={{color:'#f0f0f5'}}>Free</strong> — 5 kredytów po rejestracji, bez opłat.</li>
              <li><strong style={{color:'#f0f0f5'}}>Starter</strong> — 79 zł brutto miesięcznie, unlimited generowanie postów, obrazy AI, Brand Kit.</li>
              <li><strong style={{color:'#f0f0f5'}}>Pro</strong> — 199 zł brutto miesięcznie, wszystkie funkcje Starter + auto obrazy, logo watermark, priorytetowe generowanie.</li>
            </ul>
            <p>Płatności obsługiwane są przez Stripe. Ceny podane są w złotych polskich (PLN) i zawierają podatek VAT.</p>
            <p>Subskrypcja jest odnawiana automatycznie co 30 dni, chyba że Użytkownik ją anuluje przed datą odnowienia.</p>
            <p>Usługodawca zastrzega sobie prawo do zmiany cennika z 30-dniowym wyprzedzeniem. Zmiana nie dotyczy bieżącego, opłaconego okresu rozliczeniowego.</p>
          </div>

          <div className="legal-section">
            <h2>§5. Polityka zwrotów i anulowania</h2>
            <div className="highlight-box">
              <p>⚠️ Przed zakupem zapoznaj się uważnie z niniejszą sekcją dotyczącą zwrotów.</p>
            </div>
            <p><strong style={{color:'#f0f0f5'}}>Prawo odstąpienia od umowy:</strong> Zgodnie z art. 38 pkt 13 ustawy z dnia 30 maja 2014 r. o prawach konsumenta, prawo odstąpienia od umowy zawartej na odległość nie przysługuje, jeżeli Użytkownik wyraźnie zażądał rozpoczęcia świadczenia usługi przed upływem 14-dniowego terminu odstąpienia i przyjął do wiadomości utratę tego prawa po pełnym wykonaniu usługi.</p>
            <p>Przy zakupie subskrypcji Użytkownik wyraża zgodę na natychmiastowe uruchomienie usługi, co jest równoznaczne z rezygnacją z prawa odstąpienia zgodnie z ww. przepisem.</p>
            <p><strong style={{color:'#f0f0f5'}}>Wyjątek — pierwsze zamówienie:</strong> Jeśli subskrypcja została zakupiona po raz pierwszy i Użytkownik nie wygenerował żadnego posta, może złożyć wniosek o zwrot w ciągu 14 dni od zakupu, kontaktując się na {EMAIL}. Zwrot zostanie rozpatrzony indywidualnie.</p>
            <p><strong style={{color:'#f0f0f5'}}>Odnowienia subskrypcji:</strong> Płatności za kolejne okresy rozliczeniowe są bezzwrotne. Anulowanie subskrypcji powoduje wyłączenie automatycznego odnowienia — dostęp do płatnych funkcji pozostaje aktywny do końca opłaconego okresu.</p>
            <p><strong style={{color:'#f0f0f5'}}>Anulowanie:</strong> Subskrypcję możesz anulować w dowolnym momencie przez Panel użytkownika → Subskrypcja. Po anulowaniu nie pobieramy kolejnych opłat. Nie zwracamy środków za niewykorzystany czas w bieżącym okresie rozliczeniowym.</p>
          </div>

          <div className="legal-section">
            <h2>§6. Prawa i obowiązki Użytkownika</h2>
            <p>Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z prawem, Regulaminem i dobrymi obyczajami.</p>
            <p>Zabronione jest używanie Serwisu do generowania treści:</p>
            <ul>
              <li>niezgodnych z prawem polskim i unijnym,</li>
              <li>naruszających prawa osób trzecich,</li>
              <li>o charakterze dyskryminującym, rasistowskim, obraźliwym lub obscenicznych,</li>
              <li>zawierających nieprawdziwe informacje mogące wprowadzać konsumentów w błąd,</li>
              <li>promujących działalność niezgodną z prawem.</li>
            </ul>
            <p>Użytkownik ponosi pełną odpowiedzialność za treści generowane i publikowane przy użyciu Serwisu.</p>
          </div>

          <div className="legal-section">
            <h2>§7. Własność intelektualna i treści wygenerowane</h2>
            <p>Treści wygenerowane przez Serwis na żądanie Użytkownika mogą być przez niego swobodnie wykorzystywane w celach komercyjnych, w tym publikowane w mediach społecznościowych.</p>
            <p>Usługodawca nie rości sobie praw do treści wygenerowanych przez AI na podstawie zapytań Użytkownika.</p>
            <p>Kod źródłowy Serwisu, interfejs graficzny, logo i materiały marketingowe PostujTo są własnością Usługodawcy i są chronione prawem autorskim.</p>
            <p>Użytkownik nie może kopiować, modyfikować, dystrybuować ani sprzedawać jakichkolwiek elementów Serwisu bez pisemnej zgody Usługodawcy.</p>
          </div>

          <div className="legal-section">
            <h2>§8. Ograniczenie odpowiedzialności</h2>
            <p>Serwis świadczony jest „w stanie, w jakim jest" (as-is). Usługodawca nie gwarantuje nieprzerwanego działania Serwisu ani że wygenerowane treści będą wolne od błędów.</p>
            <p>Usługodawca nie ponosi odpowiedzialności za:</p>
            <ul>
              <li>treści wygenerowane przez AI i ich zgodność z prawem reklamowym — weryfikacja należy do Użytkownika,</li>
              <li>skutki publikacji treści wygenerowanych przez Serwis,</li>
              <li>przerwy w działaniu Serwisu wynikające z konserwacji, awarii technicznych lub działania siły wyższej,</li>
              <li>utratę danych wynikającą z przyczyn niezależnych od Usługodawcy,</li>
              <li>działania platform trzecich (Facebook, Instagram, TikTok) i ich algorytmów.</li>
            </ul>
            <p>Całkowita odpowiedzialność Usługodawcy wobec Użytkownika z tytułu jakichkolwiek roszczeń nie może przekroczyć kwoty opłat wniesionych przez Użytkownika w ciągu ostatnich 3 miesięcy.</p>
          </div>

          <div className="legal-section">
            <h2>§9. Dane osobowe i cookies</h2>
            <p>Przetwarzanie danych osobowych Użytkowników odbywa się zgodnie z Polityką Prywatności dostępną pod adresem <Link href="/privacy" style={{ color: '#a5b4fc' }}>postujto.com/privacy</Link>.</p>
            <p>Serwis wykorzystuje pliki cookies zgodnie z Polityką Prywatności. Użytkownik może zarządzać ustawieniami cookies w swojej przeglądarce.</p>
          </div>

          <div className="legal-section">
            <h2>§10. Zmiana Regulaminu</h2>
            <p>Usługodawca zastrzega sobie prawo do zmiany Regulaminu. O zmianach Użytkownicy będą informowani drogą elektroniczną (email) z co najmniej 14-dniowym wyprzedzeniem.</p>
            <p>Dalsze korzystanie z Serwisu po wejściu w życie zmian Regulaminu jest równoznaczne z ich akceptacją.</p>
          </div>

          <div className="legal-section">
            <h2>§11. Kontakt i reklamacje</h2>
            <p>W sprawach związanych z Regulaminem oraz reklamacjami prosimy o kontakt na adres: <a href={`mailto:${EMAIL}`} style={{ color: '#a5b4fc' }}>{EMAIL}</a>.</p>
            <p>Reklamacje rozpatrywane są w ciągu 14 dni roboczych od daty ich otrzymania.</p>
            <p>Użytkownik będący konsumentem ma prawo skorzystać z platformy ODR (Online Dispute Resolution) dostępnej pod adresem: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc' }}>ec.europa.eu/consumers/odr</a>.</p>
          </div>

          <div className="legal-section">
            <h2>§12. Postanowienia końcowe</h2>
            <p>Regulamin wchodzi w życie z dniem {LAST_UPDATED}.</p>
            <p>W sprawach nieuregulowanych niniejszym Regulaminem stosuje się przepisy prawa polskiego.</p>
            <p>Wszelkie spory będą rozstrzygane przez sąd właściwy dla siedziby Usługodawcy, chyba że przepisy bezwzględnie obowiązujące stanowią inaczej.</p>
          </div>
        </main>

        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '28px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.2)' }}>© 2025 PostujTo.com</p>
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