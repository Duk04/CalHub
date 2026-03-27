import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { waterLogSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const dateStr = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const date = new Date(dateStr)

  const log = await prisma.waterLog.findUnique({
    where: { userId_date: { userId, date } },
  })

  return NextResponse.json({ data: log ?? { userId, glasses: 0, date: dateStr }, error: null })
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = waterLogSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ data: null, error: result.error.errors[0].message }, { status: 400 })
  }

  const { glasses, date: dateStr } = result.data
  const date = new Date(dateStr ?? new Date().toISOString().split('T')[0])

  const log = await prisma.waterLog.upsert({
    where: { userId_date: { userId, date } },
    update: { glasses },
    create: { userId, glasses, date },
  })

  return NextResponse.json({ data: log, error: null })
}
