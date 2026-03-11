# Location and Login — Handoff Report (Mood Meter App)

This document describes how **locations** (kiosk/location management) and **login** (admin authentication) work in the mood-meter-app repository, including data structures, flows, and where to change behavior. Use it to port behavior to another repo or onboard another agent.

---

## 1. High-Level Overview

| Concern | Where It Exists | Backend / Storage | Notes |
|--------|------------------|-------------------|--------|
| **Admin login** | `dashboard-figma-dashboard` only | None (client-only) | Simulated login; no Supabase Auth. |
| **Location config (dashboard)** | Two systems (see below) | Supabase **or** localStorage | Depends on which dashboard variant. |
| **Kiosk ↔ location** | Kiosk app + Supabase | Supabase `kiosks` (+ optional `locations`) | Device ID → location name. |
| **Mood entries with location** | Server/Dashboard API + Supabase | `mood_entries` (+ optional `device_id` / `kiosk_id`) | Location shown via `kiosks` lookup. |

There are **two dashboard implementations** with different location and login behavior:

- **`dashboard-figma-dashboard`**: Admin **login** (dialog), locations in **localStorage** (`moodmeter_app_config`), filter by location, LocationStats by location. No Supabase for locations.
- **`src-DashboardMT`**: **No login**; locations in **Supabase** (`locations` table); **LocationsAdmin** in Admin tab; mood entries get `locationName` from Supabase `kiosks` by `device_id`. Optional **testing mode** hides Admin tab.

---

## 2. Login (Admin Authentication)

### 2.1 Where Login Exists

- **Only in:** `dashboard-figma-dashboard`
- **Not in:** `src-DashboardMT` (no login; Admin tab is just hidden in testing mode).

### 2.2 Components and Flow

| File | Role |
|------|------|
| `dashboard-figma-dashboard/src/App.tsx` | Holds `isAdminAuthenticated`, `showLoginDialog`; shows "Admin Login" button when not authenticated; renders `AdminLogin` and `AdminSettings`. |
| `dashboard-figma-dashboard/src/components/AdminLogin.tsx` | Dialog: username/password form, validates against hardcoded credentials, calls `onLoginSuccess` / `onOpenChange`. |
| `dashboard-figma-dashboard/src/components/AdminSettings.tsx` | Receives `isAuthenticated` and `onLogout`; shows admin-only settings (locations, APIs, CSV, custom emotions). |

Flow:

1. User clicks "Admin Login" (or similar) → `setShowLoginDialog(true)`.
2. User submits credentials in `AdminLogin`; validation is **client-only** (no server or Supabase Auth).
3. On success: `onLoginSuccess()` → `setIsAdminAuthenticated(true)`, `setShowLoginDialog(false)`.
4. Logout: `onLogout()` → `setIsAdminAuthenticated(false)`.

### 2.3 Credentials (Hardcoded)

Defined in `dashboard-figma-dashboard/src/components/AdminLogin.tsx`:

```ts
const DEFAULT_ADMIN = {
  username: 'admin123',
  password: 'admin123!'
};
```

Validation: `username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password` (after a short simulated delay). No JWT, no session persistence (state is lost on refresh).

### 2.4 What Is Gated by Login

- **AdminSettings** (and thus Locations, APIs, CSV, Custom Emotions) is only meaningfully accessible when the user has "logged in" (i.e. `isAdminAuthenticated === true`). The UI may still show an "Admin" or "Settings" entry point that opens the login dialog if not authenticated.

---

## 3. Locations — Two Systems

### 3.1 System A: Figma Dashboard (localStorage)

**Scope:** `dashboard-figma-dashboard`

- **Storage:** `localStorage` key `moodmeter_app_config` (see `dashboard-figma-dashboard/src/utils/appConfig.ts`).
- **Shape:** `AppConfig.locations` is an array of `{ id: string, name: string, enabled: boolean }`.
- **Default locations** (in `appConfig.ts`): e.g. "Main Building - Entrance", "Library - 2nd Floor", "Cafeteria", etc., with `id` like `'1'`, `'2'`, …

**Where locations are used:**

