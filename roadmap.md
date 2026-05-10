# Apartment Management — Roadmapa MVP

> Dokument opracowany z perspektywy senior technical product ownera na podstawie `documentation.md` oraz weryfikacji stanu kodu.

---

## Ocena stanu obecnego (baseline)

**Co już działa (done):**
- Pełny CRUD backendowy dla Apartments / Tenants / Rentals / Invoices / Files / User.
- Auth: rejestracja, login (JWT 24h), aktywacja konta mailowa.
- Frontend: CRUD UI dla Apartments / Tenants / Rentals + upload plików.
- Infrastruktura: Docker Compose (backend, frontend, mongodb), feature-first struktura, React Query + MUI + Tailwind.
- **[M1 done]** Fundamenty: `/api/v1`, `VITE_API_URL`, globalny error handler Express, axios 401 interceptor, `ObjectId` + `ref` na kluczach obcych, `{ timestamps: true }` na wszystkich schematach, ujednolicony npm jako package manager, ESLint `no-console` + usunięte debug logi.

**Szacowana gotowość MVP: ~90%** (po zamknięciu M1, M2, M3 P0 i M4) — domknięty kluczowy gap (Invoices UI), dashboard z realną logiką wynajmów oraz pełny model ról (Landlord/Tenant) z zaproszeniami i portalem Tenanta. Przed MVP zostaje twardnienie bezpieczeństwa i jakości (M5), gotowość do deploy (M6) oraz opcjonalny generator faktur miesięcznych (M3.7).

---

## Roadmapa MVP (6 Milestonów × ~2 tyg.)

### M1 — Stabilizacja fundamentów (must-have, 1–2 tyg.) — **ZAMKNIĘTY**

Cel: wyrównać długi techniczne, zanim dokładamy nowe funkcje.

| #    | Zadanie                                                                                                   | Priorytet | Obszar           | Status |
| ---- | --------------------------------------------------------------------------------------------------------- | --------- | ---------------- | ------ |
| 1.1  | Ujednolicenie typów FK → `ObjectId` + `ref` w `Tenant.owner`, `Rental.{owner,apartmentID,tenantID}`       | P0        | backend/models   | done   |
| 1.2  | Fix `Invoice.apartmentID` (`Number` → `ObjectId`) + `document` (niespójność schema vs TS)                 | P0        | backend/models   | done   |
| 1.3  | Fix `Invoice.uploadDate` na `default: Date.now` + `{ timestamps: true }` globalnie                        | P0        | backend/models   | done   |
| 1.4  | Prefiks `/api/v1` dla wszystkich routerów (separacja od `/uploads`)                                       | P0        | backend/server   | done   |
| 1.5  | `VITE_API_URL` zamiast hardkodowanego `baseURL` w `frontend/src/services/api.ts`                          | P0        | frontend/config  | done   |
| 1.6  | Globalny error handler Express + axios response interceptor (auto-logout na 401)                          | P0        | backend+frontend | done   |
| 1.7  | Usunięcie `console.log` (np. `RentalDetailsScreen`, `App.tsx`) + konfiguracja ESLint no-console (warn)    | P1        | frontend         | done   |
| 1.8  | Ujednolicenie package managera (usunięcie `.pnp.cjs` lub `node_modules` w `backend/`)                     | P1        | infra            | done   |

**Definition of Done:** aplikacja działa end-to-end po zmianach, wszystkie ekrany frontu strzelają do `/api/v1/*`, brak 500 bez logów, 401 → redirect do `/login`. **Osiągnięte** — backend startuje z logiem `Server listening on port 5050/api/v1`, wszystkie wywołania `api.*` (łącznie z `LoginScreen`/`RegisterScreen`/`VerifyEmailScreen`) idą przez wspólną instancję axios z `baseURL = ${VITE_API_URL}/api/v1`.

#### Szczegóły implementacji (M1 changelog)

