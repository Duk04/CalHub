'use client'

import { useEffect, useState } from 'react'
import { useDailyLog } from '@/hooks/useDailyLog'
import { useWater } from '@/hooks/useWater'
import { useAuth } from '@/hooks/useAuth'
import DailyProgress from '@/components/DailyProgress'
import WaterTracker from '@/components/WaterTracker'
import FoodCard from '@/components/FoodCard'
import { MEAL_TYPES } from '@/lib/constants'
import type { MealType } from '@/types'

export default function HomePage() {
  const { user } = useAuth()
  const { logs, loading, stats, deleteLog } = useDailyLog()
  const { glasses, logWater } = useWater()
  const [today, setToday] = useState('')

  useEffect(() => {
    const formatted = new Intl.DateTimeFormat('mn-MN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Ulaanbaatar',
    }).format(new Date())

    setToday(formatted)
  }, [])

  const logsByMeal = MEAL_TYPES.map(mt => ({
    ...mt,
    logs: logs.filter(l => l.mealType === mt.value),
  })).filter(mt => mt.logs.length > 0)

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Сайн байна уу{user?.name ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
        </div>
      </div>

      <DailyProgress
        calories={Math.round(stats.calories)}
        calorieGoal={user?.calorieGoal ?? 2000}
        protein={Math.round(stats.protein)}
        fat={Math.round(stats.fat)}
        carbs={Math.round(stats.carbs)}
        proteinGoal={user?.proteinGoal ?? 150}
        fatGoal={user?.fatGoal ?? 65}
        carbGoal={user?.carbGoal ?? 250}
      />

      <WaterTracker
        glasses={glasses}
        goal={user?.waterGoal ?? 8}
        onAdd={() => logWater(glasses + 1)}
        onRemove={() => logWater(Math.max(0, glasses - 1))}
      />

      <div className="space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-600">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-sm">Өнөөдөр хоол бүртгэгдээгүй байна</p>
          </div>
        ) : (
          logsByMeal.map(mt => (
            <div key={mt.value}>
              <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-1.5">
                <span>{mt.emoji}</span>
                <span>{mt.labelMn}</span>
                <span className="text-xs ml-auto">
                  {Math.round(mt.logs.reduce((s, l) => s + l.calories * l.quantity, 0))} ккал
                </span>
              </h2>
              {mt.logs.map(log => (
                <FoodCard
                  key={log.id}
                  log={log}
                  onDelete={() => deleteLog(log.id)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
