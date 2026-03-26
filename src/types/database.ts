export type Relationship = 'partner' | 'parent' | 'friend' | 'sibling' | 'colleague' | 'other'
export type OccasionType = 'birthday' | 'anniversary' | 'wedding' | 'holiday' | 'christmas' | 'valentines_day' | 'mothers_day' | 'fathers_day' | 'other'

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
  country: string        // ISO 3166-1 alpha-2 code, e.g. 'DE'
  state_region: string | null
  created_at: string
  updated_at: string
}

// user_id injected at save time (see RecipientsClient); nullable fields use '' in form state
export type RecipientInsert = Omit<Recipient, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type RecipientUpdate = Partial<RecipientInsert>

export interface Occasion {
  id: string
  user_id: string
  recipient_id: string
  occasion_type: OccasionType
  occasion_date: string   // ISO date string YYYY-MM-DD
  recurring: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export type OccasionInsert = Omit<Occasion, 'id' | 'user_id' | 'created_at' | 'updated_at'>
export type OccasionUpdate = Partial<OccasionInsert>

export type GiftCategory = 'flowers' | 'chocolate' | 'wine' | 'jewelry' | 'experience' | 'other'

export interface Gift {
  id: string
  name: string
  category: GiftCategory
  price: number
  description: string | null
  image_url: string | null
  created_at: string
  updated_at: string
}

// Shared catalogue — no user_id
export type GiftInsert = Omit<Gift, 'id' | 'created_at' | 'updated_at'>
