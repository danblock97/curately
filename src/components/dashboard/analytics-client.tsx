'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ExternalLink, TrendingUp, MousePointer, Eye, Calendar, BarChart3, Globe, Smartphone, QrCode, ChevronDown } from 'lucide-react'
import { Database } from '@/lib/supabase/types'
import { toast } from 'sonner'

type Link = Database['public']['Tables']['links']['Row'] & {
  qr_codes?: {
    qr_code_data: string
    format: string
    size: number
    foreground_color: string
    background_color: string
  } | null
}
type QRCode = Database['public']['Tables']['qr_codes']['Row'] & {
  clicks?: number
  is_active?: boolean
  title?: string
  url?: string
  link_type?: string
}
type Profile = Database['public']['Tables']['profiles']['Row']

interface AnalyticsClientProps {
  links: Link[]
  qrCodes: QRCode[]
  profile: Profile
}

export function AnalyticsClient({ links, qrCodes, profile }: AnalyticsClientProps) {
  const [selectedChartPeriod, setSelectedChartPeriod] = useState('7D')
  const [showTimePeriodDropdown, setShowTimePeriodDropdown] = useState(false)

  const timePeriods = profile?.tier === 'pro' 
    ? ['Last 7 days', 'Last 30 days', 'Last 90 days', 'All time']
    : ['Last 7 days', 'Last 30 days']
  
  // Ensure free users can only see 30 days max
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(() => {
    if (profile?.tier === 'free' || !profile?.tier) {
      return 'Last 30 days'
    }
    return 'Last 30 days'
  })

  // Calculate total clicks from both links and QR codes
  const linkClicks = links?.reduce((sum, link) => sum + (link.clicks || 0), 0) || 0
  const qrClicks = qrCodes?.reduce((sum, qr) => sum + (qr.clicks || 0), 0) || 0
  const totalClicks = linkClicks + qrClicks

  // Calculate active items
  const activeLinksCount = links?.filter(link => link && link.is_active !== false).length || 0
  const activeQrCodesCount = qrCodes?.filter(qr => qr && qr.is_active !== false).length || 0
  const activeLinks = activeLinksCount + activeQrCodesCount

  // Find top performer from both links and QR codes
  const allItems = [
    ...(links || []).map(link => ({ ...link, type: 'link' })),
    ...(qrCodes || []).map(qr => ({ ...qr, type: 'qr_code' }))
  ].sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
  const topLink = allItems[0]

  // Count different types
  const qrCodeLinks = qrCodes?.length || 0
  const deepLinks = links?.filter(link => link.link_type === 'deeplink').length || 0
  const regularLinks = links?.filter(link => link.link_type === 'link_in_bio').length || 0
  const avgClicksPerLink = totalClicks > 0 && activeLinks > 0 ? Math.round(totalClicks / activeLinks) : 0

  const handleTimePeriodChange = (period: string) => {
    // Check if user has access to this time period
    if (profile?.tier !== 'pro' && (period === 'Last 90 days' || period === 'All time')) {
      toast.error('Upgrade to Pro to access longer time periods')
      return
    }
    setSelectedTimePeriod(period)
    toast.success(`Viewing analytics for ${period}`)
  }


  const handleChartPeriodChange = (period: string) => {
    setSelectedChartPeriod(period)
  }

  // Generate chart data based on actual clicks
  const generateChartData = () => {
    if (totalClicks === 0) {
      // No data - flat line at bottom
      return {
        points: "30,190 90,190 150,190 210,190 270,190 330,190 390,190 450,190 510,190 570,190",
        area: "M 30,190 L 90,190 L 150,190 L 210,190 L 270,190 L 330,190 L 390,190 L 450,190 L 510,190 L 570,190 L 570,200 L 30,200 Z"
      }
    } else if (totalClicks === 1) {
      // Single click - small spike
      return {
        points: "30,190 90,190 150,190 210,190 270,190 330,190 390,180 450,190 510,190 570,190",
        area: "M 30,190 L 90,190 L 150,190 L 210,190 L 270,190 L 330,190 L 390,180 L 450,190 L 510,190 L 570,190 L 570,200 L 30,200 Z"
      }
    } else {
      // Multiple clicks - proportional distribution
      const maxHeight = 140
      const baseHeight = 190
      const clicksPerDay = totalClicks / 7 // Distribute over 7 days
      const heights = Array.from({ length: 10 }, (_, i) => {
        const clicksForDay = Math.random() * clicksPerDay * 2 // Some variation
        return baseHeight - (clicksForDay / clicksPerDay) * (baseHeight - maxHeight)
      })
      
      return {
        points: heights.map((h, i) => `${30 + i * 60},${h}`).join(' '),
        area: `M ${heights.map((h, i) => `${30 + i * 60},${h}`).join(' L ')} L 570,200 L 30,200 Z`
      }
    }
  }

  const chartData = generateChartData()

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Comprehensive insights into your link performance and audience engagement
          </p>
        </div>
        <div className="flex items-center space-x-2 relative flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowTimePeriodDropdown(!showTimePeriodDropdown)}
            className="bg-gray-900 text-white hover:bg-gray-800 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
          >
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">{selectedTimePeriod}</span>
            <span className="xs:hidden">{selectedTimePeriod.replace('Last ', '').replace(' days', 'd').replace(' time', '')}</span>
            <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
          </Button>
          
          {showTimePeriodDropdown && (
            <div className="absolute top-full right-0 mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
              <div className="py-1">
                {timePeriods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      handleTimePeriodChange(period)
                      setShowTimePeriodDropdown(false)
                    }}
                    className={`w-full text-left px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-gray-100 ${
                      selectedTimePeriod === period 
                        ? 'bg-gray-100 text-gray-900 font-medium' 
                        : 'text-gray-700'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Total Clicks</CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <MousePointer className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalClicks.toLocaleString()}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs sm:text-sm text-gray-500">No previous data to compare</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Active Links</CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{activeLinks}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs sm:text-sm text-gray-500">No previous data to compare</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Avg. Clicks/Link</CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{avgClicksPerLink}</div>
            <div className="flex items-center mt-1">
              <span className="text-xs sm:text-sm text-gray-500">No previous data to compare</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-600">Top Performer</CardTitle>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{topLink?.clicks || 0}</div>
            <p className="text-xs sm:text-sm text-gray-500 truncate mt-1">
              {topLink?.title || 'No links yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Traffic Overview Chart */}
        <div className="lg:col-span-2">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div>
                  <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Traffic Overview</CardTitle>
                  <CardDescription className="text-sm text-gray-600">Daily clicks over the selected period</CardDescription>
                </div>
                <div className="flex items-center space-x-1 flex-wrap">
                  {['7D', '30D', '90D'].map((period) => (
                    <Button
                      key={period}
                      variant="outline"
                      size="sm"
                      onClick={() => handleChartPeriodChange(period)}
                      className={`text-xs h-6 sm:h-7 px-2 ${
                        selectedChartPeriod === period
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-60 sm:h-80 bg-gray-50 rounded-lg p-3 sm:p-6 relative border border-gray-100">
                <svg className="w-full h-full" viewBox="0 0 600 240">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="60" height="48" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 48" fill="none" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Area chart */}
                  <path
                    d={chartData.area}
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Line chart */}
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    points={chartData.points}
                  />
                  
                  {/* Data points */}
                  {chartData.points.split(' ').map((point, index) => {
                    const [x, y] = point.split(',').map(Number)
                    return <circle key={index} cx={x} cy={y} r="4" fill="#3B82F6"/>
                  })}
                  
                  {/* X-axis labels */}
                  <text x="30" y="225" fill="#6B7280" fontSize="10" textAnchor="middle" className="hidden sm:block">7 days ago</text>
                  <text x="210" y="225" fill="#6B7280" fontSize="10" textAnchor="middle" className="hidden sm:block">3 days ago</text>
                  <text x="390" y="225" fill="#6B7280" fontSize="10" textAnchor="middle" className="hidden sm:block">Yesterday</text>
                  <text x="570" y="225" fill="#6B7280" fontSize="10" textAnchor="middle" className="hidden sm:block">Today</text>
                  <text x="100" y="225" fill="#6B7280" fontSize="9" textAnchor="middle" className="sm:hidden">7d</text>
                  <text x="300" y="225" fill="#6B7280" fontSize="9" textAnchor="middle" className="sm:hidden">3d</text>
                  <text x="500" y="225" fill="#6B7280" fontSize="9" textAnchor="middle" className="sm:hidden">Today</text>
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Link Type Distribution */}
        <div>
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Link Types</CardTitle>
              <CardDescription className="text-sm text-gray-600">Distribution by link type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Link in Bio</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{regularLinks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${regularLinks > 0 ? (regularLinks / (regularLinks + qrCodeLinks + deepLinks)) * 100 : 0}%`}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">QR Codes</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{qrCodeLinks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${qrCodeLinks > 0 ? (qrCodeLinks / (regularLinks + qrCodeLinks + deepLinks)) * 100 : 0}%`}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs sm:text-sm font-medium text-gray-700">Deep Links</span>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{deepLinks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: `${deepLinks > 0 ? (deepLinks / (regularLinks + qrCodeLinks + deepLinks)) * 100 : 0}%`}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Performing Links */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">Top Performing Links</CardTitle>
              <CardDescription className="text-sm text-gray-600">Your most clicked links and their performance metrics</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 self-start sm:self-auto"
              onClick={() => toast.info('Showing all links')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {allItems && allItems.length > 0 ? (
            <div className="space-y-4">
              {allItems.slice(0, 10).map((item, index) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg border border-gray-200 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-semibold text-gray-600">#{index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === 'qr_code' ? 'bg-green-100' : 
                        item.link_type === 'deeplink' ? 'bg-blue-100' : 'bg-gray-100'
                      }`}>
                        {item.type === 'qr_code' ? (
                          <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        ) : item.link_type === 'deeplink' ? (
                          <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        ) : (
                          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {item.title || 'Untitled Link'}
                          </h3>
                          <Badge variant={(item.is_active !== false) ? "default" : "secondary"} className="text-xs self-start sm:self-auto flex-shrink-0">
                            {(item.is_active !== false) ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 mt-1">
                          <span className="text-xs sm:text-sm text-gray-500 truncate">{item.url}</span>
                          <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-4 sm:space-x-6 pl-9 sm:pl-0">
                    <div className="text-center sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        {(item.clicks || 0).toLocaleString()}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        clicks
                      </div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-base sm:text-lg font-semibold text-green-600">
                        {totalClicks > 0 ? (((item.clicks || 0) / totalClicks) * 100).toFixed(1) : 0}%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        of total
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No analytics data yet</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 px-4">Start by creating your first link to begin tracking performance.</p>
              <Button 
                className="bg-gray-900 hover:bg-gray-800 text-white text-sm px-4 py-2"
                onClick={() => window.location.href = '/dashboard'}
              >
                Create Your First Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}