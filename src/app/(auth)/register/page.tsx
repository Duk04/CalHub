'use client'

import Link from 'next/link'
import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Circle,
  Lock,
  Mail,
  Mars,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  Venus,
} from 'lucide-react'

type Step = 'account' | 'age' | 'weight' | 'goal' | 'gender'
type Goal = 'lose' | 'maintain' | 'gain'
type GenderChoice = 'female' | 'male' | 'skip'
type WeightUnit = 'kg' | 'lbs'

const STEPS: Step[] = ['account', 'age', 'weight', 'goal', 'gender']

const GOAL_OPTIONS: {
  value: Goal
  title: string
  description: string
  icon: ReactNode
  accent: string
}[] = [
  {
    value: 'lose',
    title: 'Lose weight',
    description: 'Create a lighter daily calorie target.',
    icon: <TrendingDown className="h-5 w-5" strokeWidth={2} />,
    accent: '#C7E44C',
  },
  {
    value: 'maintain',
    title: 'Maintain weight',
    description: 'Stay around your current healthy range.',
    icon: <Circle className="h-5 w-5" strokeWidth={2} />,
    accent: '#FF8A62',
  },
  {
    value: 'gain',
    title: 'Gain weight',
    description: 'Increase calories for steady progress.',
    icon: <TrendingUp className="h-5 w-5" strokeWidth={2} />,
    accent: '#67D79C',
  },
]

