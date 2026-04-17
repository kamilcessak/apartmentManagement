# Apartment Management — Dokumentacja projektu

## 1. Opis ogólny

**Apartment Management** to pełnostackowa aplikacja webowa do zarządzania mieszkaniami na wynajem. Umożliwia właścicielom (Landlord) prowadzenie rejestru lokali, najemców (Tenant) oraz wynajmów, wraz z załącznikami (zdjęcia, dokumenty) i fakturami.

Projekt składa się z trzech kontenerów Docker:

- **backend** — REST API (Node.js + Express + TypeScript + Mongoose)
- **frontend** — SPA (React 18 + Vite + TypeScript + Material UI + TailwindCSS)
- **mongodb** — baza danych MongoDB 6.0

---

## 2. Struktura katalogów (poziom główny)

```
apartmentManagement/
├── backend/                # API serwera (Express + TS)
├── frontend/               # Aplikacja kliencka (React + Vite)
├── docker-compose.yml      # Orkiestracja kontenerów (backend, frontend, mongodb)
├── package.json            # Skrypty root (start, install-all)
└── .gitignore
```

### Skrypty root (`package.json`)

- `npm start` — `docker compose up --build` (uruchomienie całego stacku)
- `npm run install-all` — instalacja zależności w `backend` i `frontend`

### `docker-compose.yml`

- **backend** → port `5050:5050`, montaż `./backend:/app`, `npm start` (nodemon + tsx)
- **frontend** → port `5173:5173`, `npm run dev` (Vite)
- **mongodb** → port `27017:27017`, wolumen `mongodb_data`, użytkownik `admin/password`

---

## 3. Backend (`/backend`)

### 3.1 Stack technologiczny

| Warstwa | Technologia |
| --- | --- |
| Runtime | Node.js + `tsx` (nodemon watcher) |
| Framework | Express `^4.21.1` |
| Język | TypeScript `^5.6.3` |
| ORM/ODM | Mongoose `^8.7.2` |
| Auth | `jsonwebtoken`, `bcryptjs`, `passport-jwt` |
| Upload | `multer` (zapis do `/uploads`, limit 10MB, obrazy + PDF) |
| Mail | `nodemailer` |
| Lint/Format | ESLint 9, Prettier |

### 3.2 Struktura katalogów

```
backend/
├── server.ts               # Punkt wejścia Expressa, rejestracja routerów
├── config.ts               # Stałe środowiskowe (ATLAS_URI, JWT_SECRET, EMAIL_*, FRONTEND_URL)
├── Dockerfile
├── tsconfig.json
├── .env                    # Zmienne środowiskowe (nie commitować sekretów!)
├── controllers/            # Logika biznesowa handlerów HTTP
│   ├── apartment.controller.ts
│   ├── auth.controller.ts
│   ├── files.controller.ts
│   ├── invoice.controller.ts
│   ├── rental.controller.ts
│   ├── tenant.controller.ts
│   └── user.controller.ts
├── routes/                 # Definicje endpointów (Express Router)
│   ├── apartment.routes.ts
│   ├── auth.routes.ts
│   ├── files.routes.ts
│   ├── invoice.routes.ts
│   ├── rental.routes.ts
│   ├── tenant.routes.ts
│   └── user.routes.ts
├── models/                 # Schematy Mongoose
│   ├── apartment.model.ts
│   ├── invoice.model.ts
│   ├── rental.model.ts
│   ├── tenant.model.ts
│   └── user.model.ts
├── middlewares/
│   └── auth.middleware.ts  # Weryfikacja JWT (Bearer)
├── services/
│   ├── email.service.ts    # nodemailer transporter + sendEmail()
│   └── files.service.ts    # konfiguracja multer (disk storage)
├── db/
│   └── connection.ts       # initializeDatabase() → mongoose.connect
├── utils/
│   ├── regexs.ts           # walidacja (np. adres)
│   └── token.ts
├── types/
│   ├── files.types.ts
│   ├── types.d.ts          # augmentacja Express.Request (user)
│   └── user.types.ts
└── uploads/                # Pliki użytkownika (statyki pod /uploads)
```

### 3.3 Punkt wejścia (`server.ts`)

