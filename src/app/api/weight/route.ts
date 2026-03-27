import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { weightLogSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') ?? '30')

  const logs = await prisma.weightLog.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
    take: limit,
  })

  return NextResponse.json({ data: logs, error: null })
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = weightLogSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ data: null, error: result.error.errors[0].message }, { status: 400 })
  }

  const { weight, date: dateStr } = result.data
  const date = new Date(dateStr ?? new Date().toISOString().split('T')[0])

  const log = await prisma.weightLog.upsert({
    where: { userId_date: { userId, date } },
    update: { weight },
    create: { userId, weight, date },
  })

  return NextResponse.json({ data: log, error: null })
}
