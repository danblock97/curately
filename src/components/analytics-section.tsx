'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, Link, MousePointer, Users, Globe, QrCode, ExternalLink } from 'lucide-react'

// Dummy data for the analytics
const clicksData = [
  { name: 'Jan', clicks: 4000, links: 240 },
  { name: 'Feb', clicks: 3000, links: 198 },
  { name: 'Mar', clicks: 5000, links: 280 },
  { name: 'Apr', clicks: 7800, links: 390 },
  { name: 'May', clicks: 5900, links: 350 },
  { name: 'Jun', clicks: 8400, links: 420 },
  { name: 'Jul', clicks: 9200, links: 460 },
  { name: 'Aug', clicks: 11000, links: 520 },
  { name: 'Sep', clicks: 12000, links: 580 },
  { name: 'Oct', clicks: 13500, links: 640 },
  { name: 'Nov', clicks: 14800, links: 700 },
  { name: 'Dec', clicks: 16200, links: 780 }
]

const metrics = [
  {
    title: 'Total Clicks',
    value: '12,847',
    change: 'All time',
    icon: <MousePointer className="w-5 h-5" />,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    title: 'Active Links',
    value: '18',
    change: 'Currently active',
    icon: <Link className="w-5 h-5" />,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600'
  },
  {
    title: 'Avg. Clicks/Link',
    value: '714',
    change: 'Per link average',
    icon: <TrendingUp className="w-5 h-5" />,
    bgColor: 'bg-purple-100',
    iconColor: 'text-purple-600'
  },
  {
    title: 'Top Performer',
    value: '3,249',
    change: 'Portfolio website',
    icon: <Globe className="w-5 h-5" />,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-600'
  }
]

export function AnalyticsSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            ANALYTICS
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Track your link performance
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Monitor click counts, see your top performing links, and track your growth over time with powerful analytics
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                  <div className="text-sm font-medium text-gray-600">{metric.title}</div>
                  <div className={`w-8 h-8 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                    <div className={metric.iconColor}>{metric.icon}</div>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-500">{metric.change}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line Chart */}
          <Card className="lg:col-span-2 bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Traffic Overview</CardTitle>
                  <p className="text-gray-600">Daily clicks over the selected period</p>
                </div>
                <div className="flex items-center space-x-1">
                  {['7D', '30D', '90D'].map((period) => (
                    <button
                      key={period}
                      className={`text-xs h-7 px-2 rounded border ${
                        period === '30D'
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gray-50 rounded-lg p-6 relative border border-gray-100">
                <svg className="w-full h-full" viewBox="0 0 600 240">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
                    </linearGradient>
                    <pattern id="grid" width="60" height="48" patternUnits="userSpaceOnUse">
                      <path d="M 60 0 L 0 0 0 48" fill="none" stroke="#E5E7EB" strokeWidth="0.5" opacity="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Area chart */}
                  <path
                    d="M 30,180 L 90,160 L 150,140 L 210,120 L 270,100 L 330,90 L 390,80 L 450,70 L 510,60 L 570,50 L 570,200 L 30,200 Z"
                    fill="url(#areaGradient)"
                  />
                  
                  {/* Line chart */}
                  <polyline
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    points="30,180 90,160 150,140 210,120 270,100 330,90 390,80 450,70 510,60 570,50"
                  />
                  
                  {/* Data points */}
                  <circle cx="30" cy="180" r="4" fill="#3B82F6"/>
                  <circle cx="90" cy="160" r="4" fill="#3B82F6"/>
                  <circle cx="150" cy="140" r="4" fill="#3B82F6"/>
                  <circle cx="210" cy="120" r="4" fill="#3B82F6"/>
                  <circle cx="270" cy="100" r="4" fill="#3B82F6"/>
                  <circle cx="330" cy="90" r="4" fill="#3B82F6"/>
                  <circle cx="390" cy="80" r="4" fill="#3B82F6"/>
                  <circle cx="450" cy="70" r="4" fill="#3B82F6"/>
                  <circle cx="510" cy="60" r="4" fill="#3B82F6"/>
                  <circle cx="570" cy="50" r="4" fill="#3B82F6"/>
                  
                  {/* X-axis labels */}
                  <text x="30" y="225" fill="#6B7280" fontSize="12" textAnchor="middle">7 days ago</text>
                  <text x="210" y="225" fill="#6B7280" fontSize="12" textAnchor="middle">3 days ago</text>
                  <text x="390" y="225" fill="#6B7280" fontSize="12" textAnchor="middle">Yesterday</text>
                  <text x="570" y="225" fill="#6B7280" fontSize="12" textAnchor="middle">Today</text>
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Side Stats */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Link Types</CardTitle>
              <p className="text-gray-600">Distribution by link type</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Link in Bio</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">14</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '70%'}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">QR Codes</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">3</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: '15%'}}></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Deep Links</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">1</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: '5%'}}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {/* Top Performing Links Table */}
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">Top Performing Links</CardTitle>
                <p className="text-gray-600">Your most clicked links and their performance metrics</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'Portfolio Website', url: 'johnsmith.dev', clicks: 3249, percentage: '25.3%', type: 'link' },
                { title: 'GitHub Profile', url: 'github.com/johnsmith', clicks: 2847, percentage: '22.1%', type: 'link' },
                { title: 'Latest Blog Post', url: 'blog.johnsmith.dev/post-1', clicks: 1893, percentage: '14.7%', type: 'link' },
                { title: 'Contact QR Code', url: 'QR Code', clicks: 1247, percentage: '9.7%', type: 'qr' },
                { title: 'Instagram Deep Link', url: 'Deep Link to Instagram', clicks: 856, percentage: '6.7%', type: 'deep' }
              ].map((link, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-white rounded-lg border border-gray-200">
                      <span className="text-sm font-semibold text-gray-600">#{index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        link.type === 'qr' ? 'bg-green-100' : 
                        link.type === 'deep' ? 'bg-purple-100' : 'bg-blue-100'
                      }`}>
                        {link.type === 'qr' ? (
                          <QrCode className="w-5 h-5 text-green-600" />
                        ) : link.type === 'deep' ? (
                          <ExternalLink className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Globe className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{link.title}</h3>
                        <p className="text-sm text-gray-500">{link.url}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{link.clicks.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">clicks</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">{link.percentage}</div>
                      <div className="text-sm text-gray-500">of total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-16">
          <Button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold">
            Start tracking your links
          </Button>
        </div>
      </div>
    </section>
  )
}