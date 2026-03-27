import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { prisma } from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

const SYSTEM_PROMPT = `You are a professional fitness trainer specializing in creating personalized workout plans.
Create safe, effective, and progressive workout plans tailored to the user's profile and goals.
Return ONLY valid JSON — no markdown, no explanation, no code blocks.`

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'weight loss & fat burning',
  build_muscle: 'muscle building & hypertrophy',
  maintain: 'maintain current fitness',
  improve_fitness: 'improve cardiovascular fitness & endurance',
}

const EQUIPMENT_LABELS: Record<string, string> = {
  gym: 'full gym (barbells, dumbbells, cables, machines)',
  home: 'home setup (dumbbells, resistance bands, pull-up bar)',
  none: 'bodyweight only (no equipment)',
}

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ data: null, error: 'Нэвтрэх шаардлагатай.' }, { status: 401 })
    }

    // DB optional — graceful fallback if migration not yet run
    let user = null
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { age: true, weight: true, height: true, gender: true, activityLevel: true },
      })
    } catch {
      // continue without user profile
    }

    const body = await request.json()
    const { goal, daysPerWeek, equipment, fitnessLevel } = body

    const userCtx = user
      ? `User: ${user.gender ?? 'unknown gender'}, age ${user.age ?? '?'}, ${user.weight ?? '?'}kg, ${user.height ?? '?'}cm, activity: ${user.activityLevel ?? 'unknown'}.`
      : ''

    const prompt = `${userCtx}
Create a ${daysPerWeek}-day/week workout plan.
Goal: ${GOAL_LABELS[goal] ?? goal}
Fitness level: ${fitnessLevel}
Equipment: ${EQUIPMENT_LABELS[equipment] ?? equipment}

Return this exact JSON shape:
{
  "planName": "short English name",
  "planNameMn": "Монгол нэр",
  "daysPerWeek": ${daysPerWeek},
  "days": [
    {
      "dayNumber": 1,
      "name": "Day focus (e.g. Upper Body Push)",
      "nameMn": "Монгол нэр (жишээ: Дээд биеийн түлхэлт)",
      "estimatedMinutes": 45,
      "exercises": [
        {
          "name": "Exercise name",
          "nameMn": "Монгол нэр",
          "sets": 3,
          "reps": "8-12",
          "restSeconds": 60,
          "notes": "optional tip"
        }
      ]
    }
  ]
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 3000,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from OpenAI')

    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const plan = JSON.parse(cleaned)

    return NextResponse.json({ data: plan, error: null })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[workout/generate]', msg)
    const devError = process.env.NODE_ENV === 'development' ? ` (${msg})` : ''
    return NextResponse.json({ data: null, error: `Workout план үүсгэхэд алдаа гарлаа.${devError}` }, { status: 500 })
  }
}
