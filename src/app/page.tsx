// Landing page — to be migrated from index.html
// For now, serve the static file via Next.js redirect or build out here.
import { redirect } from 'next/navigation'

export default function Home() {
  // TODO: Migrate index.html content to this page
  redirect('/dashboard')
}
