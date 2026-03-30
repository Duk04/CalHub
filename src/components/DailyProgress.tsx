'use client'

interface Props {
  calories: number
  calorieGoal: number
  protein: number
  fat: number
  carbs: number
  proteinGoal: number
  fatGoal: number
  carbGoal: number
}

export default function DailyProgress({
  calories, calorieGoal, protein, fat, carbs, proteinGoal, fatGoal, carbGoal,
}: Props) {
  const pct = Math.min((calories / calorieGoal) * 100, 100)
  const remaining = Math.max(calorieGoal - calories, 0)
  const over = calories > calorieGoal

  const r = 52
  const circumference = 2 * Math.PI * r
  const dashOffset = circumference - (pct / 100) * circumference

  const macros = [
    { label: 'Уураг', val: protein, goal: proteinGoal, color: '#1894E0', bg: '#1C2A3A', text: '#1894E0' },
    { label: 'Өөх тос', val: fat, goal: fatGoal, color: '#FFD217', bg: '#2A2510', text: '#FFD217' },
    { label: 'Нүүрс ус', val: carbs, goal: carbGoal, color: '#45C588', bg: '#152A20', text: '#45C588' },
  ]

  return (
    <div className="bg-[#1C1C1E] rounded-3xl p-5 border border-[#2C2C2E]">
      <div className="flex items-center gap-5">
        {/* Ring */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10"
              stroke="#2C2C2E" />
            <circle
              cx="60" cy="60" r={r} fill="none"
              stroke={over ? '#FF6F43' : 'url(#calGrad)'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="calGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#45C588" />
                <stop offset="100%" stopColor="#FF6F43" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-bold text-white leading-none">{calories}</span>
            <span className="text-[10px] text-[#8E8E93] mt-0.5 font-medium uppercase tracking-wide">ккал</span>
            <span className="text-[10px] text-[#8E8E93]">{Math.round(pct)}%</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between bg-[#2C2C2E] rounded-2xl px-3 py-2.5">
            <span className="text-xs text-[#8E8E93]">Зорилго</span>
            <span className="text-sm font-bold text-white">{calorieGoal} ккал</span>
          </div>
          <div
            className="flex items-center justify-between rounded-2xl px-3 py-2.5"
            style={{ backgroundColor: over ? '#2A1515' : '#152A20' }}
          >
            <span className="text-xs font-medium" style={{ color: over ? '#FF6F43' : '#45C588' }}>
              {over ? 'Хэтэрсэн' : 'Үлдсэн'}
            </span>
            <span className="text-sm font-bold" style={{ color: over ? '#FF6F43' : '#45C588' }}>
              {over ? '+' : ''}{over ? calories - calorieGoal : remaining} ккал
            </span>
          </div>
        </div>
      </div>

      {/* Macros */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        {macros.map(m => {
          const macroPct = Math.min((m.val / m.goal) * 100, 100)
          return (
            <div key={m.label} className="rounded-2xl p-3" style={{ backgroundColor: m.bg }}>
              <div className="text-base font-bold" style={{ color: m.text }}>{m.val}г</div>
              <div className="text-xs text-[#8E8E93] mb-2">{m.label}</div>
              <div className="h-1 bg-black/30 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${macroPct}%`, backgroundColor: m.color }}
                />
              </div>
              <div className="text-[10px] text-[#8E8E93] mt-1">{m.goal}г зорилго</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
