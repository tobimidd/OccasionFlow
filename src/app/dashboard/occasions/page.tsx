import { createClient } from '@/lib/supabase/server'
import OccasionsClient from './OccasionsClient'
import type { Occasion, Recipient } from '@/types/database'

export default async function OccasionsPage() {
  const supabase = await createClient()

  const [{ data: occasions, error }, { data: recipients }] = await Promise.all([
    supabase
      .from('occasions')
      .select('*')
      .order('occasion_date', { ascending: true }),
    supabase
      .from('recipients')
      .select('id, full_name, relationship')
      .order('full_name', { ascending: true }),
  ])

  return (
    <OccasionsClient
      initialOccasions={(occasions as Occasion[]) ?? []}
      recipients={(recipients as Pick<Recipient, 'id' | 'full_name' | 'relationship'>[]) ?? []}
      error={error?.message ?? null}
    />
  )
}
