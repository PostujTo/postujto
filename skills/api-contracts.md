# Skill: api-contracts

Load this skill when the task involves API endpoint changes, new routes, or changes to request/response shapes.

---

## Rules

- Preserve backward compatibility — do not change existing response shapes without versioning
- Validate request body at the top of every route handler
- Return consistent error shapes: `{ error: string, code?: string }`
- Never return stack traces or internal error details to clients
- New endpoints must follow existing naming conventions (`/api/[resource]/[action]`)

## PostujTo API conventions

- Auth: Clerk session validated via middleware on all `/app/*` routes
- User ID: always from session, never from request body
- Supabase calls: always with `user_id` filter
- Streaming endpoints: `Content-Type: text/plain; charset=utf-8`, `Transfer-Encoding: chunked`
- Cron endpoints: verify `CRON_SECRET` header before processing

## Checklist after API changes

- [ ] Request body validated
- [ ] `user_id` from session, not from client
- [ ] Error response is user-safe (no internal details)
- [ ] Backward compatible (existing clients unaffected)
- [ ] Cron endpoints protected with secret

## Risks to flag

- Breaking change to response shape used by frontend
- Missing auth check on new endpoint
- Accepting `user_id` from client body (privilege escalation)
