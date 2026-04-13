# CLAUDE.md — PostujTo

## Project context

PostujTo is a production Polish SaaS — AI-powered social media content generator for small businesses. Stack: Next.js (Vercel) + Supabase + Clerk (auth) + Stripe (billing) + Anthropic Claude Sonnet (`claude-sonnet-4-6`) + Zernio (social publishing) + Cloudflare + Resend (email).

Priorities in order: **reliability → security → maintainability → performance → UX consistency.**

Prefer minimal diffs and targeted changes. Do not refactor unrelated code unless explicitly asked.

---

## Workflow

1. Explore relevant files and explain current behavior
2. Propose a short implementation plan in bullets
3. Only then implement
4. After implementation, run relevant checks and summarize what changed
5. If the task is ambiguous, ask one focused clarifying question before coding

---

## Architecture rules

- Reuse existing patterns before introducing new abstractions
- Extend current modules instead of creating parallel systems
- Keep business logic out of UI components
- Avoid duplicate helpers, types, and API logic
- Preserve backward compatibility unless explicitly told otherwise
- Prefer `overflow-x: clip` over `overflow-x: hidden` on html/body — `hidden` creates a new stacking context and breaks `position: fixed` elements (BottomNavBar, TopAppBar)

---

## 🔴 UI/UX isolation rule — MANDATORY

**This rule applies to every UI/UX change. No exceptions.**

- Bug reported on **mobile** → fix only `@media (max-width: 767px)`. Do not touch desktop.
- Bug reported on **desktop** → fix only `@media (min-width: 768px)`. Do not touch mobile.
- If a fix could affect the other viewport — split into two separate tasks.
- Text/copy fixes in `.tsx` are viewport-neutral but **do not change any styles** while fixing copy.

---

## Coding rules

- Write small, readable functions with explicit names
- Prefer simple control flow over nested complexity
- Avoid premature abstraction
- Do not add dependencies unless clearly justified
- Do not leave commented-out code

---

## Editing rules

- Change only files relevant to the task
- Do not rename files, move modules, or change public interfaces without need
- Keep diffs reviewable
- If a larger refactor is truly needed, explain why before doing it

---

## Testing and verification

- Add or update tests when logic changes
- Run lint, typecheck, and affected tests after changes
- Never claim something works without verification
- If verification cannot be run, say so explicitly

---

## Bug fixing

- Reproduce the bug first. Identify root cause, not just the visible symptom
- Prefer a failing test before the fix when feasible
- Do not silence errors without understanding them

---

## Frontend rules

- Keep UI consistent with existing dark theme design system (`#0F0F1A` bg, `#6366F1` accent, `#A855F7` / `#EC4899` gradient)
- All user-facing copy must be in Polish — no English strings in UI (except proper nouns: PostujTo, Brand Kit, Starter, Pro, Free, Zernio, Tidio, Magic Import)
- Prioritize accessibility: labels, keyboard support, focus states, semantic HTML
- Avoid unnecessary re-renders and heavy client-side logic
- Always handle loading, empty, and error states

---

## Backend rules

- Validate all inputs at boundaries
- Handle errors explicitly — do not expose internal error messages to end users
- Log useful diagnostic information without leaking secrets
- Protect auth, billing, and user-data paths with extra care
- All Supabase queries must filter by `user_id` — never return data across users

---

## Security

- Treat all external input as untrusted (webhooks, Magic Import URLs, Zernio callbacks)
- Never expose secrets in code, logs, or client responses
- RLS is enabled on all Supabase tables — do not bypass it
- Stripe webhook signature verification is mandatory — never skip it
- Credit decrement must use atomic `decrement_credit()` RPC — never a plain UPDATE

---

## Performance

- Use `Promise.all` for independent async operations
- Batch external API calls — never loop with sequential `await` over large sets
- Batch size for Zernio/Claude calls: max 5 parallel, 1000ms delay between batches (rate limit protection)
- Avoid N+1 patterns in Supabase queries
- Use `select('col1,col2')` instead of `select('*')` in production queries

---

## Streaming (Claude API)

