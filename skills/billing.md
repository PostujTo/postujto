# Skill: billing

Load this skill when the task involves Stripe, subscription plans, credit system, billing webhooks, or plan-based feature gating.

---

## Rules

- Always verify Stripe webhook signature — never skip `constructEvent()`
- `checkout.session.completed` = first purchase, `invoice.payment_succeeded` = renewal — handle separately
- Use explicit plan map (`standard` / `premium`) when processing `customer.subscription.updated`
- Price IDs must be whitelisted server-side — never trust client-sent Price IDs
- Credit decrement: always use atomic `decrement_credit()` RPC — never a plain `UPDATE`
- Free plan: 5 credits. Starter/Pro: 9999 (unlimited for UX purposes — never show credit UI to paid users)
- Current prices: Starter 97 zł/msc | 830 zł/rok, Pro 247 zł/msc | 2110 zł/rok

## Checklist after billing changes

- [ ] Webhook signature verification still in place
- [ ] First purchase vs renewal handled separately
- [ ] Credit decrement is atomic
- [ ] Plan limits enforced server-side (not only in UI)
- [ ] Stripe Customer Portal return URL = `/settings`
- [ ] Test with Stripe card 4242 4242 4242 4242

## Risks to flag

- Duplicate credit decrement on retry
- Race condition between webhook and frontend plan check
- Missing `plan_expires_at` update on renewal
