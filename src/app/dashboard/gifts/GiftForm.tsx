'use client'

import { useState, useEffect, useRef } from 'react'
import type { Gift, GiftInsert, GiftCategory } from '@/types/database'

const CATEGORIES: { value: GiftCategory; label: string; icon: string }[] = [
  { value: 'flowers',    label: 'Flowers',    icon: '🌸' },
  { value: 'chocolate',  label: 'Chocolate',  icon: '🍫' },
  { value: 'wine',       label: 'Wine',       icon: '🍷' },
  { value: 'jewelry',    label: 'Jewelry',    icon: '💎' },
  { value: 'experience', label: 'Experience', icon: '✨' },
  { value: 'other',      label: 'Other',      icon: '🎁' },
]

const BLANK: GiftInsert = {
  name:        '',
  category:    'flowers',
  price:       0,
  description: null,
  image_url:   null,
}

interface Props {
  gift:    Gift | null
  onSave:  (data: GiftInsert, id?: string) => Promise<boolean>
  onClose: () => void
}

export default function GiftForm({ gift, onSave, onClose }: Props) {
  const [form, setForm] = useState<GiftInsert & { price_str: string }>(
    gift
      ? {
          name:        gift.name,
          category:    gift.category,
          price:       gift.price,
          price_str:   String(gift.price),
          description: gift.description ?? '',
          image_url:   gift.image_url ?? '',
        }
      : { ...BLANK, price_str: '', description: '', image_url: '' }
  )
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function setField<K extends keyof GiftInsert>(field: K, value: GiftInsert[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const price = parseFloat(form.price_str)
    if (!form.name.trim())  { setError('Name is required.'); return }
    if (isNaN(price) || price < 0) { setError('Enter a valid price.'); return }
    setError(null); setSaving(true)
    const payload: GiftInsert = {
      name:        form.name.trim(),
      category:    form.category,
      price,
      description: form.description?.trim() || null,
      image_url:   form.image_url?.trim() || null,
    }
    const ok = await onSave(payload, gift?.id)
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
          .price-input { padding-left: 28px !important; }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 sticky top-0 bg-white z-10"
          style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <p className="text-xs font-medium tracking-widest uppercase mb-0.5" style={{ color: 'var(--forest)' }}>
              {gift ? 'Edit' : 'New'}
            </p>
            <h2 className="font-display text-xl font-medium" style={{ color: 'var(--ink)' }}>
              {gift ? 'Edit Gift' : 'Add Gift'}
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

          {/* Name */}
          <Field label="Gift Name" required>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Premium Rose Bouquet"
              required
              className="field-input"
            />
          </Field>

          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Category */}
          <Field label="Category" required>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setField('category', value)}
                  className="py-2 px-1 text-xs font-medium cursor-pointer border transition-colors flex items-center justify-center gap-1.5"
                  style={{
                    background:  form.category === value ? 'var(--forest)' : 'var(--off-white)',
                    borderColor: form.category === value ? 'var(--forest)' : 'var(--border)',
                    color:       form.category === value ? '#fff' : 'var(--ink-soft)',
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

          {/* Price */}
          <Field label="Price (€)" required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
                style={{ color: 'var(--ink-muted)' }}>€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price_str}
                onChange={e => setForm(prev => ({ ...prev, price_str: e.target.value }))}
                placeholder="0.00"
                required
                className="field-input price-input"
              />
            </div>
          </Field>

          <div className="h-px" style={{ background: 'var(--border)' }} />

          {/* Description */}
          <Field label="Description">
            <textarea
              value={form.description ?? ''}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the gift…"
              className="field-textarea"
            />
          </Field>

          {/* Image URL */}
          <Field label="Image URL">
            <input
              type="url"
              value={form.image_url ?? ''}
              onChange={e => setForm(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="field-input"
            />
            {form.image_url && (
              <div className="mt-2 overflow-hidden" style={{ height: '80px', border: '1px solid var(--border)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
              </div>
            )}
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-2 mt-auto">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 text-xs font-medium tracking-widest uppercase cursor-pointer border transition-colors"
              style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--ink-soft)', fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
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
              {gift ? 'Save Changes' : 'Add Gift'}
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
