# Home Food Storage Tracker — CLAUDE.md

## Project overview

A single-page React app (no build tools) for tracking food across 4 household storage locations: Freezer, Fridge, Cellar, and Pantry. Designed for 2 users (Alexandru and Madalina) sharing one live inventory. Runs by opening `Food_Storage_Tracker.html` directly in a browser — no server, no npm, no compilation.

---

## File structure

| File | Role |
|---|---|
| `Food_Storage_Tracker.html` | Entry point. Loads CDN scripts, global CSS, and all JSX files in order. |
| `theme.jsx` | Design tokens: colors, location configs, expiry logic, date utilities. **Single source of truth for all colors and categories.** |
| `data.jsx` | Item data model + 35 seed items across all 4 locations. |
| `icons.jsx` | `<Icon name="..." size={n} />` — all SVG icons in one place. |
| `components.jsx` | Shared UI: `ItemCard`, `SummaryBar`, `CategoryBadge`, `ExpiryPill`, `BottomNav`, `EmptyState`, `Avatar`. |
| `screens.jsx` | Bottom sheets and dialogs: `NameEntry`, `AddEditSheet`, `DetailSheet`, `MoveSheet`, `ConfirmDialog`. Also all form fields. |
| `overlays.jsx` | Full-screen overlays: `SearchOverlay`, `NotificationsPanel`. |
| `app.jsx` | Root `App` component. Owns all state, mutations, sort/filter logic, toast, tab switching. |
| `android-frame.jsx` | Visual phone bezel: `AndroidDevice`, `AndroidStatusBar`, `AndroidNavBar`. |

**Load order matters** — the HTML loads them in this exact sequence:
`android-frame.jsx` → `theme.jsx` → `data.jsx` → `icons.jsx` → `components.jsx` → `screens.jsx` → `overlays.jsx` → `app.jsx`

All files expose their exports via `Object.assign(window, { ... })` — this is intentional, not a bug.

---

## Architecture & key rules

### No build tools
- React 18 + ReactDOM + Babel Standalone loaded from CDN
- All JSX runs in the browser via `<script type="text/babel">`
- Do not introduce npm, webpack, vite, or any bundler
- Do not use ES module `import/export` syntax — everything is global via `window`

### State lives in `app.jsx` only
- `items` array is the single source of truth
- All mutations (`saveItem`, `reallyDelete`, `reallyUse`, `doMove`) live in `App()`
- Child components receive data and callbacks as props — they never mutate state directly

### Shared storage (2-user sync)
- Items are stored with `window.storage.set('fst_items', JSON.stringify(items), true)` — the `true` flag means shared between both users
- A polling interval (every 5 seconds) re-reads storage and updates state if data changed
- `userName` is stored in regular `localStorage` (not shared) — each device has its own
- Never use `localStorage` for items — it breaks the 2-user sync

### Theming
- All colors come from `theme.jsx` — never hardcode a hex color anywhere else
- Each location has: `accent`, `accentDark`, `onAccent`, `page`, `container`, `onContainer`, `navTint`
- Expiry status colors live in the `EXPIRY` object: `expired`, `soon`, `fine`, `none`
- Neutral surface colors live in the `NEUTRAL` object

---

## Data model

```js
{
  id: string,          // e.g. 'it_abc_xyz'
  location: string,    // 'freezer' | 'fridge' | 'cellar' | 'pantry'
  name: string,
  category: string,    // must be valid for the given location (see CATEGORIES in theme.jsx)
  description: string, // optional, can be empty string
  qty: number,
  unit: string,        // one of UNITS array in theme.jsx
  dateAdded: string,   // ISO date 'yyyy-MM-dd'
  expiry: string,      // ISO date 'yyyy-MM-dd' or '' if no expiry
  addedBy: string,     // user's display name
}
```

---

## Expiry logic

Defined in `theme.jsx`, used everywhere:

| Status | Condition | Dot | Text | Background |
|---|---|---|---|---|
| `expired` | days < 0 | `#D11A2A` | `#A0121F` | `#FBE3E5` |
| `soon` | 0 ≤ days ≤ 7 | `#E07A0C` | `#9A4E00` | `#FCEBD6` |
| `fine` | days > 7 | `#2E8B4F` | `#1F6B3A` | `#E1F2E6` |
| `none` | no expiry set | `#9AA0A6` | `#6B7177` | `#EEF0ED` |

Use `expiryStatus(item.expiry)` — never reimplement this logic inline.

---

## Categories per location

```
freezer:  Meat & Fish, Poultry, Seafood, Vegetables, Fruits,
          Meals & Leftovers, Bread & Dough, Dairy, Other

fridge:   Dairy & Eggs, Meat & Fish, Fruits & Vegetables, Leftovers,
          Drinks & Juices, Condiments & Sauces, Other

cellar:   Wine & Drinks, Canned Goods, Jarred Goods, Root Vegetables,
          Home Preserves & Jams, Other

pantry:   Pasta & Rice, Flour & Baking, Canned & Jarred, Oils & Vinegars,
          Spices & Herbs, Snacks, Cereals & Grains, Other
```

Always use `CATEGORIES[locationKey]` — never hardcode category lists.

---

## Animations (defined in HTML `<style>`)

| Class / keyframe | Used for |
|---|---|
| `fst-fade` | Overlays appearing |
| `fst-slide-up` | Bottom sheets sliding up |
| `fst-slide-down` | Notifications panel sliding down |
| `fst-pop` | Dialogs and newly added cards |
| `.fst-card:active` | Card press feedback (scale 0.985) |
| `.fst-noscroll` | Hides scrollbar on filter chip rows |

Do not remove or rename these — many components reference them by name.

---

## Common tasks

### Add a new field to an item
1. Add the field to the data model description above
2. Add it to `AddEditSheet` in `screens.jsx` (form field + state)
3. Add it to `DetailSheet` in `screens.jsx` (display row)
4. Update `saveItem` in `app.jsx` if any default value logic is needed
5. Update seed data in `data.jsx` if it's a required field

### Add a new location
1. Add the location config to `LOCATIONS` in `theme.jsx`
2. Add its key to `LOCATION_ORDER` in `theme.jsx`
3. Add its categories to `CATEGORIES` in `theme.jsx`
4. Add seed items for it in `data.jsx`
5. The rest (BottomNav, tabs, filtering) is driven by `LOCATION_ORDER` automatically

### Change a color
Only edit `theme.jsx`. Never touch colors in other files.

### Add a new icon
Add an SVG path string to `ICON_PATHS` in `icons.jsx`. Use `<Icon name="yourIcon" />` anywhere.

---

## Do not do these things

- Do not split `App()` into multiple files — state and mutations must stay together
- Do not use `fetch()` or any backend API — this is a fully offline app
- Do not add authentication — the name entry screen is the only identity mechanism
- Do not use `localStorage` for items — use `window.storage` with `shared: true`
- Do not hardcode colors, categories, or location names outside `theme.jsx`
- Do not add new npm dependencies or CDN libraries without a strong reason
- Do not change the phone bezel dimensions (412×880px) — the layout is designed for this size