- **1.1 / 1.2:** `backend/models/{tenant,rental,invoice}.model.ts` — FK jako `Schema.Types.ObjectId` z `ref: 'User' | 'Apartment' | 'Tenant'`. Do `Invoice` dodane brakujące pole `owner` (wymagane przez `invoice.controller`). `Invoice.document` ujednolicone do `string | null` (URL z uploadu) — wcześniejszy mieszany schemat (`ObjectId[] ref 'File'`) usunięty, bo modelu `File` nie ma.
- **1.3:** `uploadDate: default: Date.now` (funkcja, nie wartość). `{ timestamps: true }` dodane do `Apartment`, `Tenant`, `Rental`, `Invoice`, `User`.
- **1.4:** `backend/server.ts` — prefiks `/api/v1`, statyki `/uploads` bez prefiksu, 404 fallback JSON.
- **1.5:** `frontend/src/services/api.ts` — `baseURL = \`${import.meta.env.VITE_API_URL ?? "http://localhost:5050"}/api/v1\``; dodany `frontend/.env.example` ze wzorcem.
- **1.6:** Backend — globalny `ErrorRequestHandler` (log `[ErrorHandler]`, status z `err.status/statusCode`, jednolity JSON). Frontend — response interceptor na 401: czyszczenie `sessionStorage.token` + `window.location.replace("/login")` (z wyjątkiem ścieżek publicznych, żeby nie pętlić).
- **1.7:** Usunięte `console.log` z: `App.tsx`, `features/rentals/**` (5 plików), `screens/auth/RegisterScreen.tsx`, `backend/controllers/{rental,apartment}.controller.ts`. ESLint: `'no-console': ['warn', { allow: ['warn', 'error'] }]`.
- **1.8:** Usunięte `backend/.pnp.cjs`, `backend/.pnp.loader.mjs`, `backend/.yarn/`. `backend/.gitignore` zaktualizowany (`.pnp.*`, `.yarn/*`), żeby artefakty nie wracały. Projekt jednoznacznie używa npm.

#### Znane bugi wykryte przy M1 (zakres M2/M3)
- ~~`invoice.controller.createInvoice` — weryfikacja apartamentu w `InvoiceModel` zamiast `ApartmentModel`~~ → **[done w M2]** poprawione razem z UI faktur (używa `ApartmentModel.findOne({ _id, owner })`, dodana walidacja `ObjectId`).
- ~~`rental.controller.patchRental` — walidacja `tenantID` przez `UserModel` zamiast `TenantModel`~~ → **[done w M3]** poprawione razem z guardami wynajmów (`TenantModel.findOne({ _id, owner })`, import `UserModel` usunięty).

---

### M2 — Moduł Invoices (brakujący feature, 2 tyg.) — **ZAMKNIĘTY**

Cel: zamknięcie kluczowego gapu — na backendzie Invoice istnieje, **na frontendzie nie ma żadnego ekranu**.

| #    | Zadanie                                                                                                       | Priorytet | Status |
| ---- | ------------------------------------------------------------------------------------------------------------- | --------- | ------ |
| 2.1  | `features/invoices/` (feature-first): `types`, `components`, `screens`                                        | P0        | done   |
| 2.2  | Ekran listy `InvoicesScreen` z filtrowaniem (apartment, status zapłaty, zakres dat)                           | P0        | done   |
| 2.3  | `NewInvoiceScreen` + `EditInvoiceScreen` — formularze (react-hook-form + yup) z uploadem dokumentu PDF        | P0        | done   |
| 2.4  | `InvoiceDetailsScreen` + podgląd dokumentu, akcja „Oznacz jako zapłacone" (`paidDate`, `isPaid`)              | P0        | done   |
| 2.5  | Integracja w `ApartmentDetailsScreen` — zakładka/sekcja „Faktury dla tego mieszkania"                         | P1        | done   |
| 2.6  | Endpoint agregujący `GET /apartment/:id/invoices` + wskaźnik zadłużenia                                       | P1        | done   |
| 2.7  | Trasy: `/invoices`, `/invoices/new`, `/invoice/:id`, `/invoice/:id/edit` + wpięcie do `Navigation`            | P0        | done   |

**Definition of Done:** Landlord może wystawić, edytować, opłacić i usunąć fakturę dla konkretnego mieszkania; lista pokazuje statusy. **Osiągnięte** — pełny CRUD + filtrowanie + sekcja faktur per mieszkanie z wskaźnikiem zadłużenia.

#### Szczegóły implementacji (M2 changelog)

