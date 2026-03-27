'use client'

import { useState } from 'react'

type FitnessGoal = 'lose_weight' | 'build_muscle' | 'maintain' | 'improve_fitness'
type Equipment = 'gym' | 'home' | 'none'
type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'

interface Exercise {
  name: string
  nameMn: string
  sets: number
  reps: string
  restSeconds: number
  notes?: string
}

interface WorkoutDay {
  dayNumber: number
  name: string
  nameMn: string
  estimatedMinutes: number
  exercises: Exercise[]
}

interface WorkoutPlan {
  planName: string
  planNameMn: string
  daysPerWeek: number
  days: WorkoutDay[]
}

const GOALS: { value: FitnessGoal; labelMn: string; emoji: string }[] = [
  { value: 'lose_weight', labelMn: 'Жин хасах', emoji: '🔥' },
  { value: 'build_muscle', labelMn: 'Булчин хөгжүүлэх', emoji: '💪' },
  { value: 'maintain', labelMn: 'Хэвийн байдлаа хадгалах', emoji: '⚖️' },
  { value: 'improve_fitness', labelMn: 'Тэсвэр чийрэгжүүлэх', emoji: '🏃' },
]

const EQUIPMENT_OPTIONS: { value: Equipment; labelMn: string; emoji: string }[] = [
  { value: 'gym', labelMn: 'Биеийн тамирын заал', emoji: '🏋️' },
  { value: 'home', labelMn: 'Гэрийн тоног төхөөрөмж', emoji: '🏠' },
  { value: 'none', labelMn: 'Тоног төхөөрөмжгүй', emoji: '🧘' },
]

const LEVEL_OPTIONS: { value: FitnessLevel; labelMn: string }[] = [
  { value: 'beginner', labelMn: 'Эхлэгч' },
  { value: 'intermediate', labelMn: 'Дунд' },
  { value: 'advanced', labelMn: 'Дэвшилтэт' },
]

export default function WorkoutPage() {
  const [goal, setGoal] = useState<FitnessGoal>('build_muscle')
  const [daysPerWeek, setDaysPerWeek] = useState(4)
  const [equipment, setEquipment] = useState<Equipment>('gym')
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('beginner')
  const [plan, setPlan] = useState<WorkoutPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedDay, setExpandedDay] = useState<number | null>(0)

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setPlan(null)

    try {
      const res = await fetch('/api/workout/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, daysPerWeek, equipment, fitnessLevel }),
      })
      const { data, error: err } = await res.json()
      if (err) { setError(err); return }
      setPlan(data)
      setExpandedDay(0)
    } catch {
      setError('Сүлжээний алдаа. Дахин оролдоно уу.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">Workout Plan</h1>

      {/* Goal */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Зорилго</h2>
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map(g => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`py-3 px-2 rounded-xl text-sm font-medium transition-colors flex flex-col items-center gap-1 ${
                goal === g.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span className="text-xl">{g.emoji}</span>
              <span>{g.labelMn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Days per week */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          7 хоногт хэдэн өдөр дасгал хийх вэ?
        </h2>
        <div className="flex gap-2">
          {[3, 4, 5, 6].map(d => (
            <button
              key={d}
              onClick={() => setDaysPerWeek(d)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${
                daysPerWeek === d
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Тоног төхөөрөмж</h2>
        <div className="space-y-2">
          {EQUIPMENT_OPTIONS.map(e => (
            <button
              key={e.value}
              onClick={() => setEquipment(e.value)}
              className={`w-full py-3 px-4 rounded-xl text-sm font-medium text-left flex items-center gap-3 transition-colors ${
                equipment === e.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <span className="text-lg">{e.emoji}</span>
              {e.labelMn}
            </button>
          ))}
        </div>
      </div>

      {/* Fitness level */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Фитнессийн түвшин</h2>
        <div className="flex gap-2">
          {LEVEL_OPTIONS.map(l => (
            <button
              key={l.value}
              onClick={() => setFitnessLevel(l.value)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${
                fitnessLevel === l.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
              }`}
            >
              {l.labelMn}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold text-base transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            AI тооцоолж байна...
          </>
        ) : (
          <>
            <SparklesIcon className="w-5 h-5" />
            Workout план үүсгэх
          </>
        )}
      </button>

      {/* Plan result */}
      {plan && (
        <div className="space-y-3">
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-2xl p-4">
            <h2 className="font-bold text-green-800 dark:text-green-200 text-base">{plan.planNameMn}</h2>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">{plan.planName}</p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              7 хоногт {plan.daysPerWeek} өдөр
            </p>
          </div>

          {plan.days.map((day, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <button
                className="w-full px-4 py-3.5 flex items-center justify-between text-left"
                onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded-full">
                      {day.dayNumber}-р өдөр
                    </span>
                    <span className="text-xs text-gray-400">{day.estimatedMinutes} мин</span>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm mt-1">{day.nameMn}</p>
                  <p className="text-xs text-gray-400">{day.name}</p>
                </div>
                <ChevronIcon className={`w-5 h-5 text-gray-400 transition-transform ${expandedDay === idx ? 'rotate-180' : ''}`} />
              </button>

              {expandedDay === idx && (
                <div className="border-t border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800">
                  {day.exercises.map((ex, ei) => (
                    <div key={ei} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{ex.nameMn}</p>
                          <p className="text-xs text-gray-400">{ex.name}</p>
                          {ex.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{ex.notes}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{ex.sets} × {ex.reps}</p>
                          <p className="text-xs text-gray-400">{ex.restSeconds}с амрах</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            Дахин үүсгэх
          </button>
        </div>
      )}
    </div>
  )
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  )
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}
