# CalHub — Calorie Tracking App (CalAI-style)

## Project Overview
CalHub is a mobile-first calorie tracking web app similar to CalAI. Users can photograph food, scan barcodes, or manually search to log meals. The app uses AI (OpenAI Vision) to identify food and estimate nutritional information. It has **enhanced recognition for Mongolian foods** (бууз, хуушуур, цуйван, банш, хуурга, тавагтай хоол, гурилтай шөл, боодог, хорхог гэх мэт) which are underrepresented in standard AI food databases. The UI supports both **Mongolian (mn)** and **English (en)** languages.

## Tech Stack
- **Framework:** Next.js 15 (App Router, TypeScript)
- **Database:** PostgreSQL via Neon (serverless) + Prisma ORM
- **Auth:** JWT-based authentication (stored in httpOnly cookies) + Next.js middleware
- **AI:** OpenAI GPT-4o Vision API — food recognition + nutrition estimation
- **Image Storage:** Vercel Blob (production) / base64 passthrough (dev)
- **Styling:** Tailwind CSS + Framer Motion (animations)
- **Charts:** Recharts (weekly/monthly calorie & macro charts)
- **PWA:** next-pwa — installable on mobile, offline food log viewing
- **i18n:** next-intl — Mongolian (mn) and English (en) language support
- **Deployment:** Vercel

## Environment Variables
```
DATABASE_URL        — Neon PostgreSQL connection string
JWT_SECRET          — Secret for signing JWT tokens (min 32 chars)
OPENAI_API_KEY      — OpenAI API key for Vision + Chat
BLOB_READ_WRITE_TOKEN — Vercel Blob storage token
NEXT_PUBLIC_APP_URL — App base URL (e.g., https://calhub.vercel.app)
```

## Core Features
1. **Food photo analysis** — upload or capture a photo, AI returns food name + macros (calories, protein, fat, carbs, fiber)
2. **Mongolian food recognition** — custom system prompt with Mongolian food nutrition database so GPT-4o accurately identifies local dishes
3. **Manual food entry** — search from a food database or enter custom foods with nutrition info
4. **Barcode scanning** — scan packaged food barcodes to auto-fill nutrition (Open Food Facts API)
5. **Daily food log** — log meals by type (breakfast, lunch, dinner, snack), track daily calorie/macro totals
6. **Water tracking** — log daily water intake (glasses/ml), daily goal with progress indicator
7. **Weight tracking** — log weight over time, visualize trend with chart
8. **User accounts** — register/login, personal daily calorie & macro goals, profile settings
9. **Goal setting** — calorie goal calculator based on age, height, weight, activity level (Mifflin-St Jeor)
10. **Favorites & frequent foods** — save frequently eaten foods for quick re-logging
11. **Meal planning** — create and save meal plans for the week
12. **History & stats** — weekly/monthly calorie & macro charts, streak tracking
13. **Notifications** — meal reminders via Push API (PWA)
14. **Data export** — export food log as CSV
15. **Multi-language UI** — full Mongolian and English interface

