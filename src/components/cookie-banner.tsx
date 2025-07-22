'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  getCookieConsent, 
  setCookieConsent, 
  getCookiePreferences,
  setCookiePreferences,
  DEFAULT_COOKIE_PREFERENCES,
  type CookiePreferences,
  initializeAnalytics,
  initializeMarketing
} from '@/lib/cookies'
import { Cookie, Settings, X, Check, Shield } from 'lucide-react'
import Link from 'next/link'

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_COOKIE_PREFERENCES)

  useEffect(() => {
    const consent = getCookieConsent()
    if (consent === null) {
      setShowBanner(true)
    }
    setPreferences(getCookiePreferences())
  }, [])

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }
    setCookieConsent(true)
    setCookiePreferences(allAccepted)
    setShowBanner(false)
    initializeAnalytics()
    initializeMarketing()
  }

  const handleRejectAll = () => {
    setCookieConsent(true)
    setCookiePreferences(DEFAULT_COOKIE_PREFERENCES)
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    setCookieConsent(true)
    setCookiePreferences(preferences)
    setShowBanner(false)
    setShowSettings(false)
    
    if (preferences.analytics) initializeAnalytics()
    if (preferences.marketing) initializeMarketing()
  }

  const handlePreferenceChange = (type: keyof CookiePreferences, enabled: boolean) => {
    if (type === 'necessary') return // Necessary cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [type]: enabled
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
      
      {/* Banner */}
      <div className="fixed bottom-6 left-6 right-6 md:left-8 md:right-8 z-50">
        <Card className="bg-white border border-gray-200 shadow-xl max-w-4xl mx-auto">
          <CardContent className="p-6">
            {!showSettings ? (
              /* Main Banner */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Cookie className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Cookie Settings</h3>
                      <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 border-0 text-xs">
                        PRIVACY NOTICE
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRejectAll}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies to enhance your experience, analyze site usage, and assist with marketing. 
                    Necessary cookies are always enabled to ensure the site functions properly.
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Your privacy is important to us.</span>
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                      Read our Privacy Policy
                    </Link>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(true)}
                    className="flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Customize</span>
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={handleRejectAll}
                      className="flex-1 sm:flex-none"
                    >
                      Reject All
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      Accept All
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Settings Panel */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Cookie Preferences</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSettings(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Necessary Cookies */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900">Necessary</h4>
                        <Badge variant="secondary" className="text-xs">Required</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Essential for the website to function properly. Cannot be disabled.
                      </p>
                    </div>
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-green-500" />
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Analytics</h4>
                      <p className="text-sm text-gray-600">
                        Help us understand how visitors use our website to improve user experience.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('analytics', !preferences.analytics)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.analytics ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.analytics ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Marketing</h4>
                      <p className="text-sm text-gray-600">
                        Used to deliver personalized advertisements and track campaign effectiveness.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('marketing', !preferences.marketing)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.marketing ? 'bg-purple-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.marketing ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  {/* Functional Cookies */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">Functional</h4>
                      <p className="text-sm text-gray-600">
                        Enable enhanced functionality and personalization features.
                      </p>
                    </div>
                    <button
                      onClick={() => handlePreferenceChange('functional', !preferences.functional)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        preferences.functional ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.functional ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setShowSettings(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePreferences}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Save Preferences
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}