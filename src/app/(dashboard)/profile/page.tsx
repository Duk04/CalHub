'use client'

import { useEffect, useState } from 'react'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileLock2,
  FileText,
  LockKeyhole,
  LogOut,
  Mail,
  Ruler,
  Settings2,
  ShieldAlert,
  UserRound,
  VenusAndMars,
  Weight,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import type { Gender } from '@/types'

type View = 'main' | 'changePassword' | 'notifications' | 'more' | 'terms' | 'privacy' | 'help'

type ToggleKey = 'mealReminders' | 'progressSummary' | 'goalMilestones' | 'newPlanRecommendations'

function pageShell(children: React.ReactNode) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.18),_transparent_32%),linear-gradient(180deg,_#FBFAF4_0%,_#F4EFE2_100%)]">
      <div className="mx-auto min-h-screen max-w-md px-5 pb-28 pt-6">{children}</div>
    </div>
  )
}

function Header({
  title,
  subtitle,
  onBack,
}: {
  title: string
  subtitle?: string
  onBack?: () => void
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      {onBack ? (
        <button
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E8E1CF] bg-white text-[#1B1B1D] shadow-[0_10px_25px_rgba(209,203,182,0.18)]"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
      ) : (
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F0E3] text-[#97AE29]">
          <UserRound className="h-5 w-5" strokeWidth={2.2} />
        </div>
      )}

      <div className="min-w-0 flex-1 pt-1">
        <h1 className="text-[28px] font-semibold tracking-[-0.04em] text-[#161617]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm leading-6 text-[#6F6A60]">{subtitle}</p>}
      </div>
    </div>
  )
}

