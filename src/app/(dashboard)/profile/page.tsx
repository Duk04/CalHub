'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ACTIVITY_LEVELS } from '@/lib/constants'
import { calculateTDEE, calculateMacroGoals } from '@/lib/calories'
import type { ActivityLevel, Gender } from '@/types'

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth()
  const [form, setForm] = useState({
    name: '', age: '', height: '', weight: '',
    gender: '' as Gender | '',
    activityLevel: '' as ActivityLevel | '',
    calorieGoal: '', waterGoal: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tdee, setTdee] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name ?? '',
        age: user.age?.toString() ?? '',
        height: user.height?.toString() ?? '',
        weight: user.weight?.toString() ?? '',
        gender: (user.gender as Gender) ?? '',
        activityLevel: (user.activityLevel as ActivityLevel) ?? '',
        calorieGoal: user.calorieGoal.toString(),
        waterGoal: user.waterGoal.toString(),
      })
    }
  }, [user])

  useEffect(() => {
    if (form.weight && form.height && form.age && form.gender && form.activityLevel) {
      const t = calculateTDEE(
        parseFloat(form.weight),
        parseFloat(form.height),
        parseInt(form.age),
        form.gender as Gender,
        form.activityLevel as ActivityLevel,
      )
      setTdee(t)
    } else {
      setTdee(null)
    }
  }, [form.weight, form.height, form.age, form.gender, form.activityLevel])

  function applyTdee() {
    if (!tdee) return
    const macros = calculateMacroGoals(tdee)
    setForm(prev => ({ ...prev, calorieGoal: tdee.toString() }))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const body: Record<string, string | number> = {}
    if (form.name) body.name = form.name
    if (form.age) body.age = parseInt(form.age)
    if (form.height) body.height = parseFloat(form.height)
    if (form.weight) body.weight = parseFloat(form.weight)
    if (form.gender) body.gender = form.gender
    if (form.activityLevel) body.activityLevel = form.activityLevel
    if (form.calorieGoal) body.calorieGoal = parseInt(form.calorieGoal)
    if (form.waterGoal) body.waterGoal = parseInt(form.waterGoal)

    const res = await fetch('/api/user', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const { data } = await res.json()
    setSaving(false)
    if (data) { setUser(data); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Профайл</h1>
        <button
          onClick={logout}
          className="text-sm text-red-500 hover:text-red-600 font-medium"
        >
          Гарах
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Хувийн мэдээлэл</h2>

        {[
          { key: 'name', label: 'Нэр', type: 'text' },
          { key: 'age', label: 'Нас', type: 'number' },
          { key: 'height', label: 'Өндөр (см)', type: 'number' },
          { key: 'weight', label: 'Жин (кг)', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Хүйс</label>
          <div className="flex gap-2">
            {[{ value: 'male', label: 'Эрэгтэй' }, { value: 'female', label: 'Эмэгтэй' }].map(g => (
              <button
                key={g.value}
                onClick={() => setForm(prev => ({ ...prev, gender: g.value as Gender }))}
                className={`flex-1 py-2 rounded-xl text-sm transition-colors ${
                  form.gender === g.value ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Идэвхжилийн түвшин</label>
          <select
            value={form.activityLevel}
            onChange={e => setForm(prev => ({ ...prev, activityLevel: e.target.value as ActivityLevel }))}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Сонгох</option>
            {ACTIVITY_LEVELS.map(a => (
              <option key={a.value} value={a.value}>{a.labelMn}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 space-y-3">
        <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Зорилтууд</h2>

        {tdee && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-green-700 dark:text-green-300 font-medium">Тооцоолсон TDEE</p>
              <p className="text-lg font-bold text-green-600">{tdee} ккал/өдөр</p>
            </div>
            <button
              onClick={applyTdee}
              className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-medium"
            >
              Хэрэглэх
            </button>
          </div>
        )}

        {[
          { key: 'calorieGoal', label: 'Калорийн зорилго (ккал)', type: 'number' },
          { key: 'waterGoal', label: 'Усны зорилго (аяга)', type: 'number' },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">{f.label}</label>
            <input
              type={f.type}
              value={form[f.key as keyof typeof form]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-4 rounded-2xl font-bold text-base transition-colors ${
          saved
            ? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400'
            : 'bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white'
        }`}
      >
        {saving ? 'Хадгалж байна...' : saved ? 'Хадгалагдлаа!' : 'Хадгалах'}
      </button>
    </div>
  )
}
