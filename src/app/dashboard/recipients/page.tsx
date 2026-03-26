import { createClient } from '@/lib/supabase/server'
import RecipientsClient from './RecipientsClient'
import type { Recipient } from '@/types/database'

export default async function RecipientsPage() {
  const supabase = await createClient()

  const { data: recipients, error } = await supabase
    .from('recipients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <RecipientsClient
      initialRecipients={(recipients as Recipient[]) ?? []}
      error={error?.message ?? null}
    />
  )
}