When streaming Claude responses to the frontend:

1. Use `anthropic.messages.stream()` with `stream.on('text', ...)` to pipe chunks to `ReadableStream`
2. **Business logic (credit decrement, DB insert, monitoring) runs in `stream.on('finalMessage', ...)`** — never before the stream ends
3. If Claude returns structured data (JSON), collect full stream server-side with `stream.finalText()`, parse, then return as normal JSON response
4. Frontend uses `getReader()` + `TextDecoder` to consume the stream
5. Always handle stream errors: `stream.on('error', ...)` and frontend `try/catch` around the reader loop

---

## Domain-specific rules for PostujTo

### Critical flows — treat with extra care
`content generation → scheduling → publishing → retries → billing → account permissions`

### Credit system
- Free plan: 5 credits. Starter/Pro: 9999 (firewall, never show credit UI to paid users)
- Always use `decrement_credit()` RPC atomically after successful generation
- Never decrement before Claude responds — decrement in `finalMessage` handler (streaming) or after `messages.create()` returns

### Plans
- Free: 0 zł, 5 credits
- Starter: 97 zł/msc, ~830 zł/rok
- Pro: 247 zł/msc, ~2110 zł/rok
- Pro+: planned, trigger at 20 Pro Annual users, 347 zł/msc

### Content generation
- `buildSystemPrompt()` in `lib/prompts.ts` always prepends Polish language instruction as first line
- Generation hierarchy: Brand Kit (manual) → Brand Kit (imported) → Golden Pattern → Platform format (PAS/AIDA/Hook)
- 3 post versions = 1 Claude call (not 3 parallel calls)
- Plain text format with `---WERSJA---` / `---HASHTAGI---` / `---PROMPT_OBRAZU---` separators (not JSON)
- Parser in `lib/parseGeneratedPosts.ts`

### Brand Kit state management
- Always use `interface BrandKitDB` (separate from UI React state) to isolate DB values from UI defaults
- Completion score must be computed from `dbBrandKit` (DB values), never from React state defaults
- Brand Kit always starts in VIEW mode (`setIsEditing(false)` on mount)

### Publishing (Zernio)
- Publishing is idempotent — never risk duplicate publish
- Save `zernio_post_id` to `generations` table after successful publish
- Analytics sync (likes, reach, etc.) uses `GET /v1/analytics/{POST_ID}` with 60-min cache
- Analytics add-on ($10/msc) must be active in Zernio account before calling analytics endpoints

### Calendar bulk generation
- Batch size: 5 parallel requests to `/api/generate`
- 1000ms delay between batches (`BATCH_DELAY_MS = 1000`)
- Abort on 403 (`abort403` flag) — do not delay if unauthorized
- Skip days that already have generated posts

### Webhooks
- Stripe: `checkout.session.completed` and `invoice.payment_succeeded` have separate handling (first purchase vs renewal)
- Clerk: `user.created` triggers email alert to hello@postujto.com via Resend

### Auditability
Log important actions: publish, retry, connect account, disconnect account, billing state change. Never expose internal errors to end users. Prefer user-safe fallbacks.

---

## Pull request output

Summarize what changed. List files changed. List checks run. List risks or follow-ups.

---

## Skills (load contextually, not globally)

Load the relevant skill file only when the task touches that domain:

| Task domain | Skill file |
|---|---|
| Stripe, billing, plans, credits | `skills/billing.md` |
| Zernio, Facebook, Instagram, TikTok integrations | `skills/social-integrations.md` |
| Calendar scheduler, cron jobs, bulk generation | `skills/publishing-scheduler.md` |
| UI components, design system, mobile/desktop | `skills/ui-system.md` |
| Bug diagnosis, root cause analysis | `skills/debugging.md` |
| Polish copy, UI strings, error messages | `skills/copy-pl.md` |
| Auth, permissions, input validation, webhooks | `skills/security-review.md` |
| API contracts, versioning, backward compatibility | `skills/api-contracts.md` |

Skills are in `skills/` directory. Load only what is needed. Do not load all skills for every task.
