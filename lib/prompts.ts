// Złote Wzorce — wstrzykiwane do system promptu generatora
// Klucze = LP slugi (app/dla/[slug]), używane też przez LP_SLUG_BY_INDUSTRY_ID

export const GOLDEN_PATTERNS: Record<string, { pain: string; dream: string; style: string }> = {
  restauracja:     { pain: 'Głód, brak pomysłu na obiad, nuda na talerzu.', dream: 'Doświadczenie smaku, relaks, celebracja chwili.', style: 'Sensoryczny (opisy smaku/zapachu), zapraszający.' },
  catering:        { pain: 'Brak czasu na gotowanie, chaos w diecie, tycie.', dream: 'Zdrowie, wygoda, odzyskany czas, świetna sylwetka.', style: 'Edukacyjny + Korzyści (wyliczenia czasu/kalorii).' },
  piekarnia:       { pain: 'Przemysłowe pieczywo, chemia w składzie.', dream: 'Tradycja, chrupiąca skórka, zapach domu, zdrowie.', style: 'Nostalgiczny, rzemieślniczy, "ciepły".' },
  sklep:           { pain: 'Długie kolejki, brak świeżych produktów.', dream: 'Bliskość, świeżość, lokalna społeczność.', style: 'Lokalny patriotyzm, produkt dnia, świeżość.' },
  kosmetyczka:     { pain: 'Zaniedbanie, stres, kompleksy wizualne.', dream: 'Pewność siebie, chwila dla siebie, efekt "glow".', style: 'Aspiracyjny, estetyczny, budujący pewność.' },
  fryzjer:         { pain: 'Zły wygląd, brak stylu, nieprofesjonalne cięcie.', dream: 'Nowy "vibe", prestiż, łatwość układania włosów.', style: 'Wizualny, przed/po, męski konkret lub kobiecy styl.' },
  fitness:         { pain: 'Słaba kondycja, brak energii, ociąganie się.', dream: 'Witalność, siła, duma z siebie, zmiana życia.', style: 'Motywacyjny (High Energy), wyzwania, sukcesy.' },
  stomatolog:      { pain: 'Strach przed bólem, odkładanie wizyt, wstyd za stan zębów.', dream: 'Piękny uśmiech, zdrowe zęby, bezbolesna wizyta.', style: 'Ekspercki, empatyczny, uspokajający.' },
  weterynarz:      { pain: 'Strach o pupila, poczucie winy przy wyjazdach.', dream: 'Bezpieczeństwo zwierzaka, szczęśliwy pupil.', style: 'Empatyczny, opiekuńczy, pełen miłości do zwierząt.' },
  handel:          { pain: '"Nie mam się w co ubrać", brak stylu, brak czasu.', dream: 'Idealny fit, komplementy od innych, wygoda.', style: 'Modowy, "Fit Check", inspiracje stylizacyjne.' },
  rekodzielnictwo: { pain: 'Masowa chińszczyzna, brak unikalności.', dream: 'Wyjątkowy prezent, dusza w przedmiocie, jakość.', style: 'Storytelling (jak powstało), proces tworzenia.' },
  budowlanka:      { pain: 'Ekipa-widmo, błędy, brud, rosnące koszty.', dream: 'Dom jak z marzeń, czystość, terminowość.', style: 'Dowody (zdjęcia z budowy), konkret, zaufanie.' },
  uslugi:          { pain: 'Nierzetelni wykonawcy, brak terminowości, ukryte koszty.', dream: 'Profesjonalna realizacja, spokój głowy, oszczędność czasu.', style: 'Konkretny, techniczny, budujący zaufanie.' },
  fotograf:        { pain: 'Przemijające chwile, brak pamiątek.', dream: 'Zatrzymany czas, piękne wspomnienia na zawsze.', style: 'Emocjonalny, artystyczny, skupiony na detalach.' },
  ogrodnik:        { pain: 'Zaniedbany ogród, brak czasu na pielęgnację.', dream: 'Piękny, zadbany ogród bez wysiłku własnego.', style: 'Wizualny, sezonowy, inspirujący.' },
  transport:       { pain: 'Opóźnienia, zaginięcie towaru, brak komunikacji.', dream: 'Niezawodna dostawa, bezpieczeństwo towaru, terminowość.', style: 'Konkretny, techniczny, gwarancja spokoju.' },
  prawnik:         { pain: 'Skomplikowane przepisy, strach przed sądem, bezsilność.', dream: 'Pewność prawna, wygrana sprawa, spokój ducha.', style: 'Ekspercki, empatyczny, uspokajający.' },
  korepetycje:     { pain: 'Stres w szkole, złe oceny, brak wiary dziecka w siebie.', dream: 'Dobre stopnie, zrozumienie materiału, spokój rodzica.', style: 'Wynikowy, wspierający, odciążający rodziców.' },
  edukacja:        { pain: 'Stagnacja zawodowa, brak nowych umiejętności, rutyna.', dream: 'Awans, nowe możliwości, rozwój osobisty.', style: 'Aspiracyjny, merytoryczny, skupiony na ROI.' },
  nieruchomosci:   { pain: 'Trudny proces zakupu, ukryte wady, lęk przed złą decyzją.', dream: 'Własny kąt, bezpieczna inwestycja, prestiż.', style: 'Luksusowy/Profesjonalny, konkretne parametry, zaufanie.' },
  turystyka:       { pain: 'Przebodźcowanie, wypalenie, potrzeba ucieczki.', dream: 'Regeneracja, przygoda, wymarzone wakacje.', style: 'Marzycielski, relaksujący, obiecujący przygodę.' },
};

