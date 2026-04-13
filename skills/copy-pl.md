# Skill: copy-pl

Load this skill when the task involves Polish UI copy, error messages, placeholders, labels, toasts, or any user-visible text.

---

## Rules

- All user-visible text must be in Polish
- Claude API system prompts must start with: `ODPOWIADAJ WYŁĄCZNIE PO POLSKU. Każdy wygenerowany post musi być w języku polskim. Nigdy nie używaj angielskiego ani żadnego innego języka, nawet jeśli dane wejściowe są po angielsku.`
- This Polish instruction must be the **first line** of every system prompt — before Brand Kit, Golden Patterns, platform format

### Proper nouns — do NOT translate
PostujTo, Brand Kit, Starter, Pro, Free, Pro+, Zernio, Tidio, Magic Import, Dashboard, Baselinker, Shoper, Allegro

### Common mistranslations to fix
- "Settings" → "Ustawienia"
- "Cancel" → "Anuluj"
- "Save" → "Zapisz"
- "Submit" → "Wyślij" or "Zatwierdź"
- "Error" / "Blad" → "Błąd"
- "znalezc" → "znaleźć"

### Tone
- Direct, friendly, no corporate jargon
- Small-business owner language (fryzjer, restaurator, kosmetyczka)
- Use lowercase "ty" in direct address (consistent with existing style)

## Checklist after copy changes

- [ ] No English words in visible UI (except proper nouns above)
- [ ] All placeholders in Polish
- [ ] All toast/alert messages in Polish
- [ ] All aria-labels in Polish
- [ ] Claude system prompts start with Polish instruction
- [ ] Polish special characters present: ą ę ś ć ó ź ż ń ł

## Risks to flag

- Missing Polish instruction in new Claude endpoints
- English strings in dynamically generated content
