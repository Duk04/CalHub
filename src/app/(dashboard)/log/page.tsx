'use client'

import { useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { X, Camera, ScanLine, ImageIcon, Heart, ChevronLeft, Pencil } from 'lucide-react'
import type { NutritionData, MealType } from '@/types'
import { MEAL_TYPES } from '@/lib/constants'
import { compressImage } from '@/hooks/useCamera'

type Step = 'choose' | 'analyzing' | 'confirm' | 'manual'
type ScanTab = 'camera' | 'barcode' | 'gallery'

const DAILY_GOALS = { calories: 2000, protein: 150, fat: 65, carbs: 250 }

export default function LogPage() {
  const router = useRouter()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('choose')
  const [scanTab, setScanTab] = useState<ScanTab>('camera')
  const [items, setItems] = useState<NutritionData[]>([])
  const [mealType, setMealType] = useState<MealType>('other')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [favorited, setFavorited] = useState(false)

  const [manual, setManual] = useState({
    foodName: '',
    mongolianName: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    fiber: '',
    servingSize: '100g',
  })

  const totalMacros = items.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      fat: acc.fat + item.fat,
      carbs: acc.carbs + item.carbs,
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  )

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

      if (err) {
        setError(err)
        setStep('choose')
        return
      }

      setItems(data.items)
      setStep('confirm')
    } catch {
      setError('Failed to upload the image.')
      setStep('choose')
    }
  }

  async function handleSave() {
    setSaving(true)

    try {
      if (step === 'manual') {
        const item = {
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

        const res = await fetch('/api/log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...item, mealType }),
        })

        const { error: err } = await res.json()
        if (err) {
          setError(err)
          setSaving(false)
          return
        }
      } else {
        for (const item of items) {
          await fetch('/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...item, mealType }),
          })
        }
      }

      router.push('/')
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  if (step === 'analyzing') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#FBFAF4]">
        {previewUrl && <img src={previewUrl} alt="preview" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.16),_transparent_36%),linear-gradient(180deg,_rgba(251,250,244,0.9)_0%,_rgba(244,239,226,0.96)_100%)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 h-16 w-16 animate-spin rounded-full border-4 border-[#F57A4A] border-t-transparent" />
          <p className="text-lg font-semibold text-[#161617]">Analyzing your meal...</p>
          <p className="mt-1 text-sm text-[#7B7467]">GPT-4o Vision is working</p>
        </div>
      </div>
    )
  }

  if (step === 'confirm' && items.length > 0) {
    const leadItem = items[0]
    const resultTitle = leadItem.mongolianName ?? leadItem.foodName
    const resultSubtitle = leadItem.mongolianName ? leadItem.foodName : leadItem.servingSize
    const averageConfidence = Math.round(
      (items.reduce((sum, item) => sum + item.confidence, 0) / items.length) * 100,
    )
    const selectedMealLabel = MEAL_TYPES.find((type) => type.value === mealType)?.labelEn ?? mealType
    const macroCards = [
      {
        label: 'Calories',
        value: Math.round(totalMacros.calories).toLocaleString(),
        unit: 'kcal',
        bg: 'bg-[linear-gradient(180deg,_#F3EDFF_0%,_#ECE4FB_100%)]',
        textColor: 'text-[#6d28d9]',
        barColor: 'bg-[#7c3aed]',
        note: `${DAILY_GOALS.calories} daily goal`,
        pct: Math.min(100, Math.round((totalMacros.calories / DAILY_GOALS.calories) * 100)),
      },
      {
        label: 'Protein',
        value: Math.round(totalMacros.protein),
        unit: 'g',
        bg: 'bg-[linear-gradient(180deg,_#E9FAEF_0%,_#DDF5E6_100%)]',
        textColor: 'text-[#16a34a]',
        barColor: 'bg-[#22c55e]',
        note: `${DAILY_GOALS.protein}g target`,
        pct: Math.min(100, Math.round((totalMacros.protein / DAILY_GOALS.protein) * 100)),
      },
      {
        label: 'Carbs',
        value: Math.round(totalMacros.carbs),
        unit: 'g',
        bg: 'bg-[linear-gradient(180deg,_#FFF8D8_0%,_#FFF1B9_100%)]',
        textColor: 'text-[#a16207]',
        barColor: 'bg-[#eab308]',
        note: `${DAILY_GOALS.carbs}g target`,
        pct: Math.min(100, Math.round((totalMacros.carbs / DAILY_GOALS.carbs) * 100)),
      },
      {
        label: 'Fat',
        value: Math.round(totalMacros.fat),
        unit: 'g',
        bg: 'bg-[linear-gradient(180deg,_#DDF8EC_0%,_#CCF1E2_100%)]',
        textColor: 'text-[#065f46]',
        barColor: 'bg-[#10b981]',
        note: `${DAILY_GOALS.fat}g target`,
        pct: Math.min(100, Math.round((totalMacros.fat / DAILY_GOALS.fat) * 100)),
      },
    ]

    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.14),_transparent_32%),linear-gradient(180deg,_#FBFAF4_0%,_#F4EFE2_100%)]">
        <div className="relative flex-shrink-0">
          <img src={previewUrl!} alt="food" className="h-[244px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/16 via-transparent to-[#161617]/34" />
          <button
            onClick={() => { setStep('choose'); setPreviewUrl(null); setItems([]) }}
            className="absolute left-4 top-12 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/88 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5 text-[#161617]" />
          </button>
          <button
            onClick={() => setFavorited((f) => !f)}
            className="absolute right-4 top-12 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/88 shadow-[0_10px_24px_rgba(0,0,0,0.12)] backdrop-blur-sm"
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : 'text-[#161617]'}`} />
          </button>

          <div className="absolute inset-x-4 bottom-3">
            <div className="rounded-[24px] border border-white/70 bg-[rgba(245,239,226,0.92)] p-3.5 shadow-[0_18px_40px_rgba(25,20,14,0.16)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-[#F4F8E3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6C8220]">
                  AI estimate
                </span>
                <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-[#8C8475]">
                  {averageConfidence}% confidence
                </span>
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="truncate text-[22px] font-semibold tracking-[-0.05em] text-[#161617]">
                    {resultTitle}
                  </h1>
                  <p className="mt-1 text-[13px] text-[#7B7467]">
                    {items.length > 1
                      ? `${resultSubtitle} + ${items.length - 1} more item${items.length > 2 ? 's' : ''}`
                      : resultSubtitle}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <div className="text-[18px] font-semibold leading-none tracking-[-0.05em] text-[#161617]">
                    {Math.round(totalMacros.calories)}
                  </div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#8C8475]">
                    kcal total
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="-mt-4 flex-1 rounded-t-[28px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.97)_0%,_#FFFEFB_100%)] px-4 pb-36 pt-4 shadow-[0_-20px_40px_rgba(219,215,195,0.24)]">
          <div className="mb-3 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A927F]">
                Nutrition overview
              </p>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.04em] text-[#161617]">
                Macro snapshot
              </h2>
            </div>
            <div className="rounded-full border border-[#ECE5D5] bg-[#FBFAF6] px-3 py-1 text-xs font-medium text-[#7B7467]">
              {items.length} item{items.length > 1 ? 's' : ''}
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            {macroCards.map((card) => (
              <div
                key={card.label}
                className={`${card.bg} overflow-hidden rounded-[22px] border border-white/70 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B7467]">{card.label}</p>
                  <span className="rounded-full bg-white/72 px-2.5 py-1 text-[10px] font-semibold text-[#7B7467]">
                    {card.pct}%
                  </span>
                </div>

                <p className={`mt-4 text-[20px] font-semibold leading-none tracking-[-0.05em] ${card.textColor}`}>
                  {card.value}
                  <span className="ml-1 text-xs font-medium text-[#6E6657]">{card.unit}</span>
                </p>

                <div className="mt-3">
                  <div className="h-1.5 w-full rounded-full bg-white/75">
                    <div className={`${card.barColor} h-1.5 rounded-full transition-all`} style={{ width: `${card.pct}%` }} />
                  </div>
                  <p className="mt-2 text-[11px] text-[#8A826F]">{card.note}</p>
                </div>
              </div>
            ))}
          </div>

          <section className="mb-4 rounded-[24px] border border-[#ECE5D5] bg-[#FCFBF7] p-3.5 shadow-[0_14px_32px_rgba(219,215,195,0.16)]">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A927F]">
                  Detected item
                </p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-[-0.04em] text-[#161617]">
                  Ready for logging
                </h3>
              </div>
              <div className="text-right text-[11px] text-[#8A826F]">
                {Math.round(totalMacros.protein)}g P / {Math.round(totalMacros.carbs)}g C / {Math.round(totalMacros.fat)}g F
              </div>
            </div>

            <article className="rounded-[18px] border border-[#EFE7D8] bg-white px-3.5 py-3 shadow-[0_10px_24px_rgba(219,215,195,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-[#161617]">
                    {leadItem.mongolianName ?? leadItem.foodName}
                  </p>
                  {leadItem.mongolianName && (
                    <p className="mt-0.5 truncate text-xs text-[#8A826F]">{leadItem.foodName}</p>
                  )}
                </div>
                <div className="shrink-0 text-right text-sm font-semibold text-[#161617]">
                  {Math.round(leadItem.calories)} kcal
                </div>
              </div>

              <p className="mt-1.5 text-xs text-[#8A826F]">
                {leadItem.servingSize} / Protein: {Math.round(leadItem.protein)}g / Carbs: {Math.round(leadItem.carbs)}g / Fat: {Math.round(leadItem.fat)}g
              </p>

              {items.length > 1 && (
                <p className="mt-2 text-[11px] font-medium text-[#7B7467]">
                  + {items.length - 1} more detected item{items.length > 2 ? 's' : ''}
                </p>
              )}
            </article>
          </section>

          <section className="rounded-[24px] border border-[#ECE5D5] bg-white p-3.5 shadow-[0_14px_32px_rgba(219,215,195,0.16)]">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A927F]">
                  Meal settings
                </p>
                <h3 className="mt-1 text-[16px] font-semibold tracking-[-0.04em] text-[#161617]">
                  Meal type
                </h3>
              </div>
              <div className="text-xs text-[#8A826F]">{selectedMealLabel}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  onClick={() => setMealType(mt.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    mealType === mt.value
                      ? 'bg-[#F57A4A] text-white shadow-[0_14px_28px_rgba(245,122,74,0.24)]'
                      : 'border border-[#ECE5D5] bg-[#FBFAF6] text-[#7D7668]'
                  }`}
                >
                  {mt.emoji} {mt.labelEn}
                </button>
              ))}
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          </section>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-3 pb-3 pt-3">
          <div className="mx-auto max-w-lg rounded-[24px] border border-[#ECE5D5] bg-white/96 p-3 shadow-[0_16px_40px_rgba(185,176,151,0.24)] backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between gap-4 px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A927F]">Ready to log</p>
                <p className="mt-1 text-sm text-[#6F685A]">
                  {items.length} item{items.length > 1 ? 's' : ''} • {selectedMealLabel}
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold tracking-[-0.04em] text-[#161617]">
                  {Math.round(totalMacros.calories)}
                </div>
                <div className="text-xs text-[#8A826F]">kcal</div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-[18px] bg-[linear-gradient(135deg,_#F57A4A,_#FF9A5C)] py-3.5 text-base font-bold text-white shadow-[0_18px_40px_rgba(245,122,74,0.3)] transition-transform active:scale-[0.99] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add to My Diet'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'manual') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.14),_transparent_32%),linear-gradient(180deg,_#FBFAF4_0%,_#F4EFE2_100%)]">
        <div className="flex items-center gap-3 px-4 pb-4 pt-12">
          <button onClick={() => setStep('choose')} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ECE5D5] bg-white shadow-sm">
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Manual entry</h1>
        </div>

        <div className="px-4 pb-32">
          <div className="mb-4 space-y-3 rounded-[28px] border border-[#ECE5D5] bg-white p-4 shadow-[0_18px_45px_rgba(219,215,195,0.22)]">
            {[
              { key: 'foodName', label: 'Food name', required: true },
              { key: 'mongolianName', label: 'Local name', required: false },
              { key: 'servingSize', label: 'Serving size', required: true },
              { key: 'calories', label: 'Calories (kcal)', required: true, type: 'number' },
              { key: 'protein', label: 'Protein (g)', required: true, type: 'number' },
              { key: 'fat', label: 'Fat (g)', required: true, type: 'number' },
              { key: 'carbs', label: 'Carbs (g)', required: true, type: 'number' },
              { key: 'fiber', label: 'Fiber (g)', required: false, type: 'number' },
            ].map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-medium text-gray-500">{f.label}</label>
                <input
                  type={f.type ?? 'text'}
                  required={f.required}
                  value={manual[f.key as keyof typeof manual]}
                  onChange={(e) => setManual((prev) => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full rounded-xl border border-[#ECE5D5] bg-[#FBFAF6] px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F3B294]"
                />
              </div>
            ))}
          </div>

          <div className="mb-4 rounded-[28px] border border-[#ECE5D5] bg-white p-4 shadow-[0_18px_45px_rgba(219,215,195,0.22)]">
            <p className="mb-2 text-sm font-semibold text-gray-700">Meal type</p>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  onClick={() => setMealType(mt.value)}
                  className={`rounded-xl px-3 py-1.5 text-sm font-medium transition-colors ${
                    mealType === mt.value ? 'bg-[#F57A4A] text-white' : 'border border-[#ECE5D5] bg-[#FBFAF6] text-[#7D7668]'
                  }`}
                >
                  {mt.emoji} {mt.labelEn}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-[#ECE5D5] bg-white/92 px-4 pb-8 pt-3 backdrop-blur-sm">
          <button
            onClick={handleSave}
            disabled={saving || !manual.foodName || !manual.calories}
            className="w-full rounded-2xl bg-[#F57A4A] py-4 text-base font-bold text-white shadow-[0_18px_40px_rgba(245,122,74,0.28)] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Add entry'}
          </button>
        </div>
      </div>
    )
  }

  const tabs: { id: ScanTab; icon: ReactNode; label: string }[] = [
    { id: 'camera', icon: <Camera className="h-5 w-5" />, label: 'AI Camera' },
    { id: 'barcode', icon: <ScanLine className="h-5 w-5" />, label: 'AI Barcode' },
    { id: 'gallery', icon: <ImageIcon className="h-5 w-5" />, label: 'Gallery' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.14),_transparent_32%),linear-gradient(180deg,_#FBFAF4_0%,_#F4EFE2_100%)]">
      <div className="flex items-center justify-between px-5 pb-2 pt-12">
        <div className="w-9" />
        <h1 className="text-base font-semibold text-[#161617]">
          {scanTab === 'camera' ? 'AI Camera' : scanTab === 'barcode' ? 'AI Barcode' : 'Gallery'}
        </h1>
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8E1CF] bg-white shadow-[0_10px_24px_rgba(209,203,182,0.16)]"
        >
          <X className="h-4 w-4 text-[#161617]" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-7 py-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[#ECE5D5] bg-white shadow-[0_24px_60px_rgba(219,215,195,0.22)]">
          <div className="absolute left-5 top-5 h-10 w-10 rounded-tl-xl border-l-[3px] border-t-[3px] border-[#97AE29]" />
          <div className="absolute right-5 top-5 h-10 w-10 rounded-tr-xl border-r-[3px] border-t-[3px] border-[#97AE29]" />
          <div className="absolute bottom-5 left-5 h-10 w-10 rounded-bl-xl border-b-[3px] border-l-[3px] border-[#97AE29]" />
          <div className="absolute bottom-5 right-5 h-10 w-10 rounded-br-xl border-b-[3px] border-r-[3px] border-[#97AE29]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F8E3] text-[#97AE29]">
              <Camera className="h-8 w-8" />
            </div>
            <p className="text-xs text-[#7B7467]">Center your meal in the frame</p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-10">
        <div className="mb-8 flex justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setScanTab(tab.id)
                if (tab.id === 'gallery') galleryRef.current?.click()
              }}
              className={`flex flex-col items-center gap-1.5 transition-colors ${
                scanTab === tab.id ? 'text-[#161617]' : 'text-[#A19A8A]'
              }`}
            >
              {tab.icon}
              <span className="text-[11px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => setStep('manual')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E1CF] bg-white"
          >
            <Pencil className="h-4 w-4 text-[#7B7467]" />
          </button>

          <button
            onClick={() => {
              if (scanTab === 'gallery') galleryRef.current?.click()
              else cameraRef.current?.click()
            }}
            className="h-[72px] w-[72px] rounded-full border-[3px] border-[#F57A4A] p-1.5 transition-transform active:scale-95"
          >
            <div className="h-full w-full rounded-full bg-[#F57A4A]" />
          </button>

          <div className="h-10 w-10" />
        </div>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {error && <div className="absolute bottom-28 left-4 right-4 rounded-2xl bg-[#E45E45] px-4 py-3 text-center text-sm text-white">{error}</div>}
    </div>
  )
}
