import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId, clearAuthCookie, setLocaleCookie } from '@/lib/auth'
import { updateUserSchema } from '@/lib/validations'

export async function GET() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, name: true, avatarUrl: true,
      calorieGoal: true, proteinGoal: true, fatGoal: true, carbGoal: true, waterGoal: true,
      age: true, height: true, weight: true, activityLevel: true, gender: true, language: true,
    },
  })

  return NextResponse.json({ data: user, error: null })
}

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = updateUserSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ data: null, error: result.error.errors[0].message }, { status: 400 })
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: result.data,
    select: {
      id: true, email: true, name: true, calorieGoal: true, proteinGoal: true,
      fatGoal: true, carbGoal: true, waterGoal: true, age: true, height: true,
      weight: true, activityLevel: true, gender: true, language: true,
    },
  })

  const response = NextResponse.json({ data: user, error: null })
  if (result.data.language) {
    setLocaleCookie(response, result.data.language)
  }
  return response
}

export async function DELETE() {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  await prisma.user.delete({ where: { id: userId } })

  const response = NextResponse.json({ data: { success: true }, error: null })
  clearAuthCookie(response)
  return response
}