- **AdminSettings — Locations tab**  
  - **File:** `dashboard-figma-dashboard/src/components/AdminSettings.tsx`  
  - Add location: `addLocation()` → append to `config.locations`, `setConfig(...)`, then typically `saveConfig(config)` (or equivalent).  
  - Toggle: `toggleLocation(id, enabled)`.  
  - Remove: `removeLocation(id)`.  
  - All updates are to in-memory `config`; persistence is via `saveConfig()` which writes to `moodmeter_app_config`.

- **DashboardSettings**  
  - **File:** `dashboard-figma-dashboard/src/components/DashboardSettings.tsx`  
  - Uses `getEnabledLocations(config)` for the location **filter dropdown** (`selectedLocation`, `onLocationChange`).  
  - Config comes from `loadConfig()` (same `moodmeter_app_config`).

- **Filtering**  
  - **File:** `dashboard-figma-dashboard/src/utils/filterUtils.ts`  
  - `filterByLocation(entries, locationId)`: if `locationId === 'all'` return all; else filter `entry.locationId === locationId`.

- **LocationStats**  
  - **File:** `dashboard-figma-dashboard/src/components/LocationStats.tsx`  
  - Uses `loadConfig()` and `getEnabledLocations(config)` from `appConfig.ts` (same `moodmeter_app_config`).  
  - Expects each mood entry to have `locationId` (string). Counts are by `locationId`; names are resolved from the config list.

**Data flow (Figma dashboard):**

- Locations list: **AdminSettings** → `loadConfig` / `saveConfig` → `moodmeter_app_config`.
- Dashboard filter: **DashboardSettings** → `loadConfig()` → `getEnabledLocations()` → dropdown.
- Chart: **LocationStats** → `loadConfig()` → `moodmeter_app_config` + `entry.locationId`.

This dashboard uses **mock data** from `utils/mockMoodData.ts`; mock entries can include `locationId` (e.g. `'1'`–`'5'`). So "location" here is a **filter/label** only; it is not synced with any Supabase `locations` or `kiosks` tables.

### 3.2 System B: Supabase-Backed Dashboard (src-DashboardMT)

**Scope:** `src-DashboardMT` (and optionally `srcMTapp` / kiosk flows that use Supabase).

- **Storage:** Supabase tables `locations` and `kiosks`.
- **No admin login:** Admin tab is just hidden when `testingMode` is on.

#### 3.2.1 Tables (inferred from code; not fully in repo's `supabase-schema.sql`)

- **`locations`**  
  - Used by: `src-DashboardMT/services/api.ts`, `srcMTapp/services/kioskRegistry.ts`.  
  - Expected columns (from code): `id` (e.g. UUID), `name`, `active`, `created_at`.  
  - Used for: list of location names; Admin "Locations" management; kiosk dropdown if the kiosk fetches "active locations" from API.

- **`kiosks`**  
  - Used by: dashboard API (map device → location name), kiosk registry.  
  - Expected columns: `device_id` (unique per kiosk), `location_name` (required), optionally `location_id`.  
  - Purpose: map each device/kiosk to a human-readable location name (and optionally to `locations.id`).

- **`mood_entries`**  
  - In `supabase-schema.sql` the table has no `device_id`; some code paths (e.g. `src-DashboardMT/services/api.ts`, server routes) expect or use a column like `device_id` or `kiosk_id` to link an entry to a kiosk.  
  - Dashboard API: reads `mood_entries` then joins to `kiosks` on `device_id` to attach `locationName` to each entry.

If your Supabase project was created from other docs, it may have `mood_entries` with `device_id` or `kiosk_id`, and separate `locations` and `kiosks` tables. The repo's `supabase-schema.sql` only defines an older `mood_entries` shape; the code assumes the extended schema.

#### 3.2.2 Dashboard API (src-DashboardMT)

**File:** `src-DashboardMT/services/api.ts`

- **fetchMoodEntries()**  
  - Selects from `mood_entries` (all columns).  
  - Then selects from `kiosks` (`device_id`, `location_name`).  
  - Builds a map `device_id → location_name`.  
  - For each mood row, sets `entry.locationName = kioskMap.get(row.device_id) ?? "Unknown location"`.  
  - So the dashboard expects `mood_entries` to have a column that the code treats as `row.device_id` (name may be `device_id` or `kiosk_id` in DB).

