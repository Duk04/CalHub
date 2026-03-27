'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Нүүр', icon: HomeIcon },
  { href: '/log', label: 'Бүртгэх', icon: PlusIcon },
  { href: '/workout', label: 'Workout', icon: DumbbellIcon, },
  { href: '/history', label: 'Түүх', icon: ChartIcon },
  { href: '/profile', label: 'Профайл', icon: UserIcon },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 pb-safe z-50">
      <div className="flex items-stretch max-w-lg mx-auto">
        {TABS.map(tab => {
          const active = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
          const Icon = tab.icon
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                active
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-400 dark:text-gray-600'
              } ${tab.href === '/log' ? 'relative' : ''}`}
            >
              {tab.href === '/log' ? (
                <div className="absolute -top-5 bg-green-500 rounded-full p-3 shadow-lg shadow-green-500/30">
                  <Icon className="w-5 h-5 text-white" />
                </div>
              ) : (
                <Icon className={`w-5 h-5 ${active ? 'stroke-2' : ''}`} />
              )}
              <span className={`text-xs font-medium ${tab.href === '/log' ? 'mt-5' : ''}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  )
}

function DumbbellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h2M4 8a1 1 0 01-1-1V6a1 1 0 011-1h1a1 1 0 011 1v2M4 8v8M4 16H2m2 0a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1v-1a1 1 0 011-1m3-8h10M7 16h10m0-8h2m-2 0a1 1 0 001 1v1a1 1 0 01-1 1m0-2V8m0 8h2m-2 0a1 1 0 001-1v-1a1 1 0 00-1-1m0 2v-2M7 8v8" />
    </svg>
  )
}
