---
name: CalHub tech debt and missing features
description: Tech debt, anti-patterns, missing features from April 2026 audit
type: project
---

Tech debt and gaps found as of April 2026 audit:

**Why:** Comprehensive audit run to produce improvement backlog.
**How to apply:** Consult before scoping any new feature work to avoid building on broken foundations.

## Missing core features
- Barcode scanning: /api/barcode route, BarcodeScanner component, Open Food Facts integration — all absent
- CSV export: /api/export route — absent
- Favorites page (/favorites) — absent; favorites API exists but no UI page
- Weight tracking page (/weight) — absent; weight API exists but no UI page
- Meal planner page (/meal-plan) — absent; schema exists but no API or UI
- Vercel Blob upload: @vercel/blob installed but not used; all images sent as base64 to OpenAI

## next-intl not wired up
- next-intl installed, mn.json and en.json exist, but no IntlProvider in layout.tsx, no useTranslations() called anywhere — i18n is completely non-functional despite the translations existing

## next-pwa not configured
- next-pwa installed but not configured in next.config.mjs — no service worker, no offline support, no manifest.json (manifest referenced in layout metadata but no public/ directory exists)

## UI hardcodes English despite Mongolian-first spec
- Dashboard (page.tsx): greeting, labels, button text all hardcoded in English
- Log page (log/page.tsx): all UI text hardcoded in English
- Macro goals hardcoded at DAILY_GOALS = { calories: 2000, protein: 150, fat: 65, carbs: 250 } in log/page.tsx line 13 — does not use user's actual goals from the API

## FoodLog [id] route only supports DELETE, not PATCH
- CLAUDE.md specifies PATCH/DELETE; only DELETE is implemented (no way to edit a logged entry)

## Stats timezone bug
- stats/route.ts groups logs by UTC date using .toISOString() — Mongolian users (UTC+8) will see their late-evening meals attributed to the wrong day in charts

## Log route date filter uses local setHours (server timezone)
- log/route.ts lines 16-24 use `new Date(date)` and `setHours()` without timezone handling — server timezone (likely UTC on Vercel) will misalign with Mongolian user's local date

## FoodCard and DailyProgress use dark theme (iOS-style #1C1C1E)
- These two components use a dark color scheme while the rest of the app uses a light cream (#FBFAF4) theme — visual inconsistency; components appear to be from an earlier design iteration

## WaterTracker water tracking disconnect
- useWater hook (hooks/useWater.ts) provides `logWater(newGlasses)` which replaces the total, not increments; WaterTracker component calls onAdd/onRemove correctly but the integration on the home page is not visible (WaterTracker component is not rendered on the home page — glasses comes from useWater but no WaterTracker component is shown)

## Duplicate Zod schemas
- favoriteSchema in favorites/route.ts duplicates logFoodSchema fields — should import a shared schema from validations.ts

## compressCanvas non-null assertion
- useCamera.ts line 82: `canvas.toBlob(b => res(b!), ...)` — the non-null assertion is unsafe; toBlob can return null if the canvas is tainted or the format is unsupported

## Missing error handling in hooks
- useDailyLog.ts: addLog and deleteLog have no try/catch — errors are silently swallowed
- useWater.ts: logWater has no try/catch — optimistic update with no rollback on failure

## No database indexes on Favorite, WaterLog, WeightLog
- Only FoodLog has @@index([userId, loggedAt]); other models queried by userId have no index
