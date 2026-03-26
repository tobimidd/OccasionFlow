'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Gift, GiftInsert, GiftCategory } from '@/types/database'
import GiftForm from './GiftForm'

const CATEGORY_META: Record<GiftCategory, { label: string; icon: string; bg: string; text: string }> = {
  flowers:    { label: 'Flowers',    icon: '🌸', bg: '#FDE8F5', text: '#9B2270' },
  chocolate:  { label: 'Chocolate', icon: '🍫', bg: '#FDF0E8', text: '#9B4E22' },
  wine:       { label: 'Wine',       icon: '🍷', bg: '#FDE8ED', text: '#9B2240' },
  jewelry:    { label: 'Jewelry',    icon: '💎', bg: '#E8EDFD', text: '#22409B' },
  experience: { label: 'Experience', icon: '✨', bg: '#FDF4E8', text: '#9B7022' },
  other:      { label: 'Other',      icon: '🎁', bg: 'var(--surface)', text: 'var(--ink-soft)' },
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-DE', { style: 'currency', currency: 'EUR' }).format(price)
}

export default function GiftsClient({
  initialGifts,
  error,
}: {
  initialGifts: Gift[]
  error: string | null
}) {
  const supabase = createClient()

  const [gifts, setGifts]           = useState<Gift[]>(initialGifts)
  const [formOpen, setFormOpen]     = useState(false)
  const [editing, setEditing]       = useState<Gift | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function handleSave(data: GiftInsert, id?: string): Promise<boolean> {
    setActionError(null)
    if (id) {
      const { data: updated, error } = await supabase
        .from('gifts').update(data).eq('id', id).select().single()
      if (error) { setActionError(error.message); return false }
      setGifts(prev => prev.map(g => g.id === id ? updated as Gift : g)
        .sort((a, b) => a.name.localeCompare(b.name)))
    } else {
      const { data: inserted, error } = await supabase
        .from('gifts').insert(data).select().single()
      if (error) { setActionError(error.message); return false }
      setGifts(prev => [...prev, inserted as Gift]
        .sort((a, b) => a.name.localeCompare(b.name)))
    }
    setFormOpen(false); setEditing(null)
    return true
  }

  async function handleDelete(id: string) {
    setDeleting(id); setActionError(null)
    const { error } = await supabase.from('gifts').delete().eq('id', id)
    if (error) { setActionError(error.message); setDeleting(null); return }
    setGifts(prev => prev.filter(g => g.id !== id))
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
              Gift Catalogue
            </h1>
            <p className="text-sm font-light mt-1.5" style={{ color: 'var(--ink-soft)' }}>
              {gifts.length === 0
                ? 'Add gifts to build your catalogue.'
                : `${gifts.length} ${gifts.length === 1 ? 'gift' : 'gifts'} in the catalogue.`}
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
            Add Gift
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
        {gifts.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center"
            style={{ border: '1px dashed var(--border)' }}>
            <div className="w-14 h-14 flex items-center justify-center mb-5 text-2xl"
              style={{ background: 'var(--forest-pale)' }}>
              🎁
            </div>
            <p className="font-display text-lg font-medium mb-1.5" style={{ color: 'var(--ink)' }}>
              No gifts yet
            </p>
            <p className="text-sm font-light mb-6 max-w-xs" style={{ color: 'var(--ink-soft)' }}>
              Start building your gift catalogue — add flowers, chocolates, experiences, and more.
            </p>
            <button
              onClick={() => { setEditing(null); setFormOpen(true) }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-medium tracking-widest uppercase text-white cursor-pointer border transition-colors"
              style={{ background: 'var(--forest)', borderColor: 'var(--forest)', fontFamily: 'inherit' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add your first gift
            </button>
          </div>
        )}

        {/* Gifts grid */}
        {gifts.length > 0 && (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {gifts.map(g => {
              const meta = CATEGORY_META[g.category as GiftCategory] ?? CATEGORY_META.other
              return (
                <div key={g.id} className="bg-white flex flex-col" style={{ border: '1px solid var(--border)' }}>

                  {/* Image */}
                  {g.image_url ? (
                    <div className="w-full overflow-hidden" style={{ height: '160px', borderBottom: '1px solid var(--border)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={g.image_url}
                        alt={g.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.currentTarget.parentElement as HTMLElement).style.display = 'none' }}
                      />
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center text-3xl"
                      style={{ height: '100px', background: meta.bg, borderBottom: '1px solid var(--border)' }}>
                      {meta.icon}
                    </div>
                  )}

                  {/* Top band */}
                  <div className="flex items-start gap-4 p-5" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="inline-block px-2 py-0.5 text-xs font-medium"
                          style={{ background: meta.bg, color: meta.text }}>
                          {meta.icon} {meta.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--ink)' }}>
                        {g.name}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold" style={{ color: 'var(--forest)' }}>
                      {formatPrice(g.price)}
                    </span>
                  </div>

                  {/* Body */}
                  {g.description && (
                    <div className="flex-1 px-5 py-4">
                      <p className="text-xs font-light leading-relaxed line-clamp-3"
                        style={{ color: 'var(--ink-soft)' }}>
                        {g.description}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
                    <button
                      onClick={() => { setEditing(g); setFormOpen(true) }}
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
                      onClick={() => handleDelete(g.id)}
                      disabled={deleting === g.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer border-none transition-colors disabled:opacity-50"
                      style={{ background: 'transparent', color: 'var(--ink-soft)', fontFamily: 'inherit' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FAF0F0'; e.currentTarget.style.color = '#B94040' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--ink-soft)' }}
                    >
                      {deleting === g.id ? (
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
        <GiftForm
          gift={editing}
          onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditing(null) }}
        />
      )}
    </>
  )
}
