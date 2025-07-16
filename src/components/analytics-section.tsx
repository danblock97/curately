'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, Link, MousePointer, Users, Globe } from 'lucide-react'

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
    value: '847,329',
    change: '+12.5%',
    icon: <MousePointer className="w-5 h-5" />,
    color: 'text-blue-400'
  },
  {
    title: 'Active Links',
    value: '2,847',
    change: '+8.2%',
    icon: <Link className="w-5 h-5" />,
    color: 'text-green-400'
  },
  {
    title: 'Unique Visitors',
    value: '124,891',
    change: '+15.3%',
    icon: <Users className="w-5 h-5" />,
    color: 'text-purple-400'
  },
  {
    title: 'Global Reach',
    value: '89 Countries',
    change: '+3 new',
    icon: <Globe className="w-5 h-5" />,
    color: 'text-orange-400'
  }
]

export function AnalyticsSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
            ANALYTICS
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Insights that drive your growth
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Track every click, understand your audience, and optimize your link strategy with powerful analytics
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((metric, index) => (
            <Card key={index} className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg bg-gray-700/50 ${metric.color}`}>
                    {metric.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">{metric.value}</div>
                    <div className="text-sm text-green-400 flex items-center justify-end">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {metric.change}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-gray-400">{metric.title}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Line Chart */}
          <Card className="lg:col-span-2 bg-gray-800/50 border-gray-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Click Performance</span>
              </CardTitle>
              <p className="text-gray-400">Monthly clicks and link creation over time</p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clicksData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#F9FAFB'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#3B82F6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="links" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#10B981' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Side Stats */}
          <div className="space-y-6">
            {/* Top Performing Links */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Top Performing Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Portfolio Site', clicks: '12,847', percentage: '24%' },
                  { name: 'GitHub Profile', clicks: '8,293', percentage: '16%' },
                  { name: 'Latest Blog Post', clicks: '6,847', percentage: '13%' },
                  { name: 'Contact Form', clicks: '5,293', percentage: '10%' }
                ].map((link, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{link.name}</div>
                      <div className="text-gray-400 text-sm">{link.clicks} clicks</div>
                    </div>
                    <div className="text-blue-400 font-bold">{link.percentage}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Geographic Distribution */}
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white text-lg">Top Countries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { country: 'United States', percentage: '32%', flag: '🇺🇸' },
                  { country: 'United Kingdom', percentage: '18%', flag: '🇬🇧' },
                  { country: 'Canada', percentage: '12%', flag: '🇨🇦' },
                  { country: 'Australia', percentage: '8%', flag: '🇦🇺' },
                  { country: 'Germany', percentage: '7%', flag: '🇩🇪' }
                ].map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-white">{country.country}</span>
                    </div>
                    <div className="text-blue-400 font-bold">{country.percentage}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button className="bg-white hover:bg-gray-100 text-black px-8 py-3 rounded-lg font-semibold">
            Start tracking your links
          </Button>
        </div>
      </div>
    </section>
  )
}