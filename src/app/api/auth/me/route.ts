import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ data: null, error: 'Нэвтрэх шаардлагатай.' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, avatarUrl: true,
      calorieGoal: true, proteinGoal: true, fatGoal: true, carbGoal: true, waterGoal: true,
      age: true, height: true, weight: true, activityLevel: true, gender: true, language: true,
      createdAt: true,
    },
  })

  if (!user) {
    return NextResponse.json({ data: null, error: 'Хэрэглэгч олдсонгүй.' }, { status: 404 })
  }

  return NextResponse.json({ data: user, error: null })
}
