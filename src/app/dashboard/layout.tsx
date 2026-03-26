import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/DashboardShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'
  const initial = name.charAt(0).toUpperCase()

  return (
    <DashboardShell user={{ email: user.email ?? '', name, initial }}>
      {children}
    </DashboardShell>
  )
}
