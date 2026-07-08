# Clear Energy — 3-App Take-Home

Three React Native (Expo) apps — **Customer**, **Driver**, **Admin Mobile** — sharing one
`packages/shared` package for types, the API client, and the `<OrderCard />` component.

```
clear-energy-takehome/
├── apps/
│   ├── customer/          # "Today's Orders" — GET /orders?customerId=c-001
│   ├── driver/             # "Today's Trip"   — GET /trips?driverId=d-101
│   └── admin-mobile/       # "Pending Actions" — GET /pending-actions?adminId=a-201
├── packages/
│   └── shared/             # types, API client, OrderCard, ScreenState, tokens
├── mock-api.json           # json-server data
├── openapi.yaml            # API contract (reference)
└── README.md
```


## Project Highlights

- Monorepo using pnpm workspaces
- Shared TypeScript types
- Shared API client
- Shared reusable `OrderCard`
- Shared loading, empty, and error state components
- React Query for server state
- React Navigation
- Unit-tested currency formatter


## Setup

Requires Node 20+ and pnpm (`corepack enable` if you don't have it).

```bash
cd clear-energy-takehome
pnpm install

# terminal 1 — mock backend
pnpm run mock-api                 # json-server on :4000

# terminal 2 — pick an app
pnpm run customer                 # Expo dev server for the Customer app
pnpm run driver
pnpm run admin-mobile
```

Then press `w` for web, `a`/`i` in the Expo CLI, or scan the QR code with **Expo Go** on your
phone.

> **Physical device / Expo Go note:** the apps default to `http://localhost:4000` (iOS
> simulator/web) or `http://10.0.2.2:4000` (Android emulator) for the mock API. A phone on
> Expo Go can't reach your machine's `localhost` — start Expo with a tunnel and set
> `EXPO_PUBLIC_API_URL=http://<your-lan-ip>:4000` (or run json-server with `--host 0.0.0.0`)
> before starting the app.

Run the one unit test:

```bash
pnpm run test          # vitest — price formatter, packages/shared
```

Typecheck everything:

```bash
pnpm run typecheck
```

## Tech choices, and why

- **pnpm workspaces**, not Turborepo/Nx (R1). Three small apps and one shared package don't
  need a task graph, remote caching, or affected-package detection — that's solving a
  problem this repo doesn't have yet. pnpm workspaces give real dependency hoisting, a
  `workspace:*` protocol for `@clear-energy/shared`, and near-zero config. I'd reach for
  Turborepo once there are more shared packages or CI gets slow enough that caching pays for
  itself.
- **TypeScript everywhere** (R2). Domain types live once in `packages/shared/src/types` and
  are imported, never redeclared, by all three apps and by the API layer.
- **A hand-written fetch client, not a generated one** (R3). `ApiClient` in
  `packages/shared/src/api/client.ts` wraps `fetch` and normalises every failure mode into one
  `ApiError` with a `kind` (`network` / `http` / `aborted` / `parse`), so screens branch on one
  shape instead of on `try/catch` details. React Query's `queryFn({ signal })` supplies the
  abort signal, so the client's abort handling is exercised automatically when a screen
  unmounts mid-request.
- **One `<OrderCard />`, three adapters** (R4). The component only knows a small
  `OrderCardModel` (eyebrow / title / subtitle / tone / meta / rightChip / etc.). Three pure
  functions in `adapters.ts` — `orderToCardModel`, `tripStopToCardModel`,
  `pendingActionToCardModel` — translate each domain type into that model. Adding a fourth
  consumer later means writing one more adapter, not forking the component.
- **React Navigation native-stack**, one route per app, per the brief — no `expo-router`
  overhead for a single screen.
- **React Query** for server state — it gives `isLoading` / `isError` / `refetch` and abort
  wiring for free, which maps directly onto the four required screen states.
- **Shared `ScreenState` (Loading/Error/Empty)** — not explicitly required, but the three
  screens would otherwise each invent their own spinner/error copy, which is exactly the kind
  of drift the brief is testing for.
- **`formatPaise`** uses `Intl.NumberFormat("en-IN")` for real Indian digit grouping
  (lakh/crore commas) rather than a hand-rolled regex — correctness for free, and it's the one
  function explicitly asked to be unit-tested.

## What I cut, and why

- **No write endpoints / mutations beyond the idempotency plumbing** — none exist in
  `openapi.yaml`; wiring `client.mutate()` without a real endpoint would be theatre.
- **No offline caching / persistence** beyond React Query's default in-memory cache — out of
  scope for a read-only, single-session demo.
- **No custom app icons/splash** — kept Expo's generated defaults; polishing brand assets
  wasn't worth the time budget versus the shared-code architecture the brief grades on.
- **The driver map is a decorative placeholder** — the brief explicitly says the map/ETA
  banner are decorative; a real map SDK is out of scope.
- **No design system beyond `tokens.ts`** — a handful of shared colors was enough for three
  screens; a full theming layer would be premature.
- **Admin card actions show an `Alert`, not a real approve/assign flow** — there's no backend
  mutation to call yet (see above); the tap handler and `rightSlot` override are wired so a
  real action drops in without touching `<OrderCard />`.

## Open questions I answered myself (per the brief's "log it and proceed" instruction)

- `GET /orders` doesn't return a `customerName`-keyed filter for "Active" vs "Delivered" vs
  "Returns" — the Customer App's filter chips derive the bucket from `status` client-side
  (see `matchesFilter` in `OrdersScreen.tsx`).
- The mock `trips` array has no `driverId` filtering behavior documented for json-server's
  default query support beyond exact match — I sort client-side by `seq` defensively in case
  the mock ever returns stops out of order.
- SLA breach (`ageMinutes > slaMinutes`) recolors the card to `danger` tone and adds a
  "SLA breached" warning line, per the mockup's `⚠` convention, even for categories that
  aren't inherently red (e.g. `mi_empty`).

## AI usage

- **Assistant used:** Replit Agent (Claude-based), ChatGPT, used for this take-home —
  scaffolding, the shared package, all three screens, and this README.
- **ChatGPT** – Used for architecture discussions, reviewing the shared package structure, debugging TypeScript issues and reviewing React Native components.
- **Scaffold:** apps were bootstrapped with `create-expo-app --template blank-typescript`,
  then hand-edited (removed npm lockfiles/`.git`/`CLAUDE.md`/`AGENTS.md` boilerplate, wired
  into pnpm workspaces) — accepted the generated `App.tsx`/`tsconfig.json`/`assets/` as-is
  where they didn't need changes.
- **Shared package:** written directly by the assistant based on the R1–R7 requirements and
  the mockups/OpenAPI spec — accepted after typechecking and running the test suite; the
  price-formatting rounding edge case (`0.50` vs `0.5`) was caught by a failing test and
  fixed on the spot.
- **Screens:** written directly by the assistant from the three mockup HTML files, mapping
  each visual element to the shared `OrderCard`/`ScreenState` components — accepted after
  `tsc --noEmit` passed for all three apps.
- **Discarded:** nothing structurally — no dead files or unused generated boilerplate were
  left in the repo. The default Expo `App.tsx` was fully replaced, not incrementally edited.

## Actual hours spent

**~1 hour 40 mins** end-to-end: reading the brief + mockups + OpenAPI/mock data, planning the
shared-package boundaries, scaffolding, building `packages/shared`, wiring the three screens,
fixing the typecheck/test failures, and writing this README.

## Given more time, I would add

- A real "Order Detail" screen wired from the Customer list (the brief's own live-review
  extension) using the same `OrderCard` adapters, to prove the shared layer generalizes.
- Pull-to-refresh on all three lists (`RefreshControl` + `queryClient.invalidateQueries`).
- A thin `useApiQuery` hook wrapping `useQuery` to remove the small amount of repeated
  `queryKey`/`queryFn` boilerplate across the three screens.
- Real approve/assign mutations on the Admin screen once a write endpoint exists, using
  `client.mutate()` end-to-end with optimistic updates.