- **Locations (Admin):**  
  - `fetchLocations()`: `supabase.from("locations").select("*").order("created_at")`.  
  - `createLocation(name)`: insert into `locations` with `name`, `active: true`.  
  - `setLocationActive(locationId, active)`: update `locations` by `id`.

**MoodEntry type (dashboard):** `deviceId?: string`, `locationName?: string` (and standard mood fields). So the dashboard displays location by **name** from `kiosks`, not by a separate `locationId` on the entry.

#### 3.2.3 LocationsAdmin UI

**File:** `src-DashboardMT/components/LocationsAdmin.tsx`

- Rendered only in the **Admin** tab of the dashboard (`src-DashboardMT/App.tsx`), and the Admin tab is **hidden when testing mode is on** (`!testingMode`).
- Actions:  
  - Add location: input + "Add location" → `createLocation(name)` then reload.  
  - List: names, Active/Inactive, Enable/Disable via `setLocationActive(id, true|false)`.  
  - Toggle "Show inactive" to see inactive locations.
- No login; anyone who can open the Admin tab can manage locations.

#### 3.2.4 Testing mode

**File:** `src-DashboardMT/utils/testingMode.ts`

- Testing mode: `getTestingMode()` is true if any of: env `VITE_TESTING_MODE=true` or `1`, `localStorage` key `moodMeterTestingMode === "true"`, or `?testing=1` in the URL.
- When true: dashboard uses mock data only; Admin tab is hidden; no Supabase location/kiosk features.

---

## 4. Kiosk / Device Side (Location and Device ID)

### 4.1 Device ID

**File:** `srcMTapp/services/deviceId.ts` (and similarly referenced from kiosk)

- `getDeviceId()`: reads `localStorage["moodmeter_device_id"]`; if missing, generates `crypto.randomUUID()`, saves it, returns it.
- One ID per browser/device; used to identify the kiosk when submitting moods and when registering with `kiosks`.

### 4.2 Kiosk registry (Supabase)

**File:** `srcMTapp/services/kioskRegistry.ts`

- **getKioskLocation(deviceId):** `supabase.from("kiosks").select("location_name").eq("device_id", deviceId).maybeSingle()` → returns display name for this device.
- **upsertKioskLocation(deviceId, locationName):** upsert into `kiosks` with `device_id` and `location_name` (no `location_id`).
- **upsertKioskLocationId(deviceId, locationId, locationName):** upsert with `device_id`, `location_id`, `location_name` (for schemas that have `location_id` on `kiosks`).
- **fetchActiveLocations():** `supabase.from("locations").select("id,name,active").eq("active", true)` → used to populate a location dropdown (e.g. during kiosk setup) so the device can be associated with a location.

So: the **kiosk app** (or a one-time setup flow) can call `fetchActiveLocations()` to show locations, then call `upsertKioskLocation(deviceId, locationName)` or `upsertKioskLocationId(...)` to register this device to a location. The dashboard then uses `kiosks` to show `locationName` per mood entry by `device_id`.

### 4.3 Kiosk app submission (kiosk-srcMTapp)

**Files:** `kiosk-srcMTapp/services/api.ts`, `kiosk-srcMTapp/services/supabaseApi.ts`

- The kiosk can submit via a **traditional API** (server) or **Supabase**.
- **Supabase path (`supabaseApi.ts`):** Inserts into `mood_entries` with fields like `date_only`, `l1_id`, `l1_label`, `l2_id`, `l2_label`, … and optionally `session_id`, etc. The current `SupabaseMoodEntry` in the repo does **not** include `device_id` in the insert; so either the table has a default or the column is added elsewhere. For location to show on the dashboard, the mood row must be linkable to `kiosks` via `device_id` (e.g. mood_entries should store `device_id` and dashboard joins to `kiosks`).
- **Traditional API path (server):** `server/routes/moods.js` accepts `kioskId` in the request body and stores it as `kiosk_id` in the `moods` table. So the server schema uses `kiosk_id`; the dashboard Supabase path uses `device_id` and `kiosks` to resolve names.

Important: **kiosk-srcMTapp** in the repo does not show a "location picker" or call to `upsertKioskLocation` in the main flow; that flow exists in **srcMTapp** (e.g. `kioskRegistry`). So for a full "configure kiosk location" flow, you'd either add a setup step in the kiosk app that calls `fetchActiveLocations` + `upsertKioskLocation`, or configure kiosks from the dashboard only (e.g. by device_id) and ensure mood submissions include `device_id`.

