'use client'

interface Props {
  glasses: number
  goal: number
  onAdd: () => void
  onRemove: () => void
}

export default function WaterTracker({ glasses, goal, onAdd, onRemove }: Props) {
  const pct = Math.min((glasses / goal) * 100, 100)

  return (
    <div className="bg-[#1C2A3A] rounded-2xl p-4 border border-[#1894E0]/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#1894E0]/20 flex items-center justify-center">
            <span className="text-base">💧</span>
          </div>
          <span className="font-semibold text-white text-sm">Ус</span>
        </div>
        <span className="text-sm text-[#8E8E93]">
          <span className="font-bold text-[#1894E0]">{glasses}</span>/{goal} аяга
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#2C2C2E] rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: '#1894E0' }}
        />
      </div>

      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {Array.from({ length: goal }).map((_, i) => (
          <button
            key={i}
            onClick={() => i < glasses ? onRemove() : onAdd()}
            className={`text-lg transition-all active:scale-90 ${i < glasses ? 'opacity-100' : 'opacity-20'}`}
          >
            💧
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRemove}
          disabled={glasses === 0}
          className="flex-1 py-2 rounded-xl border border-[#2C2C2E] text-sm font-medium text-[#8E8E93] disabled:opacity-30 active:bg-[#2C2C2E] transition-colors"
        >
          −
        </button>
        <button
          onClick={onAdd}
          disabled={glasses >= goal}
          className="flex-1 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-30 transition-colors active:opacity-80"
          style={{ backgroundColor: '#1894E0' }}
        >
          + Аяга нэмэх
        </button>
      </div>
    </div>
  )
}
