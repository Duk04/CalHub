import type { MealType } from '@/types'

export const MEAL_TYPES: { value: MealType; labelMn: string; labelEn: string; emoji: string }[] = [
  { value: 'breakfast', labelMn: 'Өглөөний цай', labelEn: 'Breakfast', emoji: '🌅' },
  { value: 'lunch', labelMn: 'Өдрийн хоол', labelEn: 'Lunch', emoji: '☀️' },
  { value: 'dinner', labelMn: 'Оройн хоол', labelEn: 'Dinner', emoji: '🌙' },
  { value: 'snack', labelMn: 'Завсарын хоол', labelEn: 'Snack', emoji: '🍎' },
  { value: 'other', labelMn: 'Бусад', labelEn: 'Other', emoji: '🍽️' },
]

export const MACRO_COLORS = {
  calories: '#f97316',
  protein: '#3b82f6',
  fat: '#eab308',
  carbs: '#22c55e',
  fiber: '#a855f7',
  water: '#06b6d4',
}

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', labelMn: 'Суугаа ажил', labelEn: 'Sedentary' },
  { value: 'light', labelMn: 'Бага зэрэг идэвхтэй', labelEn: 'Lightly active' },
  { value: 'moderate', labelMn: 'Дунд зэрэг идэвхтэй', labelEn: 'Moderately active' },
  { value: 'active', labelMn: 'Идэвхтэй', labelEn: 'Active' },
  { value: 'very_active', labelMn: 'Маш идэвхтэй', labelEn: 'Very active' },
]

export const DEFAULT_CALORIE_GOAL = 2000
export const DEFAULT_WATER_GOAL = 8
export const MAX_IMAGE_SIZE_MB = 1
export const MAX_IMAGE_DIMENSION = 1024
