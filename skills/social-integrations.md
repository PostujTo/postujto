# Skill: social-integrations

Load this skill when the task involves Zernio, Facebook, Instagram, TikTok, or social account connection/publishing flows.

---

## Rules

- Publishing must be idempotent — never risk duplicate publish
- Always save `zernio_post_id` to `generations` table after successful publish
- Handle Zernio errors explicitly: 401 (token expired), 403 (plan limit), 429 (rate limit), 5xx (provider error)
- OAuth connect/disconnect: always log the action for auditability
- Never store raw access tokens in client-side code or logs
- Zernio Analytics requires add-on ($10/msc) — check before calling analytics endpoints
- Analytics cache: 60 minutes per post on Zernio side — do not poll more frequently

## Zernio endpoints used

- `POST /api/v1/profiles` — create profile per user
- `POST /api/v1/posts` — publish/schedule post
- `GET /api/v1/analytics/{POST_ID}` — post stats (likes, reach, comments, shares)
- `GET /api/v1/analytics/best-time` — best posting hours per platform
- `GET /api/v1/analytics/posting-frequency` — engagement vs frequency data

## Checklist after integration changes

- [ ] Publish is idempotent (no duplicate risk)
- [ ] `zernio_post_id` saved to DB on success
- [ ] All Zernio errors handled explicitly
- [ ] Account connect/disconnect logged
- [ ] Analytics add-on active before calling analytics API

## Risks to flag

- Partial failure mid-publish (published to FB but not IG)
- Token expiry during scheduled publish
- Rate limit during calendar bulk generation
