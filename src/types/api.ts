export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  error: null
  pagination: {
    page: number
    pageSize: number
    total: number
  }
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AnalyzeResponse {
  items: import('./index').NutritionData[]
}

export interface LogFoodRequest {
  foodName: string
  mongolianName?: string
  calories: number
  protein: number
  fat: number
  carbs: number
  fiber?: number
  servingSize: string
  quantity?: number
  imageUrl?: string
  barcode?: string
  mealType?: import('./index').MealType
  loggedAt?: string
}
