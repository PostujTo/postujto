# PostujTo.pl — Kontekst projektu
_Ostatnia aktualizacja: 2026-03-18_

## Stack techniczny
- **Frontend/Backend:** Next.js 16 (App Router)
- **Baza danych:** Supabase (PostgreSQL)
- **Auth:** Clerk
- **Płatności:** Stripe (Live Mode aktywny, włączenie po konsultacji prawnej)
- **AI tekst:** Anthropic Claude API (claude-sonnet-4-20250514)
- **AI obrazy:** Recraft V3
- **Email:** Resend (domena postujto.com zweryfikowana)
- **Faktury:** inFakt (auto-faktura przy nowej subskrypcji)
- **Deploy:** Vercel
- **Domena:** postujto.com (Cloudflare)

## Plany i ceny
- **Free:** 5 kredytów po rejestracji
- **Starter:** 79 zł/msc — unlimited posty, obrazy AI, Brand Kit, Głos marki
- **Pro:** 199 zł/msc — auto 3 obrazy, logo watermark, priorytetowe generowanie

## Routing
- `/` — landing page
- `/app` — generator postów
- `/dashboard` — historia postów
- `/settings` — Brand Kit
- `/calendar` — kalendarz treści
- `/onboarding` — wizard przy pierwszym logowaniu

## Design
- Ciemny motyw: `#0a0a0f`
- Fonty: Poppins (nagłówki) + DM Sans (UI)
- Kolory akcentu: `#6366f1` (indigo), `#a855f7` (fiolet), `#ec4899` (róż)

## Ukończone funkcje

### Infrastruktura
- Toast notifications
- Email alerty przez Resend (Stripe/Anthropic/Supabase/weekly report)
- inFakt auto-faktura przy nowej subskrypcji
- Vercel cron job (codziennie 8:00 UTC)
- Onboarding email po rejestracji (Clerk webhook)

