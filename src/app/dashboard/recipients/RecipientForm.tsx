'use client'

import { useState, useEffect, useRef } from 'react'
import type { Recipient, RecipientInsert, Relationship } from '@/types/database'

const RELATIONSHIPS: { value: Relationship; label: string }[] = [
  { value: 'partner',   label: 'Partner'   },
  { value: 'parent',    label: 'Parent'    },
  { value: 'friend',    label: 'Friend'    },
  { value: 'sibling',   label: 'Sibling'   },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other',     label: 'Other'     },
]

const BLANK: RecipientInsert = {
  full_name:     '',
  relationship:  'friend',
  email:         '',
  phone:         '',
  address_line1: '',
  address_line2: '',
  city:          '',
  postal_code:   '',
  country:       'Germany',
}

interface Props {
  recipient: Recipient | null
  onSave: (data: RecipientInsert, id?: string) => Promise<boolean>
  onClose: () => void
}

export default function RecipientForm({ recipient, onSave, onClose }: Props) {
  const [form, setForm] = useState<RecipientInsert>(
    recipient
      ? {
          full_name:     recipient.full_name,
          relationship:  recipient.relationship,
          email:         recipient.email         ?? '',
          phone:         recipient.phone         ?? '',
          address_line1: recipient.address_line1,
          address_line2: recipient.address_line2 ?? '',
          city:          recipient.city,
          postal_code:   recipient.postal_code,
          country:       recipient.country,
        }
      : BLANK
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function set(field: keyof RecipientInsert, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const payload: RecipientInsert = {
      ...form,
      email:        form.email        || null,
      phone:        form.phone        || null,
      address_line2: form.address_line2 || null,
    }
    const ok = await onSave(payload, recipient?.id)
    if (!ok) setError('Failed to save. Please try again.')
    setSaving(false)
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: 'rgba(26,31,46,0.35)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className="relative flex flex-col h-full overflow-y-auto bg-white"
        style={{
          width: 'min(480px, 100vw)',
          borderLeft: '1px solid var(--border)',
          animation: 'slideInRight 0.25s ease both',
        }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(40px); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div
          className="flex items-center justify-between px-7 py-5 sticky top-0 bg-white z-10"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-0.5" style={{ color: 'var(--forest)' }}>
              {recipient ? 'Edit' : 'New'}
            </p>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>
              {recipient ? 'Edit Recipient' : 'Add Recipient'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center cursor-pointer border-none bg-transparent transition-colors"
            style={{ color: 'var(--ink-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 px-7 py-6 gap-6">

          {error && (
            <div
              className="flex items-center gap-2.5 p-3 text-sm"
              style={{ background: '#FAF0F0', borderLeft: '3px solid #B94040', color: '#B94040' }}
            >
              {error}
            </div>
          )}

          {/* Section: Personal */}
          <section>
            <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'var(--ink-muted)' }}>
              Personal
            </p>
            <div className="flex flex-col gap-4">
              <Field label="Full Name" required>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => set('full_name', e.target.value)}
                  placeholder="Jane Smith"
                  required
                  className="field-input"
                />
              </Field>

              <Field label="Relationship" required>
                <div className="grid grid-cols-3 gap-1.5">
                  {RELATIONSHIPS.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('relationship', value)}
                      className="py-2 px-2 text-xs font-medium cursor-pointer border transition-colors"
                      style={{
                        background: form.relationship === value ? 'var(--forest)' : 'var(--off-white)',
                        borderColor: form.relationship === value ? 'var(--forest)' : 'var(--border)',
                        color: form.relationship === value ? '#fff' : 'var(--ink-soft)',
                        fontFamily: 'inherit',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={e => set('email', e.target.value)}
                  placeholder="jane@example.com"
                  className="field-input"
                />
              </Field>

              <Field label="Phone">
                <input
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+49 170 1234567"
                  className="field-input"
                />
              </Field>
            </div>
          </section>

          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Section: Address */}
          <section>
            <p className="text-xs font-medium tracking-widest uppercase mb-4" style={{ color: 'var(--ink-muted)' }}>
              Delivery Address
            </p>
            <div className="flex flex-col gap-4">
              <Field label="Street Address" required>
                <input
                  type="text"
                  value={form.address_line1}
                  onChange={e => set('address_line1', e.target.value)}
                  placeholder="Musterstraße 12"
                  required
                  className="field-input"
                />
              </Field>

              <Field label="Address Line 2">
                <input
                  type="text"
                  value={form.address_line2 ?? ''}
                  onChange={e => set('address_line2', e.target.value)}
                  placeholder="Apt, suite, floor (optional)"
                  className="field-input"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="City" required>
                  <input
                    type="text"
                    value={form.city}
                    onChange={e => set('city', e.target.value)}
                    placeholder="Berlin"
                    required
                    className="field-input"
                  />
                </Field>
                <Field label="ZIP Code" required>
                  <input
                    type="text"
                    value={form.postal_code}
                    onChange={e => set('postal_code', e.target.value)}
                    placeholder="10115"
                    required
                    className="field-input"
                  />
                </Field>
              </div>

              <Field label="Country" required>
                <input
                  type="text"
                  value={form.country}
                  onChange={e => set('country', e.target.value)}
                  placeholder="Germany"
                  required
                  className="field-input"
                />
              </Field>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3 pt-2 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-xs font-medium tracking-widest uppercase cursor-pointer border transition-colors"
              style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--ink-soft)', fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 text-xs font-medium tracking-widest uppercase text-white cursor-pointer border transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'var(--forest)', borderColor: 'var(--forest)', fontFamily: 'inherit' }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--forest-light)' }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--forest)' }}
            >
              {saving ? (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8"/>
                  <path d="M7 2a5 5 0 0 1 5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              ) : null}
              {recipient ? 'Save Changes' : 'Add Recipient'}
            </button>
          </div>

        </form>
      </div>

      {/* Shared input styles */}
      <style>{`
        .field-input {
          width: 100%;
          padding: 10px 14px;
          font-family: 'Jost', sans-serif;
          font-size: 0.875rem;
          color: var(--ink);
          background: var(--off-white);
          border: 1px solid var(--border);
          outline: none;
          transition: border-color 0.15s, background 0.15s;
          -webkit-appearance: none;
        }
        .field-input::placeholder { color: var(--ink-muted); }
        .field-input:focus { border-color: var(--forest); background: #fff; }
      `}</style>
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--ink-soft)' }}>
        {label}{required && <span style={{ color: 'var(--forest)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}
