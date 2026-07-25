# Copilot Instructions for `grocery-tracker-front-end`

## Build, lint, and test commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build (includes TypeScript project build + Vite build): `npm run build`
- Lint: `npm run lint`
- Preview production build: `npm run preview`
- Type-check only (without Vite bundling): `npx tsc -b`

### Tests

- There is currently **no test runner or test script configured** in this repository.
- Single-test command is therefore not available yet.

## High-level architecture

- This is a React + TypeScript + Vite SPA. Entry point is `src/main.tsx`, which wraps `<App />` in `BrowserRouter`.
- `src/App.tsx` defines screen-level routing:
  - `/` → `HomeScreen`
  - `/location/:id` and `/items` → `LocationView`
  - `/item/:id` → `ItemDetail`
  - `/add` and `/item/:id/edit` → `ItemForm`
  - `/locations` → `LocationsManager`
- Data flow is currently mixed between mock data and API hooks:
  - `usePantryItems` provides `MOCK_ITEMS` and `MOCK_LOCATIONS` plus filter/category logic used by `LocationView`, `ItemDetail`, `ItemForm`, and `LocationsManager`.
  - `useLocations` and `useInventory` perform `fetch` calls to `/api/...`.
- Local development API traffic is proxied in `vite.config.ts`:
  - `/api/*` → `http://localhost:8000`
- Theme state is centralized in `useTheme`:
  - Reads `theme` from `localStorage`
  - Falls back to `prefers-color-scheme`
  - Writes `data-theme` on `<html>`
  - Global CSS variables in `src/index.css` implement light/dark palettes.

## Key conventions in this codebase

- Use CSS Modules per component (`*.module.css`) and import as `styles` in the matching TSX component.
- Keep pantry domain types in `src/types/pantry.ts`; hooks and components import from this shared type file instead of redefining data shapes.
- Prefer route-param and query-param driven screens (`useParams`, `useSearchParams`) for selecting location/item context.
- Forms use a typed object state + generic field setter pattern (see `ItemForm`) so key/value updates remain type-safe.
- Treat TODO markers for backend writes (`POST/PUT/DELETE`) as the intended integration points when replacing mock behavior with real API calls.
