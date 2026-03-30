'use client'

import { useState } from 'react'
import type { FoodLog } from '@/types'

interface Props {
  log: FoodLog
  onDelete?: () => void
}

const MACRO_COLORS = {
  protein: '#1894E0',
  fat: '#FFD217',
  carbs: '#45C588',
}

export default function FoodCard({ log, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await onDelete?.()
  }

  const totalCal = Math.round(log.calories * log.quantity)
  const macros = [
    { label: 'Уураг', val: Math.round(log.protein * log.quantity), color: MACRO_COLORS.protein },
    { label: 'Өөх тос', val: Math.round(log.fat * log.quantity), color: MACRO_COLORS.fat },
    { label: 'Н. ус', val: Math.round(log.carbs * log.quantity), color: MACRO_COLORS.carbs },
  ]

  return (
    <div className={`bg-[#1C1C1E] rounded-2xl border border-[#2C2C2E] p-3 mb-2 flex items-center gap-3 transition-opacity ${deleting ? 'opacity-40' : ''}`}>
      {log.imageUrl && (
        <img
          src={log.imageUrl}
          alt={log.foodName}
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm truncate">
          {log.mongolianName ?? log.foodName}
          {log.quantity > 1 && (
            <span className="text-[#8E8E93] text-xs ml-1">×{log.quantity}</span>
          )}
        </p>
        <p className="text-xs text-[#8E8E93] mb-1">{log.servingSize}</p>
        <div className="flex gap-3">
          {macros.map(m => (
            <span key={m.label} className="text-xs font-medium" style={{ color: m.color }}>
              {m.val}г
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <span className="text-sm font-bold" style={{ color: '#FF6F43' }}>{totalCal}</span>
          <span className="text-xs text-[#8E8E93] ml-0.5">ккал</span>
        </div>
        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 rounded-xl text-[#8E8E93] hover:text-red-400 active:bg-[#2C2C2E] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
