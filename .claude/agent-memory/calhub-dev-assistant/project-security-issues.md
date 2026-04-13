---
name: CalHub security issues found in audit
description: Security gaps and risks discovered in April 2026 codebase audit
type: project
---

Security issues found as of April 2026 audit:

**Why:** Audit revealed several real security problems that should be addressed before production use.
**How to apply:** Flag these in any PR or feature work touching auth, API, or image handling.

1. NODE_TLS_REJECT_UNAUTHORIZED=0 is committed to .env (not gitignored) — disables SSL verification globally for the Node process in all environments where .env is loaded.

2. Password minimum length is 6 characters in registerSchema (validations.ts line 4) and resetPasswordSchema (reset-password/route.ts line 9), but profile page change-password flow requires 8 characters (profile/page.tsx line 344) — inconsistency, and 6 is too short.

3. Change-password flow in profile/page.tsx sends `{ password: newPassword }` to PATCH /api/user, but updateUserSchema in validations.ts has NO `password` field — the request silently does nothing (password is not actually changed).

4. Delete account button in profile/page.tsx has no action wired up — the "Delete" button in the confirmation modal has no onClick handler, so accounts cannot actually be deleted despite the UI suggesting they can.

5. Rate limiter in middleware is in-memory Map — resets on every serverless cold start; provides no real protection on serverless infrastructure like Vercel.

6. The /api/analyze route does NOT verify the JWT (no `getCurrentUserId()` call) — the middleware injects x-user-id header but the route handler never reads it. Any unauthenticated request that bypasses middleware (e.g., direct invocation) can use OpenAI at the app's cost.

7. Duplicate JWT verification: middleware uses a hand-rolled Web Crypto implementation; API routes use `jsonwebtoken` via `getCurrentUserId()`. If the two implementations ever diverge in edge case handling, tokens could be accepted by one and rejected by the other.
