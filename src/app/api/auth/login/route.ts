import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken, setAuthCookie, setLocaleCookie } from '@/lib/auth'
import { loginSchema } from '@/lib/validations'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = loginSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.errors[0].message },
        { status: 400 },
      )
    }

    const { email, password } = result.data

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { data: null, error: 'И-мэйл эсвэл нууц үг буруу байна.' },
        { status: 401 },
      )
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { data: null, error: 'И-мэйл эсвэл нууц үг буруу байна.' },
        { status: 401 },
      )
    }

    const token = await signToken({ userId: user.id, email: user.email })

    const response = NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        calorieGoal: user.calorieGoal,
        language: user.language,
      },
      error: null,
    })
    setAuthCookie(response, token)
    setLocaleCookie(response, user.language)
    return response
  } catch (e) {
    console.error('[login]', e)
    return NextResponse.json({ data: null, error: 'Серверийн алдаа.' }, { status: 500 })
  }
}
