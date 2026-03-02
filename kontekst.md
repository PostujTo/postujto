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
- Ocena produktu: 7/10 rynkowo, 9/10 jako MVP

## Zrealizowane funkcje

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
- TikTok jako platforma

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
- Dostępny dla wszystkich planów

### ✅ Bezpieczeństwo (9.5/10)
- RLS włączone na wszystkich tabelach Supabase
- Rate limiting w middleware/proxy.ts
- Walidacja i sanityzacja inputów we wszystkich API
- Usunięta tabela usage_stats (nieużywana)

### ✅ E — Watermark / Podpis marki
- Checkbox "Dodaj logo marki w prawym dolnym rogu" — tylko Pro
- Checkbox "Użyj kolorów i stylu marki" — wszyscy
- Nakładanie logo przez sharp (15% szerokości, prawy dolny róg)
- Bucket processed-images w Supabase Storage

### ✅ F — Automatyczne generowanie 3 obrazów (Pro)
- Po kliknięciu "Wygeneruj posty" Pro auto-generuje 3 obrazy
- Starter generuje ręcznie
- Funkcja generateImageAuto w page.tsx

### ✅ G — Guest mode (generowanie bez logowania)
- Niezalogowany dostaje 1 wersję posta
- Nie zapisywane do bazy, nie odejmuje kredytów
- Banner "Zaloguj się po 3 wersje + 5 kredytów"
- API zwraca flagę isGuest: true

### ✅ H — Persistencja sesji
- sessionStorage: temat, wyniki, obrazy, checkboxy
- Stan przywracany po powrocie z /dashboard, /settings

## Roadmapa (4-6 tygodni)

### Tydzień 1 — Gotowe do produkcji (czeka na domenę)
- [ ] Zakup domeny postujto.pl
- [ ] Clerk production keys
- [ ] Stripe Live Mode (checkout, webhooki, test pełnej ścieżki)
- [ ] Mini landing page v0.5 (hero + jak to działa + pricing)
- [ ] Dopieszczenie komunikatów błędów

### Tydzień 2 — Kalendarz + "30 dni jednym kliknięciem"
- [ ] Widok kalendarza miesięcznego (/calendar lub rozwinięcie /dashboard)
- [ ] Bulk generation: "Wygeneruj 30 postów na 30 dni" dla branży i platform
- [ ] Zapis generacji z powiązaniem do daty
- [ ] Eksport do CSV/Markdown (data, platforma, treść)
- [ ] Przycisk "Kopiuj serię na tydzień"

### Tydzień 3 — Głos marki i Brand Kit 2.0
- [ ] Sekcja "Przykładowe posty" w Brand Kit (wklej 3-10 swoich postów)
- [ ] Zapis sample_posts do brand_kits (JSON)
- [ ] Wstrzykiwanie stylu do promptów Claude ("pisz w stylu tych przykładów")
- [ ] Przełącznik "Generuj w moim stylu" (domyślnie ON)
- [ ] Presety stylów graficznych (Lokalny biznes / Korporacja / Eko / Premium)
- [ ] Lepszy empty state dashboardu + mini-tutorial
- [ ] Wizard przy pierwszym logowaniu (branża → platformy → cel → generuj)

### Tydzień 4 — Landing page sprzedażowy (Hormozi)
- [ ] Hero: "PostujTo – Twój dział social media z AI po polsku"
- [ ] Sekcje: Jak to działa, Dla kogo, Co wyróżnia, Pricing
- [ ] Social proof / use-case'y (salon kosmetyczny, sklep online)
- [ ] Tabela porównania Starter vs Pro
- [ ] Onboarding e-mail po rejestracji
- [ ] CTA z UTM-ami do TikTok/IG/YouTube

### Tydzień 5-6 — Analytics i smart kalendarz (opcjonalne)
- [ ] Oceny wersji (gwiazdki) → feedback do Claude
- [ ] "Best time to post" — predefiniowane rekomendacje PL
- [ ] Pole "sugerowana godzina publikacji" w kalendarzu
- [ ] Manualne wprowadzanie wyników (lajki, zasięg, komentarze)
- [ ] Raport miesięczny generowany przez Claude (PDF/HTML)

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
- app/api/dashboard/route.ts — dane dashboardu
- app/api/dashboard/favorite/route.ts — ulubione
- app/api/dashboard/delete/route.ts — usuwanie
- app/api/credits/route.ts — pobieranie kredytów
- app/api/webhooks/clerk/route.ts — tworzenie użytkownika
- lib/polish-brands.ts — baza 70+ polskich marek
- proxy.ts — rate limiting + ochrona tras (dawniej middleware.ts)

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
- subscription_history (nieużywana, zostawiona na przyszłość)

## Supabase Storage
- bucket: brand-logos (publiczny, 3 policies)
- bucket: processed-images (publiczny, INSERT tylko service_role)

## Ważne uwagi
- Supabase constraint: platform IN ('facebook', 'instagram', 'tiktok')
- Clerk: development keys — zmienić przy zakupie domeny (Tydzień 1)
- Stripe: Test Mode — zmienić na Live przy domenie (Tydzień 1)
- Free users: credits_total=5, credits_remaining=5, nie odnawia się
- Paid users: credits_total=999999, credits_remaining=999999
- Guest mode: 1 post, brak zapisu, brak kredytów
- Pro: auto-generowanie 3 obrazów, watermark (subscription_plan === 'premium')
- sharp@0.34.5 zainstalowany