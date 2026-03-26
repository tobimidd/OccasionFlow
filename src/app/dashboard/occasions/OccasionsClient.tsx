'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Occasion, OccasionInsert, OccasionType, Recipient } from '@/types/database'
import OccasionForm from './OccasionForm'

const TYPE_META: Record<OccasionType, { label: string; icon: string; bg: string; text: string }> = {
  birthday:      { label: 'Birthday',       icon: '🎂', bg: '#FDE8ED', text: '#9B2240' },
  anniversary:   { label: 'Anniversary',    icon: '💍', bg: '#E8F0FD', text: '#224A9B' },
  wedding:       { label: 'Wedding',        icon: '🥂', bg: '#FDF4E8', text: '#9B5C22' },
  holiday:       { label: 'Holiday',        icon: '✈️',  bg: '#E8FDF4', text: '#22669B' },
  christmas:     { label: 'Christmas',      icon: '🎄', bg: '#E8FDE8', text: '#22661C' },
  valentines_day:{ label: "Valentine's Day",icon: '❤️',  bg: '#FDE8ED', text: '#9B2240' },
  mothers_day:   { label: "Mother's Day",   icon: '🌸', bg: '#FDE8F5', text: '#9B2270' },
  fathers_day:   { label: "Father's Day",   icon: '👔', bg: '#E8EDFD', text: '#22409B' },
  other:         { label: 'Other',          icon: '🎁', bg: 'var(--surface)', text: 'var(--ink-soft)' },
}

