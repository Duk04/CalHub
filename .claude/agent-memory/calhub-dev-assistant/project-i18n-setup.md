---
name: next-intl setup (without routing)
description: How next-intl is configured in CalHub — no locale URL segments, locale from calhub_lang cookie
type: project
---

CalHub uses next-intl in "without routing" mode (no `/mn/` or `/en/` URL prefix).

- Config file: `src/i18n/request.ts` — reads `calhub_lang` cookie, falls back to `mn`
- Plugin wired in `next.config.mjs` via `createNextIntlPlugin('./src/i18n/request.ts')`
- Provider: `NextIntlClientProvider` wraps children in `src/app/layout.tsx` (async server component)
- Locale cookie `calhub_lang` is set (httpOnly: false so client can read it) in:
  - `POST /api/auth/login` — from `user.language` DB field
  - `POST /api/auth/register` — defaults to `mn`
  - `PATCH /api/user` — when `language` field is included in the update body
- Helper: `setLocaleCookie(response, locale)` in `src/lib/auth.ts`

**Why:** App has no locale-based routing; locale is a per-user preference stored in DB and mirrored to a cookie for server-side rendering.

**How to apply:** When adding new components that need translated strings, use `useTranslations('namespace')` (client components) or `getTranslations('namespace')` (server components). Always add keys to both `src/i18n/mn.json` and `src/i18n/en.json`.