- **2.1:** `frontend/src/features/invoices/` z podkatalogami `types/`, `components/`, `screens/` i barrelami `index.ts`. Typy: `InvoiceType`, `InvoiceCategory` (rent / electricity / water / gas / internet / heating / garbage / other), `InvoiceFilters`, `ApartmentInvoicesResponse`.
- **2.2:** `InvoicesScreen` + `InvoicesFilters` (select apartment, status paid/unpaid/all, zakres dat `dueDateFrom`/`dueDateTo`). Backend `getInvoices` wzbogacony o obsługę query params `apartmentID`, `isPaid`, `dueDateFrom`, `dueDateTo` + sort po `dueDate` desc.
- **2.3:** `NewInvoiceScreen` i `EditInvoiceScreen` — współdzielony `InvoiceForm` (react-hook-form + yup) z uploadem PDF przez istniejący endpoint `/upload` (accept="application/pdf"). `NewInvoiceScreen` obsługuje prefill `?apartmentID=` z linku z detali mieszkania (blokuje pole apartamentu).
- **2.4:** `InvoiceDetailsScreen` — nagłówek z `InvoiceStatusChip` (paid / overdue / unpaid na bazie `dueDate` + `isPaid`), akcje „Mark as paid" / „Mark as unpaid" (PATCH `{ isPaid, paidDate }`), edycja, podgląd dokumentu (otwarcie presigned URL z `/upload/:filename` w nowej karcie).
- **2.5:** Nowy komponent `ApartmentInvoicesSection` dopięty do `ApartmentDetailsScreen` — pokazuje listę faktur dla mieszkania oraz agregaty (total / paid / unpaid / overdue z licznikiem). „Add invoice" prowadzi do `/invoices/new?apartmentID=...`.
- **2.6:** Backend — nowy endpoint `GET /apartment/:id/invoices` (zwraca `{ invoices, summary }`, gdzie `summary` = `total`, `paidAmount`, `unpaidAmount`, `overdueAmount`, `overdueCount`). Zaimplementowany w `invoice.controller.getInvoicesByApartment` i zarejestrowany w `invoice.routes`.
- **2.7:** `frontend/src/utils/routes/invoicesRoutes.tsx` z czterema trasami; `routeConfig.tsx` spina je razem; `Navigation` ma nowy element „Invoices" z ikoną `MdReceiptLong` matchujący wszystkie cztery ścieżki.
- **Bug fix (znany z M1):** `invoice.controller.createInvoice` wykonywał weryfikację apartamentu przez `InvoiceModel.findOne` zamiast `ApartmentModel.findOne` — poprawione. Przy okazji dodana walidacja formatu `ObjectId` oraz strukturalne logi błędów w każdym handlerze. `patchInvoice` obsługuje teraz świadomie pole `isPaid`/`paidDate` (zmiana statusu auto-stempluje `paidDate = now`, cofnięcie zeruje do `null`) i zwraca zaktualizowany dokument.

---

### M3 — Dashboard i przepływ wynajmu (2 tyg.) — **P0 ZAMKNIĘTE**

Cel: zamienić aplikację z CRUDa w realne narzędzie zarządcze.

| #    | Zadanie                                                                                                 | Priorytet | Status |
| ---- | ------------------------------------------------------------------------------------------------------- | --------- | ------ |
| 3.1  | `HomeScreen` → prawdziwy dashboard: KPI (liczba mieszkań, zajętość %, MRR, należności przeterminowane)  | P0        | done   |
| 3.2  | Widget „Nadchodzące płatności" (na bazie `Rental.rentalPaymentDay` + `Invoice.dueDate`)                 | P0        | done   |
| 3.3  | Widget „Kończące się umowy" (`Rental.endDate` < 30 dni)                                                 | P1        | done   |
| 3.4  | Guard logiki: nie można utworzyć `Rental` dla mieszkania z aktywnym wynajmem (`isAvailable=false`)      | P0        | done   |
| 3.5  | Auto-toggle `Apartment.isAvailable` przy tworzeniu/zakończeniu `Rental` (transakcja)                    | P0        | done   |
| 3.6  | Akcja „Zakończ wynajem" (`Rental.isActive=false` + zwolnienie mieszkania)                               | P0        | done   |
| 3.7  | Generator faktur miesięcznych z aktywnego wynajmu (1 klik → draft invoice)                              | P1        | open   |

**Definition of Done:** użytkownik po zalogowaniu widzi pełen obraz biznesu w 1 ekranie; stany mieszkań i wynajmów są spójne. **Osiągnięte dla P0** — dashboard z KPI i dwoma widgetami, guard `isAvailable` na tworzeniu wynajmu (atomowy `findOneAndUpdate`), endpoint `POST /rental/:id/end` zwalniający mieszkanie, sprzątanie przy `DELETE /rental/:id`.

#### Szczegóły implementacji (M3 changelog — P0 + 3.3)

