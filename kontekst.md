# PostujTo.pl — Kontekst projektu
_Ostatnia aktualizacja: 2026-03-15_

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
- Historia ostatnich tematów (5 ostatnich z /api/dashboard, rozwijana lista)
- Klikalne okazje handlowe → wpisują gotowy temat do textarei
- Licznik słów i znaków pod każdą wersją posta + ostrzeżenie o długości per platforma
- Przycisk "Dodaj do kalendarza" z date-pickerem → zapisuje do calendar_topics

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

### Dashboard (/dashboard)
- Historia wszystkich postów
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
- Header: pill toggle Generator / Kalendarz / Dashboard (aktywny tab podświetlony) + plan/kredyty + Brand Kit + avatar — spójny na /app, /calendar, /dashboard
- Logo spójne z benchmarkiem (fontSize 22, color #fff, gradient-text na "To")
- Przycisk Eksportuj CSV — aktywny tylko gdy generatedCount > 0, widoczny styl nieaktywny
- Przyciski Akcje mają widoczny gradient (naprawiony błąd font-family w .btn-primary)
- Brand Kit check przed generowaniem (zielony / żółty z linkiem do /settings)
- Tekst "Wygeneruj X/31" — X to liczba dni z tematem, 31 to liczba dni w miesiącu
- Platforma w planie — enforced: Claude przypisuje tę samą platformę do wszystkich dni
- Przerwanie pętli generowania przy błędzie 403 (brak kredytów)

### Onboarding (/onboarding)
- Wizard 5 kroków: Witaj → Firma → Platformy → Ton → Start
- Zapis do Brand Kit po zakończeniu
- Redirect do generatora z pre-wypełnionym tematem
- Kolumna `onboarding_completed` w Supabase

### Landing page (/)
- Hero z demo card
- Statyczne pillsy z funkcjami
- Statystyki (10h, 30 postów, 3 platformy, 12 branż)
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
- `<UserButton />` bez deprecated `afterSignOutUrl` prop

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
# Dashboard — plan ulepszeń dla Claude Code
_Plik dla Claude Code — gotowe zadania do implementacji_

## Kontekst
Dashboard (`app/dashboard/page.tsx`) to obecnie lista postów z filtrami i ocenami.
Stack: Next.js 16, Supabase, Clerk, recharts (już w projekcie), Tailwind/inline styles.
Motyw: ciemny (`#0a0a0f`), spójny z resztą apki (patrz `kontekst.md` → Benchmark UI/UX).

---

## Zadanie 1 — Wykres aktywności (PRIORYTET)

### Co zrobić
Dodać sekcję z wykresem na górze strony Dashboard, **przed** listą postów.

### Dane
Pobierz z Supabase tabeli `generations`:
```sql
SELECT DATE_TRUNC('week', created_at) as week, platform, COUNT(*) as count
FROM generations
WHERE user_id = $1
GROUP BY week, platform
ORDER BY week DESC
LIMIT 12  -- ostatnie 12 tygodni
```

Endpoint: dodać do istniejącego `/api/dashboard` lub nowy `/api/dashboard/stats`.

### UI
Użyj `recharts` — `BarChart` z `Bar` per platforma (3 kolory: Facebook `#60a5fa`, Instagram `#f472b6`, TikTok `#e2e8f0`).
Oś X: skrócone daty tygodni (np. "3 mar", "10 mar").
Oś Y: liczba postów.
Tooltip po hover.
Tytuł sekcji: "Aktywność w ostatnich 12 tygodniach".

### Styl
```tsx
// Karta wykresu — spójna z resztą
<div className="glass-card" style={{ padding: '24px', marginBottom: 24 }}>
  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
    Aktywność — ostatnie 12 tygodni
  </p>
  <ResponsiveContainer width="100%" height={180}>
    <BarChart data={weeklyStats}>
      <XAxis dataKey="week" tick={{ fill: 'rgba(240,240,245,0.3)', fontSize: 11 }} />
      <YAxis tick={{ fill: 'rgba(240,240,245,0.3)', fontSize: 11 }} />
      <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
      <Bar dataKey="facebook" fill="#60a5fa" radius={[4,4,0,0]} />
      <Bar dataKey="instagram" fill="#f472b6" radius={[4,4,0,0]} />
      <Bar dataKey="tiktok" fill="#e2e8f0" radius={[4,4,0,0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
```

---

## Zadanie 2 — Raport miesięczny Claude jako feature, nie przycisk

### Problem
Przycisk "Generuj raport" jest ukryty na dole listy. Użytkownicy go nie widzą.

### Co zrobić
Przenieść raport miesięczny na górę strony, **obok wykresu**, jako osobna karta po prawej stronie (grid 2 kolumny: wykres po lewej, raport po prawej).

Layout:
```tsx
<div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
  {/* Karta wykresu — lewa */}
  {/* Karta raportu — prawa */}
</div>
```

Karta raportu powinna:
- Pokazać datę ostatniego raportu (jeśli istnieje)
- Pokazać pierwsze 3 zdania ostatniego raportu jako preview (skrócone, `lineClamp: 3`)
- Mieć przycisk "Generuj raport za [miesiąc]" — btn-primary ze spanem
- Po kliknięciu: spinner + generowanie, wynik pojawia się w karcie bez przeładowania
- Jeśli brak postów w tym miesiącu: disabled z tooltipem "Wygeneruj najpierw posty"

---

## Zadanie 3 — Insights od Claude (nowa sekcja)

### Co zrobić
Dodać nową sekcję "Co działa najlepiej" między wykresem a listą postów.

### Logika
Oblicz po stronie frontu (nie trzeba API) na podstawie danych z `generations`:

```tsx
// Znajdź platformę z najwyższą średnią oceną
const bestPlatform = platforms.reduce((best, p) => {
  const avg = posts.filter(post => post.platform === p && post.ratings)
    .reduce((sum, post) => {
      const ratings = Object.values(post.ratings || {}) as number[];
      return sum + (ratings.reduce((a,b) => a+b, 0) / ratings.length);
    }, 0) / posts.filter(p2 => p2.platform === p).length;
  return avg > best.avg ? { platform: p, avg } : best;
}, { platform: '', avg: 0 });

// Znajdź ton z najwyższą średnią oceną
const bestTone = tones.reduce(/* analogicznie */);
```

### UI
3 małe kafle w rzędzie (grid 3 kolumny):
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ 📱 Najlepsza    │  │ 🎯 Najlepszy    │  │ 📅 Najbardziej  │
│ platforma       │  │ ton             │  │ aktywny dzień   │
│                 │  │                 │  │                 │
│ Instagram ★4.2  │  │ Swobodny ★4.5  │  │ Wtorek          │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

Styl kafli:
```tsx
style={{
  background: 'rgba(99,102,241,0.07)',
  border: '1px solid rgba(99,102,241,0.15)',
  borderRadius: 14,
  padding: '16px 20px'
}}
```

Jeśli brak danych (za mało postów z ocenami) — nie pokazuj sekcji wcale.

---

## Zadanie 4 — Filtrowanie po ocenie i dacie

### Problem
Aktualnie filtry: Wszystkie / Ulubione / Facebook / Instagram / TikTok.
Przy 50+ postach lista jest bezużyteczna.

### Co zrobić
Dodać do istniejącego paska filtrów dwa dodatkowe elementy:

**Filtr oceny** (radio buttons styl option-btn):
```
[Wszystkie] [★★★★★ 4-5] [★★★ 3+] [Bez oceny]
```

**Sortowanie** (select lub option-btn):
```
[Najnowsze ▼] [Najstarsze] [Najwyżej ocenione]
```

Implementacja po stronie frontu — filtruj tablicę `posts` w state, nie nowe zapytanie do Supabase.

Styl — użyj istniejącej klasy `option-btn` z CSS.

---

## Zadanie 5 — Połączenie wyników z Kalendarzem

### Co zrobić
W tabeli `generations` istnieje kolumna `scheduled_date` (date, YYYY-MM-DD).
Jeśli post ma `scheduled_date` — pokaż w karcie posta badge "📅 Zaplanowany" z datą.

```tsx
{post.scheduled_date && (
  <span style={{
    fontSize: 11, padding: '2px 8px', borderRadius: 6,
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.2)',
    color: '#a5b4fc'
  }}>
    📅 {new Date(post.scheduled_date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
  </span>
)}
```

---

## Kolejność implementacji

1. **Zadanie 4** (filtry) — najmniejszy zakres, bez nowych API
2. **Zadanie 1** (wykres) — wymaga nowego endpointu stats
3. **Zadanie 2** (raport na górze) — refactor istniejącego kodu
4. **Zadanie 3** (insights) — obliczenia po stronie frontu
5. **Zadanie 5** (badge kalendarz) — 5 linii kodu

---

## Czego NIE robić

- Nie dodawać integracji z API Meta/TikTok — to wymaga App Review (tygodnie)
- Nie duplikować statystyk z Kalendarza (dni/okazje/tematy/posty) — te są tam, nie tu
- Nie przepisywać istniejącego kodu list postów — tylko dodawać na górze
- Nie zmieniać schematu Supabase — wszystkie dane już istnieją w `generations`
# Brand Kit (/settings) — plan ulepszeń dla Claude Code
_Plik dla Claude Code — gotowe zadania do implementacji_

## Kontekst
Brand Kit (`app/settings/page.tsx`) to formularz konfiguracji marki.
Dane zapisywane do tabeli `brand_kits` w Supabase.
Claude używa Brand Kit przy generowaniu postów w `/app` i `/calendar`.
Stack: Next.js 16, Supabase, Clerk, inline styles.
Motyw: ciemny (`#0a0a0f`), spójny z resztą (patrz `kontekst.md` → Benchmark UI/UX).

---

## Zadanie 1 — Wskaźnik kompletności Brand Kit (PRIORYTET)

### Problem
Użytkownik nie wie ile pól wypełnił ani jak Brand Kit wpływa na jakość postów.
W kalendarzu i generatorze są ostrzeżenia "Brak Brand Kitu" — ale użytkownik nie wie co dokładnie brakuje.

### Co zrobić
Dodać pasek postępu na górze strony z procentem uzupełnienia i listą brakujących pól.

### Logika
```tsx
const brandKitFields = [
  { key: 'company_name', label: 'Nazwa firmy', weight: 25 },
  { key: 'colors', label: 'Kolory marki', weight: 15 },      // colors.length > 0
  { key: 'logo_url', label: 'Logo', weight: 20 },
  { key: 'sample_posts', label: 'Przykładowe posty', weight: 30 }, // najważniejsze
  { key: 'tone', label: 'Ton komunikacji', weight: 10 },
];

const completeness = brandKitFields.reduce((sum, f) => {
  const val = brandKit[f.key];
  const filled = Array.isArray(val) ? val.length > 0 : !!val;
  return filled ? sum + f.weight : sum;
}, 0); // 0-100
```

### UI
```tsx
// Na górze strony, przed pierwszą sekcją
<div className="glass-card" style={{ padding: '20px 24px', marginBottom: 24 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
    <span style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f5' }}>
      Kompletność Brand Kitu
    </span>
    <span style={{ fontSize: 13, fontWeight: 700,
      color: completeness >= 80 ? '#4ade80' : completeness >= 50 ? '#fbbf24' : '#f87171' }}>
      {completeness}%
    </span>
  </div>
  <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 100 }}>
    <div style={{
      height: '100%', borderRadius: 100, transition: 'width 0.4s ease',
      width: `${completeness}%`,
      background: completeness >= 80
        ? 'linear-gradient(90deg, #4ade80, #22c55e)'
        : completeness >= 50
        ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
        : 'linear-gradient(90deg, #f87171, #ef4444)'
    }} />
  </div>
  {completeness < 100 && (
    <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)', marginTop: 8 }}>
      Brakuje: {brandKitFields.filter(f => {
        const val = brandKit[f.key];
        return Array.isArray(val) ? val.length === 0 : !val;
      }).map(f => f.label).join(', ')}
    </p>
  )}
</div>
```

---

## Zadanie 2 — Sekcja "Przykładowe posty" — lepsza instrukcja

### Problem
Pole `sample_posts` (textarea) to najważniejszy element Brand Kitu (waga 30%) bo Claude analizuje styl pisania. Ale użytkownik nie wie co tam wpisać — placeholder jest zbyt ogólny.

### Co zrobić
Dodać nad textareą rozwijane "Jak to wypełnić?" z konkretnymi wskazówkami i przykładem.

```tsx
const [showTip, setShowTip] = useState(false);

// Nad textareą sample_posts:
<div style={{ marginBottom: 8 }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <label style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)' }}>
      Przykładowe posty (styl pisania)
    </label>
    <button onClick={() => setShowTip(!showTip)}
      style={{ fontSize: 11, color: '#a5b4fc', background: 'none', border: 'none',
        cursor: 'pointer', textDecoration: 'underline' }}>
      {showTip ? 'Ukryj wskazówki' : '💡 Jak to wypełnić?'}
    </button>
  </div>

  {showTip && (
    <div style={{ padding: '12px 14px', background: 'rgba(99,102,241,0.07)',
      border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, marginBottom: 8 }}>
      <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.6)', lineHeight: 1.7, marginBottom: 8 }}>
        Wklej 3–5 postów które sam napisałeś i które Ci się podobają.
        Claude przeanalizuje Twój styl: długość zdań, użycie emoji, ton, słownictwo.
      </p>
      <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.35)', fontStyle: 'italic' }}>
        Przykład (salon fryzjerski):<br />
        "Witajcie! ✂️ Dziś chcemy pokazać Wam metamorfozę naszej Klientki Ani.
        Przyszła z długimi włosami — wyszła z pewnością siebie! 💪
        Umów się na wizytę: 📞 123 456 789"
      </p>
    </div>
  )}
</div>
```

---

## Zadanie 3 — Podgląd "Jak Claude widzi Twoją markę"

### Co zrobić
Dodać na końcu strony (po przycisku Zapisz) sekcję tylko do odczytu — podsumowanie tego co Claude dostaje w prompcie.

Nie wywołuj API Claude — generuj po stronie frontu na podstawie wypełnionych pól.

```tsx
// Tylko jeśli company_name jest wypełnione
{brandKit.company_name && (
  <div className="glass-card" style={{ padding: '20px 24px', marginTop: 24 }}>
    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)',
      textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
      👁 Jak Claude widzi Twoją markę
    </p>
    <div style={{ fontSize: 13, color: 'rgba(240,240,245,0.6)', lineHeight: 1.8,
      fontStyle: 'italic', padding: '12px 14px',
      background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
      {`Firma: ${brandKit.company_name}${brandKit.slogan ? ` — "${brandKit.slogan}"` : ''}.`}
      {brandKit.tone ? ` Ton komunikacji: ${brandKit.tone}.` : ''}
      {brandKit.colors?.length > 0 ? ` Kolory marki: ${brandKit.colors.join(', ')}.` : ''}
      {brandKit.sample_posts
        ? ` Styl pisania: Claude przeanalizował Twoje przykładowe posty.`
        : ' ⚠️ Brak przykładowych postów — posty będą generyczne.'}
    </div>
  </div>
)}
```

---

## Zadanie 4 — Presety branżowe jako punkt startowy (refactor)

### Problem
Presety stylów (Lokalny biznes, Korporacja, Eko, Premium, Młodzieżowy, Minimalizm) są dostępne, ale użytkownik nie wie jak je zastosować. Nie ma CTA ani wyjaśnienia.

### Co zrobić
Przenieść presety na **górę strony** (przed formularzem), z wyraźnym opisem:

```tsx
<div className="glass-card" style={{ padding: '20px 24px', marginBottom: 24 }}>
  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(240,240,245,0.3)',
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>
    Zacznij od presetu
  </p>
  <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', marginBottom: 14 }}>
    Wybierz szablon jako punkt startowy — możesz go potem edytować.
  </p>
  {/* istniejące przyciski presetów */}
</div>
```

Dodać też mini-opis pod każdym presetem (tooltip lub tekst pod przyciskiem):
```
Lokalny biznes → ciepły, przyjazny, buduje zaufanie
Korporacja → profesjonalny, formalny, bez emoji
Eko → autentyczny, wartości, naturalny język
Premium → elegancki, ekskluzywny, lakoniczny
Młodzieżowy → slang, emoji, energia, TikTok-ready
Minimalizm → krótko, konkretnie, bez ozdobników
```

---

## Zadanie 5 — Licznik znaków dla sample_posts

### Problem
Pole `sample_posts` ma max 10 000 znaków (limit w Supabase). Użytkownik nie wie ile wpisał.

### Co zrobić
Dodać licznik pod textareą:

```tsx
<div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
  <span style={{
    fontSize: 11,
    color: samplePosts.length > 9000
      ? '#f87171'
      : 'rgba(240,240,245,0.25)'
  }}>
    {samplePosts.length} / 10 000 znaków
  </span>
</div>
```

---

## Kolejność implementacji

1. **Zadanie 1** (pasek kompletności) — największy wpływ na engagement, motywuje do uzupełnienia
2. **Zadanie 2** (wskazówki sample_posts) — poprawia jakość danych dla Claude
3. **Zadanie 5** (licznik znaków) — 3 linie kodu
4. **Zadanie 4** (refactor presetów) — UX, bez nowych danych
5. **Zadanie 3** (podgląd Claude) — nice-to-have, edukuje użytkownika

---

## Czego NIE robić

- Nie dodawać integracji z Canva ani innymi narzędziami graficznymi
- Nie zmieniać schematu tabeli `brand_kits` — wszystkie kolumny już istnieją
- Nie generować podglądu posta przez API Claude — za drogo, za wolno
- Nie usuwać istniejących presetów — tylko przenieść wyżej i opisać
# Generator (/app) — plan ulepszeń dla Claude Code
_Plik dla Claude Code — gotowe zadania do implementacji_

## Kontekst
Generator (`app/app/page.tsx`) to główna funkcja produktu — generuje 3 wersje posta.
Stack: Next.js 16, Supabase, Clerk, Anthropic API, inline styles.
Plany: Free (5 kredytów), Starter (79 zł, unlimited), Pro (199 zł).
Motyw: ciemny (`#0a0a0f`), spójny z resztą (patrz `kontekst.md` → Benchmark UI/UX).

---

## Zadanie 1 — Inspiracje tematów (PRIORYTET)

### Problem
Użytkownik siada przed pustą textareą i nie wie co wpisać. To jest największa bariera wejścia — "blank page problem". Konkurencja (Buffer AI, Hootsuite OwlyWriter) sugeruje tematy automatycznie.

### Co zrobić
Dodać pod textareą sekcję z sugestiami tematów — klikalne chipy, które wpisują tekst do pola.

### Logika
Sugestie są statyczne (nie API) — 3 zestawy rotowane losowo przy załadowaniu strony + dopasowane do wybranej platformy.

```tsx
const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  facebook: [
    'Pokaż kulisy swojej pracy — co dzieje się za zamkniętymi drzwiami?',
    'Zadaj pytanie swoim obserwatorom: co chcieliby zobaczyć więcej?',
    'Historia klienta — jak Twój produkt/usługa mu pomogła',
    'Poranna rutyna w Twojej firmie — 3 zdjęcia z opisem',
    'Najczęstsze pytanie które dostajesz — i szczera odpowiedź',
    'Przed i po — pokaż transformację lub efekt swojej pracy',
    'Dlaczego zacząłeś ten biznes? Historia założyciela',
  ],
  instagram: [
    'Flat lay Twoich produktów z sezonowym akcentem',
    '3 rzeczy których nauczyłeś się w tym miesiącu',
    'Ulubione narzędzie/produkt którego używasz codziennie',
    'Mini-tutorial w 3 krokach — coś przydatnego dla obserwatorów',
    'Quote który Cię inspiruje + jak to łączy się z Twoją pracą',
  ],
  tiktok: [
    'POV: jeden dzień z życia [Twój zawód]',
    'Rzeczy których NIE robię w swojej branży (i dlaczego)',
    'Najszybszy sposób na [problem który rozwiązujesz]',
    'Błąd który popełniłem i czego mnie nauczył',
    'Odpowiedź na najczęstszy mit o [Twoja branża]',
  ],
};

// W komponencie — losuj 3 przy każdym render
const [suggestions] = useState(() =>
  TOPIC_SUGGESTIONS[platform]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
);
```

### UI
```tsx
// Pod textareą, przed przyciskiem Generuj
<div style={{ marginTop: 8, marginBottom: 16 }}>
  <p style={{ fontSize: 11, color: 'rgba(240,240,245,0.3)', marginBottom: 6 }}>
    Potrzebujesz inspiracji?
  </p>
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
    {suggestions.map((s, i) => (
      <button key={i} onClick={() => setTopic(s)}
        style={{
          padding: '5px 10px', borderRadius: 20, fontSize: 11, cursor: 'pointer',
          background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
          color: 'rgba(240,240,245,0.6)', transition: 'all 0.2s', textAlign: 'left',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(99,102,241,0.18)';
          e.currentTarget.style.color = '#f0f0f5';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
          e.currentTarget.style.color = 'rgba(240,240,245,0.6)';
        }}>
        {s.length > 60 ? s.slice(0, 57) + '...' : s}
      </button>
    ))}
  </div>
</div>
```

Sugestie powinny się odświeżyć gdy użytkownik zmienia platformę (useEffect na `platform`).

---

## Zadanie 2 — Historia ostatnich tematów

### Problem
Użytkownik wraca do generatora i nie pamięta o czym pisał ostatnio. Musi wchodzić na Dashboard żeby sprawdzić.

### Co zrobić
Dodać pod inspiracjami dropdown "Ostatnio generowane" — 5 ostatnich tematów z `generations` w Supabase.

Endpoint: istniejący `/api/dashboard` już zwraca dane. Użyj go, ale ogranicz do 5 wyników z `select=topic,platform,created_at`.

Alternatywnie: dodaj parametr do endpointu:
```
GET /api/dashboard?limit=5&fields=topic,platform
```

### UI
```tsx
{recentTopics.length > 0 && (
  <details style={{ marginBottom: 12 }}>
    <summary style={{ fontSize: 11, color: 'rgba(240,240,245,0.3)',
      cursor: 'pointer', listStyle: 'none', marginBottom: 6 }}>
      🕐 Ostatnio generowane ▾
    </summary>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
      {recentTopics.map((t, i) => (
        <button key={i} onClick={() => { setTopic(t.topic); setSelectedPlatform(t.platform); }}
          style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(240,240,245,0.5)', textAlign: 'left', transition: 'all 0.2s' }}>
          {t.topic.slice(0, 80)}{t.topic.length > 80 ? '...' : ''}
        </button>
      ))}
    </div>
  </details>
)}
```

---

## Zadanie 3 — Liczba słów w wygenerowanym poście

### Problem
Użytkownik nie wie czy post jest odpowiedniej długości dla platformy. Nie ma żadnej informacji zwrotnej.

### Co zrobić
Dodać pod każdym wygenerowanym postem (w karcie wersji) dwa elementy:

**Licznik słów:**
```tsx
const wordCount = post.text.split(/\s+/).filter(Boolean).length;
const charCount = post.text.length;

<span style={{ fontSize: 11, color: 'rgba(240,240,245,0.3)' }}>
  {wordCount} słów · {charCount} znaków
</span>
```

**Ocena długości dla platformy:**
```tsx
const lengthOk = {
  facebook: charCount >= 100 && charCount <= 500,
  instagram: charCount >= 80 && charCount <= 300,
  tiktok: charCount <= 150,
};

{!lengthOk[platform] && (
  <span style={{ fontSize: 11, color: '#fbbf24', marginLeft: 8 }}>
    ⚠️ {charCount > 500 ? 'Może być za długi' : 'Może być za krótki'} dla {platform}
  </span>
)}
```

---

## Zadanie 4 — Przycisk "Wyślij do Kalendarza"

### Problem
Użytkownik generuje post ale nie ma prostej drogi żeby przypisać go do konkretnej daty.
Teraz: generuje → kopiuje → idzie do kalendarza → ręcznie wpisuje temat → generuje ponownie.
To jest zbędne 2x generowanie i strata kredytów.

### Co zrobić
Dodać w karcie wygenerowanego posta przycisk "📅 Dodaj do kalendarza".

Po kliknięciu: wyświetl mini date-picker (prosty `<input type="date">`) + przycisk "Zapisz".

Zapisz do nowej tabeli `calendar_topics` (ta sama którą tworzy się dla Zadania persistence w kalendarzu):
```tsx
await fetch('/api/calendar/save-post', {
  method: 'POST',
  body: JSON.stringify({
    date: selectedDate,         // YYYY-MM-DD
    topic: generationTopic,     // temat z textarea
    platform: selectedPlatform,
    post_text: post.text,
    hashtags: post.hashtags,
    generated: true,
  }),
});
```

### UI
```tsx
<button onClick={() => setShowDatePicker(post.id)}
  className="btn-ghost"
  style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12 }}>
  📅 Dodaj do kalendarza
</button>

{showDatePicker === post.id && (
  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
    <input type="date" value={selectedDate}
      onChange={e => setSelectedDate(e.target.value)}
      min={new Date().toISOString().split('T')[0]}
      style={{ padding: '6px 10px', borderRadius: 8, fontSize: 12,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
        color: '#f0f0f5', outline: 'none' }} />
    <button onClick={() => saveToCalendar(post)}
      className="btn-primary"
      style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12 }}>
      <span>Zapisz</span>
    </button>
  </div>
)}
```

UWAGA: Zadanie 4 zależy od persistence kalendarza (tabela `calendar_topics`). Implementuj po tym jak kalendarz ma persistence.

---

## Zadanie 5 — Polskie okazje — aktywna sugestia tematu

### Problem
W generatorze jest już sekcja "Nadchodzące okazje" ale jest tylko informacyjna. Kliknięcie okazji nie robi nic.

### Co zrobić
Kliknięcie okazji powinno wpisać sugestię tematu do textarey.

```tsx
// Istniejące chipy okazji — dodaj onClick:
onClick={() => setTopic(
  `${occasion.emoji} ${occasion.name} — ${getSuggestionForOccasion(occasion.name, platform)}`
)}

// Funkcja pomocnicza
function getSuggestionForOccasion(name: string, platform: string): string {
  const map: Record<string, string> = {
    'Dzień Kobiet': 'złóż życzenia swoim klientkom i pokaż ofertę specjalną',
    'Walentynki': 'zaproponuj wyjątkowy prezent lub usługę dla par',
    'Black Friday': 'ogłoś promocję z konkretnym rabatem i terminem',
    'Mikołajki': 'pokaż pomysły na prezenty z Twojej oferty',
    'Wigilia': 'złóż życzenia i podziel się atmosferą świąt w firmie',
    // ... pozostałe okazje
  };
  return map[name] || 'nawiąż do tej okazji w kontekście swojej firmy';
}
```

---

## Kolejność implementacji

1. **Zadanie 1** (inspiracje tematów) — eliminuje "blank page problem", zwiększa konwersję
2. **Zadanie 5** (okazje → temat) — 10 linii kodu, duży efekt
3. **Zadanie 3** (licznik słów) — informacja zwrotna, łatwe
4. **Zadanie 2** (historia tematów) — wymaga lekkiej zmiany w API
5. **Zadanie 4** (wyślij do kalendarza) — zależy od persistence kalendarza, implementuj na końcu

---

## Czego NIE robić

- Nie zmieniać układu strony — tylko dodawać elementy w istniejących sekcjach
- Nie dodawać nowych API dla zadań 1, 3, 5 — wszystko po stronie frontu
- Nie usuwać istniejących inspiracji/okazji — tylko je rozszerzyć
- Zadanie 4 implementować dopiero po tym jak `/api/calendar/save-post` i tabela `calendar_topics` istnieją
- Nie zmieniać logiki kredytów — to osobne zadanie (patrz `kontekst.md` → Znane błędy)
# UX Fixes — brief dla Claude Code
_Plik dla Claude Code — gotowe zadania do implementacji_
_Priorytet: naprawić przed launchem_

## Kontekst
Stack: Next.js 16, Supabase, Clerk, Stripe, inline styles.
Motyw: ciemny (`#0a0a0f`), spójny z resztą (patrz `kontekst.md` → Benchmark UI/UX).
Język interfejsu: **wyłącznie polski** — żadnych angielskich słów w UI.

---

## ZASADA GLOBALNA — Język polski

Przeszukaj WSZYSTKIE pliki w `app/` i zamień angielskie słowa w UI na polskie.
Najczęstsze błędy do znalezienia i poprawienia:

| Angielskie | Polskie |
|------------|---------|
| "Dashboard" (jako label w UI) | "Panel" lub "Historia" |
| "Brand Kit" | zostaje — to nazwa własna produktu |
| "Free" (plan) | zostaje — to nazwa planu |
| "Starter" / "Pro" | zostają — to nazwy planów |
| "Facebook", "Instagram", "TikTok" | zostają — to nazwy platform |
| Wszelkie inne angielskie słowa w przyciskach, labelach, komunikatach | przetłumacz |

Sprawdź szczególnie: komunikaty błędów, tooltopy, placeholdery, etykiety sekcji, puste stany.

---

## Zadanie 1 — Dodanie tabów do `/settings` (Brand Kit)

### Problem
Strona `/settings` ma tylko przycisk "Wróć" — brak tabów nawigacyjnych.
Wszystkie inne podstrony (`/app`, `/calendar`, `/dashboard`) mają tabs w headerze.
Użytkownik który wszedł z linku "Uzupełnij Brand Kit" nie wie jak wrócić.

### Co zrobić
Dodać do headera `/settings` ten sam komponent tabów co na `/calendar`:

```tsx
{/* Tabs — skopiuj dokładnie z app/calendar/page.tsx */}
<div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
  <Link href="/app" style={{ textDecoration: 'none' }}>
    <button className="btn-ghost" style={{ padding: '7px 18px', borderRadius: 9,
      fontSize: 13, border: 'none', background: 'transparent',
      color: 'rgba(240,240,245,0.5)' }}>
      ✨ Generator
    </button>
  </Link>
  <Link href="/calendar" style={{ textDecoration: 'none' }}>
    <button className="btn-ghost" style={{ padding: '7px 18px', borderRadius: 9,
      fontSize: 13, border: 'none', background: 'transparent',
      color: 'rgba(240,240,245,0.5)' }}>
      📅 Kalendarz
    </button>
  </Link>
  <Link href="/dashboard" style={{ textDecoration: 'none' }}>
    <button className="btn-ghost" style={{ padding: '7px 18px', borderRadius: 9,
      fontSize: 13, border: 'none', background: 'transparent',
      color: 'rgba(240,240,245,0.5)' }}>
      📊 Historia
    </button>
  </Link>
  {/* Brand Kit — aktywny tab */}
  <button style={{ padding: '7px 18px', borderRadius: 9, fontSize: 13,
    background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
    color: '#a5b4fc', cursor: 'default',
    fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
    🎨 Brand Kit
  </button>
</div>
```

Usuń przycisk "Wróć" z headera — zastąpiony przez tabs.

---

## Zadanie 2 — Empty state w generatorze zamiast cennika

### Problem
Nowy użytkownik który jeszcze nic nie wygenerował widzi po prawej stronie karty cennikowe Starter/Pro.
Pitch sprzedażowy przed pokazaniem wartości produktu = zły UX.

### Co zrobić
W `app/app/page.tsx` — panel prawy pokazuje cennik gdy `posts.length === 0`.
Zamień na przyjazny empty state:

```tsx
{/* Zamiast cennika gdy brak postów */}
{posts.length === 0 && (
  <div className="glass-card" style={{ padding: '40px 32px', textAlign: 'center' }}>
    <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
    <p className="font-display" style={{ fontSize: 20, fontWeight: 700,
      marginBottom: 8, color: '#f0f0f5' }}>
      Gotowy na pierwszy post?
    </p>
    <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', lineHeight: 1.6,
      marginBottom: 24 }}>
      Wpisz temat po lewej stronie i kliknij „Wygeneruj posty".<br />
      Dostaniesz 3 gotowe wersje w kilka sekund.
    </p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10,
      padding: '16px', background: 'rgba(99,102,241,0.07)',
      border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12 }}>
      <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', marginBottom: 4 }}>
        💡 Przykładowe tematy na start:
      </p>
      {[
        'Pokaż kulisy swojej pracy — co dzieje się za zamkniętymi drzwiami?',
        'Historia klienta — jak Twój produkt mu pomógł',
        'Najczęstsze pytanie które dostajesz — i szczera odpowiedź',
      ].map((t, i) => (
        <button key={i} onClick={() => setTopic(t)}
          style={{ padding: '8px 12px', borderRadius: 8, fontSize: 12,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(240,240,245,0.6)', cursor: 'pointer',
            textAlign: 'left', transition: 'all 0.2s' }}>
          {t}
        </button>
      ))}
    </div>
  </div>
)}
```

Cennik (karty Starter/Pro) pokaż dopiero gdy użytkownik wyczerpie kredyty (`credits.remaining === 0`).

---

## Zadanie 3 — Tooltip przy disabled funkcjach w generatorze

### Problem
Checkboxy "Użyj kolorów i stylu z Brand Kit" i "Generuj w moim stylu" są disabled dla Free.
Użytkownik klika — nic się nie dzieje, brak feedbacku.

### Co zrobić
Dodać tooltip który pojawia się przy hover na disabled checkbox:

```tsx
// Wrapper z pozycją relative dla każdego disabled checkboxa
<div style={{ position: 'relative' }}
  onMouseEnter={() => setShowTooltip('brand-kit')}
  onMouseLeave={() => setShowTooltip(null)}>

  <label style={{ opacity: 0.4, cursor: 'not-allowed', display: 'flex',
    alignItems: 'center', gap: 8 }}>
    <input type="checkbox" disabled />
    Użyj kolorów i stylu z Brand Kit
    <span style={{ fontSize: 11, color: 'rgba(240,240,245,0.4)' }}>
      (tylko Starter i Pro)
    </span>
  </label>

  {showTooltip === 'brand-kit' && (
    <div style={{
      position: 'absolute', bottom: '100%', left: 0, marginBottom: 6,
      padding: '8px 12px', borderRadius: 8, fontSize: 12,
      background: 'rgba(26,26,46,0.98)',
      border: '1px solid rgba(99,102,241,0.3)',
      color: '#f0f0f5', whiteSpace: 'nowrap', zIndex: 50,
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
    }}>
      Dostępne w planie Starter (79 zł/msc) lub Pro (199 zł/msc)
      <Link href="/pricing" style={{ display: 'block', marginTop: 4,
        color: '#a5b4fc', textDecoration: 'underline', fontSize: 11 }}>
        Zobacz plany →
      </Link>
    </div>
  )}
</div>
```

Zastosuj analogicznie dla checkboxa "Generuj w moim stylu".

---

## Zadanie 4 — Rozszerzenie okazji do 30 dni w generatorze

### Problem
Sekcja "Nadchodzące okazje" pokazuje okazje z najbliższych 7 dni.
Gdy nie ma okazji w ciągu 7 dni — sekcja wygląda pusta i ubogo.

### Co zrobić
W `app/app/page.tsx` znajdź logikę filtrowania okazji i zmień przedział z 7 na 30 dni:

```tsx
// Znajdź coś podobnego do:
const upcomingOccasions = occasions.filter(o => {
  const daysUntil = /* obliczenie dni */;
  return daysUntil <= 7; // <-- zmień na 30
});
```

Jeśli okazji jest więcej niż 5 — pokaż pierwsze 5 i dodaj "Pokaż więcej" (collapsible).

---

## Zadanie 5 — Przycisk "Wygeneruj" disabled przy 0 kredytach w kalendarzu

### Problem
Przycisk "✨ Wygeneruj 31/31 (0 kredytów)" jest aktywny mimo braku kredytów.
Użytkownik klika, nic się nie generuje — brak feedbacku.

### Co zrobić
W `app/calendar/page.tsx` znajdź przycisk generateAllPosts i dodaj warunek:

```tsx
<button
  onClick={generateAllPosts}
  disabled={
    topicCount === 0 ||
    status === 'planning' ||
    status === 'generating' ||
    (credits?.plan === 'free' && credits.remaining === 0) // <-- dodaj
  }
  className="btn-primary"
  style={{
    padding: '12px', borderRadius: 12, fontSize: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, border: 'none',
    opacity: (topicCount === 0 ||
      (credits?.plan === 'free' && credits.remaining === 0)) ? 0.4 : 1
  }}>
  {status === 'generating'
    ? <><svg className="animate-spin" .../>Generuję posty...</>
    : credits?.plan === 'free' && credits.remaining === 0
    ? <span>✨ Brak kredytów — przejdź na Starter</span>
    : <span>✨ Wygeneruj {topicCount > 0 ? topicCount : currentDays.length}/{currentDays.length}
        {credits?.plan === 'free' ? ` (${credits.remaining} kredytów)` : ''}
      </span>
  }
</button>
```

Po kliknięciu disabled przycisku gdy brak kredytów — pokaż modal upgrade (patrz `kontekst.md` → Znane błędy → Modal upgrade).

---

## Zadanie 6 — Zmiana etykiety "Pokaż (3)" w dashboardzie

### Problem
Przycisk rozwijający wersje posta jest niejasny.

### Co zrobić
W `app/dashboard/page.tsx` znajdź przycisk z tekstem "Pokaż (3)" i zmień na:

```tsx
// Przed:
<button>Pokaż (3)</button>

// Po:
<button>▼ Rozwiń 3 wersje</button>

// Gdy rozwinięte:
<button>▲ Zwiń</button>
```

---

## Zadanie 7 — Naprawienie kalkulacji kompletności Brand Kit

### Problem
Brand Kit pokazuje 20% kompletności mimo częściowego uzupełnienia podczas onboardingu.
Prawdopodobna przyczyna: onboarding zapisuje dane do innej kolumny niż Brand Kit sprawdza,
lub wagi nie uwzględniają że część pól jest opcjonalna.

### Co zrobić
W `app/settings/page.tsx` znajdź funkcję liczącą kompletność i popraw wagi:

```tsx
const brandKitFields = [
  { key: 'company_name', label: 'Nazwa firmy', weight: 30 },     // najważniejsze
  { key: 'sample_posts', label: 'Przykładowe posty', weight: 30 }, // kluczowe dla Claude
  { key: 'logo_url', label: 'Logo', weight: 15 },
  { key: 'colors', label: 'Kolory marki', weight: 15 },           // sprawdź: colors?.length > 0
  { key: 'tone', label: 'Ton komunikacji', weight: 10 },
  // slogan i styl graficzny — bonusowe, nie obniżają gdy brak
];

// Sprawdź czy colors to tablica czy string — dostosuj warunek:
const isFilled = (key: string, val: any) => {
  if (key === 'colors') return Array.isArray(val) ? val.some(c => c && c !== '#000000') : !!val;
  return !!val && val !== '';
};
```

Dodatkowo: upewnij się że dane zapisane przez onboarding są odczytywane przez Brand Kit (ten sam `user_id` i ta sama tabela `brand_kits`).

---

## Zadanie 8 — Edycja Brand Kit (odblokowanie zapisanych pól)

### Problem
Raz zapisany Brand Kit nie może być edytowany — pola są zablokowane lub nadpisanie nie działa.

### Co zrobić
W `app/settings/page.tsx` znajdź obsługę formularza i upewnij się że używa `upsert` a nie `insert`:

```tsx
// W /api/brand-kit/route.ts — zmień insert na upsert:
const { error } = await supabase
  .from('brand_kits')
  .upsert({
    user_id: user.id,
    company_name,
    slogan,
    colors,
    style,
    tone,
    logo_url,
    sample_posts,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id', // <-- klucz upsert
  });
```

Sprawdź też czy formularz w `/settings` przy załadowaniu strony pobiera istniejące dane z Supabase i wypełnia pola (`useEffect` z `fetch('/api/brand-kit')`). Jeśli nie — dodaj.

---

## Zadanie 9 — © 2025 w footerze FAQ

### Problem
`/faq` ma w footerze © 2025 zamiast © 2026.

### Co zrobić
W `app/faq/page.tsx` znajdź footer i zmień:
```tsx
// Przed:
© 2025 PostujTo.com

// Po:
© 2026 PostujTo.com
```

---

---

## Zadanie 10 — Naprawa licznika kroków w onboardingu

### Problem
Na kroku 2 ("Firma") widać napis **"KROK 1 Z 3"** — ale pasek postępu na górze ma 5 kółek (Witaj → Firma → Platformy → Ton → Start). Użytkownik widzi dwie różne liczby i jest zdezorientowany.

### Co zrobić
Dwie opcje — wybierz jedną:

**Opcja A (prosta):** Usuń licznik "KROK X Z 3" ze wszystkich kroków — pasek postępu na górze wystarczy.

**Opcja B (spójna):** Zmień licznik żeby odpowiadał pozycji w pasku:
```tsx
// Krok 2 (Firma) → "KROK 2 Z 5"
// Krok 3 (Platformy) → "KROK 3 Z 5"
// Krok 4 (Ton) → "KROK 4 Z 5"
```

Rekomendacja: Opcja A — pasek wizualny jest bardziej intuicyjny niż licznik tekstowy.

---

## Zadanie 11 — Dodanie nazwy firmy do podsumowania (krok 5)

### Problem
Krok 5 ("Gotowe!") pokazuje Branżę, Platformy i Ton — ale nie nazwę firmy którą użytkownik wpisał w kroku 2. Użytkownik nie może zweryfikować że dane się zapisały poprawnie.

### Co zrobić
W `app/onboarding/page.tsx` (lub odpowiednim pliku) znajdź komponent kroku 5 i dodaj wiersz z nazwą firmy:

```tsx
<div style={{ /* istniejące style kafelka podsumowania */ }}>
  <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.4)', fontWeight: 600,
    letterSpacing: '0.05em', marginBottom: 8 }}>
    TWOJA KONFIGURACJA
  </p>
  {/* Dodaj ten wiersz: */}
  {companyName && (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
      <span style={{ color: 'rgba(240,240,245,0.5)', fontSize: 14 }}>Firma:</span>
      <span style={{ color: '#f0f0f5', fontSize: 14, fontWeight: 600 }}>
        🏢 {companyName}
      </span>
    </div>
  )}
  {/* istniejące wiersze Branża / Platformy / Ton */}
</div>
```

---

## Zadanie 12 — Wskazówka po onboardingu o uzupełnieniu Brand Kit

### Problem
Onboarding zbiera: nazwę firmy, branżę, platformy, ton.
**Nie zbiera:** logo, kolory marki, przykładowe posty.

Po onboardingu Brand Kit pokazuje ~20-30% kompletności i czerwony pasek ostrzeżenia — użytkownik nie dostał żadnego sygnału że powinien coś jeszcze zrobić. Pierwsze wrażenie po rejestracji to czerwony alert.

### Co zrobić
Na kroku 5 ("Gotowe!") — pod przyciskiem "Przejdź do generatora" — dodaj subtelną wskazówkę:

```tsx
{/* Pod przyciskiem głównym */}
<div style={{ marginTop: 16, padding: '12px 16px',
  background: 'rgba(99,102,241,0.08)',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: 10, textAlign: 'left' }}>
  <p style={{ fontSize: 13, color: 'rgba(240,240,245,0.7)', marginBottom: 6 }}>
    💡 <strong style={{ color: '#f0f0f5' }}>Chcesz lepsze posty?</strong>
  </p>
  <p style={{ fontSize: 12, color: 'rgba(240,240,245,0.45)', lineHeight: 1.5 }}>
    Dodaj logo i przykładowe posty w{' '}
    <Link href="/settings" style={{ color: '#a5b4fc', textDecoration: 'underline' }}>
      Brand Kit
    </Link>
    {' '}— Claude będzie pisał bardziej w Twoim stylu.
  </p>
</div>
```

Alternatywnie: po kliknięciu "Przejdź do generatora" — jeśli Brand Kit &lt; 60% — pokaż jednorazowy modal:

```tsx
// Modal po pierwszym wejściu do /app gdy brand_kit_completeness < 60
if (isFirstVisit && brandKitCompleteness < 60) {
  showModal({
    title: 'Uzupełnij Brand Kit dla lepszych wyników',
    body: 'Masz już podstawy. Dodaj logo i przykłady swoich postów — Claude zacznie pisać znacznie trafniej.',
    primaryAction: { label: 'Uzupełnij teraz', href: '/settings' },
    secondaryAction: { label: 'Później', action: 'dismiss' },
  });
}
```

`isFirstVisit` = flaga w Supabase (`profiles.onboarding_completed_at`) lub localStorage.

---

## Kolejność implementacji — WSZYSTKIE ZREALIZOWANE ✅

1. ✅ **Zadanie 9** — © 2025 → 2026 w footerze FAQ
2. ✅ **Zadanie 6** — "▼ Rozwiń X wersje" w dashboardzie
3. ✅ **Zadanie 10** — usunięto licznik "KROK X Z 3" z onboardingu
4. ✅ **Zadanie 11** — nazwa firmy była już w podsumowaniu onboardingu (OK)
5. ✅ **Zasada globalna** — język polski sprawdzony
6. ✅ **Zadanie 1** — tabs nawigacyjne w /settings (Brand Kit)
7. ✅ **Zadanie 5** — disabled + "Brak kredytów" przy 0 kredytach w kalendarzu
8. ✅ **Zadanie 3** — tooltopy przy disabled checkboxach (Brand Colors, Brand Voice)
9. ✅ **Zadanie 4** — okazje rozszerzone do 30 dni (slice 5 zamiast 3)
10. ✅ **Zadanie 7** — kalkulacja kompletności Brand Kit poprawiona (wagi 30/30/15/15/10, sprawdzanie kolorów)
11. ✅ **Zadanie 8** — upsert Brand Kit już używał onConflict: 'user_id' (OK)
12. ✅ **Zadanie 12** — wskazówka "Chcesz lepsze posty?" pod przyciskiem w onboardingu
13. ✅ **Zadanie 2** — empty state w generatorze z przykładowymi tematami, cennik tylko przy 0 kredytach

---

## Czego NIE robić

- Nie zmieniać nazw własnych: Brand Kit, Starter, Pro, Free, Facebook, Instagram, TikTok
- Nie przepisywać stron od zera — tylko punktowe poprawki
- Nie zmieniać schematu Supabase przy zadaniu 8 — tylko naprawić upsert
- Nie dodawać nowych bibliotek — wszystko inline styles + istniejące klasy CSS