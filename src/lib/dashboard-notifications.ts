import type { DailyStats, User } from '@/types'

export type DashboardNotificationKind = 'meal' | 'water' | 'goal' | 'protein'

export interface DashboardNotification {
  id: string
  kind: DashboardNotificationKind
  title: string
  body: string
}

interface BuildNotificationArgs {
  user: User | null
  stats: DailyStats
  glasses: number
  now?: Date
}

function hasMeal(stats: DailyStats, mealType: 'breakfast' | 'lunch' | 'dinner') {
  return stats.logs.some(log => log.mealType === mealType)
}

export function buildDashboardNotifications({
  user,
  stats,
  glasses,
  now = new Date(),
}: BuildNotificationArgs): DashboardNotification[] {
  if (!user) return []

  const items: DashboardNotification[] = []
  const hour = now.getHours()
  const calorieGoal = user.calorieGoal || 2000
  const proteinGoal = user.proteinGoal || 140
  const waterGoal = user.waterGoal || 8

  if (hour >= 11 && hour < 16 && !hasMeal(stats, 'lunch')) {
    items.push({
      id: 'lunch-reminder',
      kind: 'meal',
      title: "It's time for your lunch",
      body: "Don't forget to log your meal before your afternoon gets busy.",
    })
  }

  if (hour >= 18 && !hasMeal(stats, 'dinner')) {
    items.push({
      id: 'dinner-reminder',
      kind: 'meal',
      title: "You haven't logged dinner yet",
      body: "A quick dinner entry will keep today's calorie summary accurate.",
    })
  }

  if (hour >= 12 && glasses < Math.max(3, Math.ceil(waterGoal * 0.5))) {
    items.push({
      id: 'water-reminder',
      kind: 'water',
      title: 'Stay hydrated',
      body: `Aim for at least ${Math.ceil(waterGoal * 0.5)} cups before the afternoon ends.`,
    })
  }

  if (stats.calories >= calorieGoal) {
    items.push({
      id: 'goal-reached',
      kind: 'goal',
      title: "You've hit your daily calorie goal",
      body: `${Math.round(stats.calories)} of ${calorieGoal} kcal logged today. Review dinner or snacks before adding more.`,
    })
  } else if (stats.calories >= calorieGoal * 0.85) {
    items.push({
      id: 'goal-near',
      kind: 'goal',
      title: 'You are close to your daily goal',
      body: `${Math.round(stats.calories)} of ${calorieGoal} kcal logged. Keep the last meal light if needed.`,
    })
  }

  if (hour >= 15 && stats.protein > 0 && stats.protein < proteinGoal * 0.6) {
    items.push({
      id: 'protein-reminder',
      kind: 'protein',
      title: 'Protein is still low for today',
      body: `${Math.round(stats.protein)} of ${proteinGoal} g tracked so far. Add a higher-protein meal or snack.`,
    })
  }

  return items.slice(0, 6)
}
