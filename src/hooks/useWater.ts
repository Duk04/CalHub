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

  const logWater = useCallback(async (newGlasses: number) => {
    setGlasses(newGlasses)
    await fetch('/api/water', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ glasses: newGlasses, date: today }),
    })
  }, [today])

  return { glasses, loading, logWater }
}
