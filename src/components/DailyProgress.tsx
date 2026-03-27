'use client'

import { MACRO_COLORS } from '@/lib/constants'

interface Props {
  calories: number
  calorieGoal: number
  protein: number
  fat: number
  carbs: number
  proteinGoal: number
  fatGoal: number
  carbGoal: number
}

export default function DailyProgress({
  calories, calorieGoal, protein, fat, carbs, proteinGoal, fatGoal, carbGoal,
}: Props) {
  const pct = Math.min((calories / calorieGoal) * 100, 100)
  const remaining = Math.max(calorieGoal - calories, 0)
  const over = calories > calorieGoal

  const r = 52
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference - (pct / 100) * circumference

  const macros = [
    { label: 'Уураг', val: protein, goal: proteinGoal, color: MACRO_COLORS.protein, bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Өөх тос', val: fat, goal: fatGoal, color: MACRO_COLORS.fat, bg: 'bg-yellow-50 dark:bg-yellow-950', text: 'text-yellow-600 dark:text-yellow-400' },
    { label: 'Нүүрс ус', val: carbs, goal: carbGoal, color: MACRO_COLORS.carbs, bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400' },
  ]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-5">

        {/* Ring */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            {/* Track */}
            <circle cx="60" cy="60" r={r} fill="none" strokeWidth="11"
              className="stroke-gray-100 dark:stroke-gray-800" />
            {/* Progress */}
            <circle
              cx="60" cy="60" r={r} fill="none"
              stroke={over ? '#ef4444' : 'url(#calGrad)'}
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{calories}</span>
            <span className="text-[10px] text-gray-400 mt-0.5 font-medium uppercase tracking-wide">ккал</span>
            <span className="text-[10px] text-gray-400">{Math.round(pct)}%</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 space-y-3">
          {/* Goal summary */}
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Зорилго</span>
            <span className="text-sm font-bold text-gray-800 dark:text-white">{calorieGoal} ккал</span>
          </div>
          <div className={`flex items-center justify-between rounded-2xl px-3 py-2 ${over ? 'bg-red-50 dark:bg-red-950' : 'bg-green-50 dark:bg-green-950'}`}>
            <span className={`text-xs font-medium ${over ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
              {over ? 'Хэтэрсэн' : 'Үлдсэн'}
            </span>
            <span className={`text-sm font-bold ${over ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
              {over ? '+' : ''}{over ? calories - calorieGoal : remaining} ккал
            </span>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {macros.map(m => {
          const macroPct = Math.min((m.val / m.goal) * 100, 100)
          return (
            <div key={m.label} className={`${m.bg} rounded-2xl p-3`}>
              <div className={`text-base font-bold ${m.text}`}>{m.val}г</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{m.label}</div>
              <div className="h-1 bg-white/60 dark:bg-black/20 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${macroPct}%`, backgroundColor: m.color }}
                />
              </div>
              <div className="text-[10px] text-gray-400 mt-1">{m.goal}г зорилго</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
