# Skill: debugging

Load this skill when diagnosing bugs, regressions, or unexpected behavior.

---

## Procedure

1. **Reproduce** — confirm the bug exists and identify exact conditions
2. **Isolate** — identify which file/function/line is the root cause
3. **Hypothesize** — form a theory about why it happens
4. **Minimal fix** — change the fewest lines that solve root cause
5. **Regression test** — add or update a test that catches this bug
6. **Risk list** — list what else could break from this fix

## Known PostujTo patterns and their fixes

| Symptom | Root cause | Fix pattern |
|---|---|---|
| `position: fixed` element invisible | `overflow-x: hidden` on parent | Change to `overflow-x: clip` |
| Double navbar on page | Both layout and page.tsx render AppHeader | Remove AppHeader import from page.tsx |
| Brand Kit completion shows 0% on load | Completion computed from React state defaults, not DB | Compute from `dbBrandKit` |
| Posts generated in English | System prompt missing Polish instruction | Prepend Polish instruction as first line |
| Calendar bulk generation takes 8+ minutes | Sequential `for...of` with `await` | Batch 5 with `Promise.all` + 1s delay |
| Turbopack build fails on regex | Literal newline inside regex `/pattern\n/` | Use escape sequence `\n` instead |
| 404 on login click | `<Link href="/sign-in">` instead of Clerk component | Replace with `<SignInButton mode="modal">` |

## Checklist after fix

- [ ] Root cause identified and documented
- [ ] Fix addresses root cause (not just symptom)
- [ ] Regression test added or existing test updated
- [ ] Related flows tested (auth, billing, publishing, generation)
- [ ] Mobile AND desktop tested if UI change
