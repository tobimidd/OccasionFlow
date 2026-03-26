import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from './LogoutButton'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
  const firstName = name.split(' ')[0]
  const initial = firstName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen" style={{ background: 'var(--off-white)' }}>

      {/* ── Topbar ── */}
      <header
        className="sticky top-0 z-50 flex items-center justify-between px-8 h-15"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid var(--border)',
          height: '60px',
        }}
      >
        <a href="/" className="font-display text-lg font-medium no-underline" style={{ color: 'var(--ink)' }}>
          Occasion Flow
        </a>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 flex items-center justify-center text-xs font-semibold uppercase shrink-0"
              style={{
                background: 'var(--forest-pale)',
                border: '1px solid var(--border)',
                color: 'var(--forest)',
              }}
            >
              {initial}
            </div>
            <span className="text-sm hidden sm:block" style={{ color: 'var(--ink-soft)' }}>
              {user.email}
            </span>
          </div>

          <LogoutButton />
        </div>
      </header>

      {/* ── Main ── */}
      <main
        className="max-w-5xl mx-auto px-8 py-16"
        style={{ animation: 'fadeUp 0.5s 0.1s ease both' }}
      >
        <style>{`@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>

        <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--forest)' }}>
          Dashboard
        </p>
        <h1 className="font-display font-medium mb-4 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--ink)' }}>
          Welcome,<br />{firstName}
        </h1>
        <p className="text-base font-light leading-relaxed mb-12 max-w-lg" style={{ color: 'var(--ink-soft)' }}>
          Your account is set up and ready. Soon you&apos;ll be able to add recipients, schedule occasions, and let Occasion Flow handle the rest.
        </p>

        <div className="h-px mb-12" style={{ background: 'var(--border)' }} />

        {/* Stats */}
        <div
          className="grid mb-12"
          style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
          }}
        >
          {[
            { label: 'Recipients',  value: '0', note: 'No recipients yet' },
            { label: 'Occasions',   value: '0', note: 'Nothing scheduled' },
            { label: 'Orders sent', value: '0', note: 'All time' },
            { label: 'Plan',        value: 'Free', note: 'Upgrade anytime', small: true },
          ].map(({ label, value, note, small }) => (
            <div key={label} className="bg-white p-7">
              <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--ink-muted)' }}>
                {label}
              </p>
              <p
                className="font-display font-medium leading-none mb-1.5"
                style={{ fontSize: small ? '1.5rem' : '2.25rem', color: 'var(--ink)' }}
              >
                {value}
              </p>
              <p className="text-xs font-light" style={{ color: 'var(--ink-muted)' }}>{note}</p>
            </div>
          ))}
        </div>

        {/* Coming soon card */}
        <div
          className="bg-white flex items-start gap-8 p-10"
          style={{ border: '1px solid var(--border)' }}
        >
          <div
            className="shrink-0 w-12 h-12 flex items-center justify-center"
            style={{ background: 'var(--forest-pale)', color: 'var(--forest)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 3v2M11 17v2M3 11H1M21 11h-2M5.05 5.05 3.64 3.64M18.36 18.36l-1.41-1.41M5.05 16.95l-1.41 1.41M18.36 3.64l-1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="11" cy="11" r="4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <h2 className="font-display text-xl font-medium mb-2" style={{ color: 'var(--ink)' }}>
              Your dashboard is being built
            </h2>
            <p className="text-sm font-light leading-relaxed mb-5" style={{ color: 'var(--ink-soft)' }}>
              The full experience is on its way. Here&apos;s what&apos;s coming next:
            </p>
            <ul className="flex flex-col gap-2.5">
              {[
                'Add and manage gift recipients',
                'Schedule birthdays, anniversaries & more',
                'Browse the curated gift catalogue',
                'Track all your orders in one place',
                'Manage your subscription',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm" style={{ color: 'var(--ink-soft)' }}>
                  <span className="w-1.5 h-1.5 shrink-0" style={{ background: 'var(--forest)' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
