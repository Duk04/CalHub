import { NextResponse } from 'next/server'
import { analyzeFood } from '@/lib/openai'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ data: null, error: 'Зураг оруулаагүй байна.' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ data: null, error: 'Зөвхөн JPEG, PNG, WebP зураг оруулна уу.' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB (compression happens client-side)
    if (file.size > maxSize) {
      return NextResponse.json({ data: null, error: 'Зургийн хэмжээ 10MB-аас ихгүй байна.' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const mimeType = file.type === 'image/heic' ? 'image/jpeg' : file.type

    const items = await analyzeFood(base64, mimeType)

    return NextResponse.json({ data: { items }, error: null })
  } catch (err) {
    console.error('Analyze error:', err)
    const message = err instanceof Error ? err.message : 'Хоол таних явцад алдаа гарлаа. Дахин оролдоно уу.'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
