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
