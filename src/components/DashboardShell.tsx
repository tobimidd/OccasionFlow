'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface User { email: string; name: string; initial: string }

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="1" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="9" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="9" width="6" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/recipients',
    label: 'Recipients',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/occasions',
    label: 'Occasions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1.5" y="3" width="13" height="11" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 1v4M11 1v4M1.5 7h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/gifts',
    label: 'Gifts',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="7" width="14" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1 7h14M8 7V15M8 7c0-2-1.5-3-3-2s-1.5 3.5 3 2zM8 7c0-2 1.5-3 3-2s1.5 3.5-3 2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/orders',
    label: 'Orders',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 2h2l2 8h6l2-6H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8" cy="13" r="1" fill="currentColor"/>
        <circle cx="12" cy="13" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function DashboardShell({
  user,
  children,
}: {
  user: User
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--off-white)' }}>

      {/* ── Sidebar ── */}
      <aside
        className="hidden md:flex flex-col shrink-0 sticky top-0 h-screen"
        style={{
          width: '220px',
          background: '#fff',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <Link href="/" className="font-display text-base font-medium no-underline" style={{ color: 'var(--ink)' }}>
            Occasion Flow
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-3 flex-1">
          {NAV_ITEMS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium no-underline transition-colors"
              style={{
                color: isActive(href) ? 'var(--forest)' : 'var(--ink-soft)',
                background: isActive(href) ? 'var(--forest-pale)' : 'transparent',
                borderLeft: isActive(href) ? '2px solid var(--forest)' : '2px solid transparent',
              }}
            >
              <span style={{ color: isActive(href) ? 'var(--forest)' : 'var(--ink-muted)' }}>
                {icon}
              </span>
              {label}
            </Link>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="w-7 h-7 flex items-center justify-center text-xs font-semibold uppercase shrink-0"
              style={{ background: 'var(--forest-pale)', color: 'var(--forest)', border: '1px solid var(--border)' }}
            >
              {user.initial}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--ink)' }}>{user.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--ink-muted)' }}>{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium cursor-pointer border transition-colors"
            style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--ink-soft)', fontFamily: 'inherit' }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3M9 9.5l2.5-3L9 3M11.5 6.5H5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* ── Mobile topbar ── */}
      <div className="flex flex-col flex-1 min-w-0">
        <header
          className="md:hidden flex items-center justify-between px-5 h-14 sticky top-0 z-50"
          style={{ background: 'rgba(255,255,255,0.97)', borderBottom: '1px solid var(--border)' }}
        >
          <Link href="/" className="font-display text-base font-medium no-underline" style={{ color: 'var(--ink)' }}>
            Occasion Flow
          </Link>
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="cursor-pointer border-none bg-transparent p-1"
            style={{ color: 'var(--ink)' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </header>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div
            className="md:hidden fixed inset-0 z-40"
            style={{ background: 'rgba(26,31,46,0.4)' }}
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full flex flex-col"
              style={{ width: '260px', background: '#fff', borderRight: '1px solid var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="px-6 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="font-display text-base font-medium" style={{ color: 'var(--ink)' }}>Occasion Flow</span>
              </div>
              <nav className="flex flex-col gap-0.5 p-3 flex-1">
                {NAV_ITEMS.map(({ href, label, icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-medium no-underline transition-colors"
                    style={{
                      color: isActive(href) ? 'var(--forest)' : 'var(--ink-soft)',
                      background: isActive(href) ? 'var(--forest-pale)' : 'transparent',
                      borderLeft: isActive(href) ? '2px solid var(--forest)' : '2px solid transparent',
                    }}
                  >
                    <span style={{ color: isActive(href) ? 'var(--forest)' : 'var(--ink-muted)' }}>{icon}</span>
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* ── Page content ── */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
