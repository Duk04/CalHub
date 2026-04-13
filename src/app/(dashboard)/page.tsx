'use client'

import Link from 'next/link'
import { Bell, ChevronRight, Drumstick, Pencil, Trash2, UtensilsCrossed, Wheat } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useDailyLog } from '@/hooks/useDailyLog'
import { useWater } from '@/hooks/useWater'
import { useAuth } from '@/hooks/useAuth'
import { buildDashboardNotifications } from '@/lib/dashboard-notifications'
import { MEAL_TYPES } from '@/lib/constants'
import type { FoodLog, MealType } from '@/types'

interface WeekChip {
  day: string
  date: string
  isToday: boolean
}

function buildGreeting(hour: number) {
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

function buildWeekChips(now: Date): WeekChip[] {
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(now)
  monday.setDate(now.getDate() - mondayOffset)

  return Array.from({ length: 7 }, (_, index) => {
    const chipDate = new Date(monday)
    chipDate.setDate(monday.getDate() + index)

    return {
      day: new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        timeZone: 'Asia/Ulaanbaatar',
      }).format(chipDate),
      date: new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        timeZone: 'Asia/Ulaanbaatar',
      }).format(chipDate),
      isToday: chipDate.toDateString() === now.toDateString(),
    }
  })
}

interface EditForm {
  quantity: number
  calories: number
  protein: number
  fat: number
  carbs: number
  mealType: MealType
}

