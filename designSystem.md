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

## 🛠 Zrealizowane Kroki Refaktoryzacji

### Krok 1: Fundamenty
Skonfigurowano Tailwind, zainstalowano shadcn/ui oraz zdefiniowano zmienne CSS dla kolorów semantycznych.

### Krok 2 & 3: Auth Flow (Homepage, Login, Register)
- **Layout:** Przejście z pustych ekranów na wyśrodkowane karty (`Card`).
- **UX:** Dodano przyciski "Wstecz", linki przełączające między logowaniem a rejestracją oraz jasną hierarchię pól formularza (`Label` + `Input`).
- **Styl:** Minimalistyczny, skupiony na konwersji.

### Krok 4: Dashboard
- **Sidebar:** Nowoczesny panel boczny z ikonami Lucide i sekcją profilu użytkownika na dole.
- **Stats Grid:** 4-kolumnowy układ kart z metrykami (Apartments, Occupancy, MRR, Overdue).
- **Lists:** Zastosowanie komponentów `Badge` do oznaczania terminów (np. "in 14 days") oraz `Avatar` dla najemców.

## 📝 Wytyczne dla przyszłych refaktoryzacji

Podczas pracy nad nowymi ekranami (np. Najemcy, Apartamenty, Faktury), trzymaj się poniższych zasad:

1.  **Struktura Karty:** Zawsze używaj `<Card>` z odpowiednim paddingiem (`p-6`).
2.  **Statusy:** Używaj komponentu `<Badge>` zamiast surowego tekstu do oznaczania stanów.
3.  **Akcje:** Główny przycisk na stronie = `variant="default"`. Akcje poboczne/powrót = `variant="outline"` lub `ghost`.
4.  **Tabele:** Dla list danych używaj komponentu `<Table>` z shadcn, dbając o `font-medium` dla kluczowych informacji (np. nazwa najemcy).
5.  **Spójność:** Każda nowa ikona musi pochodzić z biblioteki `lucide-react`.

---