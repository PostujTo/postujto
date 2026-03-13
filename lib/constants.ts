// Centralna lista branż — importuj stąd wszędzie
export const INDUSTRIES = [
  // Gastronomia
  { id: 'restaurant',   label: 'Restauracja',              emoji: '🍽️', group: 'Gastronomia',               hint: 'Użyj apetycznych opisów, podkreśl atmosferę i smak, zachęć do rezerwacji lub wizyty. Wspomnij o polskich smakach i lokalnych składnikach.' },
  { id: 'catering',     label: 'Catering/meal prep',        emoji: '🍱', group: 'Gastronomia',               hint: 'Podkreśl świeżość, smak i wygodę. Zachęć do zamówienia i podaj opcje dostawy lub gotowych zestawów.' },
  { id: 'bakery',       label: 'Piekarnia',                 emoji: '🥐', group: 'Gastronomia',               hint: 'Podkreśl świeżość, tradycyjne receptury i domowy smak. Zachęć do odwiedzin rano lub złożenia zamówienia.' },
  { id: 'food',         label: 'Sklep spożywczy',           emoji: '🛍️', group: 'Gastronomia',               hint: 'Podkreśl świeżość, lokalność produktów i atrakcyjne ceny. Zachęć do odwiedzin lub zamówienia online.' },
  // Uroda i zdrowie
  { id: 'beauty',       label: 'Salon kosmetyczny',         emoji: '💅', group: 'Uroda i zdrowie',           hint: 'Podkreśl relaks, profesjonalizm, efekty zabiegu, zachęć do rezerwacji. Nie używaj twierdzeń medycznych.' },
  { id: 'hairdresser',  label: 'Fryzjer/barber',            emoji: '💈', group: 'Uroda i zdrowie',           hint: 'Podkreśl efekty metamorfozy, umiejętności i atmosferę salonu. Zachęć do rezerwacji wizyty.' },
  { id: 'fitness',      label: 'Siłownia/fitness',          emoji: '💪', group: 'Uroda i zdrowie',           hint: 'Motywuj do działania, podkreśl efekty i atmosferę, zachęć do zapisania się na trening lub karnet.' },
  { id: 'medical',      label: 'Przychodnia/zdrowie',       emoji: '🏥', group: 'Uroda i zdrowie',           hint: 'Podkreśl profesjonalizm i doświadczenie lekarzy, krótki czas oczekiwania. Nie składaj obietnic medycznych.' },
  { id: 'veterinary',   label: 'Weterynarz/petsitter',      emoji: '🐾', group: 'Uroda i zdrowie',           hint: 'Podkreśl troskę o zwierzęta, profesjonalizm i dostępność. Zachęć do umówienia wizyty lub spaceru.' },
  // Handel
  { id: 'fashion',      label: 'Sklep odzieżowy',           emoji: '👗', group: 'Handel',                    hint: 'Podkreśl styl, trendy sezonu, zachęć do przymierzenia i wizyty w sklepie. Używaj modnych polskich określeń.' },
  { id: 'ecommerce',    label: 'Sklep internetowy',         emoji: '🛒', group: 'Handel',                    hint: 'Podkreśl szybką dostawę, łatwe zwroty, bezpieczne płatności. Zachęć do złożenia zamówienia.' },
  { id: 'crafts',       label: 'Rękodzieło',                emoji: '🧶', group: 'Handel',                    hint: 'Podkreśl unikalność i ręczne wykonanie każdego produktu. Zachęć do zakupu jako wyjątkowego prezentu lub ozdoby.' },
  { id: 'florist',      label: 'Kwiaciarnia',               emoji: '💐', group: 'Handel',                    hint: 'Podkreśl piękno kompozycji i świeżość kwiatów. Zachęć do zamówienia na okazje i prezenty.' },
  // Usługi i rzemiosło
  { id: 'construction', label: 'Budowlanka/remonty',        emoji: '🔨', group: 'Usługi i rzemiosło',        hint: 'Podkreśl doświadczenie, jakość wykonania, terminowość i solidność ekipy. Wspomnij o gwarancji i bezpłatnej wycenie.' },
  { id: 'carpenter',    label: 'Stolarz/meble na wymiar',   emoji: '🪵', group: 'Usługi i rzemiosło',        hint: 'Podkreśl jakość drewna, precyzję wykonania i niepowtarzalność. Zachęć do bezpłatnej wyceny i pomiarów.' },
  { id: 'photography',  label: 'Fotografia',                emoji: '📸', group: 'Usługi i rzemiosło',        hint: 'Podkreśl styl, emocje i technikę. Pokaż przykładowe ujęcia i zachęć do rezerwacji sesji.' },
  { id: 'automotive',   label: 'Motoryzacja',               emoji: '🚗', group: 'Usługi i rzemiosło',        hint: 'Podkreśl parametry techniczne, stan techniczny i cenę. Zachęć do jazdy próbnej lub kontaktu.' },
  // Edukacja i biznes
  { id: 'tutoring',     label: 'Korepetycje',               emoji: '📖', group: 'Edukacja i biznes',         hint: 'Podkreśl efekty nauki, doświadczenie i indywidualne podejście. Zachęć do bezpłatnej lekcji próbnej.' },
  { id: 'education',    label: 'Edukacja/kursy',            emoji: '📚', group: 'Edukacja i biznes',         hint: 'Podkreśl certyfikaty, efekty nauki i opinie uczniów. Zachęć do zapisu na bezpłatną lekcję próbną.' },
  // Nieruchomości i turystyka
  { id: 'realestate',   label: 'Nieruchomości',             emoji: '🏠', group: 'Nieruchomości i turystyka', hint: 'Podkreśl lokalizację, standard wykończenia i cenę. Zachęć do kontaktu i bezpłatnego oglądania.' },
  { id: 'tourism',      label: 'Turystyka/hotel',           emoji: '✈️', group: 'Nieruchomości i turystyka', hint: 'Podkreśl wyjątkowość miejsca, atrakcje i relaks. Zachęć do rezerwacji i podaj dostępne terminy.' },
] as const;

export const INDUSTRY_GROUPS = [
  'Gastronomia',
  'Uroda i zdrowie',
  'Handel',
  'Usługi i rzemiosło',
  'Edukacja i biznes',
  'Nieruchomości i turystyka',
] as const;

export type IndustryId = typeof INDUSTRIES[number]['id'];