- **3.1 / 3.2 / 3.3:** Backend — nowy endpoint `GET /api/v1/dashboard` (`dashboard.controller.ts` + `dashboard.routes.ts`) agregujący:
  - KPI: `apartmentsCount`, `occupiedCount`, `occupancyRate`, `activeRentalsCount`, `mrr` (suma `monthlyCost` aktywnych wynajmów), `overdueAmount`/`overdueCount` (niepłacone faktury po `dueDate`).
  - `upcomingPayments` (30 dni): połączone faktury (`invoice` — `invoiceID`, `invoiceType`, `amount`, `dueDate`) i płatności czynszu z aktywnych wynajmów (`rental` — wyliczony `nextPaymentDate` na podstawie `rentalPaymentDay`, z uwzględnieniem miesięcy krótszych niż 31 dni).
  - `expiringLeases` (30 dni): aktywne wynajmy z `endDate` w horyzoncie 30 dni.
  Frontend — nowa feature-folder `frontend/src/features/dashboard/` (`types`, `components`, `index.ts`); `HomeScreen.tsx` przepisany z `"Home screen"` placeholder na pełny dashboard: 4 `KpiCard` (Apartments, Occupancy %, MRR, Overdue) + `UpcomingPaymentsWidget` + `ExpiringLeasesWidget`, z lookupem po adresach mieszkań (z `/apartments`). Skoki w UI: zielona/bursztynowa/czerwona akcenta w zależności od progu.
