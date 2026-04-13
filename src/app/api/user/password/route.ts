import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'
import { changePasswordSchema } from '@/lib/validations'

export async function PATCH(request: Request) {
  const userId = await getCurrentUserId()
  if (!userId) return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const result = changePasswordSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ data: null, error: result.error.errors[0].message }, { status: 400 })
  }

  const { currentPassword, newPassword } = result.data

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
  if (!user) return NextResponse.json({ data: null, error: 'User not found' }, { status: 404 })

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!isValid) {
    return NextResponse.json({ data: null, error: 'Current password is incorrect' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } })

  return NextResponse.json({ data: { success: true }, error: null })
}