function daysUntil(dateStr: string, recurring: boolean): number | null {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [y, m, d] = dateStr.split('-').map(Number)
  let target = new Date(y, m - 1, d)
  if (recurring) {
    target.setFullYear(today.getFullYear())
    if (target < today) target.setFullYear(today.getFullYear() + 1)
  }
  const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
  return diff
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function OccasionsClient({
  initialOccasions,
  recipients,
  error,
}: {
  initialOccasions: Occasion[]
  recipients: Pick<Recipient, 'id' | 'full_name' | 'relationship'>[]
  error: string | null
}) {
  const supabase = createClient()

  const [occasions, setOccasions] = useState<Occasion[]>(initialOccasions)
  const [formOpen, setFormOpen]   = useState(false)
  const [editing, setEditing]     = useState<Occasion | null>(null)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const recipientMap = Object.fromEntries(recipients.map(r => [r.id, r]))

  async function handleSave(data: OccasionInsert, id?: string) {
    setActionError(null)
    if (id) {
      const { data: updated, error } = await supabase
        .from('occasions').update(data).eq('id', id).select().single()
      if (error) { setActionError(error.message); return false }
      setOccasions(prev => prev.map(o => o.id === id ? updated as Occasion : o)
        .sort((a, b) => a.occasion_date.localeCompare(b.occasion_date)))
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setActionError('Not authenticated.'); return false }
      const { data: inserted, error } = await supabase
        .from('occasions').insert({ ...data, user_id: user.id }).select().single()
      if (error) { setActionError(error.message); return false }
      setOccasions(prev => [...prev, inserted as Occasion]
        .sort((a, b) => a.occasion_date.localeCompare(b.occasion_date)))
    }
    setFormOpen(false); setEditing(null)
    return true
  }

  async function handleDelete(id: string) {
    setDeleting(id); setActionError(null)
    const { error } = await supabase.from('occasions').delete().eq('id', id)
    if (error) { setActionError(error.message); setDeleting(null); return }
    setOccasions(prev => prev.filter(o => o.id !== id))
    setDeleting(null)
  }

  return (
    <>
      <div className="p-8 md:p-10" style={{ animation: 'fadeUp 0.45s ease both' }}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--forest)' }}>
              Dashboard
            </p>
            <h1 className="font-display font-medium leading-tight" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', color: 'var(--ink)' }}>
              Occasions
            </h1>
            <p className="text-sm font-light mt-1.5" style={{ color: 'var(--ink-soft)' }}>
              {occasions.length === 0
                ? 'Add occasions to start automating your gift delivery.'
                : `${occasions.length} ${occasions.length === 1 ? 'occasion' : 'occasions'} scheduled.`}
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setFormOpen(true) }}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-widest uppercase text-white cursor-pointer border transition-colors"
            style={{ background: 'var(--forest)', borderColor: 'var(--forest)', fontFamily: 'inherit' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--forest-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--forest)')}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add Occasion
          </button>
        </div>

        <div className="h-px mb-8" style={{ background: 'var(--border)' }} />

        {/* Errors */}
        {(error || actionError) && (
          <div className="flex items-center gap-2.5 p-3 mb-6 text-sm"
            style={{ background: '#FAF0F0', border: '1px solid rgba(185,64,64,0.2)', borderLeft: '3px solid #B94040', color: '#B94040' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 4.5v4M8 10.5v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {error || actionError}
          </div>
        )}

        {/* Empty state */}
        {occasions.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center"
            style={{ border: '1px dashed var(--border)' }}>
            <div className="w-14 h-14 flex items-center justify-center mb-5 text-2xl"
              style={{ background: 'var(--forest-pale)' }}>
              🗓
            </div>
            <p className="font-display text-lg font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
              No occasions yet
            </p>
            <p className="text-sm font-light mb-6 max-w-xs" style={{ color: 'var(--ink-soft)' }}>
              {recipients.length === 0
                ? 'Add a recipient first, then schedule their occasions.'
                : 'Schedule a birthday, anniversary, or any occasion worth remembering.'}
            </p>
            <button
              onClick={() => { setEditing(null); setFormOpen(true) }}
              disabled={recipients.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-widest uppercase text-white cursor-pointer border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--forest)', borderColor: 'var(--forest)', fontFamily: 'inherit' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add your first occasion
            </button>
            {recipients.length === 0 && (
              <p className="text-xs mt-3" style={{ color: 'var(--ink-muted)' }}>
                You need at least one recipient first.
              </p>
            )}
          </div>
        )}

        {/* Occasions grid */}
        {occasions.length > 0 && (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {occasions.map(o => {
              const meta    = TYPE_META[o.occasion_type as OccasionType] ?? TYPE_META.other
              const days    = daysUntil(o.occasion_date, o.recurring)
              const recip   = recipientMap[o.recipient_id]

              const daysLabel = days === null ? null
                : days === 0 ? 'Today!'
                : days === 1 ? 'Tomorrow'
                : days > 0   ? `In ${days} days`
                : `${Math.abs(days)} days ago`

              const daysUrgent = days !== null && days >= 0 && days <= 7

              return (
                <div key={o.id} className="bg-white flex flex-col" style={{ border: '1px solid var(--border)' }}>

                  {/* Top band */}
                  <div className="flex items-start gap-4 p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="w-10 h-10 flex items-center justify-center text-xl shrink-0"
                      style={{ background: meta.bg }}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium"
                          style={{ background: meta.bg, color: meta.text }}>
                          {meta.label}
                        </span>
                        {o.recurring && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium"
                            style={{ background: 'var(--forest-pale)', color: 'var(--forest)' }}>
                            <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                              <path d="M1 5a4 4 0 1 0 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                              <path d="M5 1 3.5 2.5 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Yearly
                          </span>
                        )}
                      </div>
                      {recip && (
                        <p className="text-sm font-medium mt-1.5 truncate" style={{ color: 'var(--ink)' }}>
                          {recip.full_name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0">
                          <rect x="1.5" y="2" width="10" height="9.5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
                          <path d="M4.5 1v2M8.5 1v2M1.5 5.5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        <span>{formatDate(o.occasion_date)}</span>
                      </div>
                      {daysLabel && (
                        <span className="text-xs font-medium px-2 py-0.5"
                          style={{
                            background: daysUrgent ? 'var(--forest-pale)' : 'var(--surface)',
                            color: daysUrgent ? 'var(--forest)' : 'var(--ink-muted)',
                          }}>
                          {daysLabel}
                        </span>
                      )}
                    </div>

                    {o.notes && (
                      <p className="text-xs font-light leading-relaxed line-clamp-2"
                        style={{ color: 'var(--ink-soft)' }}>
                        {o.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex" style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => { setEditing(o); setFormOpen(true) }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer border-none transition-colors"
                      style={{ background: 'transparent', color: 'var(--ink-soft)', fontFamily: 'inherit', borderRight: '1px solid var(--border)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.color = 'var(--ink)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)' }}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M8.5 1.5l2 2L4 10H2V8l6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(o.id)}
                      disabled={deleting === o.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer border-none transition-colors disabled:opacity-50"
                      style={{ background: 'transparent', color: 'var(--ink-soft)', fontFamily: 'inherit' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FAF0F0'; e.currentTarget.style.color = '#B94040' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)' }}
                    >
                      {deleting === o.id ? (
                        <svg className="animate-spin" width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1.5"/>
                          <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 3h8M5 3V2h2v1M4.5 3v6.5h3V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {formOpen && (
        <OccasionForm
          occasion={editing}
          recipients={recipients}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditing(null) }}
        />
      )}
    </>
  )
}
