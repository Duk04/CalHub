'use client'

interface Props {
  glasses: number
  goal: number
  onAdd: () => void
  onRemove: () => void
}

export default function WaterTracker({ glasses, goal, onAdd, onRemove }: Props) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">💧</span>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">Ус</span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-bold text-cyan-500">{glasses}</span>/{goal} аяга
        </span>
      </div>

      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {Array.from({ length: goal }).map((_, i) => (
          <button
            key={i}
            onClick={() => i < glasses ? onRemove() : onAdd()}
            className={`text-xl transition-all ${i < glasses ? 'opacity-100' : 'opacity-20'}`}
          >
            💧
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onRemove}
          disabled={glasses === 0}
          className="flex-1 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          -
        </button>
        <button
          onClick={onAdd}
          disabled={glasses >= goal}
          className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-40 text-sm font-medium text-white transition-colors"
        >
          + Аяга нэмэх
        </button>
      </div>
    </div>
  )
}