## Project Structure
```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (dashboard)/
      page.tsx                — daily log / home
      log/page.tsx            — add food entry (photo, manual, barcode)
      history/page.tsx        — past logs with charts
      profile/page.tsx        — user profile & goal settings
      favorites/page.tsx      — saved favorite foods
      weight/page.tsx         — weight tracking & chart
      meal-plan/page.tsx      — weekly meal planner
    api/
      auth/
        register/route.ts
        login/route.ts
        logout/route.ts
        me/route.ts           — GET current user from JWT
      analyze/route.ts        — POST: image → AI → nutrition data
      barcode/route.ts        — GET: barcode → Open Food Facts → nutrition
      log/route.ts            — GET/POST food log entries
      log/[id]/route.ts       — PATCH/DELETE single log entry
      favorites/route.ts      — GET/POST/DELETE favorite foods
      water/route.ts          — GET/POST daily water intake
      weight/route.ts         — GET/POST weight entries
      user/route.ts           — GET/PATCH user profile & goals
      export/route.ts         — GET: export logs as CSV
      stats/route.ts          — GET: aggregated stats (weekly/monthly)
  components/
    ui/                       — reusable UI primitives (Button, Input, Modal, etc.)
    FoodCamera.tsx            — camera capture + image upload component
    FoodCard.tsx              — displays analyzed food + macros
    FoodSearch.tsx            — search food database + manual entry
    BarcodeScanner.tsx        — barcode scanner using camera
    MacroBar.tsx              — visual macro breakdown (horizontal bar)
    MacroRing.tsx             — circular macro chart
    DailyProgress.tsx         — calorie progress ring + macro summary
    WaterTracker.tsx          — water intake tracker with glass icons
    WeightChart.tsx           — weight trend line chart
    CalorieChart.tsx          — weekly/monthly calorie bar chart
    MealTypeSelector.tsx      — breakfast/lunch/dinner/snack selector
    FavoriteButton.tsx        — toggle favorite on food items
    StreakBadge.tsx           — logging streak display
    Navbar.tsx                — bottom navigation bar (mobile)
    LanguageSwitcher.tsx      — MN/EN language toggle
  lib/
    prisma.ts                 — Prisma client singleton
    auth.ts                   — JWT sign/verify/getUserFromRequest helpers
    openai.ts                 — OpenAI client + food analysis function
    mongolian-foods.ts        — Mongolian food database & nutrition reference
    calories.ts               — Mifflin-St Jeor calorie calculator
    validations.ts            — Zod schemas for API request validation
    rate-limit.ts             — simple in-memory rate limiter for API routes
    blob.ts                   — Vercel Blob upload helper
    constants.ts              — app-wide constants (macro colors, meal types, defaults)
  hooks/
    useAuth.ts                — auth state hook (current user, logout)
    useCamera.ts              — camera access + capture hook
    useDailyLog.ts            — fetch & mutate today's food log
    useWater.ts               — water tracking hook
  types/
    index.ts                  — shared TypeScript interfaces (User, FoodLog, NutritionData, etc.)
    api.ts                    — API request/response types
  i18n/
    mn.json                   — Mongolian translations
    en.json                   — English translations
  middleware.ts               — JWT verification + route protection + rate limiting
```

## Mongolian Food Recognition
The AI analysis prompt must include Mongolian food context. Nutrition database for common dishes:

### Мах, гурилан хоол (Meat & noodle dishes)
| Хоол | Калори | Уураг | Өөх тос | Нүүрс ус |
|------|--------|-------|---------|----------|
| Бууз (1 ширхэг ~50г) | 110 kcal | 7г | 6г | 7г |
| Хуушуур (1 ширхэг ~80г) | 200 kcal | 8г | 12г | 18г |
| Цуйван (100г) | 220 kcal | 10г | 8г | 28г |
| Банш шөлтэй (100г) | 130 kcal | 7г | 5г | 14г |
| Бантан (100г) | 100 kcal | 6г | 3г | 12г |
| Тавагтай хоол (100г) | 90 kcal | 5г | 3г | 12г |
| Гурилтай шөл (100г) | 90 kcal | 5г | 3г | 12г |
| Хуурга (100г) | 180 kcal | 12г | 10г | 10г |
| Боодог (100г) | 250 kcal | 18г | 18г | 0г |
| Хорхог (100г) | 250 kcal | 18г | 18г | 0г |
| Шарсан мах (100г) | 270 kcal | 20г | 20г | 2г |
| Чанасан мах (100г) | 230 kcal | 22г | 15г | 0г |
| Пиражок (1 ширхэг ~100г) | 280 kcal | 8г | 14г | 30г |
| Манты (1 ширхэг ~60г) | 130 kcal | 7г | 6г | 12г |
| Цэвэр шөл (100мл) | 30 kcal | 3г | 1г | 2г |

### Будаа, гарнир (Rice & sides)
| Хоол | Калори | Уураг | Өөх тос | Нүүрс ус |
|------|--------|-------|---------|----------|
| Үүрэг будаа (100г) | 160 kcal | 8г | 4г | 24г |
| Цагаан будаа (100г) | 130 kcal | 3г | 0.5г | 28г |
| Шарсан будаа (100г) | 180 kcal | 6г | 6г | 26г |
| Нөөхийтэй будаа (100г) | 170 kcal | 7г | 5г | 24г |
| Төмстэй хуурга (100г) | 150 kcal | 4г | 6г | 20г |