- `app.use(cors())`, `app.use(express.json())`
- Inicjalizuje DB (`initializeDatabase`), a następnie montuje wszystkie routery pod prefiksem `/api/v1` (vide M1.4 roadmapy)
- Serwuje statyki z `./uploads` pod ścieżką `/uploads` (świadomie poza prefiksem `/api/v1`, żeby nie łamać istniejących URL-i plików)
- Globalny 404 handler (JSON `{ error: 'Route not found' }`) dla nierozpoznanych ścieżek
- Globalny `ErrorRequestHandler` — loguje błąd (`console.error('[ErrorHandler]', ...)`) i zwraca jednolity JSON `{ error }` ze statusem z `err.status`/`err.statusCode` (domyślnie 500)
- Domyślny port: `5050` (lub `process.env.PORT`). Log startowy: `Server listening on port 5050/api/v1`

### 3.4 Endpointy REST

Wszystkie endpointy (poza `auth`) wymagają nagłówka `Authorization: Bearer <JWT>`. Wszystkie ścieżki poniżej są poprzedzone prefiksem **`/api/v1`** (np. faktyczny login: `POST /api/v1/login`). Statyczne pliki upload pozostają pod `/uploads/:filename` (bez prefiksu).

#### Auth
| Metoda | Ścieżka | Opis |
| --- | --- | --- |
| POST | `/api/v1/login` | Logowanie → `{ token, user }` |
| POST | `/api/v1/register` | Rejestracja + wysyłka maila z linkiem aktywacyjnym |
| GET | `/api/v1/activate-account?token=...` | Aktywacja konta (weryfikacja email) |

#### Apartments
`POST /api/v1/apartment`, `GET /api/v1/apartments`, `GET /api/v1/apartmentsList`, `GET /api/v1/apartment/:id`, `PATCH /api/v1/apartment/:id`, `DELETE /api/v1/apartment/:id`

#### Tenants
`POST /api/v1/tenant`, `GET /api/v1/tenants`, `GET /api/v1/tenantsList`, `GET /api/v1/tenant/:id`, `PATCH /api/v1/tenant/:id`, `DELETE /api/v1/tenant/:id`

#### Rentals
`POST /api/v1/rental`, `GET /api/v1/rentals`, `GET /api/v1/rental/:id`, `PATCH /api/v1/rental/:id`, `DELETE /api/v1/rental/:id`

#### Invoices
`POST /api/v1/invoice`, `GET /api/v1/invoices`, `GET /api/v1/invoice/:id`, `PATCH /api/v1/invoice/:id`, `DELETE /api/v1/invoice/:id`

#### Files (multer, limit 10MB, image/* + application/pdf)
`POST /api/v1/upload` (single), `POST /api/v1/upload-multiple` (max 10), `GET /api/v1/upload/:filename`, `DELETE /api/v1/upload/:filename`
Statyczne pliki: `GET /uploads/:filename` (poza prefiksem `/api/v1`).

#### User
`GET /api/v1/user`, `PATCH /api/v1/user`

### 3.5 Modele danych (Mongoose)

> Wszystkie schematy mają włączone `{ timestamps: true }` (pola `createdAt` / `updatedAt` automatycznie).

**User** — `email` (unique), `password` (bcrypt w hooku `pre('save')`), `phoneNumber`, `role` (`Landlord` | `Tenant`), `invitationCode?`, `isEmailVerified`, `firstName?`, `lastName?` + metoda `comparePassword()`.

**Apartment** — `address` (regex `ul.Ulica 1, 00-000 Miasto`), `metric`, `isAvailable`, `roomCount`, `monthlyCost`, `description`, `equipment?`, `photos[]`, `documents[]`, `owner` (ObjectId, ref `User`).

**Tenant** — `firstName`, `lastName`, `email` (unique), `phoneNumber`, `address`, `invitationCode`, `isActive`, `owner` (ObjectId, ref `User`), `assignedApartmentID` (ObjectId, ref `Apartment`, default `null`).

