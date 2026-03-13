// Centralna lista branż — importuj stąd wszędzie
export const INDUSTRIES = [
  { id: 'restaurant',   label: 'Restauracja',              emoji: '🍽️', hint: 'Użyj apetycznych opisów, podkreśl atmosferę i smak, zachęć do rezerwacji lub wizyty. Wspomnij o polskich smakach i lokalnych składnikach.' },
  { id: 'fashion',      label: 'Sklep odzieżowy',           emoji: '👗', hint: 'Podkreśl styl, trendy sezonu, zachęć do przymierzenia i wizyty w sklepie. Używaj modnych polskich określeń.' },
  { id: 'beauty',       label: 'Salon kosmetyczny',         emoji: '💅', hint: 'Podkreśl relaks, profesjonalizm, efekty zabiegu, zachęć do rezerwacji. Nie używaj twierdzeń medycznych.' },
  { id: 'construction', label: 'Budowlanka/remonty',        emoji: '🔨', hint: 'Podkreśl doświadczenie, jakość wykonania, terminowość i solidność ekipy. Wspomnij o gwarancji i bezpłatnej wycenie.' },
  { id: 'ecommerce',    label: 'Sklep internetowy',         emoji: '🛒', hint: 'Podkreśl szybką dostawę, łatwe zwroty, bezpieczne płatności. Zachęć do złożenia zamówienia.' },
  { id: 'fitness',      label: 'Siłownia/fitness',          emoji: '💪', hint: 'Motywuj do działania, podkreśl efekty i atmosferę, zachęć do zapisania się na trening lub karnet.' },
  { id: 'realestate',   label: 'Nieruchomości',             emoji: '🏠', hint: 'Podkreśl lokalizację, standard wykończenia i cenę. Zachęć do kontaktu i bezpłatnego oglądania.' },
  { id: 'medical',      label: 'Przychodnia/zdrowie',       emoji: '🏥', hint: 'Podkreśl profesjonalizm i doświadczenie lekarzy, krótki czas oczekiwania. Nie składaj obietnic medycznych.' },
  { id: 'education',    label: 'Edukacja/kursy',            emoji: '📚', hint: 'Podkreśl certyfikaty, efekty nauki i opinie uczniów. Zachęć do zapisu na bezpłatną lekcję próbną.' },
  { id: 'automotive',   label: 'Motoryzacja',               emoji: '🚗', hint: 'Podkreśl parametry techniczne, stan techniczny i cenę. Zachęć do jazdy próbnej lub kontaktu.' },
  { id: 'tourism',      label: 'Turystyka/hotel',           emoji: '✈️', hint: 'Podkreśl wyjątkowość miejsca, atrakcje i relaks. Zachęć do rezerwacji i podaj dostępne terminy.' },
  { id: 'food',         label: 'Sklep spożywczy',           emoji: '🛍️', hint: 'Podkreśl świeżość, lokalność produktów i atrakcyjne ceny. Zachęć do odwiedzin lub zamówienia online.' },
  { id: 'crafts',       label: 'Rękodzieło',                emoji: '🧶', hint: 'Podkreśl unikalność i ręczne wykonanie każdego produktu. Zachęć do zakupu jako wyjątkowego prezentu lub ozdoby.' },
  { id: 'bakery',       label: 'Piekarnia',                 emoji: '🥐', hint: 'Podkreśl świeżość, tradycyjne receptury i domowy smak. Zachęć do odwiedzin rano lub złożenia zamówienia.' },
  // Nowe (2026-03)
  { id: 'photography',  label: 'Fotografia',                emoji: '📸', hint: 'Podkreśl styl, emocje i technikę. Pokaż przykładowe ujęcia i zachęć do rezerwacji sesji.' },
  { id: 'hairdresser',  label: 'Fryzjer/barber',            emoji: '💈', hint: 'Podkreśl efekty metamorfozy, umiejętności i atmosferę salonu. Zachęć do rezerwacji wizyty.' },
  { id: 'catering',     label: 'Catering/meal prep',        emoji: '🍱', hint: 'Podkreśl świeżość, smak i wygodę. Zachęć do zamówienia i podaj opcje dostawy lub gotowych zestawów.' },
  { id: 'tutoring',     label: 'Korepetycje',               emoji: '📖', hint: 'Podkreśl efekty nauki, doświadczenie i indywidualne podejście. Zachęć do bezpłatnej lekcji próbnej.' },
  { id: 'veterinary',   label: 'Weterynarz/petsitter',      emoji: '🐾', hint: 'Podkreśl troskę o zwierzęta, profesjonalizm i dostępność. Zachęć do umówienia wizyty lub spaceru.' },
  { id: 'florist',      label: 'Kwiaciarnia',               emoji: '💐', hint: 'Podkreśl piękno kompozycji i świeżość kwiatów. Zachęć do zamówienia na okazje i prezenty.' },
  { id: 'carpenter',    label: 'Stolarz/meble na wymiar',   emoji: '🪵', hint: 'Podkreśl jakość drewna, precyzję wykonania i niepowtarzalność. Zachęć do bezpłatnej wyceny i pomiarów.' },
] as const;

export type IndustryId = typeof INDUSTRIES[number]['id'];
