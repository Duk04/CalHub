'use client'

import { useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { X, Camera, ScanLine, ImageIcon, Heart, ChevronLeft, Pencil, UtensilsCrossed } from 'lucide-react'
import type { NutritionData, MealType } from '@/types'
import { MEAL_TYPES } from '@/lib/constants'
import { compressImage } from '@/hooks/useCamera'
import { useAuth } from '@/hooks/useAuth'

type Step = 'choose' | 'analyzing' | 'confirm' | 'manual'
type ScanTab = 'camera' | 'barcode' | 'gallery'

const MACRO_META = [
  { key: 'calories', label: 'Calories', unit: 'kcal', color: '#A855F7', bg: '#F5F3FF' },
  { key: 'protein', label: 'Protein', unit: 'g', color: '#3B82F6', bg: '#EFF6FF' },
  { key: 'carbs', label: 'Carbs', unit: 'g', color: '#10B981', bg: '#ECFDF5' },
  { key: 'fat', label: 'Fat', unit: 'g', color: '#F59E0B', bg: '#FFFBEB' },
] as const

export default function LogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>('choose')
  const [scanTab, setScanTab] = useState<ScanTab>('camera')
  const [items, setItems] = useState<NutritionData[]>([])
  const [mealType, setMealType] = useState<MealType>('other')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)

  const dailyGoals = {
    calories: user?.calorieGoal ?? 2000,
    protein: user?.proteinGoal ?? 150,
    fat: user?.fatGoal ?? 65,
    carbs: user?.carbGoal ?? 250,
  }

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

  async function handleFavorite() {
    if (items.length === 0) return
    const lead = items[0]
    try {
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          foodName: lead.foodName,
          mongolianName: lead.mongolianName,
          calories: lead.calories,
          protein: lead.protein,
          fat: lead.fat,
          carbs: lead.carbs,
          fiber: lead.fiber,
          servingSize: lead.servingSize,
        }),
      })
      setIsFavorited(true)
    } catch {
      // silently fail — don't interrupt the logging flow
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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FBFAF4]">
        {previewUrl && (
          <img src={previewUrl} alt="preview" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(199,228,76,0.14),_transparent_40%),linear-gradient(180deg,_rgba(251,250,244,0.92)_0%,_rgba(244,239,226,0.97)_100%)]" />
        <div className="relative flex flex-col items-center px-8 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-white shadow-[0_20px_50px_rgba(199,228,76,0.22)]">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#C7E44C] border-t-transparent" />
          </div>
          <p className="text-xl font-semibold tracking-[-0.03em] text-[#1B1B1D]">Analyzing your meal</p>
          <p className="mt-2 text-sm text-[#6B6560]">GPT-4o Vision is identifying your food</p>
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

    const macroCards = MACRO_META.map((m) => {
      const raw = m.key === 'calories' ? totalMacros.calories : totalMacros[m.key as keyof typeof totalMacros]
      const goal = dailyGoals[m.key as keyof typeof dailyGoals]
      const pct = Math.min(100, Math.round((raw / goal) * 100))
      return { ...m, value: Math.round(raw), pct, goal }
    })

    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#FBFAF4]">
        <div className="relative flex-shrink-0">
          <img src={previewUrl!} alt="food" className="h-[260px] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#1B1B1D]/40" />

          <button
            onClick={() => { setStep('choose'); setPreviewUrl(null); setItems([]); setIsFavorited(false) }}
            className="absolute left-4 top-12 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/90 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm"
          >
            <ChevronLeft className="h-5 w-5 text-[#1B1B1D]" />
          </button>
          <button
            onClick={handleFavorite}
            disabled={isFavorited}
            className="absolute right-4 top-12 flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/90 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-sm disabled:opacity-70"
          >
            <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-[#1B1B1D]'}`} />
          </button>

          <div className="absolute inset-x-4 bottom-3">
            <div className="rounded-[20px] border border-white/50 bg-white/90 p-3.5 shadow-[0_16px_40px_rgba(25,20,14,0.18)] backdrop-blur-md">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="inline-flex rounded-full bg-[#F4F8E3] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6C8220]">
                  AI estimate
                </span>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{ color: averageConfidence >= 80 ? '#10B981' : averageConfidence >= 60 ? '#F59E0B' : '#EF4444' }}
                >
                  {averageConfidence}% confidence
                </span>
              </div>
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="truncate text-[21px] font-semibold tracking-[-0.04em] text-[#1B1B1D]">{resultTitle}</h1>
                  <p className="mt-1 text-[13px] text-[#6B6560]">
                    {items.length > 1
                      ? `${resultSubtitle} + ${items.length - 1} more`
                      : resultSubtitle}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[20px] font-semibold leading-none tracking-[-0.04em] text-[#1B1B1D]">
                    {Math.round(totalMacros.calories)}
                  </div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#A09A90]">kcal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="-mt-4 flex-1 rounded-t-[28px] bg-white px-4 pb-36 pt-5 shadow-[0_-16px_40px_rgba(219,215,195,0.20)]">
          {averageConfidence < 60 && (
            <div className="mb-4 flex items-center gap-2 rounded-[14px] border border-amber-200 bg-amber-50 px-3.5 py-3">
              <span className="text-base">⚠️</span>
              <p className="text-xs font-medium text-amber-800">
                Low confidence — please verify or edit the nutrition values before logging.
              </p>
            </div>
          )}

          <div className="mb-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09A90]">
              Nutrition overview
            </p>
            <div className="grid grid-cols-2 gap-3">
              {macroCards.map((card) => (
                <div
                  key={card.label}
                  className="overflow-hidden rounded-[20px] border border-[#EDE8D9] p-3.5"
                  style={{ backgroundColor: card.bg }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6B6560]">{card.label}</p>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ backgroundColor: `${card.color}18`, color: card.color }}
                    >
                      {card.pct}%
                    </span>
                  </div>
                  <p className="mt-3 text-[22px] font-semibold leading-none tracking-[-0.04em] text-[#1B1B1D]">
                    {card.value}
                    <span className="ml-1 text-xs font-medium text-[#6B6560]">{card.unit}</span>
                  </p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/80">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${card.pct}%`, backgroundColor: card.color }}
                    />
                  </div>
                  <p className="mt-1.5 text-[10px] text-[#A09A90]">{card.goal} {card.unit} goal</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 rounded-[20px] border border-[#EDE8D9] bg-[#FBFAF6] p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09A90]">
              Detected item
            </p>
            <div className="rounded-[14px] border border-[#EDE8D9] bg-white px-3.5 py-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-[#1B1B1D]">
                    {leadItem.mongolianName ?? leadItem.foodName}
                  </p>
                  {leadItem.mongolianName && (
                    <p className="mt-0.5 truncate text-xs text-[#A09A90]">{leadItem.foodName}</p>
                  )}
                </div>
                <div className="shrink-0 text-sm font-semibold text-[#1B1B1D]">
                  {Math.round(leadItem.calories)} kcal
                </div>
              </div>
              <p className="mt-2 text-xs text-[#A09A90]">
                {leadItem.servingSize} &nbsp;·&nbsp;
                <span style={{ color: '#3B82F6' }}>P {Math.round(leadItem.protein)}g</span>
                {' '}&nbsp;
                <span style={{ color: '#10B981' }}>C {Math.round(leadItem.carbs)}g</span>
                {' '}&nbsp;
                <span style={{ color: '#F59E0B' }}>F {Math.round(leadItem.fat)}g</span>
              </p>
              {items.length > 1 && (
                <p className="mt-2 text-[11px] font-medium text-[#6B6560]">
                  + {items.length - 1} more detected item{items.length > 2 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[20px] border border-[#EDE8D9] bg-white p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09A90]">
              Meal type
            </p>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  onClick={() => setMealType(mt.value)}
                  className={`flex h-9 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all ${
                    mealType === mt.value
                      ? 'bg-[#C7E44C] text-[#3A4A05] shadow-[0_8px_20px_rgba(199,228,76,0.3)]'
                      : 'border border-[#EDE8D9] bg-[#FBFAF6] text-[#6B6560]'
                  }`}
                >
                  <span>{mt.emoji}</span>
                  {mt.labelEn}
                </button>
              ))}
            </div>
            {error && <p className="mt-4 text-sm font-medium text-red-500">{error}</p>}
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2">
          <div className="mx-auto max-w-lg rounded-[22px] border border-[#EDE8D9] bg-white/96 p-3.5 shadow-[0_16px_40px_rgba(185,176,151,0.28)] backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between px-1">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A09A90]">Ready to log</p>
                <p className="mt-0.5 text-sm text-[#6B6560]">
                  {items.length} item{items.length > 1 ? 's' : ''} · {selectedMealLabel}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold tracking-[-0.04em] text-[#1B1B1D]">
                  {Math.round(totalMacros.calories)}
                </div>
                <div className="text-xs text-[#A09A90]">kcal</div>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-[16px] bg-[#C7E44C] py-4 text-base font-bold text-[#3A4A05] shadow-[0_14px_32px_rgba(199,228,76,0.3)] transition-transform active:scale-[0.99] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add to My Diet'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'manual') {
    const selectedMealLabel = MEAL_TYPES.find((t) => t.value === mealType)?.labelEn ?? mealType

    return (
      <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#FBFAF4]">
        <div className="flex items-center gap-3 px-5 pb-4 pt-12">
          <button
            onClick={() => setStep('choose')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EDE8D9] bg-white shadow-sm"
          >
            <ChevronLeft className="h-5 w-5 text-[#1B1B1D]" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-[-0.03em] text-[#1B1B1D]">Manual entry</h1>
            <p className="text-xs text-[#A09A90]">Enter nutrition details below</p>
          </div>
        </div>

        <div className="px-5 pb-40">
          <div className="mb-4 rounded-[24px] border border-[#EDE8D9] bg-white p-5 shadow-sm">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09A90]">Food details</p>
            <div className="space-y-4">
              {[
                { key: 'foodName', label: 'Food name', placeholder: 'e.g. Бууз / Buuz', required: true },
                { key: 'mongolianName', label: 'Local name', placeholder: 'Mongolian name (optional)', required: false },
                { key: 'servingSize', label: 'Serving size', placeholder: '100g', required: true },
              ].map((f) => (
                <div key={f.key}>
                  <label className="mb-1.5 block text-xs font-semibold text-[#3B362E]">
                    {f.label}
                    {f.required && <span className="ml-1 text-red-400">*</span>}
                  </label>
                  <input
                    type="text"
                    required={f.required}
                    placeholder={f.placeholder}
                    value={manual[f.key as keyof typeof manual]}
                    onChange={(e) => setManual((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full rounded-[14px] border border-[#EDE8D9] bg-[#FBFAF6] px-4 py-3.5 text-sm text-[#1B1B1D] outline-none placeholder:text-[#C0B9AE] focus:border-[#C7E44C] focus:ring-2 focus:ring-[#C7E44C]/20"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4 rounded-[24px] border border-[#EDE8D9] bg-white p-5 shadow-sm">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09A90]">Nutrition per serving</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'calories', label: 'Calories', unit: 'kcal', required: true, color: '#A855F7' },
                { key: 'protein', label: 'Protein', unit: 'g', required: true, color: '#3B82F6' },
                { key: 'carbs', label: 'Carbs', unit: 'g', required: true, color: '#10B981' },
                { key: 'fat', label: 'Fat', unit: 'g', required: true, color: '#F59E0B' },
                { key: 'fiber', label: 'Fiber', unit: 'g', required: false, color: '#A09A90' },
              ].map((f) => (
                <div key={f.key} className={f.key === 'fiber' ? 'col-span-2' : ''}>
                  <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-[#3B362E]">
                    <span>{f.label}</span>
                    <span className="text-[10px] font-medium text-[#A09A90]">{f.unit}</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      required={f.required}
                      placeholder="0"
                      value={manual[f.key as keyof typeof manual]}
                      onChange={(e) => setManual((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full rounded-[14px] border border-[#EDE8D9] bg-[#FBFAF6] py-3.5 pl-4 pr-12 text-sm font-semibold text-[#1B1B1D] outline-none placeholder:font-normal placeholder:text-[#C0B9AE] focus:border-[#C7E44C] focus:ring-2 focus:ring-[#C7E44C]/20"
                    />
                    <span
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold"
                      style={{ color: f.color }}
                    >
                      {f.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#EDE8D9] bg-white p-5 shadow-sm">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A09A90]">Meal type</p>
            <div className="flex flex-wrap gap-2">
              {MEAL_TYPES.map((mt) => (
                <button
                  key={mt.value}
                  onClick={() => setMealType(mt.value)}
                  className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition-all ${
                    mealType === mt.value
                      ? 'bg-[#C7E44C] text-[#3A4A05] shadow-[0_8px_20px_rgba(199,228,76,0.28)]'
                      : 'border border-[#EDE8D9] bg-[#FBFAF6] text-[#6B6560]'
                  }`}
                >
                  <span>{mt.emoji}</span>
                  {mt.labelEn}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="mt-4 text-sm font-medium text-red-500">{error}</p>}
        </div>

        <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4">
          <div className="mx-auto max-w-lg">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs text-[#A09A90]">{selectedMealLabel}</p>
              {manual.calories && (
                <p className="text-sm font-semibold text-[#1B1B1D]">{manual.calories} kcal</p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !manual.foodName || !manual.calories}
              className="w-full rounded-[18px] bg-[#C7E44C] py-4 text-base font-bold text-[#3A4A05] shadow-[0_14px_32px_rgba(199,228,76,0.28)] transition-transform active:scale-[0.99] disabled:opacity-40"
            >
              {saving ? 'Saving...' : 'Add entry'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const tabs: { id: ScanTab; icon: ReactNode; label: string }[] = [
    { id: 'camera', icon: <Camera className="h-5 w-5" />, label: 'AI Camera' },
    { id: 'barcode', icon: <ScanLine className="h-5 w-5" />, label: 'Barcode' },
    { id: 'gallery', icon: <ImageIcon className="h-5 w-5" />, label: 'Gallery' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FBFAF4]">
      <div className="flex items-center justify-between px-5 pb-2 pt-12">
        <div className="w-11" />
        <div className="text-center">
          <h1 className="text-base font-semibold text-[#1B1B1D]">
            {scanTab === 'camera' ? 'AI Camera' : scanTab === 'barcode' ? 'Barcode Scan' : 'Gallery'}
          </h1>
          <p className="text-[11px] text-[#A09A90]">Take or choose a food photo</p>
        </div>
        <button
          onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EDE8D9] bg-white shadow-sm"
        >
          <X className="h-4 w-4 text-[#1B1B1D]" />
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-[28px] border border-[#EDE8D9] bg-white shadow-[0_24px_60px_rgba(219,215,195,0.22)]">
          <div className="absolute left-4 top-4 h-9 w-9 rounded-tl-xl border-l-[3px] border-t-[3px] border-[#C7E44C]" />
          <div className="absolute right-4 top-4 h-9 w-9 rounded-tr-xl border-r-[3px] border-t-[3px] border-[#C7E44C]" />
          <div className="absolute bottom-4 left-4 h-9 w-9 rounded-bl-xl border-b-[3px] border-l-[3px] border-[#C7E44C]" />
          <div className="absolute bottom-4 right-4 h-9 w-9 rounded-br-xl border-b-[3px] border-r-[3px] border-[#C7E44C]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#F4F8E3] text-[#6C8220]">
              <UtensilsCrossed className="h-8 w-8" strokeWidth={1.5} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1B1B1D]">Center your meal</p>
              <p className="mt-1 text-xs text-[#A09A90]">AI identifies food and estimates macros</p>
            </div>
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
              className={`flex min-h-[44px] flex-col items-center justify-center gap-1.5 px-3 transition-colors ${
                scanTab === tab.id ? 'text-[#1B1B1D]' : 'text-[#B0A999]'
              }`}
            >
              {tab.icon}
              <span className="text-[11px] font-semibold">{tab.label}</span>
              <div
                className={`h-0.5 w-4 rounded-full transition-all ${
                  scanTab === tab.id ? 'bg-[#C7E44C] opacity-100' : 'bg-transparent opacity-0'
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => setStep('manual')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#EDE8D9] bg-white shadow-sm"
            aria-label="Manual entry"
          >
            <Pencil className="h-4 w-4 text-[#6B6560]" />
          </button>

          <button
            onClick={() => {
              if (scanTab === 'gallery') galleryRef.current?.click()
              else cameraRef.current?.click()
            }}
            className="h-[72px] w-[72px] rounded-full border-[3px] border-[#C7E44C] p-1.5 shadow-[0_16px_32px_rgba(199,228,76,0.32)] transition-transform active:scale-95"
          >
            <div className="h-full w-full rounded-full bg-[#C7E44C]" />
          </button>

          <div className="h-11 w-11" />
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

      {error && (
        <div className="absolute bottom-32 left-5 right-5 rounded-[16px] bg-red-500 px-4 py-3 text-center text-sm font-medium text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  )
}
