'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MACRO_COLORS } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'

interface ChartEntry {
  date: string
  calories: number
  protein: number
  fat: number
  carbs: number
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [data, setData] = useState<ChartEntry[]>([])
  const [avgCalories, setAvgCalories] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/stats?period=${period}`)
      .then(r => r.json())
      .then(({ data: d }) => {
        setData(d.chartData ?? [])
        setAvgCalories(d.avgCalories ?? 0)
      })
      .finally(() => setLoading(false))
  }, [period])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Түүх</h1>

      <div className="flex gap-2 mb-4">
        {(['week', 'month'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
              period === p ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {p === 'week' ? '7 хоног' : '30 хоног'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Өдөр тутмын калори</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Дундаж: <span className="font-bold text-orange-500">{avgCalories}</span> ккал
          </span>
        </div>

        {loading ? (
          <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => [`${value} ккал`, 'Калори']}
                labelFormatter={formatDate}
              />
              <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.calories >= (user?.calorieGoal ?? 2000)
                      ? '#ef4444'
                      : MACRO_COLORS.calories}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Уураг', key: 'protein', color: MACRO_COLORS.protein },
          { label: 'Өөх тос', key: 'fat', color: MACRO_COLORS.fat },
          { label: 'Нүүрс ус', key: 'carbs', color: MACRO_COLORS.carbs },
        ].map(m => {
          const avg = data.length
            ? Math.round(data.reduce((s, d) => s + (d[m.key as keyof ChartEntry] as number), 0) / data.filter(d => d.calories > 0).length || 0)
            : 0
          return (
            <div key={m.key} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-3 text-center">
              <div className="text-lg font-bold" style={{ color: m.color }}>{avg}г</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{m.label} дундаж</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
