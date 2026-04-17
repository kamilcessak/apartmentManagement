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

**Szacowana gotowość MVP: ~80%** (po zamknięciu M1 i M2) — domknięty kluczowy gap (Invoices UI); przed MVP zostaje dashboard + logika wynajmów (M3), role/Tenant flow (M4), twardnienie bezpieczeństwa i jakości (M5) oraz gotowość do deploy (M6).

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
- `rental.controller.patchRental` — walidacja `tenantID` przez `UserModel` zamiast `TenantModel` → do poprawki w M3/M4.

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

### M3 — Dashboard i przepływ wynajmu (2 tyg.)

Cel: zamienić aplikację z CRUDa w realne narzędzie zarządcze.

| #    | Zadanie                                                                                                 | Priorytet |
| ---- | ------------------------------------------------------------------------------------------------------- | --------- |
| 3.1  | `HomeScreen` → prawdziwy dashboard: KPI (liczba mieszkań, zajętość %, MRR, należności przeterminowane)  | P0        |
| 3.2  | Widget „Nadchodzące płatności" (na bazie `Rental.rentalPaymentDay` + `Invoice.dueDate`)                 | P0        |
| 3.3  | Widget „Kończące się umowy" (`Rental.endDate` < 30 dni)                                                 | P1        |
| 3.4  | Guard logiki: nie można utworzyć `Rental` dla mieszkania z aktywnym wynajmem (`isAvailable=false`)      | P0        |
| 3.5  | Auto-toggle `Apartment.isAvailable` przy tworzeniu/zakończeniu `Rental` (transakcja)                    | P0        |
| 3.6  | Akcja „Zakończ wynajem" (`Rental.isActive=false` + zwolnienie mieszkania)                               | P0        |
| 3.7  | Generator faktur miesięcznych z aktywnego wynajmu (1 klik → draft invoice)                              | P1        |

**Definition of Done:** użytkownik po zalogowaniu widzi pełen obraz biznesu w 1 ekranie; stany mieszkań i wynajmów są spójne.

---

### M4 — Role, uprawnienia, zaproszenia Tenantów (1–2 tyg.)

Cel: dokończyć model ról — obecnie model wspiera `Tenant`, ale nie ma dedykowanego flow.

| #    | Zadanie                                                                                                                                                      | Priorytet |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| 4.1  | Middleware `requireRole('Landlord' \| 'Tenant')` + enforcement na wszystkich routerach                                                                       | P0        |
| 4.2  | Flow zaproszenia Tenanta: Landlord generuje `invitationCode` → mail do Tenanta → rejestracja z kodem wiąże konto Tenanta z `owner` + `assignedApartmentID`   | P0        |
| 4.3  | Ekran Tenanta (widok ograniczony): „Moje mieszkanie", „Moje faktury", „Moje dokumenty" (read-only)                                                           | P1        |
| 4.4  | Rozdzielenie nawigacji w `Navigation` wg `user.role`                                                                                                         | P0        |
| 4.5  | Endpoint `GET /me` zamiast samego `GET /user` (spójna nazwa) + FE hook `useCurrentUser`                                                                      | P1        |

**Definition of Done:** dwie persony (Landlord, Tenant) mają osobne, bezpieczne widoki; Tenant nie może modyfikować cudzych danych.

---

### M5 — Bezpieczeństwo i jakość (must-have przed prod, 2 tyg.)

| #    | Zadanie                                                                                                                  | Priorytet |
| ---- | ------------------------------------------------------------------------------------------------------------------------ | --------- |
| 5.1  | Walidacja wejścia na backendzie (zod lub express-validator) na wszystkich endpointach POST/PATCH                         | P0        |
| 5.2  | CORS whitelist (`FRONTEND_URL`) zamiast `cors()`                                                                         | P0        |
| 5.3  | Rate limiting (`express-rate-limit`) na `/login`, `/register`, `/activate-account`                                       | P0        |
| 5.4  | Helmet + sane defaults (CSP, HSTS)                                                                                       | P0        |
| 5.5  | Autoryzacja statyków `/uploads` — middleware sprawdzający czy user jest ownerem zasobu (lub podpisane URL-e)             | P0        |
| 5.6  | Refresh token + przejście z `sessionStorage` na httpOnly cookie (pod flagą, jeśli zbyt duży scope → zostawić na M6)      | P1        |
| 5.7  | Rotacja `JWT_SECRET` + dokumentacja w `.env.example`                                                                     | P1        |
| 5.8  | Testy backendu: Jest + Supertest — happy path + auth (min. 60% coverage dla controllerów)                                | P0        |
| 5.9  | Testy frontendu: Vitest + React Testing Library — formularze i guardy routingu                                           | P1        |
| 5.10 | E2E smoke test: Playwright — register → login → create apartment → create rental → logout                                | P1        |

**Definition of Done:** audyt bezpieczeństwa (`npm audit`, OWASP checklist) bez krytyków; CI przechodzi testy.

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
| M5 Security & QA              | Brak tego = brak produkcji                        | 2 tyg.    | wysokie (security) |
| M6 Prod readiness             | Wdrożenie + utrzymanie                            | 2 tyg.    | średnie            |

**Łączny czas MVP:** ~10–12 tygodni (1 full-stack dev), **~6–8 tygodni** przy 2 devach równolegle (M2+M3 oraz M4+M5 można zrównoleglić).

---

## Rekomendowana kolejność startu (najbliższe 2 sprinty)

**Sprint 1 (zamknięty):** ~~M1.1–M1.8~~ **[done]** + ~~M2.1–M2.7~~ **[done]**. Wszystkie zadania M1 i M2 zrealizowane, bug `invoice.controller.createInvoice` z changelogu M1 naprawiony razem z UI faktur.

**Sprint 2 (w toku):** start M3 (dashboard, guard logiki wynajmów, auto-toggle `isAvailable`). Po tym sprincie aplikacja będzie **realnie demonstrowalna klientowi** jako MVP v0.9.