### Сүүн бүтээгдэхүүн, ундаа (Dairy & drinks)
| Хоол | Калори | Уураг | Өөх тос | Нүүрс ус |
|------|--------|-------|---------|----------|
| Айраг (100мл) | 50 kcal | 2г | 2г | 5г |
| Тараг (100г) | 60 kcal | 4г | 3г | 5г |
| Сүүтэй цай (100мл) | 40 kcal | 2г | 2г | 3г |
| Ааруул (100г) | 340 kcal | 30г | 8г | 40г |
| Өрөм (100г) | 400 kcal | 4г | 40г | 6г |
| Бяслаг (100г) | 250 kcal | 20г | 15г | 10г |
| Шимийн архи (100мл) | 35 kcal | 0.5г | 0г | 3г |

### Талх, бусад (Bread & other)
| Хоол | Калори | Уураг | Өөх тос | Нүүрс ус |
|------|--------|-------|---------|----------|
| Гамбир (1 ширхэг ~80г) | 200 kcal | 5г | 4г | 36г |
| Боорцог (100г) | 450 kcal | 8г | 20г | 58г |
| Ул боов (100г) | 420 kcal | 7г | 16г | 62г |

Always include this full nutrition database in the OpenAI system prompt for food analysis.

## OpenAI Food Analysis Prompt Pattern
```typescript
const systemPrompt = `You are a nutrition analysis AI with deep expertise in Mongolian cuisine and international foods.

When analyzing food images:
1. Identify the dish name in both English and Mongolian (if it is a Mongolian dish)
2. Estimate the portion size visible in the image
3. For Mongolian dishes (бууз, хуушуур, цуйван, банш, хуурга, тавагтай хоол, боодог, хорхог, бантан, пиражок, ааруул, өрөм, гамбир, боорцог, etc.), use the provided Mongolian food nutrition database for accurate estimates
4. For countable items (бууз, хуушуур, банш), estimate the count and multiply per-piece values
5. If multiple food items are visible, list each separately
6. Rate your confidence from 0 to 1

Return JSON array:
[{
  foodName: string,
  mongolianName?: string,
  servingSize: string,
  quantity: number,
  calories: number,
  protein: number,
  fat: number,
  carbs: number,
  fiber: number,
  confidence: number
}]`
```

## Database Schema (Prisma)
```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  passwordHash  String
  name          String?
  avatarUrl     String?
  calorieGoal   Int           @default(2000)
  proteinGoal   Int           @default(150)
  fatGoal       Int           @default(65)
  carbGoal      Int           @default(250)
  waterGoal     Int           @default(8)       // glasses per day
  age           Int?
  height        Float?                           // cm
  weight        Float?                           // kg
  activityLevel String?                          // sedentary, light, moderate, active, very_active
  gender        String?                          // male, female
  language      String        @default("mn")     // mn or en
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  foodLogs      FoodLog[]
  favorites     Favorite[]
  waterLogs     WaterLog[]
  weightLogs    WeightLog[]
  mealPlans     MealPlan[]
}

model FoodLog {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  foodName      String
  mongolianName String?
  calories      Float
  protein       Float
  fat           Float
  carbs         Float
  fiber         Float    @default(0)
  servingSize   String
  quantity      Float    @default(1)
  imageUrl      String?
  barcode       String?
  mealType      String   @default("other")  // breakfast, lunch, dinner, snack
  loggedAt      DateTime @default(now())
  createdAt     DateTime @default(now())

  @@index([userId, loggedAt])
}

model Favorite {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  foodName      String
  mongolianName String?
  calories      Float
  protein       Float
  fat           Float
  carbs         Float
  fiber         Float    @default(0)
  servingSize   String
  barcode       String?
  createdAt     DateTime @default(now())

  @@unique([userId, foodName])
}

model WaterLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  glasses   Int
  date      DateTime @db.Date
  createdAt DateTime @default(now())

  @@unique([userId, date])
}

model WeightLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  weight    Float    // kg
  date      DateTime @db.Date
  createdAt DateTime @default(now())

  @@unique([userId, date])
}

model MealPlan {
  id        String         @id @default(cuid())
  userId    String
  user      User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String
  items     MealPlanItem[]
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt
}

model MealPlanItem {
  id            String   @id @default(cuid())
  mealPlanId    String
  mealPlan      MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  dayOfWeek     Int      // 0=Monday ... 6=Sunday
  mealType      String   // breakfast, lunch, dinner, snack
  foodName      String
  mongolianName String?
  calories      Float
  protein       Float
  fat           Float
  carbs         Float
  servingSize   String
}
```

