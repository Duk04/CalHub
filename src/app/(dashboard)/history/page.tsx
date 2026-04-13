'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LineChart, Line, CartesianGrid } from 'recharts'
import { TrendingUp, Flame, Zap, Scale } from 'lucide-react'
import { MACRO_COLORS } from '@/lib/constants'
import { useAuth } from '@/hooks/useAuth'

interface ChartEntry {
  date: string
  calories: number
  protein: number
  fat: number
  carbs: number
}

interface WeightEntry {
  id: string
  date: string
  weight: number
}

interface WeightTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function WeightTooltip({ active, payload, label }: WeightTooltipProps) {
  if (!active || !payload?.length) return null
  const d = label ? new Date(label) : null
  const formatted = d
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : label ?? ''

  return (
    <div className="rounded-[14px] border border-[#EDE8D9] bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(185,176,151,0.22)]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#A09A90]">{formatted}</p>
      <p className="mt-1 text-sm font-semibold text-[#1B1B1D]">{payload[0].value} kg</p>
    </div>
  )
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = label ? new Date(label) : null
  const formatted = d
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : label ?? ''

  return (
    <div className="rounded-[14px] border border-[#EDE8D9] bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(185,176,151,0.22)]">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#A09A90]">{formatted}</p>
      <p className="mt-1 text-sm font-semibold text-[#1B1B1D]">{payload[0].value} kcal</p>
    </div>
  )
}

