# PostujTo.pl — Kontekst projektu

## Stack
- Next.js 16, Supabase, Clerk, Stripe (Test Mode), Claude API, Vercel
- Replicate (Recraft V3), OpenAI (backup)
- URL: https://postujto.vercel.app

## Plany
- Free: 5 generacji jednorazowo (nie odnawia się)
- Starter: 79 zł/msc, Unlimited
- Pro: 199 zł/msc, Unlimited + obrazy AI

## Filozofia biznesu
- Alex Hormozi — sprzedajemy wynik ("zaoszczędź 10h tygodniowo"), nie narzędzie
- Gwarancja 7 dni zwrotu
- Polski rynek — kalendarz okazji, branże, prawo reklamowe

## Zrealizowane plany

### ✅ A — Limity generacji
- Odejmowanie kredytów, blokada przy 0, licznik w nagłówku
- Free = 5 jednorazowo, Starter/Pro = 999999 (unlimited)

### ✅ B — Stripe / Płatności
- Starter (79 zł), Pro (199 zł)
- Checkout, Customer Portal, Webhook (zakup, odnowienie, anulowanie)
- Etykiety: STARTER • Unlimited, PRO • Unlimited

### ✅ C — Dashboard (/dashboard)
- Statystyki, historia postów, filtry (wszystkie/ulubione/FB/IG/TT)
- Ulubione per wersja, usuwanie postów i wersji
- Godzina generacji, sessionStorage

### ✅ Polska optymalizacja
- Kalendarz polskich okazji (30 dni naprzód)
- 12 branż z wskazówkami branżowymi
- Polskie prawo reklamowe w promptach
- TikTok jako platforma (constraint Supabase zaktualizowany)

### ✅ D — Generowanie obrazów
- Recraft V3 przez Replicate ($0.04/obraz)
- Smart Style Router (Claude dobiera styl Recraft)
- Baza 70+ polskich brandów (lib/polish-brands.ts)
- Soft limit 50 obrazów/dzień per użytkownik
- Tabela image_generations w Supabase

### ✅ Brand Kit (/settings)
- Nazwa firmy, slogan, kolory (HEX/RGB/CMYK — 5 pól), styl graficzny, ton
- Upload logo (Supabase Storage bucket: brand-logos, max 2MB)
- Auto-integracja z generowaniem obrazów (Recraft używa kolorów i stylu)
- Dostępny dla wszystkich planów (Free, Starter, Pro)
- Link "⚙️ Ustawienia" w nagłówku

### ✅ Bezpieczeństwo
- RLS (Row Level Security) włączone na wszystkich tabelach Supabase
- Rate limiting w middleware.ts:
  - /api/generate: 10 req/min
  - /api/image: 5 req/min
  - /api/brand-kit: 20 req/min
  - /api/dashboard: 30 req/min
- Walidacja i sanityzacja inputów w /api/generate i /api/image
- Ocena bezpieczeństwa: ~8.5/10

## Do zrobienia (następna sesja)

### Priorytet 1 — W trakcie
1. `npm install sharp @types/sharp` — instalacja biblioteki do watermarku
2. Checkboxy pod polem tematu w app/page.tsx:
   - "Dodaj znak wodny logo w prawym dolnym rogu" (wymaga logo w Brand Kit)
   - "Użyj kolorów i stylu marki" (domyślnie zaznaczony)
3. Nakładanie logo watermark przez sharp w app/api/image/route.ts
4. Automatyczne generowanie 3 obrazów po kliknięciu "Wygeneruj post"

### Priorytet 2
- Clerk production keys (przy zakupie domeny)
- Walidacja inputów w pozostałych API (brand-kit, dashboard)
- Generowanie bez logowania (1-2 posty dla niezalogowanych)

### Priorytet 3 — Przyszłe plany
- F — Marketing i landing page
- E — Generowanie głosu
- G — Generowanie wideo (RunwayML/Kling)
- Claude Vision — analiza logo i auto-wyciąganie kolorów
- Middleware deprecated warning

## Kluczowe pliki
- app/page.tsx — strona główna
- app/dashboard/page.tsx — dashboard
- app/settings/page.tsx — Brand Kit
- app/pricing/page.tsx — cennik
- app/api/generate/route.ts — generowanie postów (Claude)
- app/api/image/route.ts — generowanie obrazów (Recraft V3)
- app/api/brand-kit/route.ts — Brand Kit CRUD
- app/api/brand-kit/upload-logo/route.ts — upload logo
- app/api/stripe/webhooks/route.ts — webhooks Stripe
- app/api/dashboard/route.ts — dane dashboardu
- app/api/dashboard/favorite/route.ts — ulubione
- app/api/dashboard/delete/route.ts — usuwanie
- app/api/credits/route.ts — pobieranie kredytów
- app/api/webhooks/clerk/route.ts — tworzenie użytkownika
- lib/polish-brands.ts — baza 70+ polskich marek
- middleware.ts — rate limiting + ochrona tras

## Zmienne środowiskowe (Vercel + .env.local)
- ANTHROPIC_API_KEY
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_WEBHOOK_SECRET
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- STRIPE_PRICE_ID_STANDARD (Starter 79 zł)
- STRIPE_PRICE_ID_PREMIUM (Pro 199 zł)
- NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD
- NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM
- NEXT_PUBLIC_APP_URL
- OPENAI_API_KEY
- REPLICATE_API_TOKEN

## Supabase tabele
- users (clerk_user_id, credits_remaining, credits_total, subscription_plan, stripe_customer_id, stripe_subscription_id)
- generations (user_id, topic, platform, tone, length, generated_posts jsonb, is_favorite, liked_versions jsonb, quality_tier, has_image, has_audio, cost_usd)
- image_generations (user_id, topic, platform, tool_used, prompt_used, image_url, cost_usd)
- brand_kits (user_id, company_name, colors jsonb, style, tone, slogan, logo_url)

## Supabase Storage
- bucket: brand-logos (publiczny)

## Ważne uwagi
- Supabase constraint: platform IN ('facebook', 'instagram', 'tiktok')
- Clerk: nadal development keys — zmienić przy zakupie domeny
- Stripe: Test Mode — zmienić na Live przy uruchomieniu produkcyjnym
- Free users: credits_total=5, credits_remaining=5, nie odnawia się
- Paid users: credits_total=999999, credits_remaining=999999