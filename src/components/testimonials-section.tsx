'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Testimonial {
  id: number
  name: string
  avatar: string
  rating: number
  title: string
  content: string
  initials: string
  bgColor: string
}

const topRowTestimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Art-Milan Mazaud',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Better than anything I\'ve tested before.',
    content: 'Using a tool like Curately changes everything in terms of conversion rate when using social media to get clients. Not only does the tool work perfectly, but the interface is also well-designed, clear, and ergonomic.',
    initials: 'AM',
    bgColor: 'bg-blue-500'
  },
  {
    id: 2,
    name: 'Loic Ifly',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'An incredible interface...',
    content: 'An incredible interface and a truly useful tool. It\'s just perfect. Plus, customer service is available and responds very quickly to all your questions—thank you again :)',
    initials: 'LI',
    bgColor: 'bg-red-500'
  },
  {
    id: 3,
    name: 'Théo Gouman',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Curately is the best tool I\'ve invested in',
    content: 'I used Bitly for a long time—it was too complicated and not very aesthetic. Curately is much more intuitive and the interface is clean and professional.',
    initials: 'TG',
    bgColor: 'bg-gray-700'
  },
  {
    id: 4,
    name: 'Sarah Mitchell',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Game-changer for my business',
    content: 'Curately has completely transformed how I share my content. The analytics are incredible and the design options are endless. Highly recommended!',
    initials: 'SM',
    bgColor: 'bg-green-500'
  },
  {
    id: 5,
    name: 'David Chen',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Perfect solution for creators',
    content: 'As a content creator, I need something that works seamlessly across all platforms. Curately delivers exactly that with beautiful design and powerful features.',
    initials: 'DC',
    bgColor: 'bg-purple-500'
  }
]

const bottomRowTestimonials: Testimonial[] = [
  {
    id: 6,
    name: 'Maxime Kurdali',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'A solution I recommend to everyone around me',
    content: 'A brilliant solution that seems obvious once it\'s created. I recommend it to everyone around me. The interface is intuitive and the results are immediate.',
    initials: 'MK',
    bgColor: 'bg-teal-500'
  },
  {
    id: 7,
    name: 'VF Prod Photographie Vidéo Com',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'A tool I can\'t live without anymore...',
    content: 'A tool I can no longer do without. Easy to set up, the stats tracking is great. Super handy to link to our sales page or dedicated videos.',
    initials: 'VF',
    bgColor: 'bg-orange-500'
  },
  {
    id: 8,
    name: 'Nouhaila Kajjout',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Great solution',
    content: 'Great solution, with high-performing redirect links. This is the only SaaS I use to make my links—and it\'s proven its worth many times over.',
    initials: 'NK',
    bgColor: 'bg-pink-500'
  },
  {
    id: 9,
    name: 'Marcus Johnson',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Exceptional service and results',
    content: 'The team behind Curately really understands what creators need. The platform is constantly improving and the support is outstanding.',
    initials: 'MJ',
    bgColor: 'bg-indigo-500'
  },
  {
    id: 10,
    name: 'Elena Rodriguez',
    avatar: '/api/placeholder/40/40',
    rating: 5,
    title: 'Boosted my conversion rates significantly',
    content: 'Since switching to Curately, my click-through rates have increased by 40%. The analytics help me understand my audience better than ever.',
    initials: 'ER',
    bgColor: 'bg-yellow-500'
  }
]

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] min-w-[360px] max-w-[360px] mx-4 flex-shrink-0 group">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="w-12 h-12 flex-shrink-0 ring-2 ring-gray-100 group-hover:ring-gray-200 transition-all">
            <AvatarImage src={testimonial.avatar} />
            <AvatarFallback className={`${testimonial.bgColor} text-white font-semibold`}>
              {testimonial.initials}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-base truncate">{testimonial.name}</h4>
              <div className="flex items-center space-x-1 flex-shrink-0">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            
            <h5 className="font-semibold text-gray-900 mb-3 text-sm leading-tight">{testimonial.title}</h5>
            <p className="text-gray-600 text-sm leading-relaxed">{testimonial.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ScrollingRow({ testimonials, direction }: { testimonials: Testimonial[], direction: 'left' | 'right' }) {
  // Duplicate testimonials for infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials, ...testimonials]
  
  return (
    <div className="relative overflow-hidden">
      <div 
        className={`flex ${direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'}`}
        style={{
          width: `${duplicatedTestimonials.length * 392}px` // 360px card + 32px margin
        }}
      >
        {duplicatedTestimonials.map((testimonial, index) => (
          <TestimonialCard key={`${testimonial.id}-${index}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  )
}

export function TestimonialsSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token')
      setIsAuthenticated(!!token)
    }
    
    checkAuth()
  }, [])

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="text-center mb-16 px-4">
        <Badge variant="outline" className="mb-4 bg-green-100 text-green-700 border-green-200">
          TESTIMONIALS
        </Badge>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Loved by creators worldwide
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          See what our users have to say about their experience with Curately
        </p>
      </div>

      {/* Scrolling Testimonials */}
      <div className="space-y-8">
        {/* Top Row - Moving Left */}
        <ScrollingRow testimonials={topRowTestimonials} direction="left" />
        
        {/* Bottom Row - Moving Right */}
        <ScrollingRow testimonials={bottomRowTestimonials} direction="right" />
      </div>
      
      {/* Call to Action */}
      <div className="text-center mt-16 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-2xl mx-auto shadow-lg">
          {isAuthenticated ? (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to get back to work?
              </h3>
              <p className="text-gray-600 mb-6">
                Continue building your perfect link-in-bio page and managing your links with Curately.
              </p>
              <div className="flex justify-center">
                <Link href="/dashboard">
                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors group inline-flex items-center">
                    Open Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to join them?
              </h3>
              <p className="text-gray-600 mb-6">
                Start creating your perfect link-in-bio page today and see why thousands of creators trust Curately.
              </p>
              <div className="flex justify-center">
                <Link href="/auth">
                  <button className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                    Get Started Free
                  </button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}