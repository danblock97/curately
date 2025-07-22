'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send, CheckCircle, AlertCircle, Zap } from 'lucide-react'
import emailjs from '@emailjs/browser'

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userTier, setUserTier] = useState<'free' | 'pro' | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    userTier: 'free'
  })

  // Check authentication and user tier on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setIsAuthenticated(true)
          setUserEmail(user.email || '')
          
          // Fetch user profile to get tier
          const { data: profile } = await supabase
            .from('profiles')
            .select('tier')
            .eq('id', user.id)
            .single()
          
          const tier = profile?.tier as 'free' | 'pro' || 'free'
          setUserTier(tier)
          
          setFormData(prev => ({
            ...prev,
            email: user.email || '',
            userTier: tier
          }))
        } else {
          setIsAuthenticated(false)
          setUserTier(null)
          setUserEmail('')
        }
      } catch (err) {
        console.error('Error fetching user data:', err)
        setIsAuthenticated(false)
        setUserTier(null)
        setUserEmail('')
      }
    }
    
    checkAuth()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS configuration is missing. Please check your environment variables.')
      }

      // Prepare email data with Pro user identification
      const emailData = {
        from_name: formData.name,
        from_email: formData.email,
        subject: userTier === 'pro' ? `[PRO USER] ${formData.subject}` : formData.subject,
        message: formData.message,
        user_tier: userTier || 'free',
        is_authenticated: isAuthenticated,
        priority: userTier === 'pro' ? 'high' : 'normal',
        // Additional context for support team
        support_context: {
          userTier: userTier,
          isLoggedIn: isAuthenticated,
          submissionTime: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      }

      await emailjs.send(
        serviceId,
        templateId,
        emailData,
        publicKey
      )

      setIsSuccess(true)
      setFormData({
        name: '',
        email: userEmail, // Keep user email if authenticated
        subject: '',
        message: '',
        userTier: userTier || 'free'
      })
    } catch (err) {
      console.error('Error sending email:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Message sent successfully!</h3>
        <p className="text-gray-600 mb-6">
          {userTier === 'pro' 
            ? "Thanks for reaching out! As a Pro user, we'll respond within 4 hours."
            : "Thanks for reaching out! We'll get back to you within 24 hours."
          }
        </p>
        <Button onClick={() => setIsSuccess(false)} variant="outline">
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pro User Badge */}
      {isAuthenticated && userTier === 'pro' && (
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              PRO USER
            </Badge>
            <span className="text-sm font-medium text-gray-700">Priority Support</span>
          </div>
          <span className="text-xs text-gray-600">Response within 4 hours</span>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-3">
          Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white hover:border-gray-300"
          placeholder="Your full name"
        />
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3">
          Email *
        </label>
        <div className="relative">
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={`w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white hover:border-gray-300 ${
              isAuthenticated ? 'cursor-not-allowed opacity-75' : ''
            }`}
            placeholder="your.email@example.com"
            disabled={isAuthenticated}
          />
          {isAuthenticated && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>
        {isAuthenticated && (
          <p className="text-xs text-green-600 mt-2 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Using your verified account email</span>
          </p>
        )}
      </div>

      {/* Subject Field */}
      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-gray-800 mb-3">
          Subject *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleInputChange}
          required
          className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white hover:border-gray-300"
          placeholder="What can we help you with?"
        />
        {userTier === 'pro' && (
          <p className="text-xs text-purple-600 mt-2 flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Your message will be automatically marked as priority support</span>
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-800 mb-3">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          rows={6}
          className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white hover:border-gray-300 resize-vertical"
          placeholder="Please describe your question or issue in detail..."
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Sending your message...</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Send Message</span>
          </>
        )}
      </Button>

      {/* Footer Note */}
      <div className="bg-gray-100 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">
          We typically respond within <span className="font-semibold text-gray-900">{userTier === 'pro' ? '4 hours' : '24 hours'}</span>.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Your information is kept private and secure.
        </p>
      </div>
    </form>
  )
}