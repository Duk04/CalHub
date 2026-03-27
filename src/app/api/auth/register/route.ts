import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'

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

    const { email, password, name } = result.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { data: null, error: 'Энэ и-мэйл аль хэдийн бүртгэлтэй байна.' },
        { status: 400 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, calorieGoal: true, language: true },
    })

    const token = signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({ data: user, error: null }, { status: 201 })
    setAuthCookie(response, token)
    return response
  } catch {
    return NextResponse.json({ data: null, error: 'Серверийн алдаа.' }, { status: 500 })
  }
}