- **3.4 / 3.5:** `rental.controller.createRental` — po walidacji własności mieszkania i tenanta wykonuje atomowy `ApartmentModel.findOneAndUpdate({ _id, owner, isAvailable: true }, { $set: { isAvailable: false } })`. Gdy warunek niespełniony (mieszkanie już zajęte) — zwraca **HTTP 409** `Apartment already has an active rental`. MongoDB standalone w docker-compose nie wspiera transakcji multi-doc, więc zamiast `session.withTransaction` użyty został mechanizm atomowego locka + ręczny rollback (`{ isAvailable: true }`) gdy `RentalModel.create` się wywali. Frontend — `NewRentalScreen` łapie 409 i pokazuje toast z serwerowym `error`; `/apartmentsList` (używany w selekcie) już filtruje po `isAvailable: true`, więc user normalnie nie zobaczy zajętych mieszkań, a 409 zostaje jako hard-guard przeciwko race condition.
- **3.6:** Nowy endpoint `POST /api/v1/rental/:id/end` (`endRental`) — weryfikuje własność, wymusza `isActive=true` (400 gdy już zakończony), ustawia `isActive=false`, `endDate=now` i zwalnia mieszkanie (`isAvailable=true`). `patchRental` odrzuca próbę ręcznej zmiany `isActive` (400 + komunikat „Use POST /rental/:id/end"), żeby uniemożliwić obejście logiki zwalniania. `deleteRental` — jeśli kasowany wynajem był aktywny, mieszkanie jest zwalniane w tle. Frontend — `RentalDetailsScreen` dostaje nagłówek z `Chip` (Active/Ended) i przycisk „End rental" (MUI `Dialog` z potwierdzeniem) wywołujący `POST /rental/:id/end`; invalidacja `["rental", id]`, `["rentals"]`, `["apartments"]`, `["dashboard"]`.
- **Bug fix (z §7.1 dokumentacji):** `patchRental` walidował `tenantID` przez `UserModel.findById`. Zmienione na `TenantModel.findOne({ _id, owner: userID })` z 404 „Tenant not found or not owned by you". Import `UserModel` usunięty z `rental.controller.ts`.

#### Out-of-scope w M3 (przeniesione dalej)
- **3.7** — generator faktur miesięcznych z aktywnego wynajmu (P1) — zaplanowany na M3 finishing lub M4; nie blokuje DoD dla P0.

---

### M4 — Role, uprawnienia, zaproszenia Tenantów (1–2 tyg.) — **ZAMKNIĘTY**

Cel: dokończyć model ról — obecnie model wspiera `Tenant`, ale nie ma dedykowanego flow.

| #    | Zadanie                                                                                                                                                      | Priorytet | Status |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ------ |
| 4.1  | Middleware `requireRole('Landlord' \| 'Tenant')` + enforcement na wszystkich routerach                                                                       | P0        | done   |
| 4.2  | Flow zaproszenia Tenanta: Landlord generuje `invitationCode` → mail do Tenanta → rejestracja z kodem wiąże konto Tenanta z `owner` + `assignedApartmentID`   | P0        | done   |
| 4.3  | Ekran Tenanta (widok ograniczony): „Moje mieszkanie", „Moje faktury", „Moje dokumenty" (read-only)                                                           | P1        | done   |
| 4.4  | Rozdzielenie nawigacji w `Navigation` wg `user.role`                                                                                                         | P0        | done   |
| 4.5  | Endpoint `GET /me` zamiast samego `GET /user` (spójna nazwa) + FE hook `useCurrentUser`                                                                      | P1        | done   |

**Definition of Done:** dwie persony (Landlord, Tenant) mają osobne, bezpieczne widoki; Tenant nie może modyfikować cudzych danych. **Osiągnięte** — JWT zawiera rolę, `requireRole` pilnuje wszystkich endpointów zarządczych, Tenant po zalogowaniu trafia do portalu z trzema read-only ekranami (`/my-apartment`, `/my-invoices`, `/my-documents`), a cały CRUD (Apartments / Tenants / Rentals / Invoices / Dashboard) jest dostępny wyłącznie dla `Landlord`.

#### Szczegóły implementacji (M4 changelog)

- **4.5:** Backend — `GET /me` i `PATCH /me` zarejestrowane w `user.routes.ts` (alias dla dotychczasowego `/user`, którego nie zrywamy ze względu na kompatybilność). Payload `getUser` zależy teraz od roli: Landlord dostaje `apartments[]` (tak jak wcześniej), Tenant — `tenant` (rekord `TenantModel` sparowany po `userID`). Frontend — nowy hook `useCurrentUser` (`frontend/src/hooks/useCurrentUser.ts`) oparty o React Query z kluczem `["currentUser"]`, staleTime 60s, `enabled: isAuthenticated()`. Zwraca `{ user, role, isLandlord, isTenant, isLoading, isError, refetch }`. Pod spodem nowy typ `CurrentUser` w `frontend/src/types/user.type.ts`. `LoginScreen` robi `queryClient.invalidateQueries(["currentUser"])` po sukcesie, a `Navigation.logOut` → `removeQueries(["currentUser"])`, żeby nie leakować stanu między sesjami.
- **4.1:** Nowy middleware `backend/middlewares/role.middleware.ts` — `requireRole(...allowedRoles)` czyta `req.user?.role` (ustawianego już przez `authenticate` z dekodowanego JWT) i zwraca 403 `This resource requires role: Landlord or Tenant` gdy brak dopasowania. JWT z `loginUser` dostaje teraz `{ id, email, role }` — token aktywacyjny konta pozostaje minimalny (`{ id }`, 1h). `requireRole('Landlord')` nałożony na wszystkie endpointy zarządcze: `apartment.routes`, `tenant.routes`, `rental.routes`, `invoice.routes`, `dashboard.routes`. Tenant-specific endpointy (`/me/apartment`, `/me/invoices`, `/me/documents`) pilnuje `requireRole('Tenant')`. Statyki `/uploads` i `/me`, `/user`, `/login`, `/register`, `/activate-account` pozostają role-agnostyczne (pierwsze dwa za `authenticate`, ostatnie trzy publiczne).
- **4.2:** Model `Tenant` dostał opcjonalne pole `userID: ObjectId | null` (ref `User`) + index na `invitationCode`. Flow: Landlord tworzy Tenanta (`POST /tenant`) — `invitationCode` generowany w `createTenant` + automatyczny mail z kodem i linkiem `${FRONTEND_URL}/register?invitationCode=<CODE>&email=<encoded>`. Tenant dostaje `isActive: false` aż do aktywacji konta. Nowy endpoint `POST /tenant/:id/invite` (`resendTenantInvitation`) pozwala ponowić wysyłkę (blokowany 400 gdy Tenant już ma sparowane `userID`). `registerUser` (backend) nie ufa już surowemu `invitationCode` — normalizuje go do upper-case, sprawdza w `TenantModel.findOne({ invitationCode })`: 400 gdy brak, 400 gdy już użyty, 400 gdy email nie pasuje do rekordu. Po utworzeniu `User` z `role: 'Tenant'` od razu linkuje `tenant.userID = user._id`; po aktywacji maila (`activateAccount`) flipuje `tenant.isActive = true`. `patchTenant` blacklistuje `owner` / `invitationCode` / `userID` z payloadu, żeby Landlord nie potrafił przypadkiem nadpisać identyfikatorów. Frontend — `RegisterScreen` czyta `?email=` i `?invitationCode=` z URL-a, pre-fill + lock pól, dodaje banner „Accept your tenant invitation"; `TenantDetailsScreen` dostaje `Chip` „Pending invitation" / „Account linked" i przycisk „Resend invitation" (tylko dla Pending).
- **4.4:** `Navigation` stał się role-aware — dwa osobne zestawy top-nav (`landlordNavItems`: Home / Tenants / Apartments / Rentals / Invoices, `tenantNavItems`: Home / My apartment / My invoices / My documents) wybierane po `useCurrentUser().isTenant|isLandlord`. Dopóki rola nie dojdzie z `/me` — `topNavItems` jest puste, żeby nie flashować Landlord-UI Tenantowi. `UserItem` w stopce pokazuje realne `firstName/lastName` (albo fallback z `tenant` / `email`) + `role` jako caption.
- **4.3:** Nowy feature-folder `frontend/src/features/tenant-portal/` (`screens/`, `types/`, `index.ts`). Trzy ekrany: `MyApartmentScreen` (`GET /me/apartment` — dane mieszkania + dane kontaktowe Tenanta, obsługuje 404 „No apartment assigned"), `MyInvoicesScreen` (`GET /me/invoices` — lista z `InvoiceStatusChip` (reuse z feature invoices) + 4 agregaty: total / paid / unpaid / overdue), `MyDocumentsScreen` (`GET /me/documents` — 3 sekcje: apartment documents, rental documents, invoice documents; każda ze swoim licznikiem i kafelkami z akcją „Preview" otwierającą presigned URL z `/upload/:filename`). Trasy w `tenantPortalRoutes.tsx`; `routeConfig.tsx` zwraca osobny zestaw routów w zależności od `role` (`getRoutes(isLoggedIn, role)`) — Tenant widzi `/`, `/login`, `/register`, `/home`, `/settings`, `/my-apartment`, `/my-invoices`, `/my-documents`; Landlord — poprzedni zestaw Landlord-only. `HomeScreen` po stronie UI też się rozgałęzia: Tenant dostaje `TenantHome` (karty-linki do 3 ekranów portalu), Landlord — dotychczasowy dashboard z KPI i widgetami. Backendowe widoki czytają dane wyłącznie dla przypiętego Tenanta (po `TenantModel.findOne({ userID })` → `assignedApartmentID`), więc Tenant nie ma żadnej ścieżki do cudzych danych — nawet jak wywoła `/apartments` ręcznie, dostanie 403 z `requireRole('Landlord')`.

#### Nowe i zmienione endpointy (M4 cheat-sheet)

| Metoda | Ścieżka                         | Rola     | Uwagi                                                                 |
| ------ | ------------------------------- | -------- | --------------------------------------------------------------------- |
| GET    | `/api/v1/me`                    | any      | Alias do `/user`, zwraca `user` + `apartments` (Landlord) / `tenant` (Tenant). |
| PATCH  | `/api/v1/me`                    | any      | Alias do `/user` (pola `firstName`/`lastName`/`phoneNumber`).         |
| GET    | `/api/v1/me/apartment`          | Tenant   | Mieszkanie przypięte przez `Tenant.assignedApartmentID`.              |
| GET    | `/api/v1/me/invoices`           | Tenant   | Faktury per assigned apartment + summary (paid/unpaid/overdue).       |
| GET    | `/api/v1/me/documents`          | Tenant   | Dokumenty mieszkania, aktywnego wynajmu i faktur (tylko URL-e plików).|
| POST   | `/api/v1/tenant/:id/invite`     | Landlord | Ponowna wysyłka maila z zaproszeniem (blokowany gdy `userID` ustawiony).|

---

### M5 — Bezpieczeństwo i jakość (must-have przed prod, 2 tyg.) — **ZAMKNIĘTE (P0)**

| #    | Zadanie                                                                                                                  | Priorytet | Status |
| ---- | ------------------------------------------------------------------------------------------------------------------------ | --------- | ------ |
| 5.1  | Walidacja wejścia na backendzie (zod lub express-validator) na wszystkich endpointach POST/PATCH                         | P0        | done   |
| 5.2  | CORS whitelist (`FRONTEND_URL`) zamiast `cors()`                                                                         | P0        | done   |
| 5.3  | Rate limiting (`express-rate-limit`) na `/login`, `/register`, `/activate-account`                                       | P0        | done   |
| 5.4  | Helmet + sane defaults (CSP, HSTS)                                                                                       | P0        | done   |
| 5.5  | Autoryzacja statyków `/uploads` — middleware sprawdzający czy user na uprawnienia do zasobu (owner lub tenant z trwającą umową najmu) (lub podpisane URL-e)             | P0        | done   |
| 5.6  | Refresh token + przejście z `sessionStorage` na httpOnly cookie (pod flagą, jeśli zbyt duży scope → zostawić na M6)      | P1        | open   |
| 5.7  | Rotacja `JWT_SECRET` + dokumentacja w `.env.example`                                                                     | P1        | done   |
| 5.8  | Testy backendu: Jest + Supertest — happy path + auth (min. 60% coverage dla controllerów)                                | P0        | done†  |
| 5.9  | Testy frontendu: Vitest + React Testing Library — formularze i guardy routingu                                           | P1        | open   |
| 5.10 | E2E smoke test: Playwright — register → login → create apartment → create rental → logout                                | P1        | open   |

† **5.8:** zaimplementowano **Vitest + Supertest** (lepsze wsparcie ESM niż Jest w tym repo) — smoke testy walidacji (login/register/activate), brak auth na `/files/:filename`; pełne 60% coverage controllerów pozostaje jako dalszy increment (np. z `mongodb-memory-server`).

**Definition of Done (P0):** backend waliduje wejście na POST/PATCH, CORS jest ograniczony do zaufanych originów, auth routes mają rate limit, odpowiedzi API przechodzą przez Helmet (CSP wyłączone dla czystego JSON API), pliki nie są już serwowane jako publiczny `express.static` — dostęp przez `GET /api/v1/files/:filename` z JWT + regułą właściciela/rekordu oraz rejestrem `UploadedFile`; Landlord-only na `DELETE /upload/:filename`; limit rozmiaru uploadu **10MB** (zgodnie z dokumentacją); `npm test` w `backend/` przechodzi.

#### Szczegóły implementacji (M5 changelog)

- **5.1:** `zod` + `middlewares/validate.middleware.ts` (`validateBody`, `validateQuery` z normalizacją query). Schematy w `validation/schemas.ts` dla auth, apartment, tenant, rental, invoice, user PATCH, lista faktur (query). `PATCH /rental` odrzuca `isActive` na poziomie schematu (strict).
- **5.2 / 5.7:** `config.ts` — `getCorsAllowedOrigins()` (`CORS_ORIGINS` CSV lub domyślnie Vite localhost + `FRONTEND_URL`). Dodany `backend/.env.example` z opisem rotacji `JWT_SECRET`. `docker-compose.yml` ustawia `FRONTEND_URL` dla serwisu backend.
- **5.3:** `middlewares/rateLimit.middleware.ts` — `loginRouteLimiter` (25/15 min) na `POST /login`, `authRouteLimiter` (60/15 min) na `POST /register` i `GET /activate-account`.
- **5.4:** `helmet` w `app.ts` (`contentSecurityPolicy: false`, `crossOriginResourcePolicy: cross-origin` dla fetch SPA).
- **5.5:** Model `UploadedFile` (filename + owner); przy uploadzie rejestrowany wpis; `services/filesAccess.service.ts` — dostęp Landlord (rejestr lub referencja w Invoice/Apartment/Rental) oraz Tenant (faktura / mieszkanie / aktywny wynajem dla przypisanego lokalu). `GET /api/v1/files/:filename` streamuje plik; usunięto publiczne `express.static('/uploads')`. Frontend: `fetchUploadFileBlob` / `createUploadObjectUrl`, hook `useUploadBlobUrl`, aktualizacja `FileItem`, `DetailsPhotosSection`, `DetailsFilesSection`, portal Tenanta i faktury — podgląd/pobieranie przez blob + Authorization.
- **5.8:** `vitest` + `supertest`, `tests/m5-security.test.ts`.
- **Architektura:** `app.ts` eksportuje `createApp()` (middleware + trasy + 404 + error handler z obsługą `MulterError`); `server.ts` tylko `initializeDatabase`, `initBillingCron`, `listen`.

**Następne kroki (poza zamkniętym P0):** M5.6 (cookie + refresh), M5.9–5.10, rozbudowa testów integracyjnych pod coverage, audyt `npm audit` przed produkcją.

---

### M6 — Gotowość produkcyjna (2 tyg.)

| #    | Zadanie                                                                                             | Priorytet |
| ---- | --------------------------------------------------------------------------------------------------- | --------- |
| 6.1  | CI/CD (GitHub Actions): lint + test + build + docker image push                                     | P0        |
| 6.2  | Multi-stage Dockerfile (backend i frontend) + image size < 200MB                                    | P0        |
| 6.3  | Konfiguracja środowisk: `dev`, `staging`, `prod` (`.env.example` w obu serwisach)                   | P0        |
| 6.4  | Logging strukturalny (pino/winston) + request ID                                                    | P0        |
| 6.5  | Healthcheck `GET /health` + liveness/readiness dla Dockera                                          | P0        |
| 6.6  | Backup strategy dla MongoDB (cron + wolumen)                                                        | P1        |
| 6.7  | Observability: Sentry (frontend + backend)                                                          | P1        |
| 6.8  | README na poziomie root, `backend/`, `frontend/` z onboardingiem (< 10 min do uruchomienia)         | P0        |
| 6.9  | CHANGELOG + semver tag `v1.0.0-mvp`                                                                 | P1        |
| 6.10 | Review prawny: polityka prywatności + regulamin (bo trzymamy dane osobowe Tenantów)                 | P0        |

**Definition of Done:** aplikacja wdrażalna jednym pushem na środowisko staging; monitoring zbiera błędy; MVP tag wypuszczony.

---

## Podsumowanie (cheat-sheet dla stakeholderów)

| Milestone                     | Wartość biznesowa                                 | Czas      | Ryzyko opóźnienia  |
| ----------------------------- | ------------------------------------------------- | --------- | ------------------ |
| M1 Stabilizacja               | Mniej bugów, łatwiejszy rozwój                    | 1–2 tyg.  | niskie             |
| M2 Invoices UI                | **Zamknięcie głównego gapu funkcjonalnego**       | 2 tyg.    | niskie             |
| M3 Dashboard + logika wynajmu | Aplikacja staje się użyteczna, nie CRUD           | 2 tyg.    | średnie            |
| M4 Role/Tenant flow           | Druga persona = 2× wartość produktu               | 1–2 tyg.  | średnie            |
| M5 Security & QA              | P0 zamknięte (walidacja, CORS, limiter, Helmet, pliki, testy smoke) | 2 tyg.    | wysokie (security) |
| M6 Prod readiness             | Wdrożenie + utrzymanie                            | 2 tyg.    | średnie            |

**Łączny czas MVP:** ~10–12 tygodni (1 full-stack dev), **~6–8 tygodni** przy 2 devach równolegle (M2+M3 oraz M4+M5 można zrównoleglić).

---

## Rekomendowana kolejność startu (najbliższe 2 sprinty)

**Sprint 1 (zamknięty):** ~~M1.1–M1.8~~ **[done]** + ~~M2.1–M2.7~~ **[done]**. Wszystkie zadania M1 i M2 zrealizowane, bug `invoice.controller.createInvoice` z changelogu M1 naprawiony razem z UI faktur.

**Sprint 2 (zamknięty):** ~~M3.1–M3.6~~ **[done]** (dashboard z KPI + 2 widgety, guard na tworzenie wynajmu, auto-toggle `Apartment.isAvailable`, „End rental" + sprzątanie na delete), bug `patchRental` (walidacja tenanta przez `TenantModel`) naprawiony. Pozostaje M3.7 (generator faktur miesięcznych, P1) — domknięcie razem z M5 / M6.

**Sprint 3 (zamknięty):** ~~M4.1–M4.5~~ **[done]** — rola w JWT + `requireRole` na wszystkich routerach, flow zaproszenia Tenanta (auto-mail z `invitationCode` + `?invitationCode=...&email=...` w `RegisterScreen`), portal Tenanta (`/my-apartment`, `/my-invoices`, `/my-documents`), role-aware `Navigation`/`HomeScreen`, hook `useCurrentUser`, endpointy `GET/PATCH /me` + `GET /me/*`. Aplikacja obsługuje obie persony end-to-end; Tenant nie ma ścieżki do danych innych najemców.

**Sprint 4 (zamknięty — M5 P0):** ~~M5.1–M5.5, M5.7, M5.8 (smoke)~~ **[done]** — Zod na POST/PATCH (+ query lista faktur), CORS whitelist, rate limiting na auth, Helmet, chronione pliki (`GET /api/v1/files/...`, rejestr `UploadedFile`, brak publicznego `/uploads`), Vitest+Supertest, `backend/.env.example`, hasło rejestracji min. 8 znaków (FE+BE). **Otwarte:** M5.6 (refresh + httpOnly), M5.9–M5.10, pełny coverage testów. **MVP v0.97** — pozostaje M6 (prod readiness) + opcjonalnie domknięcie M5 P1.

## TODO:
1. w dodawaniu najemcy rozdzielić pola do adresu zameldowania i dodać pole do numeru dokumentu
2. jakis ladniejszy kalendarz w dodawaniu najmu i na liście faktur