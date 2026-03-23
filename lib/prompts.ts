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

export const FEW_SHOT_EXAMPLES: Record<string, { platform: string; topic: string; post: string; }[]> = {
  restaurant: [
    { platform: 'facebook', topic: 'promocja weekendowa', post: 'Ten weekend pachnie wyjątkowo \u{1F37D}\uFE0F Nasze risotto z truflami wraca na menu — tylko w piątek i sobotę. Rezerwacje już otwarte, stoliki znikają szybko. Zadzwoń lub napisz w wiadomości!' },
    { platform: 'instagram', topic: 'nowe danie', post: 'Nowy bohater karty \u2728 Dorsz w skorupce z pistacji, purée z pieczonego czosnku, sos z wędzonej papryki. Każdy element ma swoje zadanie. Dostępny od dziś. #restauracja #nowedanie #foodie #kraków' },
  ],
  catering: [
    { platform: 'facebook', topic: 'oszczędność czasu', post: 'Policzyłaś kiedyś ile godzin tygodniowo spędzasz na gotowaniu? \u{1F550} Nasze klientki mówią: średnio 6-8 godzin. My dowozimy zdrowe, zbilansowane posiłki pod drzwi — i te godziny wracają do Ciebie. Sprawdź menu na ten tydzień!' },
    { platform: 'instagram', topic: 'jakość składników', post: 'Wiemy skąd pochodzi każdy składnik \u{1F957} Warzywa od Pana Marka z Grójca, mięso z lokalnej rzeźni, jajka od szczęśliwych kur. Bo to co jesz, ma znaczenie. Menu w linku w bio. #catering #zdrowejedzenie #lokalnie' },
  ],
  bakery: [
    { platform: 'facebook', topic: 'rzemiosło', post: 'O 3:00 w nocy zaczyna się magia \u{1F950} Nasz piekarz wstaje wtedy, żebyś Ty o 7:00 miał świeży chleb na zakwasie. Bez konserwantów, bez ulepszaczy — tylko mąka, woda, sól i 30 lat doświadczenia. Zapraszamy od 6:00!' },
    { platform: 'instagram', topic: 'świeżość', post: 'Właśnie wyszło z pieca \u{1F33E} Ta skórka chrupie tak, że słyszysz to przez telefon. Biegniemy po nowe bochenki — ilości ograniczone! #piekarnia #chlebnazakwasie #rzemiosło #świeży' },
  ],
  food: [
    { platform: 'facebook', topic: 'lokalne produkty', post: 'Dziś rano przyjechały truskawki od Pana Józefa z Sandomierza \u{1F353} Takich truskawek nie znajdziesz w żadnym markecie — soczyste, słodkie, pachnące latem. Ilości ograniczone, zapraszamy!' },
    { platform: 'instagram', topic: 'ekipa', post: 'Znasz nas z imienia, my znamy Ciebie \u{1F6D2} Marta, Kasia i Tomek — tu od 15 lat. Bo sklep to nie tylko zakupy, to sąsiedztwo. Zapraszamy! #sklep #lokalnie #sąsiedztwo' },
  ],
  beauty: [
    { platform: 'facebook', topic: 'zabieg', post: 'Twoja skóra po zimie woła o pomoc? \u{1F485} Rozumiemy to. Nasz zabieg rewitalizujący przywraca blask w 60 minut — efekty widoczne od razu. Ostatnie wolne terminy w tym tygodniu, pisz!' },
    { platform: 'instagram', topic: 'metamorfoza', post: 'Przed → Po \u2728 90 minut u nas i skóra wygląda jakbyś miała 5 lat mniej. Nie przesadzamy — zobaczcie. Link w bio. #kosmetyczka #metamorfoza #pielęgnacja #glow' },
  ],
  hairdresser: [
    { platform: 'facebook', topic: 'metamorfoza', post: 'Przyszła z "chcę zmianę, ale nie wiem jaką" \u{1F487}\u200D\u2640\uFE0F Wyszła z fryzurą życia. Każda metamorfoza zaczyna się od rozmowy — powiedz nam co czujesz, my zaproponujemy resztę. Wolne terminy w środę i czwartek!' },
    { platform: 'instagram', topic: 'porady', post: 'Twoje włosy się puszą po każdym myciu? \u2702\uFE0F Rób to: po nałożeniu odżywki nie spłukuj od razu — zostaw 3 minuty. Różnica jest niesamowita. Więcej rad w stories. #fryzjer #włosy #haircare #porady' },
  ],
  fitness: [
    { platform: 'facebook', topic: 'motywacja', post: 'Marek przyszedł do nas 4 miesiące temu. Nie mógł zrobić 10 pompek. Wczoraj zrobił 50 \u{1F4AA} Nie ma magii — jest systematyczna praca i dobry trener. Twoja historia może zacząć się w poniedziałek. Pierwszy trening gratis!' },
    { platform: 'instagram', topic: 'zajęcia grupowe', post: 'Energia naszych zajęć grupowych \u26A1 To trzeba poczuć, nie da się opisać. We wtorek i czwartek o 18:00 — zostało 5 miejsc. Zapisz się przez link w bio. #fitness #grupowe #siłownia #trening' },
  ],
  medical: [
    { platform: 'facebook', topic: 'brak strachu', post: 'Wiem, że się boisz. Większość naszych pacjentów przyznaje, że odkładała wizytę latami \u{1FAB7} U nas znieczulenie miejscowe sprawia, że nie czujesz nic. Serio — nic. Umów się na konsultację, to się przekonasz. Pierwsze 15 minut gratis!' },
    { platform: 'instagram', topic: 'efekty', post: 'Przed → Po \u{1F601} Wybielanie w gabinecie — efekty widoczne od razu po pierwszej sesji. Pytania? Napisz do nas. Link w bio. #stomatolog #wybielanie #uśmiech #zęby' },
  ],
  veterinary: [
    { platform: 'facebook', topic: 'profilaktyka', post: 'Twój pies nie powie Ci, że go boli \u{1F43E} Ale może Ci to pokazać: liże łapy, jest mniej aktywny, unika jedzenia. Profilaktyczna wizyta raz na 6 miesięcy pozwala wykryć problemy zanim staną się poważne. Umów się!' },
    { platform: 'instagram', topic: 'kulisy', post: 'Dzisiejsi pacjenci \u{1F415} Burek na kontroli po operacji — wraca do zdrowia idealnie. Misia na pierwszej wizycie — odważna jak lwica. Każdy dzień tu jest inny i wyjątkowy. #weterynarz #zwierzęta #opieka' },
  ],
  fashion: [
    { platform: 'facebook', topic: 'nowość', post: 'Właśnie dostaliśmy nową kolekcję i już wiemy, że zostanie krótko \u{1F6CD}\uFE0F Te sukienki w tym sezonie są wszędzie — my mamy je jako jedni z pierwszych w mieście. Wpadnij lub napisz co Cię interesuje, rezerwujemy bez przedpłaty!' },
    { platform: 'instagram', topic: 'stylizacja', post: 'Outfit na każdą okazję \u2728 Od biura do kolacji — w 5 minut. Szczegóły w stories. #moda #styl #nowakolekcja #ootd' },
  ],
  ecommerce: [
    { platform: 'facebook', topic: 'szybka dostawa', post: 'Zamówione dziś — dostarczone jutro \u{1F4E6} Żadnego czekania tygodniami. Mamy to na stanie, wysyłka w 24h, śledzenie w czasie rzeczywistym. Sprawdź ofertę i zamów teraz — darmowa dostawa od 150 zł!' },
    { platform: 'instagram', topic: 'nowości w sklepie', post: 'Właśnie dodaliśmy 12 nowych produktów \u2728 Swipe żeby zobaczyć co nowego. Wszystko dostępne online, wysyłka błyskawiczna. Link w bio. #sklep #zakupy #nowości #ecommerce' },
  ],
  crafts: [
    { platform: 'facebook', topic: 'proces', post: 'Ten koszyk powstawał 3 dni \u{1F9F6} Każdy splot ręcznie, każdy węzeł z uwagą. Nie ma dwóch takich samych — to właśnie jest jego wartość. Zamówienia przez wiadomość, czas realizacji 2 tygodnie!' },
    { platform: 'instagram', topic: 'unikalność', post: 'Zza kulis \u{1FAA1} Tak powstaje każdy produkt który wysyłam. Godziny pracy, zero masowej produkcji, 100% serce. Dostępne w linku w bio. #rękodzieło #handmade #rzemiosło #unikat' },
  ],
  florist: [
    { platform: 'facebook', topic: 'przemiana', post: 'Właściciel tego ogrodu mówił, że "tu już nic nie da się zrobić" \u{1F33F} My w to nie wierzymy. Jeden dzień pracy naszej ekipy — zobaczcie efekt. Terminy wiosenne szybko się zapełniają, pisz!' },
    { platform: 'instagram', topic: 'sezon', post: 'Wiosna już puka do drzwi \u{1F331} Czas na pierwszy przegląd — wycinamy, sadzimy, planujemy. Nasze ekipy ruszają w marcu. Zostało kilka terminów. Link w bio. #ogrodnik #ogród #wiosna #kwiaty' },
  ],
  construction: [
    { platform: 'facebook', topic: 'realizacja', post: 'Remont zakończony w terminie \u2705 3 tygodnie, łazienka od A do Z, zero niespodzianek w budżecie. Tak wygląda nasza praca. Terminy na kwiecień i maj jeszcze dostępne — zapytaj o wycenę!' },
    { platform: 'instagram', topic: 'przed/po', post: 'Przed → Po \u{1F3D7}\uFE0F Stara łazienka z 2003 roku vs to samo miejsce dziś. 18 dni roboczych. Efekt mówi sam za siebie. #remont #budowlanka #metamorfoza #wnętrza' },
  ],
  carpenter: [
    { platform: 'facebook', topic: 'szybkość', post: 'Zgłoszenie o 8:15, rozwiązanie o 11:30 \u2705 Pan Krzysztof miał problem z instalacją. Przyjechaliśmy, naprawiliśmy, posprzątaliśmy. Tak wygląda rzetelna usługa. Wolne terminy w tym tygodniu!' },
    { platform: 'instagram', topic: 'zaufanie', post: 'Solidna robota, zawsze \u{1F527} Po nas zostaje tylko efekt — nie bałagan. Realizacje w galerii, kontakt przez link w bio. #usługi #fachowiec #solidnie #rzemiosło' },
  ],
  photography: [
    { platform: 'facebook', topic: 'wspomnienia', post: 'Za 10 lat nie będziesz pamiętał jak wyglądało catering ani kwiaty \u{1F4F8} Ale będziesz wracał do tych zdjęć. Właśnie dlatego warto zainwestować w dobrego fotografa. Ostatnie wolne terminy na czerwiec!' },
    { platform: 'instagram', topic: 'kulisy', post: 'Złota godzina, dziki ogród, szczęśliwa para \u2728 To jest właśnie to co kocham w tej pracy — każda sesja jest inna. Nowe portfolio na stronie, link w bio. #fotograf #sesja #fotografia' },
  ],
  automotive: [
    { platform: 'facebook', topic: 'terminowość', post: 'Trasa Kraków–Hamburg, 1200 km, dostawa na czas \u2705 Klient czekał na maszynę produkcyjną od 2 tygodni. Załadunek w poniedziałek rano, dostawa we wtorek po południu. Bo terminowość to nie przypadek — to nasz standard. Zapytaj o wycenę!' },
    { platform: 'instagram', topic: 'bezpieczeństwo', post: 'Każda przesyłka pod kontrolą \u{1F69B} GPS, ubezpieczenie cargo, stały kontakt przez całą trasę. Twój towar jest bezpieczny — możesz spać spokojnie. Kontakt przez link w bio. #transport #spedycja #logistyka' },
  ],
  tutoring: [
    { platform: 'facebook', topic: 'wyniki', post: 'Zuzia miała 2 z matematyki na koniec klasy 7. Dziś, 4 miesiące później, dostała 5 na sprawdzianie \u{1F4DA} Mama napisała: "W końcu nie boi się matematyki". To jest właśnie po to co robię. Wolne miejsca na wrzesień — zapisz dziecko już teraz!' },
    { platform: 'instagram', topic: 'metoda', post: 'Matematyka to nie talent — to umiejętność \u270F\uFE0F Każdy może ją opanować przy odpowiednim podejściu. Sprawdź jak pracujemy — link w bio. #korepetycje #matematyka #nauka #edukacja' },
  ],
  education: [
    { platform: 'facebook', topic: 'wyniki absolwentów', post: 'Piotr 3 miesiące po naszym kursie dostał awans i 35% podwyżki \u{1F393} Powiedział: "W końcu rozumiałem o czym mówię na spotkaniach". To jest właśnie cel tego kursu. Kolejna edycja startuje za 2 tygodnie — 8 miejsc zostało!' },
    { platform: 'instagram', topic: 'zajawka treści', post: 'Zajawka z modułu 3 \u{1F4D6} 5 minut które zmienią jak myślisz o negocjacjach. Pełny kurs w linku w bio. #kursy #szkolenia #rozwój #edukacja' },
  ],
  realestate: [
    { platform: 'facebook', topic: 'szybka sprzedaż', post: 'Sprzedane w 9 dni \u{1F3E0} Mieszkanie, które stało 3 miesiące u poprzedniego agenta. Co zrobiliśmy inaczej? Prawdziwa wycena, home staging za 800 zł, 23 zdjęcia zamiast 5. Chcesz sprzedać szybko i dobrze? Napisz!' },
    { platform: 'instagram', topic: 'oferta', post: 'Widok z balkonu o poranku \u2600\uFE0F 3 pokoje, 68m\u00B2, Kraków Ruczaj. Szczegóły w linku w bio. #nieruchomości #mieszkanie #kraków #sprzedaż' },
  ],
  tourism: [
    { platform: 'facebook', topic: 'ucieczka', post: 'Kiedy ostatnio naprawdę odpoczęłeś? \u{1F304} Nie przeglądanie telefonu na kanapie — prawdziwy reset, bez powiadomień, bez maili. Mamy 3 wolne weekendy w kwietniu. Napisz zanim ktoś je zajmie!' },
    { platform: 'instagram', topic: 'klimat', post: 'Śniadanie z tym widokiem każdego ranka \u2728 Rezerwacje na maj i czerwiec w linku w bio. #hotel #wakacje #góry #wypoczynek' },
  ],
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
  biggest_pain?: string | null;
  unique_mechanism?: string | null;
};

