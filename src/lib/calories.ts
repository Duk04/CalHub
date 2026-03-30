import type { ActivityLevel, Gender } from '@/types'

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

/** Mifflin-St Jeor equation */
export function calculateTDEE(
  weight: number, // kg
  height: number, // cm
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel,
): number {
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161

  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

export function calculateMacroGoals(calorieGoal: number) {
  return {
    protein: Math.round((calorieGoal * 0.3) / 4),  // 30% of calories from protein
    fat: Math.round((calorieGoal * 0.25) / 9),      // 25% from fat
    carbs: Math.round((calorieGoal * 0.45) / 4),    // 45% from carbs
  }
}

export type OnboardingGoal = 'lose' | 'maintain' | 'gain'

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function estimateOnboardingTargets({
  weight,
  goal = 'maintain',
  gender,
}: {
  weight: number
  goal?: OnboardingGoal
  gender?: Gender | null
}) {
  const baseCaloriesPerKg =
    gender === 'male'
      ? 30
      : gender === 'female'
        ? 28
        : 29

  const goalAdjustment =
    goal === 'lose'
      ? -320
      : goal === 'gain'
        ? 260
        : 0

  const proteinPerKg =
    goal === 'lose'
      ? 2
      : goal === 'gain'
        ? 1.9
        : 1.8

  const calorieGoal = clamp(Math.round(weight * baseCaloriesPerKg + goalAdjustment), 1400, 3600)
  const proteinGoal = clamp(Math.round(weight * proteinPerKg), 90, 230)
  const fatGoal = clamp(Math.round((calorieGoal * 0.25) / 9), 40, 110)
  const carbGoal = clamp(Math.round((calorieGoal - proteinGoal * 4 - fatGoal * 9) / 4), 120, 450)
  const waterGoal = clamp(Math.round(weight / 8), 6, 12)

  return {
    calorieGoal,
    proteinGoal,
    fatGoal,
    carbGoal,
    waterGoal,
  }
}
