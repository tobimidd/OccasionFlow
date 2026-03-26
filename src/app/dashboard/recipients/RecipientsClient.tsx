'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Recipient, RecipientInsert, Relationship } from '@/types/database'
import RecipientForm from './RecipientForm'

const RELATIONSHIP_LABELS: Record<Relationship, string> = {
  partner:   'Partner',
  parent:    'Parent',
  friend:    'Friend',
  sibling:   'Sibling',
  colleague: 'Colleague',
  other:     'Other',
}

const RELATIONSHIP_COLORS: Record<Relationship, { bg: string; text: string }> = {
  partner:   { bg: '#FDE8ED', text: '#9B2240' },
  parent:    { bg: '#E8F0FD', text: '#224A9B' },
  friend:    { bg: 'var(--forest-pale)', text: 'var(--forest)' },
  sibling:   { bg: '#FDF4E8', text: '#9B5C22' },
  colleague: { bg: '#F0E8FD', text: '#5C229B' },
  other:     { bg: 'var(--surface)', text: 'var(--ink-soft)' },
}

export default function RecipientsClient({
  initialRecipients,
  error,
}: {
  initialRecipients: Recipient[]
  error: string | null
}) {
  const supabase = createClient()

  const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Recipient | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  // ── Add / Edit ────────────────────────────────────────────────────
  async function handleSave(data: RecipientInsert, id?: string) {
    setActionError(null)

    if (id) {
      // Update
      const { data: updated, error } = await supabase
        .from('recipients')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) { setActionError(error.message); return false }
      setRecipients(prev => prev.map(r => r.id === id ? updated as Recipient : r))
    } else {
      // Insert — must include user_id so RLS with_check (auth.uid() = user_id) passes
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setActionError('Not authenticated.'); return false }

      const { data: inserted, error } = await supabase
        .from('recipients')
        .insert({ ...data, user_id: user.id })
        .select()
        .single()
      if (error) { setActionError(error.message); return false }
      setRecipients(prev => [inserted as Recipient, ...prev])
    }

    setFormOpen(false)
    setEditing(null)
    return true
  }

  // ── Delete ────────────────────────────────────────────────────────
  async function handleDelete(id: string) {
    setDeleting(id)
    setActionError(null)
    const { error } = await supabase.from('recipients').delete().eq('id', id)
    if (error) { setActionError(error.message); setDeleting(null); return }
    setRecipients(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
  }

  function openAdd() { setEditing(null); setFormOpen(true) }
  function openEdit(r: Recipient) { setEditing(r); setFormOpen(true) }
  function closeForm() { setFormOpen(false); setEditing(null) }

  return (
    <>
      <div
        className="p-8 md:p-10"
        style={{ animation: 'fadeUp 0.45s ease both' }}
      >
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`}</style>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'var(--forest)' }}>
              Dashboard
            </p>
            <h1 className="font-display font-medium leading-tight" style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', color: 'var(--ink)' }}>
              Recipients
            </h1>
            <p className="text-sm font-light mt-1.5" style={{ color: 'var(--ink-soft)' }}>
              {recipients.length === 0
                ? 'Add the people you want to send gifts to.'
                : `${recipients.length} ${recipients.length === 1 ? 'person' : 'people'} in your list.`}
            </p>
          </div>

          <button
            onClick={openAdd}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-widest uppercase text-white cursor-pointer border transition-colors"
            style={{ background: 'var(--forest)', borderColor: 'var(--forest)', fontFamily: 'inherit' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--forest-light)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--forest)')}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Add Recipient
          </button>
        </div>

        <div className="h-px mb-8" style={{ background: 'var(--border)' }} />

        {/* Error */}
        {(error || actionError) && (
          <div
            className="flex items-center gap-2.5 p-3 mb-6 text-sm"
            style={{ background: '#FAF0F0', border: '1px solid rgba(185,64,64,0.2)', borderLeft: '3px solid #B94040', color: '#B94040' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M8 4.5v4M8 10.5v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {error || actionError}
          </div>
        )}

        {/* Empty state */}
        {recipients.length === 0 && !error && (
          <div
            className="flex flex-col items-center justify-center py-20 text-center"
            style={{ border: '1px dashed var(--border)' }}
          >
            <div
              className="w-14 h-14 flex items-center justify-center mb-5"
              style={{ background: 'var(--forest-pale)', color: 'var(--forest)' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="font-display text-lg font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
              No recipients yet
            </p>
            <p className="text-sm font-light mb-6 max-w-xs" style={{ color: 'var(--ink-soft)' }}>
              Add someone you&apos;d like to send gifts to — a partner, parent, friend, or colleague.
            </p>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-widest uppercase text-white cursor-pointer border transition-colors"
              style={{ background: 'var(--forest)', borderColor: 'var(--forest)', fontFamily: 'inherit' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add your first recipient
            </button>
          </div>
        )}

        {/* Recipients grid */}
        {recipients.length > 0 && (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {recipients.map(r => {
              const rel = r.relationship as Relationship
              const colors = RELATIONSHIP_COLORS[rel] ?? RELATIONSHIP_COLORS.other
              const initials = r.full_name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()

              return (
                <div
                  key={r.id}
                  className="bg-white flex flex-col"
                  style={{ border: '1px solid var(--border)' }}
                >
                  {/* Card header */}
                  <div className="flex items-start gap-4 p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div
                      className="w-10 h-10 flex items-center justify-center text-sm font-semibold shrink-0"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--ink)' }}>
                        {r.full_name}
                      </p>
                      <span
                        className="inline-block mt-1 px-2 py-0.5 text-xs font-medium"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {RELATIONSHIP_LABELS[rel]}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="flex-1 p-5 flex flex-col gap-2.5">
                    {r.email && (
                      <div className="flex items-center gap-2.5 text-xs" style={{ color: 'var(--ink-soft)' }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0">
                          <rect x="1" y="2.5" width="11" height="8" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
                          <path d="M1 3.5l5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                        </svg>
                        <span className="truncate">{r.email}</span>
                      </div>
                    )}
                    {r.phone && (
                      <div className="flex items-center gap-2.5 text-xs" style={{ color: 'var(--ink-soft)' }}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0">
                          <path d="M2 2h3l1 3-1.5 1a7 7 0 0 0 2.5 2.5L8.5 7l3 1v3a1 1 0 0 1-1 1A10 10 0 0 1 1 3a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>{r.phone}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2.5 text-xs" style={{ color: 'var(--ink-soft)' }}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0 mt-0.5">
                        <path d="M6.5 1C4.015 1 2 3.015 2 5.5c0 3.375 4.5 6.5 4.5 6.5S11 8.875 11 5.5C11 3.015 8.985 1 6.5 1z" stroke="currentColor" strokeWidth="1.2"/>
                        <circle cx="6.5" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.2"/>
                      </svg>
                      <span>
                        {[r.address_line1, r.address_line2, r.city, r.postal_code, r.country]
                          .filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div
                    className="flex"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <button
                      onClick={() => openEdit(r)}
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
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer border-none transition-colors disabled:opacity-50"
                      style={{ background: 'transparent', color: 'var(--ink-soft)', fontFamily: 'inherit' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FAF0F0'; e.currentTarget.style.color = '#B94040' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)' }}
                    >
                      {deleting === r.id ? (
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

      {/* ── Slide-over form ── */}
      {formOpen && (
        <RecipientForm
          recipient={editing}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}
    </>
  )
}
