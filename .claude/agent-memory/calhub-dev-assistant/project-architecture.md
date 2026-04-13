---
name: CalHub actual architecture snapshot
description: What is actually implemented vs CLAUDE.md spec — routes, components, packages, schema facts
type: project
---

What is implemented as of April 2026 audit:

**Why:** Full audit run against CLAUDE.md spec to establish baseline.
**How to apply:** Use this to know what exists before suggesting new features or assuming a file is present.

## Implemented API routes
- /api/auth/login, register, logout, me, forgot-password, reset-password
- /api/analyze (OpenAI Vision, base64 only — no Vercel Blob upload in any route)
- /api/log (GET/POST), /api/log/[id] (DELETE only — no PATCH)
- /api/favorites (GET/POST/DELETE)
- /api/water (GET/POST)
- /api/weight (GET/POST)
- /api/user (GET/PATCH)
- /api/stats (GET — week/month)
- /api/workout/generate (POST — OpenAI gpt-4o-mini, not in spec)

## Missing API routes (in spec, not built)
- /api/barcode (Open Food Facts integration — completely absent)
- /api/export (CSV export — completely absent)

## Implemented pages
- (auth)/login, register, reset-password
- (dashboard)/page (home), log, history, profile, workout, notifications

## Missing pages (in spec, not built)
- /favorites page
- /weight page
- /meal-plan page

## Implemented components
- Navbar, DailyProgress, FoodCard, WaterTracker (in src/components/)
- No BarcodeScanner, FoodCamera, FoodSearch, MacroBar, MacroRing, WeightChart, CalorieChart,
  MealTypeSelector, FavoriteButton, StreakBadge, LanguageSwitcher components exist

## Packages
- Uses both `jsonwebtoken` (Node, in auth.ts) AND `jose` (edge, in auth-edge.ts) — dual JWT libs
- `next-intl` is installed but NOT wired up (no IntlProvider, no useTranslations calls anywhere)
- `next-pwa` is installed but NOT configured in next.config.mjs
- `framer-motion` is installed but NOT used anywhere in the current codebase
- No `zxing-wasm` installed (barcode fallback from spec is absent)
- `@vercel/blob` is installed but NOT used in any route

## Schema facts
- MealPlan and MealPlanItem tables exist in schema but no API routes or pages use them
- No `@@index` on Favorite, WaterLog, WeightLog tables (only FoodLog has one)
- DIRECT_URL required (Neon serverless) — present in .env and schema.prisma

## Key lib facts
- prisma.ts: disables TLS verification in non-production (NODE_TLS_REJECT_UNAUTHORIZED=0)
- next.config.mjs: also disables TLS in non-production at module level
- NODE_TLS_REJECT_UNAUTHORIZED=0 is hardcoded in .env (not just local override)
- Two JWT verification paths: middleware uses raw Web Crypto API (custom impl), API routes use jsonwebtoken via getCurrentUserId()
- auth-edge.ts (jose-based) exists but is NOT used anywhere
- dashboard-notifications.ts: pure in-memory computation (no DB calls, no Push API)
