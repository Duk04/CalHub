import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie, setLocaleCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { estimateOnboardingTargets } from '@/lib/calories'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.errors[0].message },
        { status: 400 },
      )
    }

    const { email, password, name, age, weight, gender, goal } = result.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { data: null, error: 'Энэ и-мэйл аль хэдийн бүртгэлтэй байна.' },
        { status: 400 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const targets = weight
      ? estimateOnboardingTargets({
          weight,
          goal,
          gender: gender ?? null,
        })
      : null

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        age,
        weight,
        gender,
        ...(targets ?? {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        calorieGoal: true,
        proteinGoal: true,
        fatGoal: true,
        carbGoal: true,
        waterGoal: true,
        age: true,
        weight: true,
        gender: true,
        language: true,
      },
    })

    const token = await signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({ data: user, error: null }, { status: 201 })
    setAuthCookie(response, token)
    setLocaleCookie(response, user.language)
    return response
  } catch {
    return NextResponse.json({ data: null, error: 'Серверийн алдаа.' }, { status: 500 })
  }
}
