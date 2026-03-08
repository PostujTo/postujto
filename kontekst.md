# PostujTo.pl — Kontekst projektu

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
- **Starter:** 79 zł/msc — unlimited posty, obrazy AI, Brand Kit
- **Pro:** 199 zł/msc — auto 3 obrazy, logo watermark, priorytetowe generowanie

## Routing
- `/` — landing page
- `/app` — generator postów
- `/dashboard` — historia postów
- `/settings` — Brand Kit
- `/calendar` — kalendarz treści (auth tymczasowo wyłączony — Clerk DNS w toku)
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
- Brand Voice — "Generuj w moim stylu" (sample_posts)
- Best time to post — rekomendacje dla PL rynku
- Kalendarz polskich okazji (nadchodzące 30 dni)
- Branże z hintem do Claude (12 branż)
- Oceny wersji (1-5★) z feedbackiem do Claude

### Brand Kit (/settings)
- Nazwa firmy, slogan
- Kolory marki (max 5, HEX/RGB/CMYK)
- Styl graficzny (7 opcji)
- Ton komunikacji (4 opcje)
- Logo (upload do Supabase Storage)
- Przykładowe posty (sample_posts — nauka stylu przez Claude)
- Presety stylów: Lokalny biznes, Korporacja, Eko, Premium, Młodzieżowy, Minimalizm

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

### Kalendarz treści (/calendar)
- Widok miesięczny (siatka) + widok listy
- Polskie okazje handlowe (28 okazji)
- Planowanie 30 tematów przez Claude
- Bulk generation wszystkich postów
- Generowanie pojedynczego posta z panelu bocznego
- Eksport CSV z BOM (UTF-8)
- Kopiuj serię na tydzień (4 przyciski)
- Zapis z datą (scheduled_date) do Supabase
- Best time to post w panelu dnia
- Edycja tematu i platformy per dzień

### Onboarding (/onboarding)
- Wizard 5 kroków: Witaj → Firma → Platformy → Ton → Start
- Zapis do Brand Kit po zakończeniu
- Redirect do generatora z pre-wypełnionym tematem
- Kolumna `onboarding_completed` w Supabase

