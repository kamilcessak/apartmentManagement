# Dokumentacja Refaktoryzacji UI/UX - ApartmentManagement v0.1

Dokument ten podsumowuje zmiany wprowadzone podczas sesji refaktoryzacji aplikacji z wersji surowej (MVP) do nowoczesnego standardu SaaS. Służy jako baza wiedzy (Design System) dla kolejnych etapów prac.

## 🚀 Tech Stack
- **Framework:** React.js
- **Styling:** Tailwind CSS
- **UI Library:** [shadcn/ui](https://ui.shadcn.com/) (New York style)
- **Iconography:** Lucide React
- **Typography:** Inter (Sans-serif)

## 🎨 Design System

### Kolorystyka (Semantic Colors)
Zastosowano paletę budującą zaufanie i profesjonalizm:
- **Primary (Główny):** Indigo-600 (`#4f46e5`) - przyciski główne, akcenty nawigacji.
- **Success (Sukces/Finanse):** Emerald-600 (`#059669`) - wskaźniki MRR, obłożenie 100%, terminowe płatności.
- **Destructive (Alerty/Zaległości):** Rose-600 (`#e11d48`) - zaległe faktury, kończące się umowy.
- **Background App:** Slate-50 (`#f8fafc`) - chłodne, jasne tło aplikacji.
- **Background Card:** White (`#ffffff`) - czysta biel dla kontenerów treści.
- **Text:** Slate-900 (nagłówki), Slate-500 (teksty pomocnicze).

### Typografia
- **Font główny:** Inter.
- **Zasada:** Wysoki kontrast między nagłówkami (Bold, Slate-900) a opisami (Regular, Slate-500).

## 📝 Wytyczne dla tworzenia i refaktoryzacji widoków

Podczas pracy nad nowymi ekranami (np. Najemcy, Apartamenty, Faktury), bezwzględnie trzymaj się poniższych zasad:

1. **Globalne Tło i Przestrzeń:** Główny kontener aplikacji (poza sidebarem) musi mieć tło `bg-slate-50`. Treść zamykamy w białych kartach (`<Card>`) z delikatnym cieniem (`shadow-sm`) i standardowym paddingiem (`p-6`).
2. **Nagłówki Stron (Page Headers):** Każdy główny widok musi posiadać spójny nagłówek (margin-bottom: `mb-6`). 
   - Lewa strona: Tytuł (`text-2xl font-semibold`) i Podtytuł (`text-sm text-slate-500`).
   - Prawa strona: Główne akcje, np. przycisk "Dodaj".
   - Powrót: Używamy `<Button variant="ghost" size="icon">` z ikoną `ChevronLeft`.
3. **Listy Danych (Data Lists):** Odchodzimy od układu kafelków/kart. Dla zbiorów danych (Mieszkania, Najemcy, Faktury) zawsze używaj komponentu `<Table>`. Listy poprzedzaj paskiem wyszukiwania (`<Input>` z ikoną lupy).
4. **Zasady Formularzy (Forms & Inputs):**
   - **Nigdy** nie używaj placeholderów jako substytutów dla etykiet.
   - Zawsze używaj struktury: `<Label>` NAD polem `<Input>`.
   - Długie formularze grupuj za pomocą CSS Grid (np. 3 krótkie inputy w jednym rzędzie), aby skracać wysokość strony.
   - Przyciski akcji (Zapisz/Anuluj) w formularzach wyrównuj do prawej strony, na samym dole sekcji (`<CardFooter>`).
5. **Statusy i Wskaźniki:** Używaj komponentu `<Badge>` zamiast surowego tekstu do oznaczania stanów. Zastrzegaj kolor zielony (Emerald) tylko dla pozytywnych stanów, a czerwony (Rose) dla zaległości i błędów.
6. **Akcje i Przyciski:** - Główna akcja na stronie (np. Zapisz, Dodaj) = `variant="default"` (kolor Primary - Indigo).
   - Akcje poboczne/powrót = `variant="outline"` lub `ghost`.
   - Ikony akcji w tabelach (edycja, usuwanie) = `variant="ghost" size="icon"`.