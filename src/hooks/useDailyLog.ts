'use client'

import { useState, useEffect, useCallback } from 'react'
import type { FoodLog, DailyStats } from '@/types'

export function useDailyLog(date?: string) {
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const url = date ? `/api/log?date=${date}` : '/api/log'
    const res = await fetch(url)
    const { data } = await res.json()
    setLogs(data ?? [])
    setLoading(false)
  }, [date])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const addLog = useCallback(async (entry: Omit<FoodLog, 'id' | 'userId' | 'createdAt'>) => {
    const res = await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    })
    const { data } = await res.json()
    if (data) setLogs(prev => [...prev, data])
    return data
  }, [])

  const deleteLog = useCallback(async (id: string) => {
    await fetch(`/api/log/${id}`, { method: 'DELETE' })
    setLogs(prev => prev.filter(l => l.id !== id))
  }, [])

  const stats: DailyStats = {
    calories: logs.reduce((sum, l) => sum + l.calories * l.quantity, 0),
    protein: logs.reduce((sum, l) => sum + l.protein * l.quantity, 0),
    fat: logs.reduce((sum, l) => sum + l.fat * l.quantity, 0),
    carbs: logs.reduce((sum, l) => sum + l.carbs * l.quantity, 0),
    fiber: logs.reduce((sum, l) => sum + l.fiber * l.quantity, 0),
    water: 0,
    logs,
  }

  return { logs, loading, stats, fetchLogs, addLog, deleteLog }
}