## Key Implementation Notes

### Auth & Security
- JWT stored in httpOnly cookie (`calhub_token`), verified in `middleware.ts`
- `middleware.ts` protects all `/api/*` (except auth routes) and `/(dashboard)/*` routes
- Passwords hashed with bcrypt (min 12 rounds)
- API routes validate input with Zod schemas before processing
- Rate limiting: 10 req/min for `/api/analyze`, 30 req/min for other API routes
- CSRF protection via SameSite cookie + origin check

### Image Handling
- `FoodCamera.tsx` uses `getUserMedia` API for camera capture on mobile
- Images compressed client-side (max 1MB, 1024px) before upload using canvas
- In production, upload to Vercel Blob and store URL in `imageUrl`
- In development, pass base64 directly to OpenAI (no Blob needed)
- `FormData` for image uploads in `/api/analyze` (Next.js handles multipart)

### Database
- Prisma client must be singleton (see `lib/prisma.ts` pattern) to avoid connection pool issues with Neon
- Use `@@index` on frequently queried fields (userId + loggedAt)
- All delete operations cascade from User

### UI/UX
- Mobile-first responsive design — optimized for 375px+ screens
- Bottom navigation bar with 5 tabs: Home, Log, Favorites, Stats, Profile
- Camera/upload flow must work natively on mobile browsers
- Smooth animations with Framer Motion (page transitions, progress rings)
- Dark mode support via Tailwind `dark:` classes
- Loading skeletons for async data

### PWA
- Service worker for offline food log viewing (cached GET responses)
- App manifest with CalHub icon for home screen install
- Push notifications for meal reminders (configurable times)

### Barcode Scanning
- Use `BarcodeDetector` API (with fallback to `zxing-wasm` for unsupported browsers)
- Query Open Food Facts API (`https://world.openfoodfacts.org/api/v2/product/{barcode}.json`)
- If product found, auto-fill nutrition; if not, fall back to manual entry

### i18n
- Default language: Mongolian (mn)
- All UI strings in `i18n/mn.json` and `i18n/en.json`
- User language preference saved in DB and cookie
- Food names display both Mongolian and English when available

## API Response Format
All API routes return consistent shape:
```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: string }

// With pagination
{ data: T[], error: null, pagination: { page: number, pageSize: number, total: number } }
```

HTTP status codes: 200 (success), 201 (created), 400 (validation), 401 (unauthorized), 404 (not found), 429 (rate limited), 500 (server error).

## Development Commands
```bash
npm run dev              # start dev server
npm run build            # production build
npm run lint             # ESLint check
npm run type-check       # TypeScript strict check
npx prisma migrate dev   # run DB migrations
npx prisma generate      # regenerate Prisma client
npx prisma studio        # DB GUI
npx prisma db seed       # seed Mongolian food database
```

## Code Style
- TypeScript strict mode
- Functional components, no class components
- Server Components by default, `"use client"` only when needed (interactivity, hooks)
- API routes return consistent `{ data, error }` shape
- No `any` types — define proper interfaces in `types/`
- Validate all API inputs with Zod schemas
- Use named exports (not default exports) for components and utilities
- File naming: PascalCase for components, camelCase for utilities/hooks
- Tailwind classes ordered: layout → sizing → spacing → typography → colors → effects
