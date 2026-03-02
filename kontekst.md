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
- Link "Ustawienia" w nagłówku

### ✅ Bezpieczeństwo
- RLS (Row Level Security) włączone na wszystkich tabelach Supabase
- Rate limiting w middleware.ts:
  - /api/generate: 10 req/min
  - /api/image: 5 req/min
  - /api/brand-kit: 20 req/min
  - /api/dashboard: 30 req/min
- Walidacja i sanityzacja inputów we wszystkich API (generate, image, brand-kit, dashboard)
- Ocena bezpieczeństwa: ~9/10

### ✅ E — Watermark / Podpis marki
- Checkbox "Dodaj logo marki w prawym dolnym rogu" — tylko plan Pro
- Checkbox "Użyj kolorów i stylu marki" — domyślnie zaznaczony, wszyscy
- Nakładanie logo przez sharp (15% szerokości obrazu, prawy dolny róg)
- Przetworzone obrazy zapisywane w Supabase Storage bucket: processed-images
- Bucket processed-images: publiczny, RLS policy: INSERT tylko dla service_role
- sharp@0.34.5 zainstalowany

### ✅ F — Automatyczne generowanie 3 obrazów (Pro)
- Po kliknięciu "Wygeneruj posty" plan Pro automatycznie generuje 3 obrazy
- Starter generuje obrazy ręcznie (przycisk per karta)
- Funkcja generateImageAuto w page.tsx

### ✅ G — Generowanie bez logowania (Guest mode)
- Niezalogowany użytkownik dostaje 1 wersję posta (zamiast 3)
- Nie zapisywane do bazy, nie odejmuje kredytów
- Po wygenerowaniu pojawia się banner: "Zaloguj się i dostań 3 wersje + 5 kredytów"
- API zwraca flagę isGuest: true

### ✅ H — Persistencja sesji
- sessionStorage zapamiętuje: temat, wyniki, wygenerowane obrazy, checkboxy
- Stan przywracany po powrocie ze stron /dashboard, /settings itp.

## Do zrobienia (następna sesja)

### Priorytet 1
- Clerk production keys (przy zakupie domeny)
- Stripe Live Mode (przy uruchomieniu produkcyjnym)

### Priorytet 2 — Przyszłe plany
- Marketing i landing page (social proof, FAQ, testimonials)
- Generowanie głosu
- Generowanie wideo (RunwayML/Kling)
- Claude Vision — analiza logo i auto-wyciąganie kolorów
- Middleware deprecated warning fix

## Kluczowe pliki
- app/page.tsx — strona główna
- app/dashboard/page.tsx — dashboard
- app/settings/page.tsx — Brand Kit
- app/pricing/page.tsx — cennik
- app/api/generate/route.ts — generowanie postów (Claude) + guest mode
- app/api/image/route.ts — generowanie obrazów (Recraft V3) + watermark sharp
- app/api/brand-kit/route.ts — Brand Kit CRUD + walidacja
- app/api/brand-kit/upload-logo/route.ts — upload logo
- app/api/stripe/webhooks/route.ts — webhooks Stripe
- app/api/dashboard/route.ts — dane dashboardu + fix duplicate return
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
- bucket: brand-logos (publiczny, 3 policies)
- bucket: processed-images (publiczny, INSERT tylko service_role)

## Ważne uwagi
- Supabase constraint: platform IN ('facebook', 'instagram', 'tiktok')
- Clerk: nadal development keys — zmienić przy zakupie domeny
- Stripe: Test Mode — zmienić na Live przy uruchomieniu produkcyjnym
- Free users: credits_total=5, credits_remaining=5, nie odnawia się
- Paid users: credits_total=999999, credits_remaining=999999
- Guest mode: 1 post, brak zapisu, brak kredytów
- Pro plan: auto-generowanie 3 obrazów po wygenerowaniu postów
- Watermark dostępny tylko dla Pro (subscription_plan === 'premium')