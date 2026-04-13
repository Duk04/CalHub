'use client'

import { useState, useEffect, useCallback } from 'react'

export function useWater(date?: string) {
  const [glasses, setGlasses] = useState(0)
  const [loading, setLoading] = useState(true)

  const today = date ?? new Date().toISOString().split('T')[0]

  useEffect(() => {
    fetch(`/api/water?date=${today}`)
      .then(r => r.json())
      .then(({ data }) => setGlasses(data?.glasses ?? 0))
      .finally(() => setLoading(false))
  }, [today])

  const logWater = useCallback(async (newGlasses: number): Promise<{ error: string | null }> => {
    const previous = glasses
    setGlasses(newGlasses)
    try {
      const res = await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ glasses: newGlasses, date: today }),
      })
      if (!res.ok) {
        setGlasses(previous)
        const { error } = await res.json()
        return { error: error ?? 'Failed to save water intake.' }
      }
      return { error: null }
    } catch {
      setGlasses(previous)
      return { error: 'Failed to save water intake. Please try again.' }
    }
  }, [glasses, today])

  return { glasses, loading, logWater }
}