export default function HistoryPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<'week' | 'month'>('week')
  const [data, setData] = useState<ChartEntry[]>([])
  const [avgCalories, setAvgCalories] = useState(0)
  const [loading, setLoading] = useState(true)

  const [weightLogs, setWeightLogs] = useState<WeightEntry[]>([])
  const [weightLoading, setWeightLoading] = useState(true)
  const [showLogWeight, setShowLogWeight] = useState(false)
  const [weightInput, setWeightInput] = useState('')
  const [weightSaving, setWeightSaving] = useState(false)
  const [weightError, setWeightError] = useState<string | null>(null)

  const fetchWeightLogs = () => {
    setWeightLoading(true)
    fetch('/api/weight?limit=30')
      .then((r) => r.json())
      .then(({ data: d }: { data: WeightEntry[] | null }) => {
        const logs = d ?? []
        setWeightLogs(logs)
        if (logs.length > 0) {
          setWeightInput(String(logs[logs.length - 1].weight))
        }
      })
      .finally(() => setWeightLoading(false))
  }

  useEffect(() => {
    fetchWeightLogs()
  }, [])

  const todayStr = new Date().toISOString().split('T')[0]

  const handleSaveWeight = async () => {
    const parsed = parseFloat(weightInput)
    if (isNaN(parsed) || parsed < 20 || parsed > 500) {
      setWeightError('Enter a valid weight (20–500 kg)')
      return
    }
    setWeightSaving(true)
    setWeightError(null)
    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight: parsed, date: todayStr }),
      })
      const json = await res.json()
      if (!res.ok || json.error) {
        setWeightError(json.error ?? 'Failed to save')
        return
      }
      fetchWeightLogs()
      setShowLogWeight(false)
    } catch {
      setWeightError('Network error, try again')
    } finally {
      setWeightSaving(false)
    }
  }

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

  const calorieGoal = user?.calorieGoal ?? 2000

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return period === 'week'
      ? d.toLocaleDateString('en-US', { weekday: 'short' })
      : `${d.getMonth() + 1}/${d.getDate()}`
  }

  const daysWithLogs = data.filter((d) => d.calories > 0).length
  const macroAverages = [
    {
      label: 'Protein',
      key: 'protein' as const,
      color: MACRO_COLORS.protein,
      bg: '#EFF6FF',
      goal: user?.proteinGoal ?? 150,
      unit: 'g',
    },
    {
      label: 'Carbs',
      key: 'carbs' as const,
      color: MACRO_COLORS.carbs,
      bg: '#F0FDF4',
      goal: user?.carbGoal ?? 250,
      unit: 'g',
    },
    {
      label: 'Fat',
      key: 'fat' as const,
      color: MACRO_COLORS.fat,
      bg: '#FFFBEB',
      goal: user?.fatGoal ?? 65,
      unit: 'g',
    },
  ]

  const daysLogged = daysWithLogs
  const streak = daysLogged
  const goalDays = data.filter((d) => d.calories > 0 && d.calories <= calorieGoal).length

  return (
    <div className="mx-auto max-w-lg px-5 pb-32 pt-6">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#A09A90]">Your progress</p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-[#1B1B1D]">History</h1>
      </header>

      <div className="mb-5 flex gap-2">
        {(['week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex h-11 flex-1 items-center justify-center rounded-[14px] text-sm font-semibold transition-all ${
              period === p
                ? 'bg-[#1B1B1D] text-white shadow-[0_8px_20px_rgba(27,27,29,0.18)]'
                : 'border border-[#EDE8D9] bg-white text-[#6B6560]'
            }`}
          >
            {p === 'week' ? 'This week' : 'This month'}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatBadge
          icon={<Flame className="h-4 w-4" />}
          label="Avg daily"
          value={`${avgCalories}`}
          unit="kcal"
          accent="#F59E0B"
          bg="#FFFBEB"
        />
        <StatBadge
          icon={<TrendingUp className="h-4 w-4" />}
          label="Days logged"
          value={`${daysLogged}`}
          unit={`/ ${data.length}`}
          accent="#3B82F6"
          bg="#EFF6FF"
        />
        <StatBadge
          icon={<Zap className="h-4 w-4" />}
          label="On goal"
          value={`${goalDays}`}
          unit="days"
          accent="#C7E44C"
          bg="#F7FCEA"
        />
      </div>

      <div className="mb-4 rounded-[24px] border border-[#EDE8D9] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09A90]">Calorie intake</p>
            <p className="mt-1 text-lg font-semibold text-[#1B1B1D]">
              {avgCalories > 0 ? `${avgCalories} kcal avg` : 'No data yet'}
            </p>
          </div>
          <div className="rounded-full border border-[#EDE8D9] bg-[#FBFAF6] px-3 py-1 text-xs font-medium text-[#6B6560]">
            Goal {calorieGoal}
          </div>
        </div>

        {loading ? (
          <div className="h-40 rounded-[14px] skeleton" />
        ) : data.length === 0 || daysLogged === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-[14px] bg-[#FBFAF6]">
            <Flame className="h-8 w-8 text-[#D6CFBF]" strokeWidth={1.5} />
            <p className="text-sm text-[#A09A90]">No logs for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data} margin={{ top: 8, right: 0, left: -24, bottom: 0 }} barCategoryGap="32%">
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: '#A09A90', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#A09A90' }}
                axisLine={false}
                tickLine={false}
                tickCount={4}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(199,228,76,0.08)', radius: 8 }} />
              <ReferenceLine
                y={calorieGoal}
                stroke="#C7E44C"
                strokeDasharray="4 3"
                strokeWidth={1.5}
              />
              <Bar dataKey="calories" radius={[6, 6, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={
                      entry.calories === 0
                        ? '#F0EBE1'
                        : entry.calories > calorieGoal
                        ? '#FCA5A5'
                        : '#C7E44C'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="mt-3 flex items-center gap-4 border-t border-[#F0EBE1] pt-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C7E44C]" />
            <span className="text-[11px] text-[#A09A90]">Within goal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FCA5A5]" />
            <span className="text-[11px] text-[#A09A90]">Over goal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-5 rounded-full bg-[#C7E44C]" style={{ borderStyle: 'dashed', borderWidth: 1 }} />
            <span className="text-[11px] text-[#A09A90]">Goal line</span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09A90]">Weight</p>
          <button
            onClick={() => {
              setShowLogWeight((v) => !v)
              setWeightError(null)
            }}
            className="flex h-8 items-center gap-1.5 rounded-[10px] bg-[#1B1B1D] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-80"
          >
            <Scale className="h-3.5 w-3.5" />
            Log weight
          </button>
        </div>

        {showLogWeight && (
          <div className="mb-3 rounded-[20px] border border-[#EDE8D9] bg-white p-4 shadow-sm">
            <p className="mb-3 text-xs font-medium text-[#6B6560]">
              Today&apos;s weight &mdash;{' '}
              <span className="text-[#1B1B1D]">
                {new Date(todayStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min={20}
                  max={500}
                  step={0.1}
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 70.5"
                  className="h-10 w-full rounded-[12px] border border-[#EDE8D9] bg-[#FBFAF6] px-3 text-sm font-medium text-[#1B1B1D] outline-none focus:border-[#C7E44C] focus:ring-0"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A09A90]">kg</span>
              </div>
              <button
                onClick={handleSaveWeight}
                disabled={weightSaving}
                className="flex h-10 items-center rounded-[12px] bg-[#C7E44C] px-4 text-sm font-semibold text-[#1B1B1D] transition-opacity disabled:opacity-50"
              >
                {weightSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
            {weightError && (
              <p className="mt-2 text-xs font-medium text-red-500">{weightError}</p>
            )}
          </div>
        )}

        <div className="rounded-[24px] border border-[#EDE8D9] bg-white p-5 shadow-sm">
          {weightLoading ? (
            <div className="h-40 rounded-[14px] skeleton" />
          ) : weightLogs.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-[14px] bg-[#FBFAF6]">
              <Scale className="h-8 w-8 text-[#D6CFBF]" strokeWidth={1.5} />
              <p className="text-sm text-[#A09A90]">No weight logs yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weightLogs} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 3" stroke="#F0EBE1" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(dateStr: string) => {
                    const d = new Date(dateStr)
                    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }}
                  tick={{ fontSize: 10, fill: '#A09A90', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#A09A90' }}
                  axisLine={false}
                  tickLine={false}
                  tickCount={4}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  unit=" kg"
                />
                <Tooltip content={<WeightTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#C7E44C"
                  strokeWidth={2}
                  dot={{ fill: '#C7E44C', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#1B1B1D', r: 4, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09A90]">
          Average macros
        </p>
        <div className="grid grid-cols-3 gap-3">
          {macroAverages.map((m) => {
            const avg = daysWithLogs
              ? Math.round(data.reduce((sum, d) => sum + d[m.key], 0) / daysWithLogs)
              : 0
            const pct = Math.min(Math.round((avg / m.goal) * 100), 100)

            return (
              <div
                key={m.key}
                className="rounded-[20px] border border-[#EDE8D9] bg-white p-4 shadow-sm"
              >
                <div
                  className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px]"
                  style={{ backgroundColor: m.bg }}
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: m.color }} />
                </div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#A09A90]">
                  {m.label}
                </p>
                <p className="mt-1 text-[18px] font-semibold leading-none text-[#1B1B1D]">
                  {avg}
                  <span className="ml-0.5 text-xs font-medium text-[#A09A90]">{m.unit}</span>
                </p>
                <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#F0EBE1]">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: m.color }}
                  />
                </div>
                <p className="mt-1.5 text-[10px] text-[#A09A90]">{pct}% of goal</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatBadge({
  icon,
  label,
  value,
  unit,
  accent,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  accent: string
  bg: string
}) {
  return (
    <div className="rounded-[20px] border border-[#EDE8D9] bg-white p-4 shadow-sm">
      <div
        className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px]"
        style={{ backgroundColor: bg, color: accent }}
      >
        {icon}
      </div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-[#A09A90]">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-none text-[#1B1B1D]">
        {value}
        <span className="ml-1 text-[11px] font-medium text-[#A09A90]">{unit}</span>
      </p>
    </div>
  )
}
