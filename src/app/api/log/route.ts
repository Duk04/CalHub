import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { logFoodSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') // YYYY-MM-DD

  let startDate: Date
  let endDate: Date

  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    startDate = new Date(`${date}T00:00:00.000Z`)
    endDate = new Date(`${date}T00:00:00.000Z`)
    endDate.setUTCDate(endDate.getUTCDate() + 1)
  } else {
    const today = new Date().toISOString().slice(0, 10)
    startDate = new Date(`${today}T00:00:00.000Z`)
    endDate = new Date(`${today}T00:00:00.000Z`)
    endDate.setUTCDate(endDate.getUTCDate() + 1)
  }

  const logs = await prisma.foodLog.findMany({
    where: {
      userId,
      loggedAt: { gte: startDate, lt: endDate },
    },
    orderBy: { loggedAt: 'asc' },
  })

  return NextResponse.json({ data: logs, error: null })
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const result = logFoodSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.errors[0].message },
        { status: 400 },
      )
    }

    const { loggedAt, ...rest } = result.data

    const log = await prisma.foodLog.create({
      data: {
        ...rest,
        userId,
        loggedAt: loggedAt ? new Date(loggedAt) : new Date(),
      },
    })

    return NextResponse.json({ data: log, error: null }, { status: 201 })
  } catch {
    return NextResponse.json({ data: null, error: 'Серверийн алдаа.' }, { status: 500 })
  }
}
