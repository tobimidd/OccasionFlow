'use client'

import { useState, useEffect, useRef } from 'react'
import type { Occasion, OccasionInsert, OccasionType, Recipient } from '@/types/database'

const OCCASION_TYPES: { value: OccasionType; label: string; icon: string }[] = [
  { value: 'birthday',       label: 'Birthday',        icon: '🎂' },
  { value: 'anniversary',    label: 'Anniversary',     icon: '💍' },
  { value: 'wedding',        label: 'Wedding',         icon: '🥂' },
  { value: 'holiday',        label: 'Holiday',         icon: '✈️' },
  { value: 'christmas',      label: 'Christmas',       icon: '🎄' },
  { value: 'valentines_day', label: "Valentine's",     icon: '❤️' },
  { value: 'mothers_day',    label: "Mother's Day",    icon: '🌸' },
  { value: 'fathers_day',    label: "Father's Day",    icon: '👔' },
  { value: 'other',          label: 'Other',           icon: '🎁' },
]

const BLANK: OccasionInsert = {
  recipient_id:   '',
  occasion_type:  'birthday',
  occasion_date:  '',
  recurring:      true,
  notes:          '',
}

interface Props {
  occasion: Occasion | null
  recipients: Pick<Recipient, 'id' | 'full_name' | 'relationship'>[]
  onSave: (data: OccasionInsert, id?: string) => Promise<boolean>
  onClose: () => void
}

export default function OccasionForm({ occasion, recipients, onSave, onClose }: Props) {
  const [form, setForm] = useState<OccasionInsert>(
    occasion
      ? {
          recipient_id:  occasion.recipient_id,
          occasion_type: occasion.occasion_type,
          occasion_date: occasion.occasion_date,
          recurring:     occasion.recurring,
          notes:         occasion.notes ?? '',
        }
      : { ...BLANK, recipient_id: recipients[0]?.id ?? '' }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function set<K extends keyof OccasionInsert>(field: K, value: OccasionInsert[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.recipient_id) { setError('Please select a recipient.'); return }
    setError(null); setSaving(true)
    const payload: OccasionInsert = { ...form, notes: form.notes || null }
    const ok = await onSave(payload, occasion?.id)
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
        style={{ width: 'min(480px, 100vw)', borderLeft: '1px solid var(--border)', animation: 'slideInRight 0.25s ease both' }}
      >
        <style>{`
          @keyframes slideInRight { from { transform:translateX(40px); opacity:0; } to { transform:translateX(0); opacity:1; } }
          .field-input, .field-select, .field-textarea {
            width: 100%; font-family: 'Jost', sans-serif; font-size: 0.875rem;
            color: var(--ink); background: var(--off-white); border: 1px solid var(--border);
            outline: none; transition: border-color 0.15s, background 0.15s; -webkit-appearance: none;
          }
          .field-input, .field-select { padding: 10px 14px; }
          .field-select {
            padding-right: 32px; cursor: pointer; appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239BA3AF' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat; background-position: right 12px center;
          }
          .field-textarea { padding: 10px 14px; resize: vertical; min-height: 80px; }
          .field-input::placeholder, .field-textarea::placeholder { color: var(--ink-muted); }
          .field-input:focus, .field-select:focus, .field-textarea:focus { border-color: var(--forest); background: #fff; }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 sticky top-0 bg-white z-10"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-0.5" style={{ color: 'var(--forest)' }}>
              {occasion ? 'Edit' : 'New'}
            </p>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>
              {occasion ? 'Edit Occasion' : 'Add Occasion'}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center cursor-pointer border-none bg-transparent"
            style={{ color: 'var(--ink-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-muted)')}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 px-7 py-6 gap-6">

          {error && (
            <div className="flex items-center gap-2.5 p-3 text-sm"
              style={{ background: '#FAF0F0', borderLeft: '3px solid #B94040', color: '#B94040' }}>
              {error}
            </div>
          )}

          {/* Recipient */}
          <Field label="Recipient" required>
            {recipients.length === 0 ? (
              <p className="text-sm py-2" style={{ color: 'var(--ink-muted)' }}>
                No recipients yet — add one first.
              </p>
            ) : (
              <select
                value={form.recipient_id}
                onChange={e => set('recipient_id', e.target.value)}
                required
                className="field-select"
              >
                <option value="">Select a recipient…</option>
                {recipients.map(r => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
            )}
          </Field>

          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Occasion type */}
          <Field label="Occasion Type" required>
            <div className="grid grid-cols-3 gap-1.5">
              {OCCASION_TYPES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('occasion_type', value)}
                  className="py-2 px-1 text-xs font-medium cursor-pointer border transition-colors flex items-center justify-center gap-1.5"
                  style={{
                    background:  form.occasion_type === value ? 'var(--forest)' : 'var(--off-white)',
                    borderColor: form.occasion_type === value ? 'var(--forest)' : 'var(--border)',
                    color:       form.occasion_type === value ? '#fff' : 'var(--ink-soft)',
                    fontFamily:  'inherit',
                  }}
                >
                  <span>{icon}</span>
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </Field>

          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Date + Recurring */}
          <Field label="Date" required>
            <input
              type="date"
              value={form.occasion_date}
              onChange={e => set('occasion_date', e.target.value)}
              required
              className="field-input"
            />
          </Field>

          {/* Recurring toggle */}
          <div className="flex items-center justify-between py-3 px-4"
            style={{ background: 'var(--off-white)', border: '1px solid var(--border)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>Repeat yearly</p>
              <p className="text-xs font-light" style={{ color: 'var(--ink-muted)' }}>
                Occasion recurs every year on this date
              </p>
            </div>
            <button
              type="button"
              onClick={() => set('recurring', !form.recurring)}
              className="relative shrink-0 cursor-pointer border-none bg-transparent p-0"
              style={{ width: '44px', height: '24px' }}
              aria-label="Toggle recurring"
            >
              <span
                className="absolute inset-0 rounded-full transition-colors"
                style={{ background: form.recurring ? 'var(--forest)' : 'var(--border)' }}
              />
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform shadow-sm"
                style={{ transform: form.recurring ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
          </div>

          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Notes */}
          <Field label="Notes">
            <textarea
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              placeholder="Any details, gift ideas, or reminders…"
              className="field-textarea"
            />
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2 mt-auto">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 text-xs font-medium tracking-widest uppercase cursor-pointer border transition-colors"
              style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--ink-soft)', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || recipients.length === 0}
              className="flex-1 py-3 text-xs font-medium tracking-widest uppercase text-white cursor-pointer border transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: 'var(--forest)', borderColor: 'var(--forest)', fontFamily: 'inherit' }}
              onMouseEnter={e => { if (!saving) e.currentTarget.style.background = 'var(--forest-light)' }}
              onMouseLeave={e => { if (!saving) e.currentTarget.style.background = 'var(--forest)' }}>
              {saving && (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8"/>
                  <path d="M7 2a5 5 0 0 1 5 5" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              )}
              {occasion ? 'Save Changes' : 'Add Occasion'}
            </button>
          </div>
        </form>
      </div>
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
