'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Link, 
  TrendingUp, 
  Star, 
  BarChart3, 
  Zap, 
  Shield,
  Users,
  Globe,
  Target,
  Sparkles
} from 'lucide-react'

const advantages = [
  {
    icon: <Link className="w-8 h-8" />,
    title: 'All Your Links in One Place',
    description: 'Centralize your entire online presence. No more scattered links across different platforms - everything your audience needs in one beautiful, organized location.',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    iconBg: 'bg-blue-500/20'
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: 'Higher Conversion Rates',
    description: 'Streamlined user experience leads to better engagement. Users are 3x more likely to complete actions when they find what they need quickly.',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    iconBg: 'bg-green-500/20'
  },
  {
    icon: <Star className="w-8 h-8" />,
    title: 'Professional Brand Image',
    description: 'Custom themes, branded layouts, and professional presentation. Make a lasting impression that reflects your personal or business brand.',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    iconBg: 'bg-purple-500/20'
  },
  {
    icon: <BarChart3 className="w-8 h-8" />,
    title: 'Comprehensive Link Tracking',
    description: 'Monitor every click, view, and interaction. Understand your audience behavior with detailed analytics and insights.',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    iconBg: 'bg-orange-500/20'
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'One Link for Multiple Purposes',
    description: 'Single bio link that adapts to different platforms. Share once, work everywhere - from Instagram to LinkedIn to business cards.',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    iconBg: 'bg-yellow-500/20'
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Enhanced Security & Reliability',
    description: 'Enterprise-grade security with 99.9% uptime guarantee. Your links are protected with SSL encryption and DDoS protection.',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    iconBg: 'bg-red-500/20'
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Better User Experience',
    description: 'Fast loading, mobile-optimized, and intuitive design. Your audience gets the best experience across all devices and platforms.',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    iconBg: 'bg-cyan-500/20'
  },
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Global Reach & Accessibility',
    description: 'CDN-powered delivery ensures fast loading worldwide. Accessible design standards make your content available to everyone.',
    color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    iconBg: 'bg-indigo-500/20'
  },
  {
    icon: <Target className="w-8 h-8" />,
    title: 'Targeted Content Delivery',
    description: 'Smart routing based on user location, device, and preferences. Deliver the right content to the right audience at the right time.',
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    iconBg: 'bg-pink-500/20'
  }
]

export function AdvantagesSection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 bg-purple-500/20 text-purple-400 border-purple-500/30">
            ADVANTAGES
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why choose Curately for your links?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your online presence with powerful features designed to boost engagement, 
            improve conversions, and provide deep insights into your audience
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {advantages.map((advantage, index) => (
            <Card 
              key={index} 
              className="group bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl ${advantage.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={advantage.color.split(' ')[1]}>
                    {advantage.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gray-100 transition-colors">
                  {advantage.title}
                </h3>
                
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
                  {advantage.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-white mb-2">3x</div>
              <div className="text-blue-400 font-semibold mb-2">Higher Conversion</div>
              <div className="text-gray-400 text-sm">Compared to scattered links</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-white mb-2">99.9%</div>
              <div className="text-green-400 font-semibold mb-2">Uptime Guarantee</div>
              <div className="text-gray-400 text-sm">Enterprise-grade reliability</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="text-4xl font-bold text-white mb-2">50ms</div>
              <div className="text-purple-400 font-semibold mb-2">Average Load Time</div>
              <div className="text-gray-400 text-sm">Lightning-fast performance</div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Highlight */}
        <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-gray-600 backdrop-blur-sm">
          <CardContent className="p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    FEATURED
                  </Badge>
                </div>
                <h3 className="text-3xl font-bold text-white mb-6">
                  Smart Link Intelligence
                </h3>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Our AI-powered system learns from your audience behavior to automatically optimize 
                  link placement, suggest content improvements, and maximize engagement rates.
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-semibold">
                  Learn More About AI Features
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                <div className="relative bg-gray-900/50 rounded-3xl p-8 border border-gray-700">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium">AI analyzing user behavior...</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium">Optimizing link placement...</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-white font-medium">Suggesting improvements...</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 mt-6">
                      <div className="text-sm text-gray-400 mb-2">Conversion Rate</div>
                      <div className="text-2xl font-bold text-white">+47%</div>
                      <div className="text-sm text-green-400">↑ This week</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <Button className="bg-white hover:bg-gray-100 text-black px-8 py-4 rounded-lg font-semibold text-lg">
            Get Started with Curately
          </Button>
          <p className="text-gray-400 mt-4">Join thousands of creators already using Curately</p>
        </div>
      </div>
    </section>
  )
}