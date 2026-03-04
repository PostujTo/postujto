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