**Rental** — `apartmentID` (ObjectId, ref `Apartment`), `tenantID` (ObjectId, ref `Tenant`), `startDate`, `endDate`, `rentalPaymentDay`, `monthlyCost`, `securityDeposit`, `description`, `documents[]`, `photos[]`, `isActive`, `owner` (ObjectId, ref `User`).

**Invoice** — `apartmentID` (ObjectId, ref `Apartment`), `invoiceType`, `amount`, `dueDate`, `uploadDate` (default `Date.now`), `paidDate` (default `null`), `invoiceID`, `document` (`string | null` — URL pliku z uploadu), `isPaid` (default `false`), `owner` (ObjectId, ref `User`).

### 3.6 Autoryzacja

- `auth.middleware.ts` wyciąga token z `Authorization: Bearer`, weryfikuje go `jwt.verify` z sekretem `jwtSecret` i wpisuje `decoded` do `req.user`.
- Token logowania ważny 24h; token aktywacyjny 1h.
- Hasła hashowane `bcryptjs` (salt 10) w hooku `pre('save')` modelu User.

---

## 4. Frontend (`/frontend`)

### 4.1 Stack technologiczny

| Warstwa | Technologia |
| --- | --- |
| Build | Vite `^5.4.8` |
| UI | React `^18.3.1` + React DOM |
| Routing | react-router-dom `^6.27.0` |
| Data fetching | `@tanstack/react-query` `^5.59` |
| HTTP | `axios` (singleton w `services/api.ts`, interceptor dopinający token z `sessionStorage`) |
| Formularze | `react-hook-form` + `@hookform/resolvers` + `yup` |
| UI Kit | `@mui/material` + `@mui/x-date-pickers` + `@emotion` |
| Styling | TailwindCSS `^3.4.14` + PostCSS + Autoprefixer |
| i18n | `i18next` + `react-i18next` (używany `dayjs/locale/pl`) |
| Ikony | `react-icons` |
| Powiadomienia | `react-toastify` |
| Animacje | `lottie-react` |
| Daty | `dayjs` |

### 4.2 Struktura katalogów

```
frontend/
├── index.html
├── vite.config.ts          # aliasy @components, @utils, @assets, @css, @services, @types, @features
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── Dockerfile
├── public/
└── src/
    ├── main.tsx            # Providerzy: QueryClient, BrowserRouter, ThemeProvider, LocalizationProvider
    ├── App.tsx             # Layout: Navigation + <Routes /> sterowane isLoggedIn
    ├── assets/
    ├── css/
    │   ├── tailwind.css
    │   └── muicss           # Theme MUI
    ├── services/
    │   └── api.ts          # axios instance z interceptorem JWT
    ├── hooks/
    │   ├── index.ts
    │   └── useAppLanguage.ts
    ├── screens/            # Ekrany "rdzeniowe" (poza feature'ami)
    │   ├── HomeScreen.tsx
    │   ├── SettingsScreen.tsx
    │   ├── WelcomeScreen.tsx
    │   └── auth/
    │       ├── LoginScreen.tsx
    │       ├── RegisterScreen.tsx
    │       ├── RegisterSuccessful.tsx
    │       ├── UnauthenticatedScreen.tsx
    │       └── VerifyEmailScreen.tsx
    ├── features/           # Wydzielone domeny biznesowe
    │   ├── apartments/
    │   │   ├── components/ (ApartmentItem, DetailsDescriptionSection, DetailsInformationsSection, DetailsPhotosSection)
    │   │   ├── screens/    (ApartmentsScreen, NewApartmentScreen, ApartmentDetailsScreen)
    │   │   └── types/apartment.type.ts
    │   ├── rentals/
    │   │   ├── components/ (RentalItem, RentalInfoSection, RentalDetailsSection, DetailsFilesSection)
    │   │   ├── screens/    (RentalsScreen, NewRentalScreen, RentalDetailsScreen)
    │   │   └── types/rental.types.ts
    │   └── tenants/
    │       ├── components/ (TenantItem, TenantDetails)
    │       ├── screens/    (TenantsScreen, NewTenantScreen, TenantDetailsScreen)
    │       └── types/tenant.type.ts
    ├── components/         # Reużywalne komponenty globalne
    │   ├── common/         (ActivityIndicator, Divider, EmptyView, ErrorView, LoadingView, RouteContent, UserAvatar, UserItem)
    │   ├── files/          (FileItem, FilesSection, UploadFileButton)
    │   ├── header/         (DetailsSectionHeader)
    │   ├── navigation/     (Navigation, NavItem)
    │   ├── routes/         (ProtectedRoute)
    │   └── sections/       (DetailsInformationItem)
    ├── types/
    └── utils/
        ├── apartment.ts
        ├── auth.ts         # isAuthenticated() — guard dla UI
        ├── common.ts
        ├── generateRandomHexColor.ts
        ├── i18n.ts         # konfiguracja i18next
        └── routes/
            ├── routeConfig.tsx      # getRoutes(isLoggedIn)
            ├── apartmentsRoutes.tsx
            ├── rentalsRoutes.tsx
            └── tenantsRoutes.tsx
```