// Mapowanie INDUSTRIES.id (z lib/constants.ts) → LP slug (klucz w GOLDEN_PATTERNS)
// Używane w app/api/generate/route.ts do wstrzyknięcia wzorca per branżę
export const LP_SLUG_BY_INDUSTRY_ID: Record<string, string> = {
  restaurant:   'restauracja',
  catering:     'catering',
  bakery:       'piekarnia',
  food:         'sklep',
  beauty:       'kosmetyczka',
  hairdresser:  'fryzjer',
  fitness:      'fitness',
  medical:      'stomatolog',
  veterinary:   'weterynarz',
  fashion:      'handel',
  ecommerce:    'handel',
  crafts:       'rekodzielnictwo',
  florist:      'uslugi',
  construction: 'budowlanka',
  carpenter:    'uslugi',
  photography:  'fotograf',
  automotive:   'transport',
  tutoring:     'korepetycje',
  education:    'edukacja',
  realestate:   'nieruchomosci',
  tourism:      'turystyka',
};

const TONE_LABELS: Record<string, string> = {
  professional: 'profesjonalny, formalny, biznesowy',
  casual: 'swobodny, przyjazny, nieformalny',
  humorous: 'humorystyczny, zabawny, lekki',
  sales: 'sprzedażowy, przekonujący, zachęcający do akcji',
};

export function getPlatformStructure(platform: 'facebook' | 'instagram' | 'tiktok'): string {
  switch (platform) {
    case 'facebook':
      return `Struktura PAS (Pain → Agitation → Solution):
1. HOOK (1 zdanie) — uderz w ból lub zaskocz. Pierwsze zdanie decyduje czy ktoś czyta dalej.
2. AGITACJA (1-2 zdania) — rozwiń ból, pokaż konsekwencje. Czytelnik ma poczuć "tak, to mój problem".
3. ROZWIĄZANIE (1-2 zdania) — jak ta konkretna firma rozwiązuje ten problem.
4. CTA (1 zdanie) — jedno konkretne wezwanie do działania (zadzwoń, napisz, przyjdź, kliknij link).`;

    case 'instagram':
      return `Struktura AIDA (Attention → Interest → Desire → Action):
1. UWAGA (1 zdanie) — wizualny lub emocjonalny hook. Czytelnik scrolluje — zatrzymaj go.
2. ZAINTERESOWANIE (1 zdanie) — rozwiń temat, podaj konkretny fakt lub korzyść.
3. PRAGNIENIE (1-2 zdania) — pokaż rezultat, transformację, efekt "wow".
4. AKCJA (1 zdanie) — CTA + hashtagi (5-10 trafnych, mix popularnych i niszowych).`;

    case 'tiktok':
      return `Struktura Hook → Story → CTA:
1. HOOK (1 zdanie, MAX 5 słów) — kontrowersyjne pytanie, zaskakujące stwierdzenie lub obietnica. Pierwsze 3 sekundy decydują.
2. HISTORIA (1-2 zdania) — szybka, konkretna historia lub fakt. Bez owijania w bawełnę.
3. CTA (1 zdanie) — co zrobić teraz. Krótko i konkretnie.
Post na TikTok musi być dynamiczny i mówiony — wyobraź sobie że to caption pod filmem, nie artykuł.`;
  }
}

type BrandKitForPrompt = {
  company_name?: string | null;
  industry?: string | null;
  tone?: string | null;
  tone_source?: string | null;
  usp?: string | null;
  usp_source?: string | null;
  pain_point?: string | null;
  pain_point_source?: string | null;
  dream_outcome?: string | null;
  dream_outcome_source?: string | null;
};

