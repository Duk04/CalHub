'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Dumbbell, Home, Plus, UserRound } from 'lucide-react'

const TABS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/history', label: 'History', icon: BarChart3 },
  { href: '/log', label: '', icon: Plus },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/profile', label: 'Profile', icon: UserRound },
]

export function Navbar() {
  const pathname = usePathname()

  if (pathname.startsWith('/log')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-auto max-w-lg px-4 pb-3">
        <div className="rounded-[28px] border border-[#E8E1CF] bg-white/94 px-2 py-2 shadow-[0_20px_40px_rgba(185,176,151,0.28)] backdrop-blur-xl">
          <div className="flex items-center">
            {TABS.map((tab) => {
              const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
              const Icon = tab.icon
              const isAdd = tab.href === '/log'

              if (isAdd) {
                return (
                  <Link key={tab.href} href={tab.href} className="flex flex-1 justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C7E44C] text-[#3A4A05] shadow-[0_12px_24px_rgba(199,228,76,0.35)] transition-transform active:scale-95">
                      <Icon className="h-5 w-5" strokeWidth={2.8} />
                    </div>
                  </Link>
                )
              }

              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-1"
                >
                  <Icon
                    className={`h-[22px] w-[22px] transition-colors ${
                      active ? 'text-[#1B1B1D]' : 'text-[#B0A999]'
                    }`}
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                  {tab.label && (
                    <span
                      className={`text-[10px] font-semibold tracking-wide transition-colors ${
                        active ? 'text-[#1B1B1D]' : 'text-[#B0A999]'
                      }`}
                    >
                      {tab.label}
                    </span>
                  )}
                  <div
                    className={`h-[3px] w-[3px] rounded-full transition-all duration-200 ${
                      active ? 'bg-[#C7E44C] scale-100' : 'bg-transparent scale-0'
                    }`}
                  />
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