### 4.3 Routing

`getRoutes(isLoggedIn)` składa listę tras publicznych i prywatnych (opakowanych `<ProtectedRoute>`):

| Publiczne | Chronione |
| --- | --- |
| `/`, `/login`, `/register`, `/verify-email`, `/registerSuccess`, `/404` | `/home`, `/settings` |
| | `/apartments`, `/apartments/new`, `/apartment/:id` |
| | `/tenants`, `/tenants/add`, `/tenant/:id` |
| | `/rentals`, `/rentals/new`, `/rental/:id` |

`App.tsx` synchronizuje stan `isLoggedIn` na podstawie `isAuthenticated()` (token w `sessionStorage`) i przekierowuje na `/home` po zalogowaniu.

### 4.4 Warstwa HTTP

- `axios.create({ baseURL: \`${import.meta.env.VITE_API_URL ?? "http://localhost:5050"}/api/v1\` })`
- Zmienna `VITE_API_URL` pochodzi z pliku `.env` (wzorzec w `frontend/.env.example`)
- Interceptor **żądań** dokleja `Authorization: Bearer ${sessionStorage.token}`
- Interceptor **odpowiedzi** — na `401 Unauthorized` czyści token z `sessionStorage` i wykonuje `window.location.replace("/login")` (z wyjątkiem ekranów publicznych `/`, `/login`, `/register`, żeby nie pętlić)
- `QueryClientProvider` z `@tanstack/react-query` opakowuje całą aplikację

> Ekrany auth (`LoginScreen`, `RegisterScreen`, `VerifyEmailScreen`) używają wspólnej instancji `api` (zamiast surowego `axios` z hardkodowanym hostem), dzięki czemu prefiks `/api/v1`, `baseURL` i interceptory działają spójnie.

### 4.5 Architektura UI

- Podział **feature-first** — każdy moduł (`apartments`, `rentals`, `tenants`) ma własne `components/`, `screens/`, `types/` oraz barrel `index.ts`.
- Współdzielone primitives w `components/common`, layout w `components/navigation`, sekcje widoków szczegółów w `components/sections` i `components/header`.
- Globalne zasoby plikowe (upload, podgląd, lista) w `components/files`.
- Stylowanie hybrydowe: Tailwind do utility + MUI do gotowych kontrolek (`LocalizationProvider` z `AdapterDayjs` w języku z `i18n.language`).

---

## 5. Zmienne środowiskowe

### Backend (`backend/.env`)
- `ATLAS_URI` — connection string do MongoDB (dev: `mongodb://admin:password@mongodb:27017`)
- `JWT_SECRET` — sekret do podpisywania tokenów
- `PORT` — domyślnie `5050`
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASS` — SMTP dla nodemailera
- `FRONTEND_URL` — URL do linków w mailach (np. weryfikacja konta)

### Frontend (`frontend/.env`)
- `VITE_API_URL` — base URL backendu (dev: `http://localhost:5050`). `api.ts` dokleja do niej prefiks `/api/v1`. Plik wzorcowy: `frontend/.env.example`.

---

## 6. Uruchomienie lokalne

