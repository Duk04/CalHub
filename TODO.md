# CalHub — TODO Feature List

CalAI судалгаа + codebase analysis дээр үндэслэн гаргасан хийх ажлуудын жагсаалт.

---

## 🔴 Priority 1 — Хагас хийгдсэнийг дуусгах

- [ ] **Barcode Scanning API** — `src/app/api/barcode/route.ts` үүсгэж Open Food Facts API (`https://world.openfoodfacts.org/api/v2/product/{barcode}.json`) холбох. UI (`log/page.tsx`) аль хэдийн бий.

- [ ] **Meal Planning Page + API** — DB schema (`MealPlan`, `MealPlanItem`) Prisma-д бэлэн. `src/app/(dashboard)/meal-plan/page.tsx` + `src/app/api/meal-plan/route.ts` нэмэх. 7 өдрийн grid view, хоол нэмэх/устгах.

- [ ] **CSV Data Export** — `src/app/api/export/route.ts` — food log-ийг CSV болгон татаж авах endpoint. Profile page-аас "Өгөгдөл татах" товч нэмэх.

---

## 🟡 Priority 2 — CalAI-аас илүү болгох

- [ ] **Meal Health Score** — `/api/analyze` response-д nutrition дээр үндэслэн 0–100 health score нэмэх. Log page болон FoodCard дотор харуулах. (нэмэлт API шаардлагагүй — тооцооллоор хийнэ)

- [ ] **Streak Tracking + StreakBadge** — `src/components/StreakBadge.tsx` component хэрэгжүүлэх (spec-д заасан ч хийгдээгүй). `/api/stats` дотор дараалсан өдрийн тоо тооцоолох. Home page дээр харуулах.

- [ ] **Exercise Calorie Toggle** — Home page-д дасгалын kcal нэмэх toggle. Workout page-тэй холбоно. `FoodLog` эсвэл тусдаа `ExerciseLog` model ашиглаж өдрийн нийт калорийн бюджетэд нэмэх.

- [ ] **Progress Photos** — `src/app/(dashboard)/progress/page.tsx` шинэ page. Biеийн өөрчлөлтийн зураг Vercel Blob-д хадгалах, timeline харуулах. Prisma-д `ProgressPhoto` model нэмэх.

- [ ] **BMI + TDEE Calculator** — `src/lib/calories.ts`-д BMI, TDEE функц нэмэх. Profile page дотор тусдаа tab болгон харуулах.

---

## 🟢 Priority 3 — CalHub өвөрмөц (CalAI-д байхгүй)

- [ ] **Монгол Хоолны Recipe Database** — Бууз, цуйван, хуушуур гэх мэт хоолны дэлгэрэнгүй жор `src/lib/mongolian-foods.ts`-д нэмэх. Meal Plan дотор recipe харах боломж.

- [ ] **Монгол Бүтээгдэхүүний Barcode Database** — Монголын дотоодын бүтээгдэхүүн Open Food Facts-д байхгүй тул custom database үүсгэх. `prisma/seed.ts`-д Монгол бараануудыг seed хийх.

- [ ] **Friends / Group Challenge** — Урилгын холбоосоор найзтайгаа group үүсгэх. 7 хоногийн challenge (ус, калори). Prisma-д `Group`, `GroupMember`, `Challenge` model нэмэх.

- [ ] **PWA Push Notifications** — `next-pwa` package нэмэх, service worker тохируулах. Notification logic (`src/lib/dashboard-notifications.ts`) аль хэдийн бий — push delivery нэмэх. Хоолны сануулга автоматаар цэвэрлэгдэх логик.

---

## 📝 Жижиг сайжруулалтууд

- [ ] `src/components/LanguageSwitcher.tsx` — Spec-д заасан ч component файл үүсгэгдээгүй. Navbar эсвэл Profile-д харуулах.
- [ ] `src/components/StreakBadge.tsx` — Дээрх streak feature-тэй хамт хийх.
- [ ] Vercel Blob image upload — Одоогоор dev-д base64 pass хийж байна. Production-д `src/lib/blob.ts` ашиглаж зургийг Blob-д upload хийх.
- [ ] Rate limit сайжруулалт — In-memory map cold start-д reset болдог. Redis эсвэл Upstash-руу шилжих.

---

## ✅ Хийгдсэн

- [x] AI food photo analysis (OpenAI Vision)
- [x] Mongolian food recognition (30 хоол, custom nutrition DB)
- [x] Manual food entry
- [x] Daily food log (breakfast, lunch, dinner, snack)
- [x] Water tracking
- [x] Weight tracking + chart
- [x] User accounts, JWT auth, bcrypt
- [x] Calorie goal calculator (Mifflin-St Jeor)
- [x] Favorites
- [x] History & stats (weekly/monthly Recharts)
- [x] Smart notifications (dashboard)
- [x] Multi-language UI (Mongolian/English, next-intl)
- [x] Workout generator (AI-powered, GPT-4o-mini)
- [x] Password reset flow (email token)
- [x] Rate limiting middleware
