'use client'

interface Props {
  glasses: number
  goal: number
  onAdd: () => void
  onRemove: () => void
}

export function WaterTracker({ glasses, goal, onAdd, onRemove }: Props) {
  const pct = Math.min((glasses / goal) * 100, 100)
  const isComplete = glasses >= goal

  return (
    <div className="rounded-[24px] border border-[#EDE8D9] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#EAF6FD] text-lg">
            💧
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1B1B1D]">Water</p>
            <p className="text-xs text-[#6B6560]">Daily hydration</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-lg font-semibold text-[#1B1B1D]">{glasses}</span>
          <span className="text-sm text-[#A09A90]">/{goal}</span>
          <p className="text-xs text-[#A09A90]">glasses</p>
        </div>
      </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-[#F0EBE1]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: isComplete ? '#C7E44C' : '#38BDF8',
          }}
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {Array.from({ length: goal }).map((_, i) => (
          <button
            key={i}
            onClick={() => (i < glasses ? onRemove() : onAdd())}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90"
            style={{
              backgroundColor: i < glasses ? '#EAF6FD' : '#F5F1EA',
            }}
            aria-label={i < glasses ? 'Remove glass' : 'Add glass'}
          >
            <span
              className="text-base leading-none transition-opacity"
              style={{ opacity: i < glasses ? 1 : 0.3 }}
            >
              💧
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRemove}
          disabled={glasses === 0}
          className="flex h-11 flex-1 items-center justify-center rounded-[14px] border border-[#EDE8D9] bg-[#FBFAF6] text-sm font-semibold text-[#6B6560] transition-colors active:bg-[#F0EBE1] disabled:opacity-30"
        >
          −
        </button>
        <button
          onClick={onAdd}
          disabled={glasses >= goal}
          className="flex h-11 flex-1 items-center justify-center rounded-[14px] bg-[#38BDF8] text-sm font-semibold text-white transition-colors active:opacity-85 disabled:opacity-30"
        >
          + Add glass
        </button>
      </div>
    </div>
  )
}

export default WaterTracker