```bash
npm run install-all   # instalacja zależności w backend + frontend
npm start             # docker compose up --build
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5050
- MongoDB:  mongodb://admin:password@localhost:27017

---

## 7. Obserwacje / potencjalne usprawnienia (senior review)

> Legenda statusów: **[done M1]** — zamknięte w milestonie M1 roadmapy; **[open]** — do zrobienia w kolejnych milestonach.

1. **Prefiksy API** — **[done M1]** Wszystkie routery montowane pod `/api/v1`; statyki `/uploads` pozostawione osobno (M1.4).
2. **Hardkodowany `baseURL`** — **[done M1]** `frontend/src/services/api.ts` używa `import.meta.env.VITE_API_URL` + prefiks `/api/v1`; dodany `frontend/.env.example` (M1.5).
3. **`sessionStorage` na token** — **[open]** rozważyć httpOnly cookie + refresh token dla lepszego bezpieczeństwa (obecnie XSS-able). Zaplanowane w M5.6.
4. **Globalny error handler + axios 401** — **[done M1]** Express ma `ErrorRequestHandler` i 404 fallback; axios ma `response` interceptor czyszczący token i przekierowujący na `/login` przy 401 (M1.6).
5. **Niespójność typów FK** — **[done M1]** `Tenant.owner`, `Rental.owner`, `Rental.apartmentID`, `Rental.tenantID`, `Tenant.assignedApartmentID`, `Invoice.apartmentID`, `Invoice.owner` przestawione na `ObjectId` + `ref` (M1.1 / M1.2).
6. **`Invoice.apartmentID: Number` + niespójny `document`** — **[done M1]** `apartmentID` → `ObjectId` (ref `Apartment`), `document` → spójny `string | null` w TS i schemacie. Dodano brakujące pole `owner` (wymagane przez controller) (M1.2).
7. **`uploadDate: default: new Date()`** — **[done M1]** Zmienione na `default: Date.now`; dodatkowo wszystkie modele mają `{ timestamps: true }` (M1.3).
8. **`.pnp.cjs` + `node_modules`** w `backend/` — **[done M1]** Usunięte `backend/.pnp.cjs`, `backend/.pnp.loader.mjs`, `backend/.yarn/`; `.gitignore` zaktualizowany, żeby nie wracały. Projekt jednoznacznie używa npm (M1.8).
9. **`console.log` w kodzie produkcyjnym** — **[done M1]** Usunięte z `App.tsx`, `RentalItem`, `RentalDetailsScreen`, `NewRentalScreen`, `RentalDetailsSection`, `RentalsScreen`, `RegisterScreen` oraz `rental.controller.ts` i `apartment.controller.ts`. ESLint: dodana reguła `'no-console': ['warn', { allow: ['warn', 'error'] }]` (M1.7).
10. **Walidacja wejścia** — **[open]** brak warstwy walidacji (np. `zod` / `express-validator`) na backendzie; obecnie głównie Mongoose. Zaplanowane w M5.1.
11. **Testy** — **[open]** brak konfiguracji (`"test": "exit 1"`). Jest/Vitest + Supertest — M5.8–M5.10.
12. **CORS** — **[open]** `cors()` bez whitelisty; przed produkcją ograniczyć do `FRONTEND_URL`. Zaplanowane w M5.2.
13. **Statyczne `/uploads` bez autoryzacji** — **[open]** każdy z linkiem pobierze plik; podpisane URL-e lub middleware — M5.5.
14. **DRY routingu frontend** — **[open]** `getApartmentsRoutes/TenantsRoutes/RentalsRoutes` powtarzają wzorzec; do refaktoru przy M4 (podział nawigacji po rolach).
15. **README** — **[open]** brak na poziomie root i `backend/`. Zaplanowane w M6.8.

### 7.1 Znane bugi odkryte przy M1 (out-of-scope, do M2/M3)
- `invoice.controller.createInvoice` — zapytanie weryfikujące apartament idzie do `InvoiceModel.findOne({ _id: apartmentID })` zamiast `ApartmentModel`. Do poprawki razem z budową UI faktur w **M2**.
- `rental.controller.patchRental` — weryfikacja istnienia tenanta przez `UserModel.findById(tenantID)` zamiast `TenantModel`. Do poprawki w **M3** (logika spójności wynajmów) lub **M4** (flow ról).
