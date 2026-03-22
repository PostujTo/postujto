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