### Landing page (/)
- Hero z demo card
- Ticker z funkcjami
- Statystyki (10h, 30 postów, 3 platformy, 12 branż)
- Jak to działa (3 kroki)
- Co wyróżnia PostujTo (6 cech)
- Dla kogo (6 use-case'ów z cytatami)
- Cennik (3 plany)
- Tabela porównania Starter vs Pro
- CTA section
- Footer z linkami social media + UTM-y

## Supabase — tabele i ważne kolumny
```
users:
  - clerk_user_id, email, full_name
  - subscription_plan (free/standard/premium)
  - credits_remaining, credits_total
  - onboarding_completed (boolean)

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
POST /api/stripe/create-checkout-session
POST /api/stripe/customer-portal
POST /api/stripe/webhook
POST /api/webhooks/clerk    — tworzenie użytkownika w Supabase + onboarding email
GET  /api/cron/daily        — dzienny cron (Vercel)
```

## Social media PostujTo
- TikTok: @reklamyzpostujto
- Instagram: @reklamyzpostujto
- Facebook: @reklamyzpostujto
- UTM bio links: `?utm_source=tiktok/instagram/facebook&utm_medium=social&utm_campaign=bio`

## Do zrobienia / otwarte tematy
- [ ] Clerk email DNS — zweryfikować i przywrócić auth w `/calendar`
- [ ] Stripe — włączyć płatności po konsultacji prawnej
- [ ] Cloudflare cache dla Vercel (0% Percent Cached — każde żądanie idzie do Vercel)
- [ ] KSeF — zawieszone (brak JDG/VAT)

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
Odpisz szablonem powołując się na §5 Regulaminu:

> Dziękujemy za kontakt. Zgodnie z §5 naszego Regulaminu, który zaakceptowałeś przy rejestracji, prawo odstąpienia od umowy nie przysługuje w przypadku gdy usługa cyfrowa została uruchomiona i wykorzystana przed upływem 14 dni (art. 38 pkt 13 ustawy o prawach konsumenta). W Twoim przypadku usługa była aktywnie używana, dlatego nie możemy zrealizować zwrotu. W razie pytań jesteśmy do dyspozycji pod hello@postujto.com.

## Optymalizacje wydajności (marzec 2025)

### Zrealizowane
- **Fonty:** Zastąpiono Lato + Google Fonts `@import` przez `next/font/google` (Poppins + DM Sans) w `layout.tsx`. Usunięto `@import url(googleapis...)` ze wszystkich stron. Fonty używają CSS variables (`--font-poppins`, `--font-dm-sans`) i `display: swap`.
- **next.config.ts:** Dodano `compress: true`, `poweredByHeader: false`, `images.formats: ['image/avif', 'image/webp']`.
- **Footer landing page:** Naprawiono zagnieżdżone `<Link>` w footerze (błąd hydration). Linki do Regulamin/Prywatność/FAQ dodane do istniejącej tablicy linków.

### Zrezygnowano
- **Server Component dla landing page:** W Next.js App Router nawet `'use client'` komponenty są server-side renderowane przy pierwszym ładowaniu — Google widzi pełną treść. Różnica dla SEO minimalna. `isVisible` i `scrollY` są używane w dziesiątkach miejsc w JSX, przepisanie niesie duże ryzyko błędów przy małym zysku.

## Sesja 5 marca 2026 — bezpieczeństwo, DNS, Google OAuth, audyt

### Zrealizowane

**Clerk DNS — w pełni zweryfikowany**
- Wszystkie 5/5 rekordów Verified (Frontend API, Account Portal, Email DKIM)
- SSL certificates issued
- Błędy CORS z clerk.postujto.com zniknęły

**Google OAuth — skonfigurowane**
- Utworzono projekt w Google Cloud Console
- Skonfigurowano OAuth 2.0 Client ID (typ: Aplikacja internetowa)
- Authorized redirect URI: `https://clerk.postujto.com/v1/oauth_callback`
- Authorized JS origins: `https://clerk.postujto.com`
- Client ID i Secret wklejone w Clerk Dashboard → Production → Google OAuth
- "Use custom credentials" włączone

**Security headers** dodane do `next.config.ts`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy: strict-origin-when-cross-origin
- X-XSS-Protection: 1; mode=block

**Rate limiting** — nowy plik `lib/rateLimit.ts`:
- Map-based in-memory rate limiter
- `/api/generate` — max 10 requestów/minutę per userId
- `/api/image` — max 5 requestów/minutę per userId
- Goście limitowani po IP (x-forwarded-for)

**Walidacja inputów** — już była w `/api/generate`:
- Sprawdzanie platform, tone, length, długości topic
- Sanityzacja HTML z topic
- Ukryto `error.message` w odpowiedziach 500

**globals.css** — wyczyszczony z Geist font references

**robots.txt + sitemap.ts** — dodane:
- robots.txt w /public, pozwala PerplexityBot i wszystkim crawlerom
- sitemap.ts generuje /sitemap.xml dla: /, /faq, /terms, /privacy

**Regulamin §1** — zaktualizowany:
- "PostujTo" zastąpione danymi osoby fizycznej: Jarosław Cisło + adres + hello@postujto.com
- Do zaktualizowania po rejestracji JDG (pełna nazwa firmy, NIP, REGON)

### Do zrobienia

**Google OAuth — weryfikacja**
- Przetestować logowanie przez Google po propagacji zmian (może trwać do kilku godzin)
- Jeśli nadal błąd — sprawdzić czy w Google Cloud ekran zgody OAuth ma status "In production"

**Audyt Perplexity — pozostałe punkty**
- [ ] Screenshoty z apki na landing page (dashboard, kreator posta, kalendarz)
- [ ] Więcej CTA "Zacznij za darmo" po kluczowych sekcjach (po hero, po "Jak to działa", po cenniku)
- [ ] Sekcja "Jak dbamy o dane" na landing page
- [ ] Doprecyzowanie "standardowych klauzul umownych" w polityce prywatności
- [ ] Plan Starter jako "najpopularniejszy" w cenniku — wyróżnienie wizualne

**Prawne**
- [ ] Po rejestracji JDG: zaktualizować §1 regulaminu (nazwa firmy, NIP, REGON, adres)
- [ ] Limit kredytów Free — doprecyzować w regulaminie czy wygasają

**Stripe**
- [ ] Włączyć płatności po konsultacji prawnej

**Cloudflare cache**
- [ ] Konfiguracja cache dla Vercel (0% Percent Cached)

## Aktualizacja — 5 marca 2026 (popołudnie)

### Zrealizowane w tej sesji

**Landing page — nowe sekcje i CTA:**
- Dodano sekcję "Jak dbamy o dane" (6 kafli: TLS 1.3, serwery DE, Stripe PCI DSS, AI nie trenuje, ograniczony dostęp, RODO) między tabelą porównania a FAQ
- Dodano CTA "Zacznij za darmo" po sekcji "Jak to działa"
- Dodano CTA "Wypróbuj PostujTo za darmo" po tabeli porównania Starter vs Pro

**Cloudflare cache — decyzja:**
- Zostawiono DNS only (szara chmurka) — Cloudflare nie jest proxy dla Vercel
- Vercel edge cache wystarczy na tym etapie
- Cloudflare cache ma sens dopiero przy dużym ruchu (1000+ użytkowników dziennie)

**Google OAuth — częściowo naprawione:**
- Skonfigurowano OAuth 2.0 Client ID w Google Cloud Console
- Authorized JS origins: `https://clerk.postujto.com`
- Authorized redirect URI: `https://clerk.postujto.com/v1/oauth_callback`
- Status aplikacji zmieniony z "Testowanie" na "In production"
- Client ID i Secret wklejone w Clerk Production
- ⚠️ Błąd `invalid_client` nadal się pojawia — może wymagać propagacji lub dalszej diagnostyki

### Do zrobienia

**🔴 Pilne**

- [ ] **Google OAuth** — sprawdzić po kilku godzinach czy błąd `invalid_client` zniknął po propagacji. Jeśli nie — usunąć credentials i skonfigurować od nowa.

- [ ] **Konta testowe — wyczyścić i sprawdzić rejestrację:**
  - Usunąć z Supabase i Clerk: `premium@example.com`, `test@example.com`
  - Sprawdzić `j.st4rtup@gmail.com` — czy logowanie działa i czy strona go rozpoznaje
  - SQL już przygotowany (patrz wyżej w historii)
  - ⚠️ Wątpliwość: czy rejestracja nowego użytkownika działa poprawnie (czy webhook/endpoint tworzy rekord w Supabase przy nowej rejestracji przez Clerk)

- [ ] **Screenshoty z apki na landing page** — po naprawieniu logowania:
  - Uzupełnić Brand Kit w `/settings`
  - Wygenerować 3-4 posty w `/app`
  - Dodać posty do kalendarza w `/calendar`
  - Zrobić screenshoty i wstawić na landing page

**🟡 Ważne**

- [ ] Stripe — włączyć płatności po konsultacji prawnej
- [ ] Regulamin §1 — zaktualizować po rejestracji JDG (nazwa firmy, NIP, REGON)
- [ ] Doprecyzowanie "standardowych klauzul umownych" w polityce prywatności

### Stan kont testowych w Supabase (5 marca 2026)

| email | plan | kredyty |
|-------|------|---------|
| premium@example.com | standard | 100/100 — DO USUNIĘCIA |
| test@example.com | free | 5/5 — DO USUNIĘCIA |
| j.st4rtup@gmail.com | free | 5/5 — sprawdzić |
| psychoproductivity@gmail.com | premium→pro | naprawiono na 999999 |
| exct22@gmail.com | premium→pro | naprawiono na 999999 |

## Aktualizacja — 6 marca 2026

### Zrealizowane

**Landing page — kolejne poprawki:**
- Ticker (pasek TV) zastąpiony statycznymi pillsami z funkcjami
- Usunięto ikony z kroków "Jak to działa"
- Cennik przeniesiony na osobną stronę `/pricing` — przepisany w ciemnym motywie, równe przyciski i karty tej samej wysokości
- Link "Cennik" dodany do nawa
- Stopka: `#pricing` → `/pricing`, Dashboard ukryty dla niezalogowanych, prawdziwe SVG ikony social mediów, rok 2026
- Sekcja bezpieczeństwa: Niemcy → Irlandia 🇮🇪
- CTA "Zacznij za darmo" po sekcji "Jak to działa" i po tabeli porównania

**Konta testowe — wyczyszczone:**
- Usunięto z Supabase i Clerk: wszystkie stare konta testowe
- Gotowe do świeżej rejestracji

**Google OAuth — diagnoza:**
- Znaleziono przyczynę błędu `invalid_client` — zduplikowana końcówka w Client ID wklejonym w Clerk (`...googleusercontent.comoogleusercontent.com ` + spacja)
- Poprawiono Client ID w Clerk — czeka na weryfikację

## Aktualizacja — 6 marca 2026 (popołudnie)

### Zrealizowane

**Google OAuth — naprawiony ✅**
- Przyczyna błędu `invalid_client`: zduplikowana końcówka w Client ID wklejonym w Clerk
- Poprawiono Client ID, status aplikacji Google zmieniony na "In production"
- Clerk webhook URL zmieniony na `https://www.postujto.com/api/webhooks/clerk` (fix HTTP 307)
- Rejestracja nowych użytkowników działa — rekord w Supabase + email onboardingowy

**Security — CSP headers dodane do `next.config.ts`:**
- Content-Security-Policy (script-src, style-src, img-src, connect-src, frame-src, worker-src)
- Permissions-Policy (camera, microphone, geolocation)
- Whitelist: Clerk, Stripe, Supabase, Anthropic, Replicate, Resend, Google Fonts, Cloudflare

**Cennik `/pricing` — ulepszenia:**
- Checkbox akceptacji regulaminu przed przejściem do Stripe
- Własny modal "Wymagana akceptacja" zamiast natywnego `alert()`
- Linki do Regulaminu i Polityki prywatności w checkboxie i modalu
- Tekst o zrzeczeniu prawa do odstąpienia (art. 38 pkt 13)

**Stripe success/cancel flow — przepisane w ciemnym motywie:**
- `app/success/SuccessContent.tsx` — ciemny motyw, linki do Regulaminu i Polityki prywatności w stopce
- `app/cancel/page.tsx` — nowa strona (wcześniej nie istniała), ciemny motyw, linki prawne
- `cancel_url` w checkout session zmieniony z `/pricing` na `/cancel`

**Polityka prywatności `/privacy` — zaktualizowana:**
- Dodana kolumna "Odbiorcy" do tabeli §2 (Clerk/Supabase, Stripe, Anthropic, Vercel/Cloudflare)
- Data aktualizacji zmieniona na 6 marca 2026

**Regulamin `/terms` — wcześniej w tej sesji:**
- Dodano §5 Reklamacje (procedura, termin 14 dni roboczych)
- Dodano §10 tabela podstaw prawnych RODO
- Dodano §12 Rozstrzyganie sporów (ODR, SPSK, art. 34 KPC)
- Spis treści z anchorami §1-§13

**Dashboard `/dashboard` — przyciski RODO:**
- "📥 Pobierz moje dane" — eksport JSON z danymi użytkownika
- "🗑️ Usuń konto" — podwójne potwierdzenie, usuwa z Supabase + Clerk
- Nowe endpointy: `GET /api/user/gdpr-export`, `DELETE /api/user/delete-account`

**Landing page — drobne poprawki:**
- Link "Cennik" w nav — dodany efekt hover (`#a5b4fc`) zgodny ze stopką
- Sekcja bezpieczeństwa: 🇩🇪 Niemcy → 🇮🇪 Irlandia (serwer Supabase eu-west-1)

### API endpoints — nowe
```
GET  /api/user/gdpr-export     — eksport danych użytkownika (JSON)
DELETE /api/user/delete-account — usunięcie konta (Supabase + Clerk)
```

### Do zrobienia

- [ ] Stripe — włączyć po konsultacji prawnej
- [ ] Regulamin §1 — zaktualizować po rejestracji JDG (nazwa firmy, NIP, REGON)
- [ ] Screenshoty z apki na landing page (dashboard, kreator, kalendarz)
- [ ] Social proof (logotypy firm, licznik użytkowników)
- [ ] CSP — monitoring czy coś blokuje po wdrożeniu
- [ ] Cennik na landing page (`/` sekcja `#pricing`) — dodany, ale wymaga poprawek graficznych (niespójność z `/pricing` page) — poprawić w kolejnej sesji

## Kod do użycia później — Social Proof

⚠️ Wstawić dopiero gdy będą prawdziwi użytkownicy (min. 3 opinie). Fałszywy social proof narusza ustawę o nieuczciwych praktykach rynkowych.

Wstawić w `app/page.tsx` między `{/* HOW IT WORKS */}` a `{/* FEATURES */}`. Dodać też `'social-proof'` do tablicy sekcji w `IntersectionObserver`.

```tsx
{/* SOCIAL PROOF */}
      <section style={{ padding: '80px 24px', position: 'relative' }} id="social-proof" data-animate>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Licznik + ocena */}
          <div className={`section-reveal from-up ${isVisible('social-proof') ? 'visible' : ''}`} style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div className="font-display" style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>500+</div>
                <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', marginTop: 4 }}>firm w Polsce</div>
              </div>
              <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginBottom: 4 }}>
                  {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 24, color: '#fbbf24' }}>★</span>)}
                </div>
                <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)' }}>4.9/5 średnia ocena</div>
              </div>
              <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.08)' }} />
              <div style={{ textAlign: 'center' }}>
                <div className="font-display" style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>12k+</div>
                <div style={{ fontSize: 14, color: 'rgba(240,240,245,0.45)', marginTop: 4 }}>postów wygenerowanych</div>
              </div>
            </div>
          </div>

          {/* Logotypy */}
          <div className={`section-reveal from-up ${isVisible('social-proof') ? 'visible' : ''}`} style={{ transitionDelay: '0.1s', marginBottom: 72 }}>
            <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,240,245,0.25)', marginBottom: 28 }}>
              Używane przez firmy z całej Polski
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40, flexWrap: 'wrap' }}>
              {['Salon Urody', 'Sklep Online', 'Restauracja', 'Agencja', 'Fitness Club', 'Szkoła Językowa'].map((name, i) => (
                <div key={i} style={{ padding: '10px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'rgba(240,240,245,0.3)', letterSpacing: '0.03em' }}>
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* Opinie */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { name: 'Magda K.', role: 'Właścicielka salonu urody', avatar: '💅', rating: 5, text: 'Oszczędzam minimum 8 godzin tygodniowo. Posty są lepsze niż te które pisałam sama — a zajmuje mi to teraz 5 minut dziennie.' },
              { name: 'Tomek W.', role: 'Sklep z elektroniką online', avatar: '🛒', rating: 5, text: 'Zrezygnowałem z copywritera za 1800 zł/msc. PostujTo robi to samo za ułamek ceny i nigdy nie ma "wolnych terminów".' },
              { name: 'Kasia M.', role: 'Restauracja, Kraków', avatar: '🍽️', rating: 5, text: 'Kalendarz treści na cały miesiąc planuję w niedzielę w 10 minut. Wcześniej nie miałam postów przez 2 miesiące z rzędu.' },
            ].map((review, i) => (
              <div
                key={i}
                className={`section-reveal from-up card-glass ${isVisible('social-proof') ? 'visible' : ''}`}
                style={{ borderRadius: 18, padding: 28, transitionDelay: `${0.2 + i * 0.1}s` }}
              >
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  {Array(review.rating).fill(0).map((_, j) => <span key={j} style={{ fontSize: 14, color: '#fbbf24' }}>★</span>)}
                </div>
                <p style={{ fontSize: 14, color: 'rgba(240,240,245,0.7)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                  "{review.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {review.avatar}
                  </div>
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
```
# PostujTo.pl — kontekst.md
_Ostatnia aktualizacja: 2026-03-08_

---

## Do sprawdzenia po włączeniu płatności

- Czy modal przed Stripe w `/pricing` poprawnie zapisuje `terms_accepted_at` przed przekierowaniem do Stripe
- Czy checkbox blokuje przycisk „Akceptuję — przejdź do płatności →" dopóki niezaznaczony
- Czy użytkownicy którzy zaakceptowali regulamin przez `/app` (free) lub onboarding nie widzą ponownie modala przy zakupie

---

## Do poprawki — Onboarding (`app/onboarding/page.tsx`)

- **Brak ikon serwisów** — w kroku 2 z 3 (wybór platform) oraz na ostatnim ekranie podsumowania wyświetla się tylko tekst zamiast ikon Facebook / Instagram / TikTok. Ikony są pobierane z `cdn.simpleicons.org` — sprawdzić czy ładują się poprawnie po deploymencie.
- **Przycisk „Dalej" i przycisk na ostatnim ekranie** — powinny wyglądać jak przycisk „Wypróbuj za darmo →" ze strony głównej: gradient fioletowy, efekt hover (`filter: brightness(1.15)`, `transform: translateY(-1px)`). Aktualnie styl `btn-primary` może nie być spójny z benchmarkiem (strona główna).

---

## Otwarte zadania techniczne

- [ ] Stripe — włączyć po konsultacji prawnej
- [ ] Regulamin §1 — zaktualizować po rejestracji JDG (nazwa firmy, NIP, REGON)
- [ ] Screenshoty z apki na landing page
- [ ] Clerk email DNS — zweryfikować propagację
- [ ] Cloudflare cache dla Vercel — konfiguracja
- [ ] KSeF — zawieszone (brak JDG/VAT)

---

## Benchmark UI/UX

**Strona główna (`app/page.tsx`) to benchmark** — każda nowa strona i komponent muszą być z nią spójne:
- Efekty hover na kartach: `translateY(-8px)`, `border-color rgba(99,102,241,...)`, transition `0.2s ease` na konkretnych właściwościach (nie `all`)
- Przyciski primary: gradient `linear-gradient(135deg, #6366f1, #a855f7)`, hover `brightness(1.15) + translateY(-1px)`
- Kolory tła: `#0a0a0f`, karty `rgba(255,255,255,0.03)`, border `rgba(255,255,255,0.08)`
- Typografia: Poppins (nagłówki), DM Sans (tekst)
- Sticky header: `background: rgba(10,10,15,0.9)`, `backdropFilter: blur(20px)`, `borderBottom: 1px solid rgba(255,255,255,0.06)`