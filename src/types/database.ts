export type Relationship = 'partner' | 'parent' | 'friend' | 'sibling' | 'colleague' | 'other'

export interface Recipient {
  id: string
  user_id: string
  full_name: string
  relationship: Relationship
  email: string | null
  phone: string | null
  address_line1: string
  address_line2: string | null
  city: string
  postal_code: string
  country: string
  created_at: string
  updated_at: string
}

export type RecipientInsert = Omit<Recipient, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type RecipientUpdate = Partial<RecipientInsert>
