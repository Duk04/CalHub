'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { NutritionData, MealType } from '@/types'
import { MEAL_TYPES } from '@/lib/constants'
import { compressImage } from '@/hooks/useCamera'

type Step = 'choose' | 'analyzing' | 'confirm' | 'manual'

export default function LogPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('choose')
  const [items, setItems] = useState<NutritionData[]>([])
  const [selected, setSelected] = useState<NutritionData | null>(null)
  const [mealType, setMealType] = useState<MealType>('other')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Manual entry state
  const [manual, setManual] = useState({
    foodName: '', mongolianName: '', calories: '', protein: '', fat: '', carbs: '', fiber: '', servingSize: '100г',
  })

  async function handleFile(file: File) {
    setError('')
    setPreviewUrl(URL.createObjectURL(file))
    setStep('analyzing')

    try {
      const compressed = await compressImage(file)
      const formData = new FormData()
      formData.append('image', compressed)

      const res = await fetch('/api/analyze', { method: 'POST', body: formData })
      const { data, error: err } = await res.json()

      if (err) { setError(err); setStep('choose'); return }

      setItems(data.items)
      setSelected(data.items[0] ?? null)
      setStep('confirm')
    } catch {
      setError('Зураг дамжуулахад алдаа гарлаа.')
      setStep('choose')
    }
  }

  async function handleSave() {
    const item = step === 'manual'
      ? {
          foodName: manual.foodName,
          mongolianName: manual.mongolianName || undefined,
          calories: parseFloat(manual.calories),
          protein: parseFloat(manual.protein),
          fat: parseFloat(manual.fat),
          carbs: parseFloat(manual.carbs),
          fiber: parseFloat(manual.fiber) || 0,
          servingSize: manual.servingSize,
          quantity: 1,
        }
      : selected

    if (!item) return
    setSaving(true)

    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, mealType }),
    })

    const { error: err } = await res.json()
    setSaving(false)

    if (err) { setError(err); return }
    router.push('/')
    router.refresh()
  }

  if (step === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        {previewUrl && (
          <img src={previewUrl} alt="preview" className="w-48 h-48 object-cover rounded-2xl mb-6 shadow-lg" />
        )}
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">Хоолыг таньж байна...</p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">GPT-4o Vision ажиллаж байна</p>
      </div>
    )
  }

  if (step === 'confirm' && selected) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <button onClick={() => { setStep('choose'); setPreviewUrl(null) }} className="text-gray-400 mb-4 flex items-center gap-1 text-sm">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Хоолны мэдээлэл</h1>

        {previewUrl && (
          <img src={previewUrl} alt="food" className="w-full h-48 object-cover rounded-2xl mb-4" />
        )}

        {items.length > 1 && (
          <div className="mb-4 space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Олон хоол илэрсэн:</p>
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => setSelected(item)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                  selected === item
                    ? 'border-green-500 bg-green-50 dark:bg-green-950'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                <span className="font-medium text-gray-900 dark:text-white text-sm">
                  {item.mongolianName ?? item.foodName}
                </span>
                <span className="text-xs text-gray-400 ml-2">{Math.round(item.calories)} ккал</span>
              </button>
            ))}
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">
                {selected.mongolianName ?? selected.foodName}
              </h2>
              {selected.mongolianName && (
                <p className="text-sm text-gray-400">{selected.foodName}</p>
              )}
              <p className="text-xs text-gray-400 mt-0.5">{selected.servingSize}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-orange-500">{Math.round(selected.calories)}</span>
              <span className="text-sm text-gray-400 ml-1">ккал</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: 'Уураг', val: selected.protein, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
              { label: 'Өөх тос', val: selected.fat, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' },
              { label: 'Нүүрс ус', val: selected.carbs, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
            ].map(m => (
              <div key={m.label} className={`${m.bg} rounded-xl p-2`}>
                <div className={`font-bold ${m.color}`}>{Math.round(m.val)}г</div>
                <div className="text-xs text-gray-500">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-2 text-center text-xs text-gray-400">
            Итгэлцэл: {Math.round(selected.confidence * 100)}%
          </div>
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Хоолны төрөл</label>
          <div className="grid grid-cols-3 gap-2">
            {MEAL_TYPES.map(mt => (
              <button
                key={mt.value}
                onClick={() => setMealType(mt.value)}
                className={`py-2 px-3 rounded-xl text-sm transition-colors ${
                  mealType === mt.value
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {mt.emoji} {mt.labelMn}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold text-base transition-colors"
        >
          {saving ? 'Хадгалж байна...' : 'Бүртгэлд нэмэх'}
        </button>
      </div>
    )
  }

  if (step === 'manual') {
    return (
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <button onClick={() => setStep('choose')} className="text-gray-400 mb-4 flex items-center gap-1 text-sm">
          ← Буцах
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Гараар оруулах</h1>

        <div className="space-y-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 mb-4">
          {[
            { key: 'foodName', label: 'Хоолны нэр (англи)', required: true },
            { key: 'mongolianName', label: 'Монгол нэр', required: false },
            { key: 'servingSize', label: 'Порц хэмжээ', required: true },
            { key: 'calories', label: 'Калори (ккал)', required: true, type: 'number' },
            { key: 'protein', label: 'Уураг (г)', required: true, type: 'number' },
            { key: 'fat', label: 'Өөх тос (г)', required: true, type: 'number' },
            { key: 'carbs', label: 'Нүүрс ус (г)', required: true, type: 'number' },
            { key: 'fiber', label: 'Эслэг (г)', required: false, type: 'number' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">{f.label}</label>
              <input
                type={f.type ?? 'text'}
                required={f.required}
                value={manual[f.key as keyof typeof manual]}
                onChange={e => setManual(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Хоолны төрөл</label>
          <div className="grid grid-cols-3 gap-2">
            {MEAL_TYPES.map(mt => (
              <button
                key={mt.value}
                onClick={() => setMealType(mt.value)}
                className={`py-2 rounded-xl text-sm transition-colors ${
                  mealType === mt.value ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
              >
                {mt.emoji} {mt.labelMn}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={handleSave}
          disabled={saving || !manual.foodName || !manual.calories}
          className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white font-bold text-base transition-colors"
        >
          {saving ? 'Хадгалж байна...' : 'Бүртгэлд нэмэх'}
        </button>
      </div>
    )
  }

  // Default: choose step
  return (
    <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Хоол бүртгэх</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl py-5 flex items-center justify-center gap-3 font-semibold text-base transition-colors shadow-lg shadow-green-500/20"
        >
          <CameraIcon className="w-6 h-6" />
          Зураг авах / оруулах
        </button>

        <button
          onClick={() => setStep('manual')}
          className="w-full bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-2xl py-4 flex items-center justify-center gap-3 font-medium transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
          Гараар оруулах
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
        GPT-4o Vision ашиглан Монгол болон дэлхийн хоолыг таних боломжтой
      </p>
    </div>
  )
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}