### Generator (/app)
- Generowanie 3 wersji postów (1 dla gości)
- Facebook / Instagram / TikTok
- Tony: Profesjonalny, Swobodny, Humorystyczny, Sprzedażowy
- Długości: Krótki (~100), Średni (~250), Długi (~500)
- Polskie prawo reklamowe w prompcie
- Generowanie obrazów AI (Recraft V3) — Starter+
- Logo watermark na obrazach — tylko Pro
- Brand Voice — "Generuj w moim stylu" (sample_posts) — tylko Starter+Pro (disabled dla Free)
- Best time to post — rekomendacje dla PL rynku
- Kalendarz polskich okazji (nadchodzące 30 dni)
- Branże z hintem do Claude (14 branż: 12 + Rękodzieło + Piekarnia)
- Oceny wersji (1-5★) z feedbackiem do Claude
- Textarea z widoczną ramką (border: 1px solid rgba(255,255,255,0.25))
- Licznik kredytów: czerwony przy 0 (background rgba(239,68,68,0.15), color #f87171)
- Karty pakietów: slider miesięczny/roczny, oba przyciski gradient, brightness(1.25) na hover
- Modal regulaminu przed Stripe (sprawdza terms_accepted_at)
- Inspiracje tematów — 3 losowe chipy per platforma (odświeżają się przy zmianie platformy)
- 21 branż podzielonych na 6 grup (Gastronomia, Uroda i zdrowie, Handel, Usługi i rzemiosło, Edukacja i biznes, Nieruchomości i turystyka) — chipy z nagłówkami grup
- Lazy onboarding — baner po pierwszym wygenerowanym poście gdy brak Brand Kit (jedno pole: nazwa firmy + opcjonalna branża z chipami), zamykany przez "Później" (localStorage)
- Fallback kontekst w prompt gdy Brand Kit pusty — Claude dostaje wskazówkę o polskiej małej firmie i wnioskuje branżę z tematu
- Historia ostatnich tematów (5 ostatnich z /api/dashboard, rozwijana lista)
- Klikalne okazje handlowe → wpisują gotowy temat do textarei
- Licznik słów i znaków pod każdą wersją posta + ostrzeżenie o długości per platforma
- Przycisk "Dodaj do kalendarza" z date-pickerem → zapisuje do calendar_topics
- Empty state z 3 klikalnymi przykładowymi tematami (setTopic)
- Cennik wyświetlany tylko gdy credits.remaining === 0 (nie w empty state)
- Tooltip przy disabled Brand Colors / Brand Voice (widoczny na hover, opis planu)

### Brand Kit (/settings)
- Nazwa firmy, slogan
- Kolory marki (max 5, HEX/RGB/CMYK)
- Styl graficzny (7 opcji)
- Ton komunikacji (4 opcje)
- Logo (upload do Supabase Storage)
- Przykładowe posty (sample_posts — nauka stylu przez Claude)
- Presety stylów: Lokalny biznes, Korporacja, Eko, Premium, Młodzieżowy, Minimalizm
- Pasek kompletności Brand Kitu (0–100%, kolor zależny od procentu, lista brakujących pól)
- Presety przeniesione na górę formularza z opisami
- Wskazówki "Jak to wypełnić?" przy sample_posts (rozwijane)
- Licznik znaków sample_posts (max 10 000)
- Podgląd "Jak Claude widzi Twoją markę" (na podstawie wypełnionych pól, bez API)
- Kompletność: wagi 30/30/15/15/10 (company_name/sample_posts/logo_url/colors/tone)
- Sprawdzanie kolorów: ignoruje #000000 i puste stringi

### Dashboard (/dashboard)
- Historia wszystkich postów
- Tab w nawigacji: "📊 Historia" (nie "Dashboard")
- Filtry: wszystkie, ulubione, Facebook, Instagram, TikTok
- Statystyki (total, ulubione, per platforma)
- Ulubione (gwiazdka)
- Kopiuj post do schowka
- Usuń post / wersję
- Oceny wersji 1-5★
- Manualne wyniki postów (lajki, zasięg, komentarze, udostępnienia)
- Raport miesięczny generowany przez Claude
- Empty state z mini-tutorialem i Brand Kit tipem
- Przyciski RODO: eksport danych JSON + usunięcie konta

### Kalendarz treści (/calendar)
- Widok miesięczny (siatka) + widok listy
- Polskie okazje handlowe (28 okazji)
- Planowanie tematów przez Claude (liczba = dni w danym miesiącu, nie stałe 30)
- Bulk generation wszystkich postów
- Generowanie pojedynczego posta z panelu bocznego
- Eksport CSV z BOM (UTF-8)
- Kopiuj serię na tydzień (4 przyciski)
- Zapis z datą (scheduled_date) do Supabase
- Best time to post w panelu dnia
- Edycja tematu i platformy per dzień
- Tony: Profesjonalny, Swobodny, Humorystyczny, Sprzedażowy
- Prawdziwe SVG ikony platform (Facebook, Instagram, TikTok) z nazwami (FB/IG/TT) w panelu dnia
- Header: pill toggle Generator / Kalendarz / Historia (3 zakładki, aktywna podświetlona) + plan/kredyty + avatar z dropdownem (🎨 Brand Kit + ↪ Wyloguj) — spójny na /app, /calendar, /dashboard, /settings
- Logo spójne z benchmarkiem (fontSize 22, color #fff, gradient-text na "To")
- Przycisk Eksportuj CSV — aktywny tylko gdy generatedCount > 0, widoczny styl nieaktywny
- Przyciski Akcje mają widoczny gradient (naprawiony błąd font-family w .btn-primary)
- Brand Kit check przed generowaniem (zielony / żółty z linkiem do /settings)
- Tekst "Wygeneruj X/31" — X to liczba dni z tematem, 31 to liczba dni w miesiącu
- Platforma w planie — enforced: Claude przypisuje tę samą platformę do wszystkich dni
- Przerwanie pętli generowania przy błędzie 403 (brak kredytów)
- Przycisk "Wygeneruj" disabled + etykieta "Brak kredytów" gdy credits.remaining === 0

### Onboarding (/onboarding)
- Wizard 5 kroków: Witaj → Firma → Platformy → Ton → Start
- Zapis do Brand Kit po zakończeniu
- Redirect do generatora z pre-wypełnionym tematem
- Kolumna `onboarding_completed` w Supabase
- Brak licznika "KROK X Z 3" — pasek postępu wystarczy
- Krok 5: wskazówka "Chcesz lepsze posty? Dodaj logo i przykładowe posty w Brand Kit"

### Landing page (/)
- Hero z demo card
- Statyczne pillsy z funkcjami
- Statystyki (10h, 30 postów, 3 platformy, 21 branż)
- Jak to działa (3 kroki) + CTA po sekcji
- Co wyróżnia PostujTo (6 cech)
- Dla kogo (6 use-case'ów z cytatami)
- Cennik (3 plany) — sekcja na landing + osobna strona /pricing
- Tabela porównania Starter vs Pro + CTA po tabeli
- Sekcja "Jak dbamy o dane" (6 kafli, serwery Irlandia 🇮🇪)
- Footer z linkami social media + UTM-y, SVG ikony, rok 2026
- **Auto-redirect:** zalogowani Starter/Pro → automatyczne przekierowanie na /app; Free → landing page

## Supabase — tabele i ważne kolumny
```
users:
  - clerk_user_id, email, full_name
  - subscription_plan (free/standard/premium)
  - credits_remaining, credits_total
  - onboarding_completed (boolean)
  - terms_accepted_at (timestamp)

generations:
  - user_id, topic, platform, tone, length
  - generated_posts (jsonb)
  - is_favorite, liked_versions
  - ratings (jsonb) — oceny wersji {0: 4, 1: 5}
  - performance (jsonb) — {likes, reach, comments, shares}
  - scheduled_date (date)
  - has_image, cost_usd

brand_kits:
  - user_id, company_name, slogan
  - colors (jsonb), style, tone
  - logo_url
  - sample_posts (text, max 10k znaków)
```

## API endpoints
```
POST /api/generate          — generowanie postów
POST /api/image             — generowanie obrazów
POST /api/brand-kit         — zapis Brand Kit
POST /api/brand-kit/upload-logo — upload logo
GET  /api/credits           — kredyty i plan użytkownika
GET  /api/dashboard         — historia postów
POST /api/dashboard/delete  — usuń post/wersję
POST /api/dashboard/favorite — ulubione
POST /api/dashboard/rating  — ocena wersji
POST /api/dashboard/performance — wyniki posta
POST /api/dashboard/report  — raport miesięczny Claude
POST /api/calendar/plan     — planowanie tematów na miesiąc
POST /api/onboarding-complete — oznacz onboarding jako ukończony
POST /api/user/accept-terms — zapisz terms_accepted_at
GET  /api/user/terms-status — sprawdź czy regulamin zaakceptowany
GET  /api/user/gdpr-export  — eksport danych użytkownika (JSON)
DELETE /api/user/delete-account — usunięcie konta (Supabase + Clerk)
POST /api/stripe/create-checkout-session
POST /api/stripe/customer-portal
POST /api/stripe/webhook
POST /api/webhooks/clerk    — tworzenie użytkownika w Supabase + onboarding email
GET  /api/cron/daily        — dzienny cron (Vercel)
```

## Akceptacja regulaminu — pełne pokrycie
1. Onboarding (krok 0) — checkbox blokuje "Zaczynamy!", zapisuje `terms_accepted_at`
2. `/app` — modal blokujący przy pierwszym wejściu (sprawdza `terms_accepted_at`)
3. Płatność — modal przed Stripe TYLKO jeśli `terms_accepted_at` jest puste
4. Niezalogowany gość — brak wymogu

## Bezpieczeństwo i zgodność
- CSP headers (script-src, style-src, img-src, connect-src, frame-src, worker-src)
- Permissions-Policy (camera, microphone, geolocation)
- X-Content-Type-Options, X-Frame-Options, Referrer-Policy, X-XSS-Protection
- Rate limiting: /api/generate (10 req/min), /api/image (5 req/min)
- Row Level Security w Supabase
- Walidacja i sanityzacja inputów w /api/generate
- Regulamin §1: dane osoby fizycznej (Jarosław Cisło) — do aktualizacji po JDG
- Regulamin §5 Reklamacje, §10 RODO, §12 Rozstrzyganie sporów
- Polityka prywatności z kolumną Odbiorcy (Clerk, Supabase, Stripe, Anthropic, Vercel/Cloudflare)

## Optymalizacje wydajności
- Fonty przez `next/font/google` (Poppins + DM Sans), CSS variables, display: swap
- `compress: true`, `poweredByHeader: false`, `images.formats: ['image/avif', 'image/webp']`
- Cloudflare DNS only — Vercel edge cache wystarczy na tym etapie

## Proces zwrotu

### Kiedy zwrot przysługuje
Jedyny przypadek: pierwsze zamówienie + użytkownik nie wygenerował żadnego posta + wniosek w ciągu 14 dni od zakupu.

### Kiedy zwrot NIE przysługuje
- Użytkownik wygenerował choćby jeden post
- Odnowienie subskrypcji (kolejny miesiąc)
- Po 14 dniach od pierwszego zakupu

### Weryfikacja w Supabase
```sql
SELECT COUNT(*) FROM generations 
WHERE user_id = (SELECT id FROM users WHERE email = 'EMAIL_KLIENTA');
```

### Jeśli COUNT = 0 (zwrot przysługuje)
1. Stripe Dashboard → Customers → znajdź klienta
2. Kliknij ostatnią płatność → Refund (pełna kwota)
3. Anuluj subskrypcję (Cancel subscription)
4. Odpisz klientowi — zwrot 3-5 dni roboczych

### Jeśli COUNT > 0 (zwrot NIE przysługuje)
> Dziękujemy za kontakt. Zgodnie z §5 naszego Regulaminu, który zaakceptowałeś przy rejestracji, prawo odstąpienia od umowy nie przysługuje w przypadku gdy usługa cyfrowa została uruchomiona i wykorzystana przed upływem 14 dni (art. 38 pkt 13 ustawy o prawach konsumenta). W Twoim przypadku usługa była aktywnie używana, dlatego nie możemy zrealizować zwrotu. W razie pytań jesteśmy do dyspozycji pod hello@postujto.com.

## Znane błędy do naprawy (priorytet)

### ✅ Persistence kalendarza (NAPRAWIONE)
- Tabela `calendar_topics` w Supabase — migracja w `supabase/migrations/calendar_topics.sql`
- API route `GET/POST /api/calendar/topics`
- Tematy ładowane z Supabase przy zmianie miesiąca (useEffect)
- Zapis: po generatePlan (batch), po edycji tematu (onBlur), po zmianie platformy, po wygenerowaniu posta

### ✅ Kredyty nie odświeżają się po odświeżeniu strony (NAPRAWIONE)
- Re-fetch /api/credits po bulk generation i po generowaniu z sidebara
- setCredits z data.creditsRemaining po generowaniu single posta

### ✅ Modal upgrade przy wyczerpaniu kredytów (NAPRAWIONE)
- Gdy użytkownik (Free) wyczerpie 5 kredytów podczas bulk generation
- Pokazać modal: "Wygenerowałeś X/31 postów. Zostało Ci Y dni bez treści. Plan Starter odblokuje wszystkie za 79 zł/msc."
- Przycisk "Przejdź na Starter" → Stripe checkout

## Roadmap — zaplanowane funkcje

### Sprint: Kalendarz multi-platforma (priorytet po launchcie)
- Refactor `CalendarDay` — pole `platform` zamienione na tablicę postów per platforma
- Multi-select platform w trybie szybkim (FB + IG + TikTok jednocześnie)
- Tryb zaawansowany: zaznaczanie wielu dni (shift+klik) + hurtowa zmiana platformy/tonu
- Claude dobiera ton automatycznie na podstawie okazji przy bulk generation
- Eksport CSV uwzględnia wiele platform per dzień

### Auto-posting (wersja 2.0)
- Wymaga App Review Meta + Business Verification — proces wielotygodniowy
- TikTok API — osobna weryfikacja
- Na teraz: przycisk "Kopiuj post" + intent link otwierający platformę z wklejonym tekstem

## Otwarte zadania

### 🔴 Pilne
- [ ] Stripe — włączyć płatności po konsultacji prawnej
- [x] Screenshoty z apki na landing page (CSS mockupy generatora, dashboardu, kalendarza)
- [x] Modal upgrade przy wyczerpaniu kredytów w kalendarzu (wyświetlać ile dni zostało bez postów + CTA do Stripe)

### 🟡 Ważne
- [ ] Regulamin §1 — zaktualizować po rejestracji JDG (nazwa firmy, NIP, REGON, adres)
- [ ] Doprecyzowanie "standardowych klauzul umownych" w polityce prywatności
- [ ] Limit kredytów Free — doprecyzować w regulaminie czy wygasają
- [x] Onboarding — ikony serwisów (cdn.simpleicons.org) — sprawdzić po deploymencie
- [x] Onboarding — spójność przycisku "Dalej" z benchmarkiem (gradient, hover)

### 🟢 Backlog
- [ ] Social proof — wstawić po zebraniu min. 3 prawdziwych opinii (kod gotowy poniżej)
- [ ] KSeF — zawieszone (brak JDG/VAT)

## Benchmark UI/UX

**Strona główna (`app/page.tsx`) to benchmark** — każda nowa strona i komponent muszą być z nią spójne:
- Efekty hover na kartach: `translateY(-8px)`, `border-color rgba(99,102,241,...)`, transition `0.2s ease` na konkretnych właściwościach (nie `all`)
- Przyciski primary: gradient `linear-gradient(135deg, #6366f1, #a855f7)`, hover `brightness(1.25) + translateY(-1px)`, tekst w `<span>` dla z-index
- Przyciski secondary: `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.15)`, hover `rgba(255,255,255,0.1)`
- Kolory tła: `#0a0a0f`, karty `rgba(255,255,255,0.03)`, border `rgba(255,255,255,0.08)`
- Typografia: Poppins (nagłówki), DM Sans (tekst)
- Logo: `Postuj<span className="gradient-text">To</span>`, fontSize 22, fontWeight 800, color #fff
- gradient-text: `linear-gradient(135deg, #6366f1, #a855f7, #ec4899)`
- Sticky header: `background: rgba(10,10,15,0.9)`, `backdropFilter: blur(20px)`, `borderBottom: 1px solid rgba(255,255,255,0.06)`, height 68-72px
- Nawigacja: avatar z dropdownem (useUser + useClerk) zamiast UserButton

## Do sprawdzenia po włączeniu płatności
- Czy modal przed Stripe w `/pricing` poprawnie zapisuje `terms_accepted_at`
- Czy checkbox blokuje przycisk „Akceptuję — przejdź do płatności →" dopóki niezaznaczony
- Czy użytkownicy którzy zaakceptowali regulamin przez `/app` lub onboarding nie widzą ponownie modala

## Kod do użycia później — Social Proof

⚠️ Wstawić dopiero gdy będą prawdziwi użytkownicy (min. 3 opinie). Fałszywy social proof narusza ustawę o nieuczciwych praktykach rynkowych.

Wstawić w `app/page.tsx` między `{/* HOW IT WORKS */}` a `{/* FEATURES */}`. Dodać `'social-proof'` do tablicy sekcji w `IntersectionObserver`.

```tsx
{/* SOCIAL PROOF */}
<section style={{ padding: '80px 24px', position: 'relative' }} id="social-proof" data-animate>
  <div style={{ maxWidth: 1200, margin: '0 auto' }}>
    <div className={`section-reveal from-up ${isVisible('social-proof') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 64 }}>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="font-display" style={{ fontSize: 48, fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>500+</div>
          <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', marginTop: 4 }}>firm w Polsce</div>
        </div>
        <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
            {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 24, color: '#fbbf24' }}>★</span>)}
          </div>
          <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)' }}>4.9/5 średnia ocena</div>
        </div>
        <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ textAlign: 'center' }}>
          <div className="font-display" style={{ fontSize: 48, fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>12k+</div>
          <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', marginTop: 4 }}>postów wygenerowanych</div>
        </div>
      </div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
      {[
        { name: 'Magda K.', role: 'Właścicielka salonu urody', avatar: '💅', rating: 5, text: 'Oszczędzam minimum 8 godzin tygodniowo. Posty są lepsze niż te które pisałam sama — a zajmuje mi to teraz 5 minut dziennie.' },
        { name: 'Tomek W.', role: 'Sklep z elektroniką online', avatar: '🛒', rating: 5, text: 'Zrezygnowałem z copywritera za 1800 zł/msc. PostujTo robi to samo za ułamek ceny i nigdy nie ma "wolnych terminów".' },
        { name: 'Kasia M.', role: 'Restauracja, Kraków', avatar: '🍽️', rating: 5, text: 'Kalendarz treści na cały miesiąc planuję w niedzielę w 10 minut. Wcześniej nie miałam postów przez 2 miesiące z rzędu.' },
      ].map((review, i) => (
        <div key={i} className={`section-reveal from-up card-glass ${isVisible('social-proof') ? 'visible' : ''}`}
          style={{ borderRadius: 18, padding: 28, transitionDelay: `${0.2 + i * 0.1}s` }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {Array(review.rating).fill(0).map((_, j) => <span key={j} style={{ fontSize: 14, color: '#fbbf24' }}>★</span>)}
          </div>
          <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.7)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{review.text}"</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{review.avatar}</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#f0f0f5' }}>{review.name}</p>
              <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)' }}>{review.role}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>