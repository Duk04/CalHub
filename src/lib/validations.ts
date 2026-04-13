import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1).optional(),
  age: z.number().int().min(13).max(100).optional(),
  weight: z.number().min(30).max(300).optional(),
  gender: z.enum(['male', 'female']).optional(),
  goal: z.enum(['lose', 'maintain', 'gain']).optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Please enter your password'),
})

export const logFoodSchema = z.object({
  foodName: z.string().min(1),
  mongolianName: z.string().optional(),
  calories: z.number().min(0),
  protein: z.number().min(0),
  fat: z.number().min(0),
  carbs: z.number().min(0),
  fiber: z.number().min(0).optional().default(0),
  servingSize: z.string().min(1),
  quantity: z.number().min(0.1).optional().default(1),
  imageUrl: z.string().url().optional(),
  barcode: z.string().optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']).optional().default('other'),
  loggedAt: z.string().datetime().optional(),
})

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  calorieGoal: z.number().min(500).max(10000).optional(),
  proteinGoal: z.number().min(0).max(500).optional(),
  fatGoal: z.number().min(0).max(500).optional(),
  carbGoal: z.number().min(0).max(1000).optional(),
  waterGoal: z.number().min(1).max(30).optional(),
  age: z.number().min(1).max(150).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).optional(),
  gender: z.enum(['male', 'female']).optional(),
  language: z.enum(['mn', 'en']).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export const waterLogSchema = z.object({
  glasses: z.number().min(1).max(30),
  date: z.string().optional(),
})

export const weightLogSchema = z.object({
  weight: z.number().min(20).max(500),
  date: z.string().optional(),
})

export const updateLogSchema = z.object({
  calories: z.number().min(0).optional(),
  protein: z.number().min(0).optional(),
  fat: z.number().min(0).optional(),
  carbs: z.number().min(0).optional(),
  fiber: z.number().min(0).optional(),
  servingSize: z.string().min(1).optional(),
  quantity: z.number().min(0.1).optional(),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']).optional(),
})
