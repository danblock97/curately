import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LinkManager } from '@/components/dashboard/link-manager'
import { ProfileSetup } from '@/components/dashboard/profile-setup'
import { InactiveContentManager } from '@/components/dashboard/inactive-content-manager'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: pages } = await supabase
    .from('pages')
    .select('*')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', user.id)
    .order('order', { ascending: true })

  const { data: qrCodes } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', user.id)
    .order('order_index', { ascending: true })

  // If no profile exists or no pages exist, show profile setup
  if (!profile || !pages || pages.length === 0) {
    return <ProfileSetup userId={user.id} />
  }

  return (
    <div className="w-full space-y-6">
      {/* Upgrade Banner for Free Users */}
      {profile.tier === 'free' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ready to unlock more features?</h3>
              <p className="text-gray-600 mt-1">
                Upgrade to Pro for 50 links, 50 QR codes, 2 pages, and advanced analytics
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 whitespace-nowrap ml-4"
            >
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}

      <LinkManager 
        links={(links || []).filter(Boolean)} 
        qrCodes={(qrCodes || []).filter(Boolean)}
        userId={user.id} 
        profile={profile} 
        pages={pages || []}
      />
      <InactiveContentManager profile={profile} />
    </div>
  )
}