export default function HomePage() {
  const { user } = useAuth()
  const { logs, loading, stats, deleteLog, updateLog } = useDailyLog()
  const { glasses } = useWater()
  const [greeting, setGreeting] = useState('Good Morning')
  const [weekChips, setWeekChips] = useState<WeekChip[]>([])
  const [editingLog, setEditingLog] = useState<FoodLog | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    quantity: 1,
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    mealType: 'other',
  })

  useEffect(() => {
    const now = new Date()
    setGreeting(buildGreeting(now.getHours()))
    setWeekChips(buildWeekChips(now))
  }, [])

  const openEdit = (log: FoodLog) => {
    setEditingLog(log)
    setEditForm({
      quantity: log.quantity,
      calories: log.calories,
      protein: log.protein,
      fat: log.fat,
      carbs: log.carbs,
      mealType: log.mealType,
    })
  }

  const saveEdit = async () => {
    if (!editingLog) return
    await updateLog(editingLog.id, editForm)
    setEditingLog(null)
  }

  const calorieGoal = user?.calorieGoal ?? 2000
  const carbGoal = user?.carbGoal ?? 250
  const proteinGoal = user?.proteinGoal ?? 150
  const calorieProgress = Math.min((stats.calories / calorieGoal) * 100, 100)
  const carbsProgress = Math.min((stats.carbs / carbGoal) * 100, 100)
  const proteinProgress = Math.min((stats.protein / proteinGoal) * 100, 100)
  const notifications = buildDashboardNotifications({ user, stats, glasses })

  const logsByMeal = MEAL_TYPES
    .map((meal) => ({
      ...meal,
      logs: logs.filter((log) => log.mealType === meal.value),
    }))
    .filter((meal) => meal.logs.length > 0)

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 pb-32 pt-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#F57A4A,_#FFB36B)] text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,122,74,0.28)]">
              {(user?.name?.trim()?.[0] ?? 'C').toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#97907F]">{greeting}</p>
              <h1 className="text-[24px] font-semibold tracking-[-0.04em] text-[#161617]">
                {user?.name ? user.name : 'CalHub'}
              </h1>
            </div>
          </div>

          <Link
            href="/notifications"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E1CF] bg-white text-[#1B1B1D] shadow-[0_12px_25px_rgba(209,203,182,0.18)]"
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5" strokeWidth={2} />
            {notifications.length > 0 && (
              <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#CDB5F8] px-1 text-[10px] font-semibold text-[#1C1428]">
                {notifications.length}
              </span>
            )}
          </Link>
        </header>

        <section className="mb-7">
          <div className="grid grid-cols-7 gap-2">
            {weekChips.map((chip) => (
              <div
                key={`${chip.day}-${chip.date}`}
                className={`rounded-[18px] px-2 py-2.5 text-center transition-colors ${
                  chip.isToday
                    ? 'bg-[#C7E44C] text-white shadow-[0_18px_35px_rgba(199,228,76,0.32)]'
                    : 'bg-white text-[#8F8777] border border-[#ECE5D5]'
                }`}
              >
                <div className="text-[10px] font-semibold">{chip.day}</div>
                <div className="mt-1 text-sm font-semibold">{chip.date}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3">
            <p className="text-lg font-semibold tracking-[-0.03em] text-[#161617]">Count Your Daily Calories</p>
            <p className="text-sm text-[#7B7467]">Keep an eye on energy and macros before your next meal.</p>
          </div>

          <div className="grid grid-cols-[1.55fr_1fr] gap-3">
            <div className="rounded-[30px] bg-[#CDB5F8] p-5 text-[#18131F] shadow-[0_24px_50px_rgba(181,154,241,0.18)]">
              <div className="mb-5 inline-flex rounded-full bg-white/60 px-3 py-1 text-xs font-semibold">Calories</div>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                <div className="relative h-[122px] w-[122px]">
                  <svg viewBox="0 0 200 120" className="h-full w-full overflow-visible">
                    <path
                      d="M30 100 A70 70 0 0 1 170 100"
                      fill="none"
                      stroke="rgba(0,0,0,0.12)"
                      strokeWidth="16"
                      strokeLinecap="round"
                      pathLength="100"
                    />
                    <path
                      d="M30 100 A70 70 0 0 1 170 100"
                      fill="none"
                      stroke="#1A1321"
                      strokeWidth="16"
                      strokeLinecap="round"
                      pathLength="100"
                      strokeDasharray="100"
                      strokeDashoffset={100 - calorieProgress}
                    />
                  </svg>
                  <div className="absolute inset-x-0 bottom-4 text-center">
                    <div className="text-[28px] font-semibold leading-none">{Math.round(stats.calories)}</div>
                    <div className="mt-2 flex items-center justify-between px-3 text-[10px] font-medium uppercase text-[#4F4461]">
                      <span>0</span>
                      <span>Limit</span>
                      <span>{calorieGoal}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 text-right">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#5D536E]">Goal</div>
                    <div className="mt-1 text-2xl font-semibold">{calorieGoal}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#5D536E]">Remaining</div>
                    <div className="mt-1 text-lg font-semibold">{Math.max(calorieGoal - Math.round(stats.calories), 0)} kcal</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <MacroCard
                label="Carbs"
                value={Math.round(stats.carbs)}
                goal={carbGoal}
                progress={carbsProgress}
                accent="#E0A500"
                surface="#FFF6D8"
                icon={<Wheat className="h-4 w-4" strokeWidth={2} />}
              />
              <MacroCard
                label="Protein"
                value={Math.round(stats.protein)}
                goal={proteinGoal}
                progress={proteinProgress}
                accent="#3EBB78"
                surface="#EAF8F0"
                icon={<Drumstick className="h-4 w-4" strokeWidth={2} />}
              />
            </div>
          </div>
        </section>

        <section className="flex-1">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#161617]">Diet Plan</h2>
              <p className="text-sm text-[#7B7467]">Meal cards based on today&apos;s food log.</p>
            </div>
            <Link href="/log" className="inline-flex items-center gap-1 text-sm font-medium text-[#F57A4A]">
              Add meal
              <ChevronRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((item) => (
                <div key={item} className="h-40 rounded-[28px] border border-[#ECE5D5] bg-white skeleton" />
              ))}
            </div>
          ) : logsByMeal.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-[#E4DCCB] bg-white p-6 shadow-[0_18px_45px_rgba(219,215,195,0.22)]">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1EA] text-[#F57A4A]">
                <UtensilsCrossed className="h-6 w-6" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#161617]">Build today&apos;s plan</h3>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[#7B7467]">
                Add breakfast, lunch, or dinner entries and this section will turn into visual meal cards like the reference.
              </p>
              <Link href="/log" className="mt-5 inline-flex rounded-full bg-[#F57A4A] px-4 py-2 text-sm font-semibold text-white">
                Log your first meal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {logsByMeal.map((meal) => {
                const totalCalories = Math.round(meal.logs.reduce((sum, log) => sum + log.calories * log.quantity, 0))
                const cover = meal.logs.find((log) => log.imageUrl)?.imageUrl ?? null
                return (
                  <article
                    key={meal.value}
                    className="overflow-hidden rounded-[28px] border border-[#ECE5D5] bg-white shadow-[0_18px_45px_rgba(219,215,195,0.22)]"
                  >
                    {/* Cover image / hero area */}
                    <div className="relative">
                      {cover ? (
                        <img src={cover} alt={meal.labelEn} className="h-36 w-full object-cover" />
                      ) : (
                        <div className="flex h-36 items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.18),_transparent_34%),linear-gradient(135deg,_#F8F2E4_0%,_#F1E7D3_80%)] text-5xl">
                          {meal.emoji}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#201B16]/60 via-transparent to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                        <div>
                          <div className="mb-1 inline-flex rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-[#655D50]">
                            {meal.logs.length} item{meal.logs.length > 1 ? 's' : ''}
                          </div>
                          <h3 className="text-xl font-semibold tracking-[-0.03em] text-white">{meal.labelEn}</h3>
                        </div>
                        <div className="rounded-[22px] bg-white/85 px-4 py-3 text-right backdrop-blur-sm">
                          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#7A7367]">Total</div>
                          <div className="mt-1 text-base font-semibold text-[#161617]">{totalCalories} kcal</div>
                        </div>
                      </div>
                    </div>

                    {/* Individual food item rows */}
                    <ul className="divide-y divide-[#F4EEE2]">
                      {meal.logs.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-[#161617]">
                              {item.mongolianName ?? item.foodName}
                            </p>
                            <p className="mt-0.5 text-xs text-[#97907F]">
                              {item.quantity > 1 ? `${item.quantity} × ` : ''}{item.servingSize} · {Math.round(item.calories * item.quantity)} kcal
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button
                              onClick={() => openEdit(item)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[#97907F] transition-colors hover:bg-[#EDF5FF] hover:text-[#3B82F6]"
                              aria-label={`Edit ${item.foodName}`}
                            >
                              <Pencil className="h-4 w-4" strokeWidth={2} />
                            </button>
                            <button
                              onClick={() => deleteLog(item.id)}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-[#97907F] transition-colors hover:bg-[#FFF0EE] hover:text-[#EF4444]"
                              aria-label={`Delete ${item.foodName}`}
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </article>
                )
              })}
            </div>
          )}

          {/* Edit modal */}
          {editingLog && (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
              onClick={() => setEditingLog(null)}
            >
              <div
                className="w-full max-w-lg rounded-t-[28px] bg-white p-6 shadow-[0_-12px_40px_rgba(0,0,0,0.14)]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-1 h-1 w-10 rounded-full bg-[#E4DCCB] mx-auto" />
                <h3 className="mt-4 text-lg font-semibold tracking-[-0.03em] text-[#161617]">
                  {editingLog.mongolianName ?? editingLog.foodName}
                </h3>
                {editingLog.mongolianName && (
                  <p className="mt-0.5 text-sm text-[#97907F]">{editingLog.foodName}</p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3">
                  {/* Quantity */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#7B7467]">Quantity</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={editForm.quantity}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, quantity: parseFloat(e.target.value) || 1 }))
                      }
                      className="w-full rounded-xl border border-[#E4DCCB] px-3 py-2 text-sm text-[#161617] focus:outline-none focus:ring-2 focus:ring-[#F57A4A]/40"
                    />
                  </div>

                  {/* Calories */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#7B7467]">Calories</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.calories}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, calories: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full rounded-xl border border-[#E4DCCB] px-3 py-2 text-sm text-[#161617] focus:outline-none focus:ring-2 focus:ring-[#F57A4A]/40"
                    />
                  </div>

                  {/* Protein */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#7B7467]">Protein (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.protein}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, protein: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full rounded-xl border border-[#E4DCCB] px-3 py-2 text-sm text-[#161617] focus:outline-none focus:ring-2 focus:ring-[#F57A4A]/40"
                    />
                  </div>

                  {/* Carbs */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#7B7467]">Carbs (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.carbs}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, carbs: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full rounded-xl border border-[#E4DCCB] px-3 py-2 text-sm text-[#161617] focus:outline-none focus:ring-2 focus:ring-[#F57A4A]/40"
                    />
                  </div>

                  {/* Fat */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#7B7467]">Fat (g)</label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.fat}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, fat: parseFloat(e.target.value) || 0 }))
                      }
                      className="w-full rounded-xl border border-[#E4DCCB] px-3 py-2 text-sm text-[#161617] focus:outline-none focus:ring-2 focus:ring-[#F57A4A]/40"
                    />
                  </div>

                  {/* Meal type */}
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#7B7467]">Meal Type</label>
                    <select
                      value={editForm.mealType}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, mealType: e.target.value as MealType }))
                      }
                      className="w-full rounded-xl border border-[#E4DCCB] px-3 py-2 text-sm text-[#161617] focus:outline-none focus:ring-2 focus:ring-[#F57A4A]/40"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => setEditingLog(null)}
                    className="flex-1 rounded-2xl border border-[#E4DCCB] py-3 text-sm font-medium text-[#7B7467] transition-colors hover:bg-[#FAF7F2]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="flex-1 rounded-2xl bg-[#F57A4A] py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function MacroCard({
  label,
  value,
  goal,
  progress,
  accent,
  surface,
  icon,
}: {
  label: string
  value: number
  goal: number
  progress: number
  accent: string
  surface: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-[24px] p-4 shadow-[0_12px_30px_rgba(219,215,195,0.18)]" style={{ backgroundColor: surface }}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[#161617]">{label}</div>
          <div className="mt-1 text-xs text-[#7B7467]">{goal} g target</div>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${accent}22`, color: accent }}>
          {icon}
        </div>
      </div>

      <div className="text-2xl font-semibold text-[#161617]">{value} g</div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/8">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: accent }} />
      </div>
    </div>
  )
}
