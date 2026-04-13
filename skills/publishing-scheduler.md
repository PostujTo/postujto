# Skill: publishing-scheduler

Load this skill when the task involves calendar bulk generation, cron jobs, background jobs, or scheduled publishing.

---

## Rules

- Bulk generation batch size: **5 parallel requests**, `BATCH_DELAY_MS = 1000` between batches
- Abort immediately on 403 (`abort403` flag) — do not continue if unauthorized
- Skip days that already have generated posts — never overwrite existing content
- Cron jobs must be idempotent — safe to run multiple times without side effects
- Background jobs: always handle partial failure (try/catch per item in batch)
- Never use sequential `for...of` with `await` for large sets — always batch with `Promise.all`

## Current crons (vercel.json)

- `0 10 * * *` — daily reminder email (5 days inactivity)
- `0 7 * * *` — AI Trend Advisor (RSS → Claude → Pro user email)
- `0 8 * * *` — Zernio stats sync (all users with Zernio connected)

## Checklist after scheduler changes

- [ ] Cron is idempotent
- [ ] Batch size respects rate limits (max 5 parallel for Claude/Zernio)
- [ ] Partial failure handled per-item (not whole batch)
- [ ] Existing posts not overwritten
- [ ] vercel.json updated if new cron added

## Risks to flag

- Duplicate publish from concurrent cron runs
- Missing abort condition causes infinite retry
- Calendar bulk overwriting user-curated posts
