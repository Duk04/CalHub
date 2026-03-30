'use client'

import Link from 'next/link'
import { BellRing, ChevronLeft, Droplets, Drumstick, Flame, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useDailyLog } from '@/hooks/useDailyLog'
import { useWater } from '@/hooks/useWater'
import { buildDashboardNotifications, type DashboardNotification } from '@/lib/dashboard-notifications'

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth()
  const { stats, loading: logLoading } = useDailyLog()
  const { glasses, loading: waterLoading } = useWater()

  const notifications = buildDashboardNotifications({ user, stats, glasses })
  const isLoading = authLoading || logLoading || waterLoading

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col px-5 pb-28 pt-6">
        <header className="mb-8 flex items-center gap-4">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E1CF] bg-white text-[#1B1B1D] shadow-[0_12px_25px_rgba(209,203,182,0.18)]"
            aria-label="Back to home"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
          </Link>
          <div>
            <h1 className="text-[26px] font-semibold tracking-[-0.04em] text-[#161617]">Notifications</h1>
            <p className="text-sm text-[#746D62]">Smart reminders built from today&apos;s progress.</p>
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-[86px] rounded-[24px] border border-[#ECE5D5] bg-white skeleton" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center pb-20 text-center">
            <EmptyNotificationIllustration />
            <h2 className="mt-8 text-[28px] font-semibold tracking-[-0.04em] text-[#161617]">No notifications yet.</h2>
            <p className="mt-3 max-w-[280px] text-sm leading-6 text-[#7A7367]">Your healthy habits are on track. Keep it up.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NotificationCard({ notification }: { notification: DashboardNotification }) {
  const accent = getNotificationAccent(notification.kind)

  return (
    <article className="flex items-start gap-4 rounded-[24px] border border-[#ECE5D5] bg-white px-4 py-4 shadow-[0_14px_35px_rgba(219,215,195,0.22)]">
      <div
        className="mt-0.5 flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${accent}20`, color: accent }}
      >
        <NotificationGlyph kind={notification.kind} className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold leading-6 text-[#161617]">{notification.title}</h2>
        <p className="mt-1 text-sm leading-6 text-[#7D7668]">{notification.body}</p>
      </div>
    </article>
  )
}

function EmptyNotificationIllustration() {
  return (
    <div className="relative h-56 w-56">
      <div className="absolute left-1/2 top-10 h-36 w-36 -translate-x-1/2 rounded-full bg-[#F0EBDD]" />
      <div className="absolute left-1/2 top-4 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-[#F4D35E] text-[#18110A] shadow-[0_14px_28px_rgba(244,211,94,0.22)]">
        <BellRing className="h-7 w-7" strokeWidth={2} />
      </div>
      <div className="absolute left-1/2 top-24 h-24 w-24 -translate-x-1/2 rounded-full border border-[#E2DAC9] bg-white">
        <div className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#E8E1D0] bg-[#FBFAF6]" />
        <div className="absolute left-6 top-7 h-2.5 w-2.5 rounded-full bg-[#CDB5F8]" />
        <div className="absolute right-6 top-10 h-2 w-2 rounded-full bg-[#CDB5F8]" />
        <div className="absolute bottom-7 left-10 h-2.5 w-2.5 rounded-full bg-[#CDB5F8]" />
        <div className="absolute bottom-8 right-9 h-1.5 w-1.5 rounded-full bg-[#CDB5F8]" />
      </div>
      <div className="absolute left-8 top-[110px] h-10 w-10 rotate-[-18deg] rounded-[18px] bg-[#F2ECDD]" />
      <div className="absolute right-8 top-[112px] h-10 w-10 rotate-[18deg] rounded-[18px] bg-[#F2ECDD]" />
      <div className="absolute bottom-8 left-[42px] h-6 w-6 rounded-full bg-[#EEE7D6]" />
      <div className="absolute bottom-6 right-[42px] h-6 w-6 rounded-full bg-[#EEE7D6]" />
      <div className="absolute bottom-[42px] left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-[#DED6C5]" />
    </div>
  )
}

function getNotificationAccent(kind: DashboardNotification['kind']) {
  switch (kind) {
    case 'meal':
      return '#A38BFE'
    case 'water':
      return '#5BC0FF'
    case 'goal':
      return '#FF8A62'
    case 'protein':
      return '#53D6A4'
    default:
      return '#A38BFE'
  }
}

function NotificationGlyph({
  kind,
  className,
}: {
  kind: DashboardNotification['kind']
  className?: string
}) {
  switch (kind) {
    case 'water':
      return <Droplets className={className} strokeWidth={2} />
    case 'goal':
      return <Flame className={className} strokeWidth={2} />
    case 'protein':
      return <Drumstick className={className} strokeWidth={2} />
    case 'meal':
    default:
      return <UtensilsCrossed className={className} strokeWidth={2} />
  }
}
