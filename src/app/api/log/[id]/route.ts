import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

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
