'use client'

import Link from 'next/link'
import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams])
  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!token || !email) {
      setError('This reset link is incomplete.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      })

      const json = await res.json()
      if (json.error) {
        setError(json.error)
      } else {
        setCompleted(true)
        setMessage(json.message ?? 'Your password has been updated.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFAF4]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-8 pt-6">
        <Link
          href="/login"
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-full border border-[#ECE7D7] bg-white text-[#1D1D1F]"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={2} />
        </Link>

        <div className="rounded-[34px] bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.22),_transparent_45%),linear-gradient(180deg,_#FFFFFF_0%,_#F7F3E8_100%)] px-6 pb-7 pt-8 shadow-[0_24px_60px_rgba(203,208,164,0.2)]">
          <h1 className="text-[30px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#161617]">Create a new password</h1>
          <p className="mt-3 text-sm leading-6 text-[#6F6A60]">
            Choose a new password for <span className="font-medium text-[#161617]">{email || 'your account'}</span>.
          </p>
        </div>

        <div className="mt-6 flex-1">
          {completed ? (
            <div className="rounded-[28px] border border-[#ECE7D7] bg-white p-6 text-center shadow-[0_18px_45px_rgba(219,215,195,0.22)]">
              <p className="text-lg font-semibold text-[#161617]">Password updated</p>
              <p className="mt-2 text-sm text-[#7B7467]">{message}</p>
              <Link
                href="/login"
                className="mt-5 inline-flex rounded-full bg-[#F57A4A] px-5 py-3 text-sm font-semibold text-white"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="New password"
                value={password}
                onChange={setPassword}
                placeholder="Enter new password"
                error=""
                icon={<Lock className="h-5 w-5" strokeWidth={2} />}
                type="password"
              />
              <InputField
                label="Confirm password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repeat new password"
                error={error}
                icon={<Lock className="h-5 w-5" strokeWidth={2} />}
                type="password"
              />
              <PrimaryButton disabled={loading}>
                {loading ? 'Updating...' : 'Update password'}
              </PrimaryButton>
            </form>
          )}
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