function SectionCard({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-[30px] border border-[#ECE5D5] bg-white p-5 shadow-[0_18px_45px_rgba(219,215,195,0.25)] ${className}`}>
      {children}
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly,
  suffix,
  icon,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
  suffix?: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#3B362E]">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A29B8B]">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          readOnly={readOnly}
          className="w-full rounded-[22px] border border-[#ECE5D5] bg-[#FBFAF6] py-4 pl-12 pr-4 text-sm text-[#171717] outline-none placeholder:text-[#B5AE9D] focus:border-[#F3B294]"
          style={{
            color: readOnly ? '#8B8477' : undefined,
            paddingRight: suffix ? '3.75rem' : undefined,
          }}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-[#938D80]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  icon,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-[#3B362E]">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A29B8B]">
          {icon}
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-[22px] border border-[#ECE5D5] bg-[#FBFAF6] py-4 pl-12 pr-10 text-sm text-[#171717] outline-none focus:border-[#F3B294]"
          style={{ color: value ? '#171717' : '#B5AE9D' }}
        >
          <option value="" disabled>{placeholder ?? 'Select'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-[#938D80]" strokeWidth={2} />
      </div>
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  disabled,
  success,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  success?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center rounded-full px-5 py-4 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,122,74,0.25)] transition-transform active:scale-[0.99] disabled:opacity-60"
      style={{ background: success ? '#67D79C' : '#F57A4A' }}
    >
      {children}
    </button>
  )
}

function Toggle({
  enabled,
  onChange,
}: {
  enabled: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative h-8 w-14 rounded-full transition-colors ${enabled ? 'bg-[#F57A4A]' : 'bg-[#E9E3D6]'}`}
    >
      <span
        className="absolute top-1 h-6 w-6 rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.14)] transition-transform"
        style={{ transform: enabled ? 'translateX(30px)' : 'translateX(4px)' }}
      />
    </button>
  )
}

function ListRow({
  icon,
  label,
  sublabel,
  onPress,
  danger,
}: {
  icon: React.ReactNode
  label: string
  sublabel?: string
  onPress: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onPress}
      className="flex w-full items-center gap-4 py-4 text-left first:pt-0 last:pb-0"
    >
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${danger ? 'bg-[#FFF0EB] text-[#E45E45]' : 'bg-[#F7F3E9] text-[#97AE29]'}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className={`text-sm font-semibold ${danger ? 'text-[#C74936]' : 'text-[#1B1B1D]'}`}>{label}</div>
        {sublabel && <div className="mt-1 text-xs text-[#888173]">{sublabel}</div>}
      </div>
      <ChevronRight className={`h-4 w-4 flex-shrink-0 ${danger ? 'text-[#D98477]' : 'text-[#B0A999]'}`} strokeWidth={2} />
    </button>
  )
}

function BottomModal({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#171512]/35 px-5 pb-8 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[30px] border border-[#ECE5D5] bg-white p-6 shadow-[0_28px_80px_rgba(98,89,70,0.22)]">
        {children}
      </div>
    </div>
  )
}

function ArticleView({
  title,
  onBack,
  children,
}: {
  title: string
  onBack: () => void
  children: React.ReactNode
}) {
  return pageShell(
    <>
      <Header title={title} onBack={onBack} />
      <SectionCard className="space-y-4 text-sm leading-7 text-[#6F6A60]">
        {children}
      </SectionCard>
    </>,
  )
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()
  const [view, setView] = useState<View>('main')

  const [form, setForm] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    gender: '' as Gender | '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwChanged, setPwChanged] = useState(false)
  const [pwError, setPwError] = useState('')

  const [notifs, setNotifs] = useState<Record<ToggleKey, boolean>>({
    mealReminders: true,
    progressSummary: true,
    goalMilestones: false,
    newPlanRecommendations: true,
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        age: user.age?.toString() ?? '',
        height: user.height?.toString() ?? '',
        weight: user.weight?.toString() ?? '',
        gender: (user.gender as Gender) ?? '',
      })
    }
  }, [user])

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  async function handleSave() {
    setSaving(true)
    const body: Record<string, string | number> = {}
    if (form.name) body.name = form.name
    if (form.age) body.age = parseInt(form.age)
    if (form.height) body.height = parseFloat(form.height)
    if (form.weight) body.weight = parseFloat(form.weight)
    if (form.gender) body.gender = form.gender

    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const { data } = await res.json()
    setSaving(false)

    if (data) {
      setUser(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function handleChangePassword() {
    setPwError('')
    if (!pwForm.currentPassword) {
      setPwError('Please enter your current password')
      return
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters')
      return
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match')
      return
    }

    setPwSaving(true)
    const res = await fetch('/api/user/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
    })
    const { error } = await res.json()
    setPwSaving(false)

    if (error) {
      setPwError(error)
      return
    }
    setPwChanged(true)
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    const res = await fetch('/api/user', { method: 'DELETE' })
    const { error } = await res.json()
    if (error) {
      setDeleting(false)
      setShowDeleteConfirm(false)
      return
    }
    logout()
  }

  if (view === 'changePassword') {
    return pageShell(
      <>
        <Header
          title="Change Password"
          subtitle="Keep your account protected with a stronger password."
          onBack={() => {
            setView('main')
            setPwChanged(false)
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setPwError('')
          }}
        />

        <SectionCard className="space-y-4">
          <InputField
            label="Current Password"
            value={pwForm.currentPassword}
            onChange={(v) => setPwForm((prev) => ({ ...prev, currentPassword: v }))}
            placeholder="Enter current password"
            type="password"
            icon={<ShieldAlert className="h-5 w-5" strokeWidth={2} />}
          />
          <InputField
            label="New Password"
            value={pwForm.newPassword}
            onChange={(v) => setPwForm((prev) => ({ ...prev, newPassword: v }))}
            placeholder="Enter new password"
            type="password"
            icon={<LockKeyhole className="h-5 w-5" strokeWidth={2} />}
          />
          <InputField
            label="Confirm Password"
            value={pwForm.confirmPassword}
            onChange={(v) => setPwForm((prev) => ({ ...prev, confirmPassword: v }))}
            placeholder="Confirm new password"
            type="password"
            icon={<LockKeyhole className="h-5 w-5" strokeWidth={2} />}
          />
          {pwError && <p className="text-xs font-medium text-[#D45541]">{pwError}</p>}
        </SectionCard>

        <div className="mt-6">
          <ActionButton onClick={handleChangePassword} disabled={pwSaving}>
            {pwSaving ? 'Saving...' : 'Save Password'}
          </ActionButton>
        </div>

        {pwChanged && (
          <BottomModal>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF7F0] text-[#67D79C]">
                <ShieldAlert className="h-8 w-8" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold tracking-[-0.03em] text-[#161617]">Password updated</h3>
              <p className="mt-2 text-sm leading-6 text-[#70695E]">
                Your account password has been changed successfully.
              </p>
              <div className="mt-6">
                <ActionButton
                  onClick={() => {
                    setView('main')
                    setPwChanged(false)
                    setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  }}
                >
                  Back to profile
                </ActionButton>
              </div>
            </div>
          </BottomModal>
        )}
      </>,
    )
  }

  if (view === 'notifications') {
    const items: { key: ToggleKey; label: string; note: string }[] = [
      { key: 'mealReminders', label: 'Meal reminders', note: 'Nudges to log breakfast, lunch, and dinner.' },
      { key: 'progressSummary', label: 'Progress summary', note: 'Quick recap of your calories and macros.' },
      { key: 'goalMilestones', label: 'Goal milestones', note: 'Alerts when you hit important targets.' },
      { key: 'newPlanRecommendations', label: 'New plan recommendations', note: 'Fresh suggestions based on your habits.' },
    ]

    return pageShell(
      <>
        <Header
          title="Notifications"
          subtitle="Choose which reminders should reach you during the day."
          onBack={() => setView('main')}
        />

        <SectionCard>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={item.key}
                className={`flex items-start justify-between gap-4 ${index !== items.length - 1 ? 'border-b border-[#F0EADB] pb-4' : ''}`}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#1B1B1D]">{item.label}</div>
                  <div className="mt-1 text-xs leading-5 text-[#888173]">{item.note}</div>
                </div>
                <Toggle
                  enabled={notifs[item.key]}
                  onChange={(value) => setNotifs((prev) => ({ ...prev, [item.key]: value }))}
                />
              </div>
            ))}
          </div>
        </SectionCard>
      </>,
    )
  }

  if (view === 'more') {
    return pageShell(
      <>
        <Header
          title="More"
          subtitle="Account tools, legal details, and support."
          onBack={() => setView('main')}
        />

        <SectionCard>
          <ListRow
            icon={<FileText className="h-5 w-5" strokeWidth={2} />}
            label="Terms and Conditions"
            sublabel="Read the app usage terms."
            onPress={() => setView('terms')}
          />
          <ListRow
            icon={<FileLock2 className="h-5 w-5" strokeWidth={2} />}
            label="Privacy Policy"
            sublabel="See how CalHub handles your data."
            onPress={() => setView('privacy')}
          />
          <ListRow
            icon={<CircleHelp className="h-5 w-5" strokeWidth={2} />}
            label="Help"
            sublabel="Support tips and common questions."
            onPress={() => setView('help')}
          />
        </SectionCard>

        <div className="mt-5">
          <SectionCard>
            <ListRow
              icon={<ShieldAlert className="h-5 w-5" strokeWidth={2} />}
              label="Delete Account"
              sublabel="Permanently remove your CalHub data."
              onPress={() => setShowDeleteConfirm(true)}
              danger
            />
            <ListRow
              icon={<LogOut className="h-5 w-5" strokeWidth={2} />}
              label="Log Out"
              sublabel="Sign out of your current session."
              onPress={() => setShowLogoutConfirm(true)}
              danger
            />
          </SectionCard>
        </div>

        {showDeleteConfirm && (
          <BottomModal>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF1ED] text-[#E45E45]">
                <ShieldAlert className="h-8 w-8" strokeWidth={2} />
              </div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#161617]">Delete account?</p>
              <p className="mt-2 text-sm leading-6 text-[#70695E]">
                This would permanently remove your saved profile, logs, and progress history.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-full border border-[#E7DFCE] bg-[#FBFAF6] py-3 text-sm font-semibold text-[#2C2A27]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 rounded-full bg-[#E45E45] py-3 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </BottomModal>
        )}

        {showLogoutConfirm && (
          <BottomModal>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF3EE] text-[#F57A4A]">
                <LogOut className="h-8 w-8" strokeWidth={2} />
              </div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#161617]">Log out now?</p>
              <p className="mt-2 text-sm leading-6 text-[#70695E]">
                You can sign back in any time to continue tracking your meals and progress.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-full border border-[#E7DFCE] bg-[#FBFAF6] py-3 text-sm font-semibold text-[#2C2A27]"
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  className="flex-1 rounded-full bg-[#F57A4A] py-3 text-sm font-semibold text-white"
                >
                  Log Out
                </button>
              </div>
            </div>
          </BottomModal>
        )}
      </>,
    )
  }

  if (view === 'terms') {
    return (
      <ArticleView title="Terms and Conditions" onBack={() => setView('more')}>
        <p className="font-medium text-[#2C2925]">Last Updated: 12 June, 2024</p>
        <p>Welcome to CalHub, your AI-powered nutrition assistant. Please read these Terms carefully before using the app.</p>
        <p>By using CalHub, you agree to these Terms. If you do not agree with any part, please do not access the app.</p>
        <h3 className="font-semibold text-[#1B1B1D]">1. Eligibility</h3>
        <p>You must be at least 13 years old to use CalHub. If you are under 16, you may use the app only with parental or guardian consent.</p>
        <h3 className="font-semibold text-[#1B1B1D]">2. Health Disclaimer</h3>
        <p>CalHub provides calorie tracking, dietary insights, and AI-generated meal recommendations. It does not replace professional medical advice.</p>
        <h3 className="font-semibold text-[#1B1B1D]">3. User Accounts</h3>
        <p>You agree to provide accurate information and protect your login credentials.</p>
      </ArticleView>
    )
  }

  if (view === 'privacy') {
    return (
      <ArticleView title="Privacy Policy" onBack={() => setView('more')}>
        <p className="font-medium text-[#2C2925]">Last Updated: 12 June, 2024</p>
        <p>Thank you for trusting CalHub. Your privacy matters to us, and this policy explains how we collect, use, and protect your data.</p>
        <h3 className="font-semibold text-[#1B1B1D]">1. How We Use Your Data</h3>
        <p>We use profile and nutrition data to personalize your tracking experience, improve recommendations, and help you monitor progress.</p>
        <h3 className="font-semibold text-[#1B1B1D]">2. How We Share Information</h3>
        <p>We do not sell personal data. Limited information may be shared with service providers where necessary to operate the product.</p>
        <h3 className="font-semibold text-[#1B1B1D]">3. Legal Requests</h3>
        <p>We may disclose information where required by law or to protect the safety and rights of users and the service.</p>
      </ArticleView>
    )
  }

  if (view === 'help') {
    return (
      <ArticleView title="Help" onBack={() => setView('more')}>
        <p className="font-medium text-[#2C2925]">Need help? We&apos;re here to guide you.</p>
        <h3 className="font-semibold text-[#1B1B1D]">Quick Help Topics</h3>
        <p>How to log a meal, how calorie goals work, and how to choose a plan that matches your habits.</p>
        <h3 className="font-semibold text-[#1B1B1D]">Contact Support</h3>
        <p>If you can&apos;t find what you&apos;re looking for, send us a message. We usually respond within 24 hours.</p>
        <h3 className="font-semibold text-[#1B1B1D]">Helpful Links</h3>
        <p>Privacy Policy and Terms &amp; Conditions are always available from the More section.</p>
      </ArticleView>
    )
  }

  return pageShell(
    <>
      <Header title="My Profile" subtitle="Update your personal details and app settings." />

      <SectionCard className="overflow-hidden p-0">
        <div className="bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.26),_transparent_42%),linear-gradient(180deg,_#FFFFFF_0%,_#F7F3E8_100%)] px-5 pb-6 pt-5">
          <div className="mb-5 flex items-start justify-between">
            <div className="rounded-full bg-[#F3F8DE] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#89A11E]">
              Profile
            </div>
            <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#7E776B] shadow-[0_8px_20px_rgba(207,201,181,0.18)]">
              {user?.language?.toUpperCase() ?? 'MN'}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[linear-gradient(135deg,_#F57A4A,_#FFB36B)] text-2xl font-bold text-white shadow-[0_18px_40px_rgba(245,122,74,0.28)]">
                {initials}
              </div>
              <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#C7E44C] text-[#5A6A0A]">
                <Settings2 className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-2xl font-semibold tracking-[-0.04em] text-[#161617]">
                {user?.name ?? 'Your Profile'}
              </h2>
              <p className="mt-1 truncate text-sm text-[#736D63]">{user?.email}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#7E776B]">
                  Calorie goal {user?.calorieGoal ?? 2000}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#7E776B]">
                  Water {user?.waterGoal ?? 8} cups
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 border-t border-[#EFE8D9] px-5 py-4">
          <MiniStat label="Age" value={form.age || '--'} />
          <MiniStat label="Height" value={form.height ? `${form.height} cm` : '--'} />
          <MiniStat label="Weight" value={form.weight ? `${form.weight} kg` : '--'} />
        </div>
      </SectionCard>

      <div className="mt-5">
        <SectionCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1B1B1D]">Personal Information</h3>
            <p className="mt-1 text-sm text-[#7A7367]">Keep your profile details up to date for better recommendations.</p>
          </div>

          <div className="space-y-4">
            <InputField
              label="Name"
              value={form.name}
              onChange={(v) => setForm((prev) => ({ ...prev, name: v }))}
              placeholder="Your name"
              icon={<UserRound className="h-5 w-5" strokeWidth={2} />}
            />
            <InputField
              label="Email"
              value={user?.email ?? ''}
              readOnly
              icon={<Mail className="h-5 w-5" strokeWidth={2} />}
            />
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Age"
                value={form.age}
                onChange={(v) => setForm((prev) => ({ ...prev, age: v }))}
                placeholder="25"
                type="number"
                icon={<UserRound className="h-5 w-5" strokeWidth={2} />}
              />
              <SelectField
                label="Gender"
                value={form.gender}
                onChange={(v) => setForm((prev) => ({ ...prev, gender: v as Gender }))}
                placeholder="Select"
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                ]}
                icon={<VenusAndMars className="h-5 w-5" strokeWidth={2} />}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Height"
                value={form.height}
                onChange={(v) => setForm((prev) => ({ ...prev, height: v }))}
                placeholder="170"
                type="number"
                suffix="cm"
                icon={<Ruler className="h-5 w-5" strokeWidth={2} />}
              />
              <InputField
                label="Weight"
                value={form.weight}
                onChange={(v) => setForm((prev) => ({ ...prev, weight: v }))}
                placeholder="70"
                type="number"
                suffix="kg"
                icon={<Weight className="h-5 w-5" strokeWidth={2} />}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="mt-5">
        <SectionCard>
          <div className="mb-4">
            <h3 className="text-lg font-semibold tracking-[-0.03em] text-[#1B1B1D]">Settings</h3>
            <p className="mt-1 text-sm text-[#7A7367]">Security, reminders, and more account tools.</p>
          </div>

          <ListRow
            icon={<LockKeyhole className="h-5 w-5" strokeWidth={2} />}
            label="Change Password"
            sublabel="Update your login password."
            onPress={() => setView('changePassword')}
          />
          <ListRow
            icon={<Bell className="h-5 w-5" strokeWidth={2} />}
            label="Notifications"
            sublabel="Control your reminders and progress alerts."
            onPress={() => setView('notifications')}
          />
          <ListRow
            icon={<Settings2 className="h-5 w-5" strokeWidth={2} />}
            label="More"
            sublabel="Legal info, support, and logout tools."
            onPress={() => setView('more')}
          />
        </SectionCard>
      </div>

      <div className="mt-6">
        <ActionButton onClick={handleSave} disabled={saving} success={saved}>
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </ActionButton>
      </div>
    </>,
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] bg-[#FBFAF6] px-3 py-3 text-center">
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-[#A19A8A]">{label}</div>
      <div className="mt-2 text-sm font-semibold text-[#1B1B1D]">{value}</div>
    </div>
  )
}
