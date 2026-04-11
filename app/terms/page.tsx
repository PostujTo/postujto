'use client';

import Link from 'next/link';

const LAST_UPDATED = '21 marca 2026';
const COMPANY = 'PostujTo';
const EMAIL = 'hello@postujto.com';
const DOMAIN = 'postujto.com';

export default function TermsPage() {
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
        .highlight-box { padding: 16px 20px; background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.2); border-radius: 12px; margin-bottom: 16px; }
        .highlight-box p { color: rgba(240,240,245,0.75) !important; margin-bottom: 0 !important; }
        .rodo-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13px; }
        .rodo-table th { background: rgba(99,102,241,0.15); color: #a5b4fc; font-weight: 600; padding: 10px 14px; text-align: left; border: 1px solid rgba(255,255,255,0.08); }
        .rodo-table td { padding: 10px 14px; border: 1px solid rgba(255,255,255,0.06); color: rgba(240,240,245,0.65); vertical-align: top; line-height: 1.6; }
        .rodo-table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
        .toc { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 24px 28px; margin-bottom: 48px; }
        .toc h3 { font-size: 14px; font-weight: 700; color: #f0f0f5; margin-bottom: 14px; }
        .toc a { font-size: 13px; color: rgba(165,180,252,0.7); text-decoration: none; display: block; margin-bottom: 8px; transition: color 0.2s; }
        .toc a:hover { color: #a5b4fc; }
        .btn-primary { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; font-weight: 700; transition: all 0.3s ease; position: relative; overflow: hidden; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
        .btn-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%); opacity: 0; transition: opacity 0.3s ease; }
        .btn-primary:hover::after { opacity: 1; }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); color: #f0f0f5; font-weight: 600; transition: all 0.3s ease; backdrop-filter: blur(10px); cursor: pointer; }
        .btn-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 3px; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '5%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

        <main style={{ flex: 1, maxWidth: 760, margin: '0 auto', width: '100%', padding: '56px 24px 100px' }}>
          <div style={{ marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>Dokumenty prawne</p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
              <span className="gradient-text">Regulamin</span> serwisu
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.3)' }}>Ostatnia aktualizacja: {LAST_UPDATED}</p>
          </div>

          {/* SPIS TREŚCI */}
          <div className="toc">
            <h3>Spis treści</h3>
            <a href="#s1">§1. Postanowienia ogólne</a>
            <a href="#s2">§2. Definicje</a>
            <a href="#s3">§3. Rejestracja i konto</a>
            <a href="#s4">§4. Plany i płatności</a>
            <a href="#s5">§5. Reklamacje</a>
            <a href="#s6">§6. Polityka zwrotów i anulowania</a>
            <a href="#s7">§7. Prawa i obowiązki Użytkownika</a>
            <a href="#s8">§8. Własność intelektualna i treści wygenerowane</a>
            <a href="#s9">§9. Ograniczenie odpowiedzialności</a>
            <a href="#s10">§10. Dane osobowe i RODO</a>
            <a href="#s11">§11. Zmiana Regulaminu</a>
            <a href="#s12">§12. Rozstrzyganie sporów i sąd konsumenta</a>
            <a href="#s13">§13. Postanowienia końcowe</a>
          </div>

          <div className="legal-section" id="s1">
            <h2>§1. Postanowienia ogólne</h2>
            <p>Niniejszy Regulamin określa zasady korzystania z serwisu internetowego <strong style={{color:'#f0f0f5'}}>{DOMAIN}</strong> (dalej: „Serwis"), prowadzonego przez PostujTo (dalej: „Usługodawca" lub „my"), dostępnego pod adresem https://{DOMAIN}.</p>
            <p>Korzystając z Serwisu, akceptujesz niniejszy Regulamin w całości. Jeśli nie zgadzasz się z jego treścią, nie korzystaj z Serwisu.</p>
            <p>W sprawach nieuregulowanych niniejszym Regulaminem zastosowanie mają przepisy prawa polskiego, w szczególności Kodeksu cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.</p>
          </div>

          <div className="legal-section" id="s2">
            <h2>§2. Definicje</h2>
            <ul>
              <li><strong style={{color:'#f0f0f5'}}>Użytkownik</strong> — osoba fizyczna lub prawna korzystająca z Serwisu po założeniu konta.</li>
              <li><strong style={{color:'#f0f0f5'}}>Konsument</strong> — osoba fizyczna zawierająca umowę niezwiązaną bezpośrednio z jej działalnością gospodarczą lub zawodową.</li>
              <li><strong style={{color:'#f0f0f5'}}>Usługa</strong> — narzędzie do generowania treści w mediach społecznościowych przy użyciu AI, dostępne w ramach wybranych planów.</li>
              <li><strong style={{color:'#f0f0f5'}}>Konto</strong> — indywidualne konto Użytkownika w Serwisie.</li>
              <li><strong style={{color:'#f0f0f5'}}>Kredyt</strong> — jednostka rozliczeniowa umożliwiająca jedno generowanie postów w planie Free.</li>
              <li><strong style={{color:'#f0f0f5'}}>Subskrypcja</strong> — płatny dostęp do rozszerzonych funkcji Serwisu w ramach planu Starter lub Pro.</li>
              <li><strong style={{color:'#f0f0f5'}}>Treści wygenerowane</strong> — posty, hashtagi i opisy grafik tworzone przez AI na żądanie Użytkownika.</li>
            </ul>
          </div>

          <div className="legal-section" id="s3">
            <h2>§3. Rejestracja i konto</h2>
            <p>Do korzystania z pełnej funkcjonalności Serwisu wymagane jest założenie konta. Rejestracja jest bezpłatna.</p>
            <p>Użytkownik zobowiązuje się do podania prawdziwych danych podczas rejestracji oraz do aktualizacji tych danych w przypadku ich zmiany.</p>
            <p>Jedno konto może być używane wyłącznie przez jedną osobę. Zakaz udostępniania konta osobom trzecim.</p>
            <p>Usługodawca może zablokować lub usunąć konto Użytkownika, który narusza postanowienia Regulaminu, bez uprzedniego powiadomienia.</p>
          </div>

          <div className="legal-section" id="s4">
            <h2>§4. Plany i płatności</h2>
            <p>Serwis oferuje następujące plany:</p>
            <ul>
              <li><strong style={{color:'#f0f0f5'}}>Free</strong> — 5 kredytów po rejestracji, bez opłat.</li>
              <li><strong style={{color:'#f0f0f5'}}>Starter</strong> — 79 zł brutto miesięcznie, unlimited generowanie postów, obrazy AI, Brand Kit.</li>
              <li><strong style={{color:'#f0f0f5'}}>Pro</strong> — 199 zł brutto miesięcznie, wszystkie funkcje Starter + auto obrazy, logo watermark, priorytetowe generowanie.</li>
            </ul>
            <p>Kredyty przyznane w planie Free są ważne przez 12 miesięcy od daty rejestracji. Niewykorzystane kredyty wygasają po upływie tego okresu bez możliwości ich przywrócenia.</p>
            <p>Płatności obsługiwane są przez Stripe. Ceny podane są w złotych polskich (PLN) i zawierają podatek VAT.</p>
            <p>Subskrypcja jest odnawiana automatycznie co 30 dni, chyba że Użytkownik ją anuluje przed datą odnowienia.</p>
            <p>Usługodawca zastrzega sobie prawo do zmiany cennika z 30-dniowym wyprzedzeniem. Zmiana nie dotyczy bieżącego, opłaconego okresu rozliczeniowego.</p>
          </div>

          <div className="legal-section" id="s5">
            <h2>§5. Reklamacje</h2>
            <p>Użytkownik ma prawo złożyć reklamację dotyczącą działania Serwisu lub świadczonych Usług.</p>
            <p><strong style={{color:'#f0f0f5'}}>Jak złożyć reklamację:</strong> Reklamację należy przesłać na adres e-mail: <a href={`mailto:${EMAIL}`} style={{ color: '#a5b4fc' }}>{EMAIL}</a> z tytułem wiadomości „REKLAMACJA", podając:</p>
            <ul>
              <li>imię i nazwisko lub nazwę firmy,</li>
              <li>adres e-mail przypisany do konta,</li>
              <li>opis problemu i okoliczności jego wystąpienia,</li>
              <li>oczekiwany sposób rozwiązania reklamacji.</li>
            </ul>
            <p><strong style={{color:'#f0f0f5'}}>Termin rozpatrzenia:</strong> Reklamacje rozpatrujemy w ciągu 14 dni roboczych od daty ich otrzymania. O wyniku poinformujemy Użytkownika drogą elektroniczną na adres e-mail podany w reklamacji.</p>
            <p><strong style={{color:'#f0f0f5'}}>Reklamacje dotyczące płatności:</strong> W przypadku problemów z płatnością prosimy o kontakt przez formularz Stripe lub bezpośrednio na {EMAIL}. Zwroty realizowane są zgodnie z §6 niniejszego Regulaminu.</p>
            <div className="highlight-box" style={{ marginTop: 16 }}>
              <p>💡 Użytkownik będący konsumentem może skorzystać z pozasądowego rozstrzygania sporów — szczegóły w §12.</p>
            </div>
          </div>

          <div className="legal-section" id="s6">
            <h2>§6. Polityka zwrotów i anulowania</h2>
            <div className="highlight-box">
              <p>⚠️ Przed zakupem zapoznaj się uważnie z niniejszą sekcją dotyczącą zwrotów.</p>
            </div>
            <p><strong style={{color:'#f0f0f5'}}>Prawo odstąpienia od umowy:</strong> Zgodnie z art. 38 pkt 13 ustawy z dnia 30 maja 2014 r. o prawach konsumenta, prawo odstąpienia od umowy zawartej na odległość nie przysługuje, jeżeli Użytkownik wyraźnie zażądał rozpoczęcia świadczenia usługi przed upływem 14-dniowego terminu odstąpienia i przyjął do wiadomości utratę tego prawa po pełnym wykonaniu usługi.</p>
            <p>Przy zakupie subskrypcji Użytkownik wyraża zgodę na natychmiastowe uruchomienie usługi, co jest równoznaczne z rezygnacją z prawa odstąpienia zgodnie z ww. przepisem.</p>
            <p><strong style={{color:'#f0f0f5'}}>Wyjątek — pierwsze zamówienie:</strong> Jeśli subskrypcja została zakupiona po raz pierwszy i Użytkownik nie wygenerował żadnego posta, może złożyć wniosek o zwrot w ciągu 14 dni od zakupu, kontaktując się na {EMAIL}. Zwrot zostanie rozpatrzony indywidualnie.</p>
            <p><strong style={{color:'#f0f0f5'}}>Odnowienia subskrypcji:</strong> Płatności za kolejne okresy rozliczeniowe są bezzwrotne. Anulowanie subskrypcji powoduje wyłączenie automatycznego odnowienia — dostęp do płatnych funkcji pozostaje aktywny do końca opłaconego okresu.</p>
            <p><strong style={{color:'#f0f0f5'}}>Anulowanie:</strong> Subskrypcję możesz anulować w dowolnym momencie przez Panel użytkownika → Subskrypcja. Po anulowaniu nie pobieramy kolejnych opłat. Nie zwracamy środków za niewykorzystany czas w bieżącym okresie rozliczeniowym.</p>
          </div>

          <div className="legal-section" id="s7">
            <h2>§7. Prawa i obowiązki Użytkownika</h2>
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

          <div className="legal-section" id="s8">
            <h2>§8. Własność intelektualna i treści wygenerowane</h2>
            <p>Treści wygenerowane przez Serwis na żądanie Użytkownika mogą być przez niego swobodnie wykorzystywane w celach komercyjnych, w tym publikowane w mediach społecznościowych.</p>
            <p>Usługodawca nie rości sobie praw do treści wygenerowanych przez AI na podstawie zapytań Użytkownika.</p>
            <p>Kod źródłowy Serwisu, interfejs graficzny, logo i materiały marketingowe PostujTo są własnością Usługodawcy i są chronione prawem autorskim.</p>
            <p>Użytkownik nie może kopiować, modyfikować, dystrybuować ani sprzedawać jakichkolwiek elementów Serwisu bez pisemnej zgody Usługodawcy.</p>
          </div>

          <div className="legal-section" id="s9">
            <h2>§9. Ograniczenie odpowiedzialności</h2>
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

          <div className="legal-section" id="s10">
            <h2>§10. Dane osobowe i RODO</h2>
            <p>Przetwarzanie danych osobowych Użytkowników odbywa się zgodnie z Polityką Prywatności dostępną pod adresem <Link href="/privacy" style={{ color: '#a5b4fc' }}>postujto.com/privacy</Link> oraz zgodnie z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 (RODO).</p>
            <p>Serwis wykorzystuje pliki cookies zgodnie z Polityką Prywatności. Użytkownik może zarządzać ustawieniami cookies w swojej przeglądarce.</p>

            <p style={{ marginTop: 20, marginBottom: 12, fontWeight: 600, color: '#f0f0f5', fontSize: 14 }}>Podstawy prawne i cele przetwarzania danych:</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="rodo-table">
                <thead>
                  <tr>
                    <th>Cel przetwarzania</th>
                    <th>Podstawa prawna</th>
                    <th>Okres przechowywania</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Realizacja umowy (świadczenie usług, obsługa konta)</td>
                    <td>Art. 6 ust. 1 lit. b RODO — niezbędność do wykonania umowy</td>
                    <td>Czas trwania umowy + 3 lata (roszczenia)</td>
                  </tr>
                  <tr>
                    <td>Obsługa płatności i fakturowanie</td>
                    <td>Art. 6 ust. 1 lit. b i c RODO — umowa i obowiązek prawny</td>
                    <td>5 lat (obowiązki podatkowe)</td>
                  </tr>
                  <tr>
                    <td>Wysyłka e-maili transakcyjnych (rejestracja, płatności)</td>
                    <td>Art. 6 ust. 1 lit. b RODO — niezbędność do wykonania umowy</td>
                    <td>Czas trwania konta</td>
                  </tr>
                  <tr>
                    <td>Marketing własny (newsletter, informacje o funkcjach)</td>
                    <td>Art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes</td>
                    <td>Do cofnięcia zgody lub sprzeciwu</td>
                  </tr>
                  <tr>
                    <td>Bezpieczeństwo i zapobieganie nadużyciom</td>
                    <td>Art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes</td>
                    <td>12 miesięcy</td>
                  </tr>
                  <tr>
                    <td>Obsługa reklamacji i sporów</td>
                    <td>Art. 6 ust. 1 lit. c i f RODO — obowiązek prawny i uzasadniony interes</td>
                    <td>3 lata od zakończenia sprawy</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ marginTop: 16 }}><strong style={{color:'#f0f0f5'}}>Prawa Użytkownika:</strong> Użytkownik ma prawo do dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu. Wnioski należy kierować na: <a href={`mailto:${EMAIL}`} style={{ color: '#a5b4fc' }}>{EMAIL}</a>.</p>
            <p>Użytkownik ma prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO), ul. Stawki 2, 00-193 Warszawa.</p>
          </div>

          <div className="legal-section" id="s11">
            <h2>§11. Zmiana Regulaminu</h2>
            <p>Usługodawca zastrzega sobie prawo do zmiany Regulaminu. O zmianach Użytkownicy będą informowani drogą elektroniczną (email) z co najmniej 14-dniowym wyprzedzeniem.</p>
            <p>Dalsze korzystanie z Serwisu po wejściu w życie zmian Regulaminu jest równoznaczne z ich akceptacją.</p>
          </div>

          <div className="legal-section" id="s12">
            <h2>§12. Rozstrzyganie sporów i sąd konsumenta</h2>
            <p>Usługodawca dąży do polubownego rozwiązywania sporów. W przypadku sporu prosimy w pierwszej kolejności o kontakt na <a href={`mailto:${EMAIL}`} style={{ color: '#a5b4fc' }}>{EMAIL}</a>.</p>

            <p><strong style={{color:'#f0f0f5'}}>Pozasądowe rozstrzyganie sporów:</strong> Użytkownik będący konsumentem ma prawo skorzystać z następujących form pozasądowego rozstrzygania sporów:</p>
            <ul>
              <li>Platforma ODR (Online Dispute Resolution) Komisji Europejskiej: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#a5b4fc' }}>ec.europa.eu/consumers/odr</a></li>
              <li>Stały Polubowny Sąd Konsumencki przy właściwym Wojewódzkim Inspektoracie Inspekcji Handlowej</li>
              <li>Mediacja prowadzona przez Inspekcję Handlową</li>
              <li>Powiatowy (Miejski) Rzecznik Praw Konsumentów</li>
            </ul>

            <p><strong style={{color:'#f0f0f5'}}>Sąd konsumenta:</strong> Zgodnie z art. 34 Kodeksu postępowania cywilnego, Użytkownik będący konsumentem może wytoczyć powództwo według swojego miejsca zamieszkania. Usługodawca nie może narzucać konsumentowi wyłącznej właściwości sądu siedziby przedsiębiorcy.</p>

            <p><strong style={{color:'#f0f0f5'}}>Sprawy B2B:</strong> Spory z Użytkownikami niebędącymi konsumentami rozstrzygane są przez sąd właściwy dla siedziby Usługodawcy.</p>
          </div>

          <div className="legal-section" id="s13">
            <h2>§13. Postanowienia końcowe</h2>
            <p>Regulamin wchodzi w życie z dniem {LAST_UPDATED}.</p>
            <p>W sprawach nieuregulowanych niniejszym Regulaminem stosuje się przepisy prawa polskiego, w szczególności: Kodeksu cywilnego, ustawy o świadczeniu usług drogą elektroniczną, ustawy o prawach konsumenta oraz RODO.</p>
            <p>Jeżeli jakiekolwiek postanowienie Regulaminu okaże się nieważne lub bezskuteczne, pozostałe postanowienia pozostają w mocy.</p>
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