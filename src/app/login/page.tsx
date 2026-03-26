'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Mode = 'signin' | 'signup'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isSignup = mode === 'signup'

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
        if (error) throw error
        setSuccess('Account created! Check your email to confirm your address, then sign in.')
        switchMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      if (msg.includes('Invalid login credentials')) setError('Incorrect email or password.')
      else if (msg.includes('Email not confirmed')) setError('Please confirm your email before signing in.')
      else if (msg.includes('already registered')) setError('An account with this email already exists.')
      else setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: '1fr 1fr' }}>

      {/* ── Left Brand Panel ── */}
      <div
        className="relative hidden md:flex flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'var(--forest)' }}
      >
        {/* decorative circles */}
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full border border-white/8 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full border border-white/6 pointer-events-none" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 20% 80%, rgba(74,114,96,0.45) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 10%, rgba(46,80,64,0.6) 0%, transparent 60%)',
          }}
        />

        <Link href="/" className="relative z-10 font-display text-xl font-medium text-white/95 tracking-wide no-underline">
          Occasion Flow
        </Link>

        <div className="relative z-10">
          <p className="text-xs font-medium tracking-widest uppercase text-white/50 mb-5">
            Automated Gift Delivery
          </p>
          <h1 className="font-display text-4xl font-medium leading-tight text-white mb-6">
            Never miss<br />
            <em className="text-white/70">a moment</em><br />
            that matters.
          </h1>
          <p className="text-sm font-light leading-relaxed text-white/60 max-w-xs">
            Occasion Flow remembers birthdays, anniversaries, and every occasion worth celebrating — and sends the perfect gift automatically.
          </p>
        </div>

        <blockquote
          className="relative z-10 text-sm italic text-white/40 leading-relaxed pl-4"
          style={{ borderLeft: '2px solid rgba(255,255,255,0.2)' }}
        >
          "The most thoughtful people<br />are often the best organised."
        </blockquote>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex items-center justify-center bg-white px-8 py-12">
        <div
          className="w-full max-w-sm"
          style={{
            animation: 'slideIn 0.45s ease forwards',
            opacity: 0,
          }}
        >
          <style>{`@keyframes slideIn { to { opacity: 1; transform: translateY(0); } } div[style*='slideIn'] { transform: translateY(16px); }`}</style>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs mb-10 no-underline transition-colors"
            style={{ color: 'var(--ink-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M8.5 2.5L4 7l4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to site
          </Link>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-medium tracking-widest uppercase mb-2.5" style={{ color: 'var(--forest)' }}>
              Welcome
            </p>
            <h2 className="font-display text-3xl font-medium mb-2" style={{ color: 'var(--ink)' }}>
              {isSignup ? 'Create account' : 'Sign in'}
            </h2>
            <p className="text-sm font-light" style={{ color: 'var(--ink-soft)' }}>
              {isSignup ? 'Start automating your gift giving.' : 'Enter your credentials to continue.'}
            </p>
          </div>

          {/* Toggle */}
          <div
            className="flex mb-8"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className="flex-1 py-2.5 text-xs font-medium tracking-widest uppercase cursor-pointer border-none transition-colors"
                style={{
                  background: mode === m ? 'var(--forest)' : 'transparent',
                  color: mode === m ? '#fff' : 'var(--ink-muted)',
                }}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Messages */}
          {error && (
            <div
              className="flex items-start gap-2.5 p-3 mb-5"
              style={{
                background: '#FAF0F0',
                border: '1px solid rgba(185,64,64,0.2)',
                borderLeft: '3px solid #B94040',
              }}
            >
              <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#B94040" strokeWidth="1.4"/>
                <path d="M8 4.5v4M8 10.5v1" stroke="#B94040" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <span className="text-sm leading-snug" style={{ color: '#B94040' }}>{error}</span>
            </div>
          )}

          {success && (
            <div
              className="flex items-start gap-2.5 p-3 mb-5"
              style={{
                background: 'var(--forest-pale)',
                border: '1px solid rgba(46,80,64,0.2)',
                borderLeft: '3px solid var(--forest)',
              }}
            >
              <svg className="shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="var(--forest)" strokeWidth="1.4"/>
                <path d="M5 8l2 2 4-4" stroke="var(--forest)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm leading-snug" style={{ color: 'var(--forest)' }}>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {isSignup && (
              <div>
                <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--ink-soft)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Jane Smith"
                  required={isSignup}
                  autoComplete="name"
                  className="w-full px-4 py-3 text-sm outline-none transition-colors"
                  style={{
                    background: 'var(--off-white)',
                    border: '1px solid var(--border)',
                    color: 'var(--ink)',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--forest)'; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--off-white)' }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--ink-soft)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="jane@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--off-white)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--forest)'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--off-white)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--ink-soft)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                className="w-full px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--off-white)',
                  border: '1px solid var(--border)',
                  color: 'var(--ink)',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--forest)'; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--off-white)' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-xs font-medium tracking-widest uppercase text-white border cursor-pointer transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'var(--forest)',
                borderColor: 'var(--forest)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!loading) (e.target as HTMLButtonElement).style.background = 'var(--forest-light)' }}
              onMouseLeave={e => { if (!loading) (e.target as HTMLButtonElement).style.background = 'var(--forest)' }}
            >
              {loading ? (
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                  <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                isSignup ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--ink-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <p className="text-center text-sm" style={{ color: 'var(--ink-muted)' }}>
            {isSignup ? (
              <>Already have an account?{' '}
                <button onClick={() => switchMode('signin')} className="font-medium cursor-pointer bg-transparent border-none p-0" style={{ color: 'var(--forest)', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Sign in
                </button>
              </>
            ) : (
              <>Don&apos;t have an account?{' '}
                <button onClick={() => switchMode('signup')} className="font-medium cursor-pointer bg-transparent border-none p-0" style={{ color: 'var(--forest)', fontFamily: 'inherit', fontSize: 'inherit' }}>
                  Create one
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
