# Skill: security-review

Load this skill when the task involves auth, permissions, input validation, webhooks, file uploads, or user data handling.

---

## Rules

- RLS enabled on all Supabase tables — never bypass
- Every query must filter by `user_id` — never return cross-user data
- Stripe webhook: always use `constructEvent()` with `STRIPE_WEBHOOK_SECRET`
- Magic Import URL: block internal addresses (SSRF protection)
- Rate limiting via Supabase (works across Vercel instances) — not localStorage alone
- Never expose raw error messages to end users
- Never log secrets, tokens, or PII
- Clerk JWT validated on every protected route via middleware

## Sensitive flows — extra care required

- Credit decrement: atomic RPC only
- Account connect/disconnect: logged, token never exposed
- Billing state change: logged, webhook signature verified
- User data deletion: cascade delete from all tables + Stripe cancel + Clerk delete

## Checklist for security-sensitive changes

- [ ] All inputs validated at API boundary
- [ ] User can only access their own data (user_id filter)
- [ ] Webhook signature verified
- [ ] No secrets in code, logs, or responses
- [ ] Rate limiting in place for external-facing endpoints
- [ ] Error messages are user-safe (no stack traces)
- [ ] SSRF protection for URL inputs (Magic Import)

## Risks to flag

- Missing `user_id` filter exposes all users' data
- Webhook without signature check allows spoofing
- Credit race condition allows free generation
