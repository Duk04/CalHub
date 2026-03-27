export interface User {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
  calorieGoal: number
  proteinGoal: number
  fatGoal: number
  carbGoal: number
  waterGoal: number
  age: number | null
  height: number | null
  weight: number | null
  activityLevel: string | null
  gender: string | null
  language: string
  createdAt: string
}

export interface NutritionData {
  foodName: string
  mongolianName?: string
  servingSize: string
  quantity: number
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  confidence: number
}

export interface FoodLog {
  id: string
  userId: string
  foodName: string
  mongolianName: string | null
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  servingSize: string
  quantity: number
  imageUrl: string | null
  barcode: string | null
  mealType: MealType
  loggedAt: string
  createdAt: string
}

export interface Favorite {
  id: string
  userId: string
  foodName: string
  mongolianName: string | null
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  servingSize: string
  barcode: string | null
  createdAt: string
}

export interface WaterLog {
  id: string
  userId: string
  glasses: number
  date: string
}

export interface WeightLog {
  id: string
  userId: string
  weight: number
  date: string
}

export interface DailyStats {
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber: number
  water: number
  logs: FoodLog[]
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other'
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type Gender = 'male' | 'female'
export type Language = 'mn' | 'en'
