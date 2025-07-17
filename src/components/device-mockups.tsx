'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ExternalLink, Instagram, Twitter, Github, Linkedin, Youtube } from 'lucide-react'

export function DeviceMockups() {
  return (
    <div className="relative max-w-7xl mx-auto">
      {/* MacBook View - Main */}
      <div className="relative">
        {/* MacBook Outer Frame */}
        <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-2xl p-2 shadow-2xl">
          {/* MacBook Screen Frame */}
          <div className="bg-black rounded-t-xl p-1">
            {/* MacBook Top Bar */}
            <div className="bg-gray-200 rounded-t-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm hover:bg-red-600 transition-colors"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm hover:bg-yellow-600 transition-colors"></div>
                  <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm hover:bg-green-600 transition-colors"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white rounded-lg px-6 py-2 text-sm text-gray-600 border border-gray-300 shadow-sm min-w-[300px] text-center">
                    🔒 curately.com/johnsmith
                  </div>
                </div>
                <div className="w-20"></div>
              </div>
            </div>
            
            {/* MacBook Screen Content */}
            <div className="bg-black rounded-b-lg overflow-hidden">
              <div className="relative h-[600px] bg-gradient-to-br from-gray-900 via-black to-gray-900 p-16">
                {/* Desktop Layout - Centered */}
                <div className="max-w-lg mx-auto h-full flex flex-col justify-center">
                  {/* Profile Section */}
                  <div className="text-center mb-12">
                    <Avatar className="w-32 h-32 mx-auto mb-6 ring-4 ring-white/20 shadow-2xl">
                      <AvatarImage src="/api/placeholder/128/128" />
                      <AvatarFallback className="bg-blue-500 text-white text-2xl">JS</AvatarFallback>
                    </Avatar>
                    
                    <h2 className="text-3xl font-bold text-white mb-4">
                      John Smith
                    </h2>
                    <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                      Full-stack developer sharing my journey and latest projects
                    </p>
                  </div>

                  {/* Links */}
                  <div className="space-y-5 mb-12">
                    <Button
                      variant="outline"
                      className="w-full py-5 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl justify-between backdrop-blur-sm transition-all text-lg shadow-lg hover:shadow-xl"
                    >
                      <span className="font-semibold">My Portfolio</span>
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full py-5 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl justify-between backdrop-blur-sm transition-all text-lg shadow-lg hover:shadow-xl"
                    >
                      <span className="font-semibold">Latest Blog Post</span>
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full py-5 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-2xl justify-between backdrop-blur-sm transition-all text-lg shadow-lg hover:shadow-xl"
                    >
                      <span className="font-semibold">GitHub Projects</span>
                      <ExternalLink className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Social Icons */}
                  <div className="flex justify-center space-x-6">
                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm shadow-lg hover:shadow-xl">
                      <Twitter className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm shadow-lg hover:shadow-xl">
                      <Instagram className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm shadow-lg hover:shadow-xl">
                      <Github className="w-6 h-6 text-gray-300" />
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm shadow-lg hover:shadow-xl">
                      <Linkedin className="w-6 h-6 text-gray-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* MacBook Base */}
        <div className="bg-gradient-to-b from-gray-400 to-gray-500 h-6 rounded-b-2xl flex items-center justify-center relative shadow-lg">
          <div className="w-40 h-1 bg-gray-600 rounded-full"></div>
          {/* MacBook Apple Logo */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center shadow-md">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* iPhone View - Larger, positioned bottom right */}
      <div className="absolute -bottom-12 -right-12 scale-90 transform rotate-12">
        {/* iPhone Frame */}
        <div className="bg-gray-900 rounded-[3.5rem] p-3 shadow-2xl">
          {/* iPhone Screen */}
          <div className="bg-black rounded-[3rem] overflow-hidden relative">
            {/* iPhone Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-7 bg-black rounded-b-3xl z-10"></div>
            
            {/* iPhone Screen Content */}
            <div className="relative h-[640px] w-[300px] bg-gradient-to-br from-gray-900 via-black to-gray-900 p-8 pt-12">
              {/* Mobile Layout */}
              <div className="text-center mb-8">
                <Avatar className="w-20 h-20 mx-auto mb-6 ring-3 ring-white/20 shadow-xl">
                  <AvatarImage src="/api/placeholder/80/80" />
                  <AvatarFallback className="bg-blue-500 text-white text-lg">JS</AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl font-bold text-white mb-3">
                  John Smith
                </h2>
                <p className="text-base text-gray-400 mb-6 leading-relaxed">
                  Full-stack developer sharing my journey
                </p>
              </div>

              {/* Mobile Links */}
              <div className="space-y-4 mb-8">
                <Button
                  variant="outline"
                  className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl justify-between backdrop-blur-sm text-base transition-all shadow-lg hover:shadow-xl"
                >
                  <span className="font-semibold">My Portfolio</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl justify-between backdrop-blur-sm text-base transition-all shadow-lg hover:shadow-xl"
                >
                  <span className="font-semibold">Latest Blog Post</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full py-4 bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl justify-between backdrop-blur-sm text-base transition-all shadow-lg hover:shadow-xl"
                >
                  <span className="font-semibold">GitHub Projects</span>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              {/* Mobile Social Icons */}
              <div className="flex justify-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm shadow-lg hover:shadow-xl">
                  <Twitter className="w-5 h-5 text-gray-300" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm shadow-lg hover:shadow-xl">
                  <Instagram className="w-5 h-5 text-gray-300" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm shadow-lg hover:shadow-xl">
                  <Github className="w-5 h-5 text-gray-300" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm shadow-lg hover:shadow-xl">
                  <Linkedin className="w-5 h-5 text-gray-300" />
                </div>
              </div>

              {/* Mobile Curately Footer */}
              <div className="absolute bottom-10 left-0 right-0 text-center">
                <p className="text-sm text-gray-400">
                  Created with{' '}
                  <span className="font-medium text-gray-200">Curately</span>
                </p>
              </div>
              
              {/* iPhone Home Indicator */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-36 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}