const GENDER_OPTIONS: {
  value: GenderChoice
  title: string
  description: string
  icon: ReactNode
}[] = [
  {
    value: 'female',
    title: 'Female',
    description: 'Use female-based calorie estimates.',
    icon: <Venus className="h-5 w-5" strokeWidth={2} />,
  },
  {
    value: 'male',
    title: 'Male',
    description: 'Use male-based calorie estimates.',
    icon: <Mars className="h-5 w-5" strokeWidth={2} />,
  },
  {
    value: 'skip',
    title: 'Prefer not to say',
    description: 'We will keep the estimate neutral.',
    icon: <Circle className="h-5 w-5" strokeWidth={2} />,
  },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function toKg(weight: number, unit: WeightUnit) {
  return unit === 'kg' ? weight : Math.round((weight / 2.20462) * 10) / 10
}

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('account')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ name: '', email: '', password: '', general: '' })
  const [loading, setLoading] = useState(false)

  const [age, setAge] = useState(19)
  const [weight, setWeight] = useState(62)
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [goal, setGoal] = useState<Goal>('maintain')
  const [gender, setGender] = useState<GenderChoice>('male')

  const [skips, setSkips] = useState({
    age: false,
    weight: false,
    goal: false,
    gender: false,
  })

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  function nextStep(current: Step) {
    if (current === 'account') return setStep('age')
    if (current === 'age') return setStep('weight')
    if (current === 'weight') return setStep('goal')
    if (current === 'goal') return setStep('gender')
  }

  function prevStep() {
    if (step === 'age') return setStep('account')
    if (step === 'weight') return setStep('age')
    if (step === 'goal') return setStep('weight')
    if (step === 'gender') return setStep('goal')
  }

  function validateAccount() {
    const nextErrors = { name: '', email: '', password: '', general: '' }

    if (!name.trim()) nextErrors.name = 'Please enter your full name'
    if (!email.trim()) nextErrors.email = 'Please enter your email'
    if (!password || password.length < 6) nextErrors.password = 'Password must be at least 6 characters'

    setErrors(nextErrors)
    return !nextErrors.name && !nextErrors.email && !nextErrors.password
  }

  function handleAccountContinue(e: FormEvent) {
    e.preventDefault()
    if (!validateAccount()) return
    nextStep('account')
  }

  function handleSkip() {
    if (step === 'age') {
      setSkips(prev => ({ ...prev, age: true }))
      return nextStep('age')
    }

    if (step === 'weight') {
      setSkips(prev => ({ ...prev, weight: true }))
      return nextStep('weight')
    }

    if (step === 'goal') {
      setSkips(prev => ({ ...prev, goal: true }))
      return nextStep('goal')
    }

    if (step === 'gender') {
      setSkips(prev => ({ ...prev, gender: true }))
      return submitRegistration()
    }
  }

  async function submitRegistration() {
    if (!validateAccount()) {
      setStep('account')
      return
    }

    setLoading(true)
    setErrors(prev => ({ ...prev, general: '' }))

    const payload: Record<string, string | number> = {
      name: name.trim(),
      email: email.trim(),
      password,
    }

    if (!skips.age) payload.age = age
    if (!skips.weight) payload.weight = toKg(weight, weightUnit)
    if (!skips.goal) payload.goal = goal
    if (!skips.gender && gender !== 'skip') payload.gender = gender

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()
      setLoading(false)

      if (json.error) {
        setErrors(prev => ({ ...prev, general: json.error }))
        return
      }

      window.location.href = '/'
    } catch {
      setLoading(false)
      setErrors(prev => ({ ...prev, general: 'Network error. Please try again.' }))
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFAF4]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8 pt-6">
        <div className="mb-6 flex items-center justify-between">
          {step === 'account' ? (
            <Link
              href="/login"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ECE7D7] bg-white text-[#1D1D1F]"
              aria-label="Back to login"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            </Link>
          ) : (
            <button
              onClick={prevStep}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ECE7D7] bg-white text-[#1D1D1F]"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            </button>
          )}

          <div className="w-24">
            <div className="h-2 rounded-full bg-[#ECE7D7]">
              <div
                className="h-full rounded-full bg-[#C7E44C] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {step === 'account' ? (
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9F9B8E]">
              Sign up
            </span>
          ) : (
            <button
              onClick={handleSkip}
              className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9F9B8E]"
            >
              Skip
            </button>
          )}
        </div>

        {step === 'account' && (
          <div className="flex flex-1 flex-col">
            <div className="rounded-[34px] bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.28),_transparent_45%),linear-gradient(180deg,_#FFFFFF_0%,_#F7F3E8_100%)] px-6 pb-7 pt-8 shadow-[0_24px_60px_rgba(203,208,164,0.26)]">
              <div className="relative mx-auto mb-6 flex h-44 w-44 items-end justify-center">
                <div className="absolute inset-x-4 bottom-0 h-14 rounded-b-[48px] bg-[#ECECEC]" />
                <div className="absolute inset-x-7 bottom-9 h-8 rounded-full bg-[#F4F4F4]" />
                <div className="absolute left-10 top-8 h-10 w-10 rounded-full bg-[#B4D545]" />
                <div className="absolute left-8 top-6 h-4 w-4 rounded-full bg-[#9CC13D]" />
                <div className="absolute left-16 top-3 h-8 w-1 rotate-[-20deg] rounded-full bg-[#82A62A]" />
                <div className="absolute left-[70px] top-[54px] h-16 w-9 rotate-[35deg] rounded-[999px] bg-[#FFD146]" />
                <div className="absolute left-[88px] top-[50px] h-16 w-9 rotate-[60deg] rounded-[999px] bg-[#F4B826]" />
                <div className="absolute right-11 top-[76px] h-10 w-10 rotate-[18deg] rounded-[18px] bg-[#FF6E4D]" />
                <div className="absolute right-8 top-[70px] h-4 w-4 rounded-full bg-[#76A832]" />
              </div>

              <div className="text-center">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F3F8DE] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#7F991B]">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  Start smart
                </div>
                <h1 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#161617]">
                  Track your nutrition, transform your health
                </h1>
                <p className="mt-3 text-sm leading-6 text-[#6F6A60]">
                  Create your account, answer a few quick questions, and we will set up your starter calorie goals.
                </p>
              </div>
            </div>

            <form onSubmit={handleAccountContinue} className="mt-6 space-y-4">
              <InputField
                label="Full name"
                value={name}
                onChange={setName}
                placeholder="Enter your full name"
                error={errors.name}
                icon={<UserRound className="h-5 w-5" strokeWidth={2} />}
                type="text"
              />
              <InputField
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="Enter your email"
                error={errors.email}
                icon={<Mail className="h-5 w-5" strokeWidth={2} />}
                type="email"
              />
              <InputField
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Create a password"
                error={errors.password}
                icon={<Lock className="h-5 w-5" strokeWidth={2} />}
                type="password"
              />

              {errors.general && (
                <p className="text-sm text-[#E2553F]">{errors.general}</p>
              )}

              <PrimaryButton type="submit">
                Continue
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              </PrimaryButton>
            </form>

            <div className="mt-auto pt-8 text-center">
              <p className="text-sm text-[#7C776D]">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[#F57A4A]">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        )}

        {step === 'age' && (
          <QuestionStep
            eyebrow="Step 2 of 5"
            title="What&apos;s your age?"
            subtitle="We use this to make your daily target more realistic."
            visual={
              <div className="rounded-[32px] bg-white px-6 py-7 shadow-[0_24px_60px_rgba(219,215,195,0.35)]">
                <div className="mb-6 flex items-center justify-center text-[#C6C1B4]">
                  <CalendarDays className="h-6 w-6" strokeWidth={2} />
                </div>
                <div className="space-y-1 text-center">
                  <div className="text-3xl text-[#D7D2C8]">{clamp(age - 2, 13, 100)}</div>
                  <div className="text-4xl text-[#C5C1B5]">{clamp(age - 1, 13, 100)}</div>
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[26px] bg-[#C7E44C] text-5xl font-semibold text-white shadow-[0_18px_35px_rgba(199,228,76,0.35)]">
                    {age}
                  </div>
                  <div className="text-4xl text-[#C5C1B5]">{clamp(age + 1, 13, 100)}</div>
                  <div className="text-3xl text-[#D7D2C8]">{clamp(age + 2, 13, 100)}</div>
                </div>
                <input
                  type="range"
                  min={13}
                  max={80}
                  value={age}
                  onChange={(e) => {
                    setAge(Number(e.target.value))
                    setSkips(prev => ({ ...prev, age: false }))
                  }}
                  className="mt-7 w-full"
                  style={{ accentColor: '#C7E44C' }}
                />
              </div>
            }
            footer={
              <PrimaryButton onClick={() => nextStep('age')}>
                Continue
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              </PrimaryButton>
            }
          />
        )}

        {step === 'weight' && (
          <QuestionStep
            eyebrow="Step 3 of 5"
            title="What&apos;s your current weight right now?"
            subtitle="Your starter calories and protein will adjust around this."
            visual={
              <div className="rounded-[32px] bg-[linear-gradient(180deg,_#C7E44C_0%,_#B7D93C_100%)] px-6 py-7 text-white shadow-[0_28px_60px_rgba(183,217,60,0.28)]">
                <div className="mb-6 flex items-center justify-center">
                  <div className="inline-flex rounded-full bg-white/20 p-3">
                    <Scale className="h-6 w-6" strokeWidth={2} />
                  </div>
                </div>

                <div className="mb-6 flex justify-center">
                  <div className="inline-flex rounded-full bg-white/15 p-1">
                    {(['kg', 'lbs'] as WeightUnit[]).map(unit => (
                      <button
                        key={unit}
                        onClick={() => {
                          if (weightUnit === unit) return

                          const converted =
                            unit === 'lbs'
                              ? Math.round(weight * 2.20462)
                              : Math.round(weight / 2.20462)

                          setWeight(converted)
                          setWeightUnit(unit)
                        }}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                          weightUnit === unit ? 'bg-white text-[#8AA112]' : 'text-white/75'
                        }`}
                      >
                        {unit.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-5xl font-semibold tracking-[-0.04em]">
                    {Math.round(weight)} {weightUnit}
                  </div>
                  <div className="mt-2 text-sm text-white/80">
                    {weightUnit === 'lbs' ? `${toKg(weight, 'lbs')} kg` : `${Math.round(weight * 2.20462)} lbs`}
                  </div>
                </div>

                <div className="mt-7">
                  <input
                    type="range"
                    min={weightUnit === 'kg' ? 35 : 80}
                    max={weightUnit === 'kg' ? 150 : 330}
                    value={weight}
                    onChange={(e) => {
                      setWeight(Number(e.target.value))
                      setSkips(prev => ({ ...prev, weight: false }))
                    }}
                    className="w-full"
                    style={{ accentColor: '#FFFFFF' }}
                  />

                  <div className="mt-4 flex justify-between">
                    {Array.from({ length: 10 }).map((_, index) => (
                      <div
                        key={index}
                        className={`rounded-full bg-white/80 ${index % 2 === 0 ? 'h-6 w-0.5' : 'h-3 w-0.5'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            }
            footer={
              <PrimaryButton onClick={() => nextStep('weight')}>
                Continue
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              </PrimaryButton>
            }
          />
        )}

        {step === 'goal' && (
          <QuestionStep
            eyebrow="Step 4 of 5"
            title="What goal do you have in mind?"
            subtitle="Pick the direction you want your nutrition plan to support."
            visual={
              <div className="space-y-3">
                {GOAL_OPTIONS.map(option => {
                  const active = goal === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setGoal(option.value)
                        setSkips(prev => ({ ...prev, goal: false }))
                      }}
                      className={`flex w-full items-center gap-4 rounded-[24px] border px-4 py-4 text-left transition-all ${
                        active
                          ? 'border-[#FF8A62] bg-white shadow-[0_16px_35px_rgba(255,138,98,0.18)]'
                          : 'border-[#ECE7D7] bg-white'
                      }`}
                    >
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: `${option.accent}22`, color: option.accent }}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-semibold text-[#161617]">{option.title}</div>
                        <div className="mt-1 text-sm text-[#7C776D]">{option.description}</div>
                      </div>
                      <SelectionDot active={active} />
                    </button>
                  )
                })}
              </div>
            }
            footer={
              <PrimaryButton onClick={() => nextStep('goal')}>
                Continue
                <ChevronRight className="h-4 w-4" strokeWidth={2.2} />
              </PrimaryButton>
            }
          />
        )}

        {step === 'gender' && (
          <QuestionStep
            eyebrow="Step 5 of 5"
            title="What&apos;s your gender?"
            subtitle="This only helps refine the calorie estimate. You can change it later."
            visual={
              <div className="space-y-3">
                {GENDER_OPTIONS.map(option => {
                  const active = gender === option.value
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setGender(option.value)
                        setSkips(prev => ({ ...prev, gender: false }))
                      }}
                      className={`flex w-full items-center gap-4 rounded-[24px] border px-4 py-4 text-left transition-all ${
                        active
                          ? 'border-[#FF8A62] bg-white shadow-[0_16px_35px_rgba(255,138,98,0.18)]'
                          : 'border-[#ECE7D7] bg-white'
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF3EE] text-[#FF8A62]">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-semibold text-[#161617]">{option.title}</div>
                        <div className="mt-1 text-sm text-[#7C776D]">{option.description}</div>
                      </div>
                      <SelectionDot active={active} />
                    </button>
                  )
                })}
              </div>
            }
            footer={
              <>
                {errors.general && (
                  <p className="mb-3 text-sm text-[#E2553F]">{errors.general}</p>
                )}
                <PrimaryButton onClick={submitRegistration} disabled={loading}>
                  {loading ? 'Creating account...' : 'Finish setup'}
                  {!loading && <ChevronRight className="h-4 w-4" strokeWidth={2.2} />}
                </PrimaryButton>
              </>
            }
          />
        )}
      </div>
    </div>
  )
}

function QuestionStep({
  eyebrow,
  title,
  subtitle,
  visual,
  footer,
}: {
  eyebrow: string
  title: string
  subtitle: string
  visual: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#A4A093]">
          {eyebrow}
        </div>
        <h1 className="mt-3 text-[32px] font-semibold leading-[1.03] tracking-[-0.05em] text-[#161617]">
          {title}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[#716C61]">{subtitle}</p>
      </div>

      <div className="flex-1">{visual}</div>

      <div className="pt-6">{footer}</div>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  error,
  icon,
  type,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  error: string
  icon: ReactNode
  type: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#33312D]">{label}</label>
      <div
        className="flex items-center gap-3 rounded-[24px] border bg-white px-4 py-4"
        style={{ borderColor: error ? '#E2553F' : '#ECE7D7' }}
      >
        <div className="text-[#9F9B8E]">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#B1AC9F]"
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-[#E2553F]">{error}</p>}
    </div>
  )
}

function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F57A4A] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,122,74,0.28)] transition-transform active:scale-[0.99] disabled:opacity-60"
    >
      {children}
    </button>
  )
}

function SelectionDot({ active }: { active: boolean }) {
  return (
    <div
      className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
        active ? 'border-[#FF8A62] bg-[#FF8A62]' : 'border-[#D7D0BF] bg-transparent'
      }`}
    >
      <div className={`h-2.5 w-2.5 rounded-full ${active ? 'bg-white' : 'bg-transparent'}`} />
    </div>
  )
}