### 4.4 srcMTapp mood submission (Supabase)

**File:** `srcMTapp/services/moodEntriesSupabase.ts`

- `insertMoodEntry({ deviceId, quadrant, emotion, timeToSelectMs })` inserts into `mood_entries` with `device_id`, `quadrant`, `emotion`, `time_to_select_ms`. So this path **does** send `device_id`; the dashboard can then join to `kiosks` to get `locationName`.

---

## 5. Server (Express) — Optional Path

**File:** `server/routes/moods.js`

- Uses Supabase table `moods` (not necessarily `mood_entries`); accepts `kioskId` and stores as `kiosk_id`.
- So if the other repo uses this server, location is tracked via `kiosk_id` on the `moods` table; the dashboard variant that reads from this API would need to map `kiosk_id` to location names (e.g. from a `kiosks` table or config).

---

## 6. File Reference Summary

| Purpose | File(s) |
|--------|--------|
| Admin login UI & state | `dashboard-figma-dashboard/src/App.tsx`, `dashboard-figma-dashboard/src/components/AdminLogin.tsx` |
| Admin credentials | `dashboard-figma-dashboard/src/components/AdminLogin.tsx` (DEFAULT_ADMIN) |
| Admin settings (locations, APIs, etc.) | `dashboard-figma-dashboard/src/components/AdminSettings.tsx` |
| Figma dashboard location config | `dashboard-figma-dashboard/src/utils/appConfig.ts` (loadConfig, saveConfig, DEFAULT_CONFIG.locations) |
| Figma location filter | `dashboard-figma-dashboard/src/components/DashboardSettings.tsx`, `dashboard-figma-dashboard/src/utils/filterUtils.ts` |
| Figma LocationStats (by location) | `dashboard-figma-dashboard/src/components/LocationStats.tsx` (uses loadConfig → moodmeter_app_config) |
| Supabase locations CRUD | `src-DashboardMT/services/api.ts` (fetchLocations, createLocation, setLocationActive) |
| Supabase mood fetch + location names | `src-DashboardMT/services/api.ts` (fetchMoodEntries, kiosks map by device_id) |
| Locations Admin UI (Supabase) | `src-DashboardMT/components/LocationsAdmin.tsx` |
| Dashboard App (tabs, testing mode, Admin) | `src-DashboardMT/App.tsx` |
| Testing mode (hide Admin) | `src-DashboardMT/utils/testingMode.ts` |
| Device ID | `srcMTapp/services/deviceId.ts` |
| Kiosk ↔ location (Supabase) | `srcMTapp/services/kioskRegistry.ts` (getKioskLocation, upsertKioskLocation, upsertKioskLocationId, fetchActiveLocations) |
| Kiosk submit (Supabase) | `kiosk-srcMTapp/services/supabaseApi.ts`; `kiosk-srcMTapp/services/api.ts` |
| Mood insert with device_id | `srcMTapp/services/moodEntriesSupabase.ts` |
| Server mood API (kiosk_id) | `server/routes/moods.js` |

---

## 7. Suggested Checklist for the Other Repo

- Decide which model you want:  
  - **Figma-style:** Login (or not), locations in localStorage, filter + LocationStats by `locationId`.  
  - **Supabase-style:** No login (or add real auth), `locations` + `kiosks` tables, dashboard resolves location by `device_id` and shows `locationName`.
- If Supabase: ensure DB has `locations`, `kiosks`, and `mood_entries` (or `moods`) with a column like `device_id` or `kiosk_id` so you can join to `kiosks`.
- If login: either keep the simple client-only check (like AdminLogin) or replace with Supabase Auth and gate Admin/Locations behind it.
- Align storage keys if you use localStorage: use a single key (e.g. `moodmeter_app_config`) for both AdminSettings and LocationStats so location list and stats stay in sync.
- Kiosk: ensure mood submission includes device/kiosk identifier and that either the kiosk registers itself in `kiosks` (via `upsertKioskLocation`) or you have another way to map device → location name for the dashboard.

This should give another agent enough structure to reimplement or adapt location and login behavior in a different repo.
