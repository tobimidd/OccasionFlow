import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const firstName = name.split(' ')[0]

  // Fetch counts
  const [{ count: recipientCount }, { count: occasionCount }, { count: orderCount }] = await Promise.all([
    supabase.from('recipients').select('*', { count: 'exact', head: true }),
    supabase.from('occasions').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Recipients',  value: recipientCount ?? 0, note: 'People you gift to', href: '/dashboard/recipients' },
    { label: 'Occasions',   value: occasionCount ?? 0,  note: 'Upcoming events',    href: '/dashboard/occasions' },
    { label: 'Orders sent', value: orderCount ?? 0,     note: 'All time',           href: '/dashboard/orders' },
    { label: 'Plan',        value: 'Free',              note: 'Upgrade anytime',    href: '/dashboard/settings', small: true },
  ]

  return (
    <div
      className="p-8 md:p-10"
      style={{ animation: 'fadeUp 0.45s ease both' }}
    >
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--forest)' }}>
        Overview
      </p>
      <h1
        className="font-display font-medium leading-tight mb-3"
        style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--ink)' }}
      >
        Welcome back,<br />{firstName}
      </h1>
      <p className="text-sm font-light leading-relaxed mb-10 max-w-md" style={{ color: 'var(--ink-soft)' }}>
        Here&apos;s a snapshot of your account. Add recipients and occasions to get started.
      </p>

      <div className="h-px mb-10" style={{ background: 'var(--border)' }} />

      {/* Stats grid */}
      <div
        className="grid mb-10"
        style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
        }}
      >
        {stats.map(({ label, value, note, href, small }) => (
          <Link
            key={label}
            href={href}
            className="bg-white p-6 no-underline block transition-colors group"
            style={{ color: 'inherit' }}
          >
            <p className="text-xs font-medium tracking-widest uppercase mb-3 transition-colors" style={{ color: 'var(--ink-muted)' }}>
              {label}
            </p>
            <p
              className="font-display font-medium leading-none mb-1.5"
              style={{ fontSize: small ? '1.375rem' : '2rem', color: 'var(--ink)' }}
            >
              {value}
            </p>
            <p className="text-xs font-light" style={{ color: 'var(--ink-muted)' }}>{note}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[
          { label: 'Add a recipient', desc: 'A person you want to send gifts to', href: '/dashboard/recipients' },
          { label: 'Schedule an occasion', desc: 'Birthday, anniversary, and more', href: '/dashboard/occasions' },
          { label: 'Browse gifts', desc: 'Curated gifts for every relationship', href: '/dashboard/gifts' },
        ].map(({ label, desc, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white p-5 no-underline flex items-start gap-4 transition-colors"
            style={{ border: '1px solid var(--border)', color: 'inherit' }}
          >
            <span
              className="shrink-0 w-2 h-2 mt-1.5"
              style={{ background: 'var(--forest)' }}
            />
            <div>
              <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--ink)' }}>{label}</p>
              <p className="text-xs font-light" style={{ color: 'var(--ink-muted)' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
