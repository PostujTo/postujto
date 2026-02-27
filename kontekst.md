# PostujTo.pl — Kontekst Projektu

## Stack technologiczny
- **Frontend/Backend:** Next.js (App Router)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Clerk
- **Payments:** Stripe (Test Mode)
- **AI:** Anthropic Claude API (Sonnet)
- **Hosting:** Vercel
- **Domena produkcyjna:** https://postujto.vercel.app
- **Repozytorium:** GitHub

## Status planów

### ✅ A — Limity generacji (GOTOWE)
- Odejmowanie kredytów po każdej generacji
- Blokada gdy kredyty = 0
- Wyświetlanie pozostałych kredytów w nagłówku

### ✅ B — Stripe / Płatności (GOTOWE)
- Plan Standard: 49 zł/msc, 100 postów
- Plan Premium: 149 zł/msc, 500 postów
- Checkout session (`/api/stripe/create-checkout-session`)
- Customer Portal (`/api/stripe/customer-portal`) z powrotem do aplikacji
- Webhook (`/api/stripe/webhooks`) obsługuje:
  - `checkout.session.completed` → aktywacja planu + kredyty
  - `invoice.payment_succeeded` → odnowienie kredytów co miesiąc
  - `customer.subscription.deleted` → powrót do planu free (10 kredytów)
- Strony: `/pricing`, `/success`

### 🔄 C — Dashboard użytkownika (NASTĘPNY)
✅ C — Dashboard użytkownika (GOTOWE)
- Historia wygenerowanych postów
- Statystyki (total, ulubione, Facebook, Instagram)
- Oznaczanie ulubionych
- Link do dashboardu w nagłówku
- Usuwanie całego postu lub pojedynczej wersji
- Godzina wygenerowania posta

### ⏳ D — Generowanie obrazów
- Stable Diffusion XL (Standard)
- DALL-E 3 (Premium)

### ⏳ E — Generowanie głosu
- ElevenLabs integracja

### ⏳ F — Marketing i pierwsi klienci
- Landing page
- Strategia pozyskania klientów

## Kluczowe pliki
| Plik | Opis |
|------|------|
| `app/page.tsx` | Strona główna z generatorem |
| `app/pricing/page.tsx` | Cennik z planami |
| `app/success/page.tsx` | Strona po płatności |
| `app/api/credits/route.ts` | Pobieranie stanu kredytów |
| `app/api/generate/route.ts` | Generowanie postów AI |
| `app/api/stripe/create-checkout-session/route.ts` | Tworzenie sesji płatności |
| `app/api/stripe/customer-portal/route.ts` | Portal klienta Stripe |
| `app/api/stripe/webhooks/route.ts` | Webhook Stripe |
| `app/api/user/plan/route.ts` | Pobieranie planu użytkownika |
| `app/lib/supabase.ts` | Klient Supabase |

## Baza danych Supabase — tabele
- `users` — clerk_user_id, email, credits_remaining, credits_total, subscription_plan, stripe_customer_id, stripe_subscription_id, credits_reset_date
- `generations` — historia wygenerowanych postów
- `usage_stats` — statystyki użycia
- `subscription_history` — historia zmian planów

## Zmienne środowiskowe (Vercel)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STANDARD=price_...
STRIPE_PRICE_ID_PREMIUM=price_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID_STANDARD=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM=price_...
NEXT_PUBLIC_APP_URL=https://postujto.vercel.app
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
ANTHROPIC_API_KEY=...
```

## Problemy do rozwiązania PÓŹNIEJ
- **Clerk development keys** — zmienić na production keys przy zakupie domeny
- **middleware deprecated** — warning: użyć `proxy` zamiast `middleware`
- **Customizacja portalu Stripe** — wygląd okna zarządzania subskrypcją

## Notatki
- Stripe jest w **trybie Sandbox (testowym)** — brak prawdziwych płatności
- Brak własnej domeny — aplikacja działa na domenie Vercel
- Użytkownik nie zna się na kodowaniu — wymagane szczegółowe instrukcje krok po kroku

✅ Polska optymalizacja (częściowo)
- Kalendarz polskich okazji marketingowych (30 dni naprzód)
- Kafelki branżowe: restauracja, sklep odzieżowy, salon kosmetyczny, budowlanka
- Prompt wzbogacony o wskazówki branżowe