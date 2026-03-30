import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyPasswordResetToken } from '@/lib/auth'

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  token: z.string().min(1, 'Missing reset token'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = resetPasswordSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { data: null, error: result.error.errors[0].message },
        { status: 400 },
      )
    }

    const { email, token, password } = result.data
    const normalizedEmail = email.trim().toLowerCase()

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, passwordHash: true },
    })

    if (!user) {
      return NextResponse.json(
        { data: null, error: 'This reset link is invalid or has expired.' },
        { status: 400 },
      )
    }

    const payload = verifyPasswordResetToken(token, user.passwordHash)
    if (!payload || payload.userId !== user.id || payload.email !== user.email) {
      return NextResponse.json(
        { data: null, error: 'This reset link is invalid or has expired.' },
        { status: 400 },
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    })

    return NextResponse.json({
      data: { success: true },
      error: null,
      message: 'Your password has been updated.',
    })
  } catch (error) {
    console.error('[reset-password]', error)
    return NextResponse.json(
      { data: null, error: 'Failed to reset password.' },
      { status: 500 },
    )
  }
}
