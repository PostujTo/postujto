# Skill: ui-system

Load this skill when the task involves UI components, styling, mobile/desktop layout, or design system consistency.

---

## Rules

### Mobile/desktop isolation — NON-NEGOTIABLE
- Bug on **mobile** → fix only `@media (max-width: 767px)`. Desktop untouched.
- Bug on **desktop** → fix only `@media (min-width: 768px)`. Mobile untouched.
- If fix could affect both → split into two tasks.

### CSS patterns
- Use `overflow-x: clip` (not `hidden`) on html/body — `hidden` creates stacking context and breaks `position: fixed`
- Use `overflow-x: hidden` only on individual sections, never on html/body
- `position: fixed` elements (TopAppBar, BottomNavBar, Tidio) need `z-index` and must not be inside overflow-clipped containers

### Design tokens
- Background: `#0F0F1A`
- Surface/cards: `#1a1a2e`
- Border: `rgba(255,255,255,0.08)`
- Text primary: `#F0F0F5`
- Text secondary: `rgba(255,255,255,0.5)`
- Accent purple: `#6366F1`
- Accent violet: `#A855F7`
- Accent pink: `#EC4899`
- Success green: `#22c55e`
- Warning yellow: `#FBBF24`

### Component rules
- Brand Kit always starts in VIEW mode (`setIsEditing(false)` on mount)
- Use `interface BrandKitDB` to separate DB values from UI state defaults
- Completion score computed from `dbBrandKit`, never from React state defaults
- Mobile nav: BottomNavBar (`position: fixed`, `z-index: 1000`)
- Desktop nav: TopAppBar (`display: none` on mobile via `hidden md:flex`)

### Material Design 3 (mobile)
- Comparison tables → Cards per item, stacked vertically
- Card border-radius: `12px`, full-width on mobile
- Featured card (Pro): `border: 1px solid #6366F1`

## Checklist after UI changes

- [ ] Tested on mobile 375px viewport
- [ ] Tested on desktop 1280px viewport
- [ ] No horizontal scroll on mobile
- [ ] Fixed elements (nav, Tidio) visible and not clipped
- [ ] Polish copy — no English strings in visible UI
- [ ] Loading, empty, and error states handled

## Risks to flag

- overflow change breaking fixed-position navigation
- Desktop regression from mobile-only fix
- Missing Polish translation in new UI strings
