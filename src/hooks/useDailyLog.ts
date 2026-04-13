'use client'

import { useState, useEffect, useCallback } from 'react'
import type { FoodLog, DailyStats } from '@/types'

export function useDailyLog(date?: string) {
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    const localDate = date ?? new Date().toLocaleDateString('en-CA')
    const res = await fetch(`/api/log?date=${localDate}`)
    const { data } = await res.json()
    setLogs(data ?? [])
    setLoading(false)
  }, [date])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const addLog = useCallback(async (entry: Omit<FoodLog, 'id' | 'userId' | 'createdAt'>): Promise<{ data: FoodLog | null; error: string | null }> => {
    try {
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      const { data, error } = await res.json()
      if (error) return { data: null, error }
      setLogs(prev => [...prev, data])
      return { data, error: null }
    } catch {
      return { data: null, error: 'Failed to save food log. Please try again.' }
    }
  }, [])

  const deleteLog = useCallback(async (id: string): Promise<{ error: string | null }> => {
    try {
      const res = await fetch(`/api/log/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const { error } = await res.json()
        return { error: error ?? 'Failed to delete entry.' }
      }
      setLogs(prev => prev.filter(l => l.id !== id))
      return { error: null }
    } catch {
      return { error: 'Failed to delete entry. Please try again.' }
    }
  }, [])

  const updateLog = useCallback(async (
    id: string,
    updates: Partial<Pick<FoodLog, 'calories' | 'protein' | 'fat' | 'carbs' | 'fiber' | 'servingSize' | 'quantity' | 'mealType'>>,
  ): Promise<{ data: FoodLog | null; error: string | null }> => {
    try {
      const res = await fetch(`/api/log/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      const { data, error } = await res.json()
      if (error) return { data: null, error }
      if (data) {
        setLogs(prev => prev.map(l => (l.id === id ? { ...l, ...data } : l)))
      }
      return { data: data as FoodLog, error: null }
    } catch {
      return { data: null, error: 'Failed to update entry. Please try again.' }
    }
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

  return { logs, loading, stats, fetchLogs, addLog, deleteLog, updateLog }
}
