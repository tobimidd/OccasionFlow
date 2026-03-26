import { createClient } from '@/lib/supabase/server'
import GiftsClient from './GiftsClient'
import type { Gift } from '@/types/database'

export default async function GiftsPage() {
  const supabase = await createClient()

  const { data: gifts, error } = await supabase
    .from('gifts')
    .select('*')
    .order('name', { ascending: true })

  return (
    <GiftsClient
      initialGifts={(gifts as Gift[]) ?? []}
      error={error?.message ?? null}
    />
  )
}
