import { createClient } from '@/lib/supabase/server'
import { LandingPage } from '@/components/landing-page'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Allow both authenticated and non-authenticated users to view the homepage
  return <LandingPage />
}