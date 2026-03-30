'use client'

import { useEffect, useState } from 'react'
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
      .then((r) => r.json())
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
    <div className="mx-auto max-w-lg px-4 pb-8 pt-6">
      <h1 className="mb-4 text-[28px] font-semibold tracking-[-0.04em] text-[#161617]">History</h1>

      <div className="mb-4 flex gap-2">
        {(['week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              period === p ? 'bg-[#97AE29] text-white' : 'border border-[#ECE5D5] bg-white text-[#7D7668]'
            }`}
          >
            {p === 'week' ? '7 days' : '30 days'}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-[28px] border border-[#ECE5D5] bg-white p-4 shadow-[0_18px_45px_rgba(219,215,195,0.22)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-[#4C463B]">Daily calories</span>
          <span className="text-sm text-[#7D7668]">
            Average: <span className="font-bold text-[#F57A4A]">{avgCalories}</span> kcal
          </span>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-xl bg-[#F4EFE3]" />
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                formatter={(value: number) => [`${value} kcal`, 'Calories']}
                labelFormatter={formatDate}
              />
              <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.calories >= (user?.calorieGoal ?? 2000) ? '#ef4444' : MACRO_COLORS.calories}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Protein', key: 'protein', color: MACRO_COLORS.protein },
          { label: 'Fat', key: 'fat', color: MACRO_COLORS.fat },
          { label: 'Carbs', key: 'carbs', color: MACRO_COLORS.carbs },
        ].map((m) => {
          const daysWithLogs = data.filter((d) => d.calories > 0).length
          const avg = daysWithLogs
            ? Math.round(data.reduce((sum, d) => sum + (d[m.key as keyof ChartEntry] as number), 0) / daysWithLogs)
            : 0

          return (
            <div key={m.key} className="rounded-[24px] border border-[#ECE5D5] bg-white p-3 text-center shadow-[0_12px_30px_rgba(219,215,195,0.18)]">
              <div className="text-lg font-bold" style={{ color: m.color }}>{avg}g</div>
              <div className="text-xs text-[#7D7668]">Average {m.label.toLowerCase()}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