export function buildSystemPrompt(brandKit: BrandKitForPrompt, platform: 'facebook' | 'instagram' | 'tiktok', feedbackHint?: string): string {
  const goldenKey = brandKit.industry ? LP_SLUG_BY_INDUSTRY_ID[brandKit.industry] : undefined;
  const pattern = goldenKey ? GOLDEN_PATTERNS[goldenKey] : undefined;
  const toneLabel = brandKit.tone ? (TONE_LABELS[brandKit.tone] || brandKit.tone) : 'swobodny, przyjazny';
  const toneNote = brandKit.tone_source === 'manual' ? ' (ustawiony ręcznie — priorytet absolutny)' : brandKit.tone_source === 'imported' ? ' (wykryty z WWW — stosuj, ręczne ustawienia mają pierwszeństwo)' : '';
  const uspNote = brandKit.usp_source === 'manual' ? ' (podany ręcznie — priorytet absolutny)' : brandKit.usp_source === 'imported' ? ' (wykryty z WWW — stosuj jako wskazówkę)' : '';
  const painNote = brandKit.pain_point_source === 'manual' ? ' (podany ręcznie — priorytet absolutny)' : brandKit.pain_point_source === 'imported' ? ' (wykryty z WWW — stosuj jako wskazówkę)' : '';
  const dreamNote = brandKit.dream_outcome_source === 'manual' ? ' (podany ręcznie — priorytet absolutny)' : brandKit.dream_outcome_source === 'imported' ? ' (wykryty z WWW — stosuj jako wskazówkę)' : '';

  const examples = FEW_SHOT_EXAMPLES[brandKit.industry || ''];
  const fewShotSection = examples
    ? '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n## PRIORYTET 2b — WZORCOWE POSTY (Few-Shot)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOto przykłady dobrych postów dla tej branży. Naśladuj ich styl, ton i strukturę — ale NIE kopiuj treści:\n\n'
      + examples.map(ex => '[' + ex.platform.toUpperCase() + '] Temat: ' + ex.topic + '\n"' + ex.post + '"').join('\n\n')
      + '\n\n➤ Ucz się z tych przykładów: ich długości, tonu, struktury zdań, użycia emoji.\n➤ NIE kopiuj tematów — generujesz post o INNYM temacie, ale w PODOBNYM stylu.\n'
    : '';

  const hormoziSection = (brandKit.biggest_pain || brandKit.unique_mechanism) ? [
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '## Głębszy kontekst firmy (Grand Slam)',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    brandKit.biggest_pain ? 'Największy Strach klienta przed zakupem: ' + brandKit.biggest_pain : '',
    brandKit.unique_mechanism ? 'Unikalny Mechanizm tej firmy: ' + brandKit.unique_mechanism : '',
    '',
    '➤ Strach klienta to najsilniejszy hook dla postów sprzedażowych — zacznij od niego.',
    '➤ Unikalny Mechanizm to dowód wiarygodności — używaj go jako odróżnienia od konkurencji.',
  ].filter(Boolean).join('\n') : '';

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
${hormoziSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PRIORYTET 2 — STYL BRANŻY (tło i kontekst)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${pattern ? `Branżowy Ból klienta końcowego: ${pattern.pain}
Branżowy Wymarzony Rezultat: ${pattern.dream}
Kluczowy Styl dla tej branży: ${pattern.style}

➤ Używaj wiedzy o branży jako TŁA — żeby post brzmiał znajomo dla odbiorcy z tej branży.
➤ Jeśli firma podała własny ból (Priorytet 1) — branżowy jest tylko uzupełnieniem, nie zastępuje.
➤ Styl branżowy stosuj gdy firma nie określiła własnego tonu.` : '➤ Brak wzorca dla tej branży — opieraj się wyłącznie na danych firmy z Priorytetu 1.'}

${fewShotSection}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## PRIORYTET 3 — STRUKTURA POSTA (format platformy)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getPlatformStructure(platform)}
${feedbackHint || ''}
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
