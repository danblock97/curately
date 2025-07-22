'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'


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
          Join Our Community
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Be among the first to share your experience with Curately
        </p>
      </div>

      {/* Be the First Message */}
      <div className="flex justify-center">
        <Card className="bg-white border border-gray-200 rounded-2xl p-12 max-w-2xl mx-4 shadow-lg text-center">
          <CardContent className="p-0">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Be the First to Share Your Experience
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Join our growing community and be among the first to leave a review. 
                Your feedback helps us improve and helps others discover Curately.
              </p>
            </div>
            <div className="flex justify-center">
              <Link href="/contact">
                <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 group inline-flex items-center shadow-lg hover:shadow-xl">
                  Leave a Review
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
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