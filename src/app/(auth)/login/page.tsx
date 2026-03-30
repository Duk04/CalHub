'use client'

import Link from 'next/link'
import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import { ArrowLeft, Lock, Mail } from 'lucide-react'

type View = 'login' | 'forgotPassword'

export default function LoginPage() {
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '', general: '' })
  const [loading, setLoading] = useState(false)

  const [fpEmail, setFpEmail] = useState('')
  const [fpLoading, setFpLoading] = useState(false)
  const [fpError, setFpError] = useState('')
  const [fpSent, setFpSent] = useState(false)
  const [fpMessage, setFpMessage] = useState('')

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    const nextErrors = { email: '', password: '', general: '' }
    if (!email) nextErrors.email = 'Please enter your email'
    if (!password) nextErrors.password = 'Please enter your password'
    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors)
      return
    }

    setErrors({ email: '', password: '', general: '' })
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const json = await res.json()
      setLoading(false)
      if (json.error) {
        setErrors((prev) => ({ ...prev, general: json.error }))
      } else {
        window.location.href = '/'
      }
    } catch {
      setLoading(false)
      setErrors((prev) => ({ ...prev, general: 'Network error. Please try again.' }))
    }
  }

  async function handleForgotPassword(e: FormEvent) {
    e.preventDefault()
    if (!fpEmail) {
      setFpError('Please enter your email')
      return
    }
    setFpLoading(true)
    setFpError('')
    setFpMessage('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fpEmail }),
      })
      const json = await res.json()
      if (json.error) {
        setFpError(json.error)
        setFpLoading(false)
        return
      }
      setFpMessage(json.message ?? 'If an account exists for that email, a reset link has been sent.')
      setFpSent(true)
    } catch {
      setFpError('Network error. Please try again.')
    }
    setFpLoading(false)
  }

  if (view === 'forgotPassword') {
    return (
      <div className="min-h-screen bg-[#FBFAF4]">
        <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8 pt-6">
          <button
            onClick={() => { setView('login'); setFpSent(false); setFpEmail(''); setFpError(''); setFpMessage('') }}
            className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#ECE7D7] bg-white text-[#1D1D1F]"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
          </button>

          <div className="rounded-[34px] bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.22),_transparent_45%),linear-gradient(180deg,_#FFFFFF_0%,_#F7F3E8_100%)] px-6 pb-7 pt-8 shadow-[0_24px_60px_rgba(203,208,164,0.2)]">
            <h1 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#161617]">Forgot your password?</h1>
            <p className="mt-3 text-sm leading-6 text-[#6F6A60]">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <div className="mt-6 flex-1">
            {fpSent ? (
              <div className="rounded-[28px] border border-[#ECE7D7] bg-white p-6 text-center shadow-[0_18px_45px_rgba(219,215,195,0.22)]">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF8F0] text-[#67D79C]">
                  <Mail className="h-6 w-6" strokeWidth={2} />
                </div>
                <p className="text-lg font-semibold text-[#161617]">Reset link sent</p>
                <p className="mt-2 text-sm text-[#7B7467]">{fpMessage || 'Check your email for the next step.'}</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <InputField
                  label="Email"
                  value={fpEmail}
                  onChange={setFpEmail}
                  placeholder="Enter your email"
                  error={fpError}
                  icon={<Mail className="h-5 w-5" strokeWidth={2} />}
                  type="email"
                />
                <PrimaryButton disabled={fpLoading}>{fpLoading ? 'Sending...' : 'Send Reset Link'}</PrimaryButton>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBFAF4]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8 pt-6">
        <div className="rounded-[34px] bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.22),_transparent_45%),linear-gradient(180deg,_#FFFFFF_0%,_#F7F3E8_100%)] px-6 pb-7 pt-8 shadow-[0_24px_60px_rgba(203,208,164,0.2)]">
          <h1 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#161617]">Welcome Back to CalHub</h1>
          <p className="mt-3 text-sm leading-6 text-[#6F6A60]">Eat better. Get back on track.</p>
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
            placeholder="Enter your password"
            error={errors.password}
            icon={<Lock className="h-5 w-5" strokeWidth={2} />}
            type="password"
          />

          <div className="flex justify-end -mt-1">
            <button
              type="button"
              onClick={() => setView('forgotPassword')}
              className="text-sm font-medium text-[#F57A4A]"
            >
              Forgot Password?
            </button>
          </div>

          {errors.general && <p className="text-sm text-[#E2553F]">{errors.general}</p>}

          <PrimaryButton disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</PrimaryButton>
        </form>

        <div className="mt-auto pt-8 text-center">
          <p className="text-sm text-[#7C776D]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-[#F57A4A]">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
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
      <div className="flex items-center gap-3 rounded-[24px] border bg-white px-4 py-4" style={{ borderColor: error ? '#E2553F' : '#ECE7D7' }}>
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

function PrimaryButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex w-full items-center justify-center rounded-full bg-[#F57A4A] px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,122,74,0.28)] transition-transform active:scale-[0.99] disabled:opacity-60"
    >
      {children}
    </button>
  )
}
