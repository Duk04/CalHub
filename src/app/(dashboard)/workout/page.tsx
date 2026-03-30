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

const GOALS: { value: FitnessGoal; label: string; emoji: string }[] = [
  { value: 'lose_weight', label: 'Lose weight', emoji: '🔥' },
  { value: 'build_muscle', label: 'Build muscle', emoji: '💪' },
  { value: 'maintain', label: 'Maintain', emoji: '⚖️' },
  { value: 'improve_fitness', label: 'Improve fitness', emoji: '🏃' },
]

const EQUIPMENT_OPTIONS: { value: Equipment; label: string; emoji: string }[] = [
  { value: 'gym', label: 'Gym', emoji: '🏋️' },
  { value: 'home', label: 'Home equipment', emoji: '🏠' },
  { value: 'none', label: 'No equipment', emoji: '🧘' },
]

const LEVEL_OPTIONS: { value: FitnessLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
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
      if (err) {
        setError(err)
        return
      }
      setPlan(data)
      setExpandedDay(0)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 pb-8 pt-6">
      <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#161617]">Workout Plan</h1>

      <SectionCard title="Goal">
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-sm font-medium transition-colors ${
                goal === g.value ? 'bg-[#97AE29] text-white' : 'border border-[#ECE5D5] bg-[#FBFAF6] text-[#7D7668]'
              }`}
            >
              <span className="text-xl">{g.emoji}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="How many days per week do you want to work out?">
        <div className="flex gap-2">
          {[3, 4, 5, 6].map((d) => (
            <button
              key={d}
              onClick={() => setDaysPerWeek(d)}
              className={`flex-1 rounded-xl py-3 text-sm font-bold transition-colors ${
                daysPerWeek === d ? 'bg-[#97AE29] text-white' : 'border border-[#ECE5D5] bg-[#FBFAF6] text-[#7D7668]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Equipment">
        <div className="space-y-2">
          {EQUIPMENT_OPTIONS.map((e) => (
            <button
              key={e.value}
              onClick={() => setEquipment(e.value)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                equipment === e.value ? 'bg-[#97AE29] text-white' : 'border border-[#ECE5D5] bg-[#FBFAF6] text-[#7D7668]'
              }`}
            >
              <span className="text-lg">{e.emoji}</span>
              {e.label}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Fitness level">
        <div className="flex gap-2">
          {LEVEL_OPTIONS.map((l) => (
            <button
              key={l.value}
              onClick={() => setFitnessLevel(l.value)}
              className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
                fitnessLevel === l.value ? 'bg-[#97AE29] text-white' : 'border border-[#ECE5D5] bg-[#FBFAF6] text-[#7D7668]'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </SectionCard>

      {error && (
        <div className="rounded-xl border border-[#F0C8BD] bg-[#FFF2ED] px-4 py-3 text-sm text-[#C75A42]">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F57A4A] py-4 text-base font-bold text-white shadow-[0_18px_40px_rgba(245,122,74,0.28)] transition-colors disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Building your plan...
          </>
        ) : (
          <>
            <SparklesIcon className="h-5 w-5" />
            Generate workout plan
          </>
        )}
      </button>

      {plan && (
        <div className="space-y-3">
          <div className="rounded-[28px] border border-[#E7E6C3] bg-[#F5F9DE] p-4">
            <h2 className="text-base font-bold text-[#637612]">{plan.planName}</h2>
            <p className="mt-1 text-xs text-[#7E8D38]">{plan.daysPerWeek} days per week</p>
          </div>

          {plan.days.map((day, idx) => (
            <div key={idx} className="overflow-hidden rounded-[24px] border border-[#ECE5D5] bg-white shadow-[0_12px_30px_rgba(219,215,195,0.18)]">
              <button
                className="flex w-full items-center justify-between px-4 py-3.5 text-left"
                onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#EDF5C8] px-2 py-0.5 text-xs font-semibold text-[#72841A]">
                      Day {day.dayNumber}
                    </span>
                    <span className="text-xs text-[#8A8274]">{day.estimatedMinutes} min</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#161617]">{day.name}</p>
                </div>
                <ChevronIcon className={`h-5 w-5 text-[#8A8274] transition-transform ${expandedDay === idx ? 'rotate-180' : ''}`} />
              </button>

              {expandedDay === idx && (
                <div className="divide-y divide-[#F3EEE2] border-t border-[#F3EEE2]">
                  {day.exercises.map((ex, ei) => (
                    <div key={ei} className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#161617]">{ex.name}</p>
                          {ex.notes && <p className="mt-1 text-xs italic text-[#8A8274]">{ex.notes}</p>}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-[#161617]">{ex.sets} x {ex.reps}</p>
                          <p className="text-xs text-[#8A8274]">{ex.restSeconds}s rest</p>
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
            className="w-full rounded-xl border border-[#ECE5D5] bg-white py-3 text-sm font-medium text-[#5C564B] transition-colors"
          >
            Generate again
          </button>
        </div>
      )}
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 rounded-[28px] border border-[#ECE5D5] bg-white p-4 shadow-[0_18px_45px_rgba(219,215,195,0.22)]">
      <h2 className="text-sm font-semibold text-[#4C463B]">{title}</h2>
      {children}
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
