import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { z } from 'zod'

const favoriteSchema = z.object({
  foodName: z.string().min(1),
  mongolianName: z.string().optional(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  fat: z.number().min(0),
  carbs: z.number().min(0),
  fiber: z.number().min(0).optional().default(0),
  servingSize: z.string().min(1),
  barcode: z.string().optional(),
})

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ data: favorites, error: null })
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = favoriteSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ data: null, error: result.error.errors[0].message }, { status: 400 })
  }

  const favorite = await prisma.favorite.upsert({
    where: { userId_foodName: { userId, foodName: result.data.foodName } },
    update: result.data,
    create: { ...result.data, userId },
  })

  return NextResponse.json({ data: favorite, error: null }, { status: 201 })
}

export async function DELETE(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ data: null, error: 'ID шаардлагатай.' }, { status: 400 })

  const fav = await prisma.favorite.findUnique({ where: { id } })
  if (!fav || fav.userId !== userId) {
    return NextResponse.json({ data: null, error: 'Олдсонгүй.' }, { status: 404 })
  }

  await prisma.favorite.delete({ where: { id } })
  return NextResponse.json({ data: { id }, error: null })
}
