import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = searchParams.get('period') ?? 'week' // week | month

  const days = period === 'month' ? 30 : 7
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)
  startDate.setHours(0, 0, 0, 0)

  const logs = await prisma.foodLog.findMany({
    where: { userId, loggedAt: { gte: startDate } },
    orderBy: { loggedAt: 'asc' },
  })

  // Group by date
  const byDate = new Map<string, { calories: number; protein: number; fat: number; carbs: number }>()

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().split('T')[0]
    byDate.set(key, { calories: 0, protein: 0, fat: 0, carbs: 0 })
  }

  for (const log of logs) {
    const key = log.loggedAt.toISOString().split('T')[0]
    const entry = byDate.get(key)
    if (entry) {
      entry.calories += log.calories * log.quantity
      entry.protein += log.protein * log.quantity
      entry.fat += log.fat * log.quantity
      entry.carbs += log.carbs * log.quantity
    }
  }

  const chartData = Array.from(byDate.entries()).map(([date, vals]) => ({
    date,
    ...Object.fromEntries(
      Object.entries(vals).map(([k, v]) => [k, Math.round(v)])
    ),
  }))

  const totalDaysWithLogs = chartData.filter(d => d.calories > 0).length
  const avgCalories = totalDaysWithLogs
    ? Math.round(chartData.reduce((sum, d) => sum + (d.calories as number), 0) / totalDaysWithLogs)
    : 0

  return NextResponse.json({
    data: { chartData, avgCalories, totalDaysWithLogs, period },
    error: null,
  })
}