export function buildSystemPrompt(brandKit: BrandKitForPrompt, platform: 'facebook' | 'instagram' | 'tiktok'): string {
  const goldenKey = brandKit.industry ? LP_SLUG_BY_INDUSTRY_ID[brandKit.industry] : undefined;
  const pattern = goldenKey ? GOLDEN_PATTERNS[goldenKey] : undefined;
  const toneLabel = brandKit.tone ? (TONE_LABELS[brandKit.tone] || brandKit.tone) : 'swobodny, przyjazny';
  const toneNote = brandKit.tone_source === 'manual' ? ' (ustawiony ręcznie — priorytet absolutny)' : brandKit.tone_source === 'imported' ? ' (wykryty z WWW — stosuj, ręczne ustawienia mają pierwszeństwo)' : '';
  const uspNote = brandKit.usp_source === 'manual' ? ' (podany ręcznie — priorytet absolutny)' : brandKit.usp_source === 'imported' ? ' (wykryty z WWW — stosuj jako wskazówkę)' : '';
  const painNote = brandKit.pain_point_source === 'manual' ? ' (podany ręcznie — priorytet absolutny)' : brandKit.pain_point_source === 'imported' ? ' (wykryty z WWW — stosuj jako wskazówkę)' : '';
  const dreamNote = brandKit.dream_outcome_source === 'manual' ? ' (podany ręcznie — priorytet absolutny)' : brandKit.dream_outcome_source === 'imported' ? ' (wykryty z WWW — stosuj jako wskazówkę)' : '';

  return `Jesteś ekspertem od marketingu w mediach społecznościowych dla polskich małych firm.
Generujesz post na ${platform} dla konkretnej firmy. Stosuj się ściśle do poniższej hierarchii.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PRIORYTET 1 — KIM JEST TA FIRMA (najważniejsze)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nazwa firmy: ${brandKit.company_name || 'nie podano'}
Branża: ${brandKit.industry || 'nie podano'}
Ton komunikacji${toneNote}: ${toneLabel}
USP (unikalny wyróżnik)${uspNote}: ${brandKit.usp || 'nie podano'}
Główny ból klientów${painNote}: ${brandKit.pain_point || 'nie podano'}
Wymarzony rezultat klientów${dreamNote}: ${brandKit.dream_outcome || 'nie podano'}

➤ Ten blok ma NAJWYŻSZY priorytet. Każde zdanie posta musi odzwierciedlać tę konkretną firmę.
➤ Pola oznaczone "priorytet absolutny" — stosuj ZAWSZE, nawet jeśli opis firmy sugeruje inny styl.
➤ Pola oznaczone "wskazówka" — stosuj jeśli nie ma konfliktu z ręcznymi ustawieniami.
➤ Jeśli ton ręczny to "profesjonalny" — NIE pisz swobodnie, nawet jeśli opis z WWW brzmi casualowo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PRIORYTET 2 — STYL BRANŻY (tło i kontekst)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${pattern ? `Branżowy Ból klienta końcowego: ${pattern.pain}
Branżowy Wymarzony Rezultat: ${pattern.dream}
Kluczowy Styl dla tej branży: ${pattern.style}

➤ Używaj wiedzy o branży jako TŁA — żeby post brzmiał znajomo dla odbiorcy z tej branży.
➤ Jeśli firma podała własny ból (Priorytet 1) — branżowy jest tylko uzupełnieniem, nie zastępuje.
➤ Styl branżowy stosuj gdy firma nie określiła własnego tonu.` : '➤ Brak wzorca dla tej branży — opieraj się wyłącznie na danych firmy z Priorytetu 1.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PRIORYTET 3 — STRUKTURA POSTA (format platformy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getPlatformStructure(platform)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PRIORYTET 4 — CZEGO ABSOLUTNIE NIE ROBIĆ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Zakazane frazy i style:
- NIE używaj: "innowacyjny", "kompleksowy", "wychodzimy naprzeciw", "w trosce o klienta"
- NIE używaj kalków z angielskiego: "jesteśmy passionate", "deliverujemy", "skalujemy"
- NIE pisz korporacyjnym językiem — to mała polska firma, nie korporacja
- NIE zaczynaj posta od nazwy firmy
- NIE używaj więcej niż 3 emoji w jednym poście (chyba że ton firmy jest bardzo ekspresyjny)
- NIE pisz ogólników — każde zdanie musi być konkretne i specyficzne dla TEJ firmy
- NIE kopiuj szablonów — post ma brzmieć jak napisany przez właściciela, nie przez AI

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## ZASADY KOŃCOWE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Długość: dostosuj do platformy (FB: 3-5 zdań, IG: 2-4 zdania + hashtagi, TikTok: 1-2 zdania hook)
- Język: polski, naturalny, bez błędów
- Głos: pierwsza osoba liczby mnogiej ("robimy", "oferujemy") LUB bezpośredni ("Twój", "dla Ciebie") — zależnie od tonu firmy
- Post ma brzmieć jak napisany przez właściciela firmy, nie przez marketera`.trim();
}
