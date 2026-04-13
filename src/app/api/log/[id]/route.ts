import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { updateLogSchema } from '@/lib/validations'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const log = await prisma.foodLog.findUnique({ where: { id } })
  if (!log || log.userId !== userId) {
    return NextResponse.json({ data: null, error: 'Олдсонгүй.' }, { status: 404 })
  }

  try {
    const body = await request.json()
    const result = updateLogSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.errors[0].message },
        { status: 400 },
      )
    }

    const updated = await prisma.foodLog.update({
      where: { id },
      data: result.data,
    })

    return NextResponse.json({ data: updated, error: null })
  } catch {
    return NextResponse.json({ data: null, error: 'Серверийн алдаа.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const log = await prisma.foodLog.findUnique({ where: { id } })
  if (!log || log.userId !== userId) {
    return NextResponse.json({ data: null, error: 'Олдсонгүй.' }, { status: 404 })
  }

  await prisma.foodLog.delete({ where: { id } })
  return NextResponse.json({ data: { id }, error: null })
}
