'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ExternalLink, Instagram, Twitter, Github, Linkedin, Youtube } from 'lucide-react'
import Image from 'next/image'
import { BrandedQRCode } from '@/components/ui/branded-qr-code'

export function DeviceMockups() {
  return (
    <div className="relative max-w-[90rem] mx-auto w-full">
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
                    🔒 curately.co.uk/johnsmith
                  </div>
                </div>
                <div className="w-20"></div>
              </div>
            </div>
            
            {/* MacBook Screen Content */}
            <div className="bg-black rounded-b-lg overflow-hidden">
              <div className="relative h-[600px] bg-white flex">
                {/* Left side - Profile */}
                <div className="w-1/2 p-8 flex flex-col justify-center">
                  <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto mb-4 ring-3 ring-gray-200 shadow-xl">
                      <AvatarImage src="/api/placeholder/80/80" />
                      <AvatarFallback className="bg-blue-500 text-white text-lg">JS</AvatarFallback>
                    </Avatar>
                    
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      John Smith
                    </h2>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                      Full-stack developer sharing my journey
                    </p>
                    
                  </div>
                </div>

                {/* Right side - Widgets */}
                <div className="w-1/2 p-6 relative">
                  {/* Widget Grid */}
                  <div className="space-y-2">
                    {/* Twitter Widget */}
                    <div className="h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center px-3 shadow-sm">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center mr-3">
                        <Twitter className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="text-white text-xs font-medium">@johnsmith</span>
                    </div>
                    
                    {/* Portfolio Link */}
                    <div className="h-12 bg-gray-100 rounded-lg flex items-center px-3 justify-between shadow-sm">
                      <span className="text-gray-900 text-xs font-medium">My Portfolio</span>
                      <ExternalLink className="w-3 h-3 text-gray-600" />
                    </div>
                    
                    {/* Square widgets row */}
                    <div className="flex space-x-2">
                      <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center shadow-sm">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-lg flex items-center justify-center shadow-sm">
                        <Github className="w-4 h-4 text-white" />
                      </div>
                      <div className="w-16 h-16 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center shadow-sm p-1">
                        <BrandedQRCode 
                          url="https://danblock.dev" 
                          size={56}
                          logoSize={14}
                          className="w-full h-full"
                        />
                      </div>
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
            <div className="relative h-[640px] w-[300px] bg-white flex flex-col pt-12">
              {/* Mobile Profile Section */}
              <div className="px-6 text-center mb-6">
                <Avatar className="w-16 h-16 mx-auto mb-3 ring-2 ring-gray-200 shadow-lg">
                  <AvatarImage src="/api/placeholder/64/64" />
                  <AvatarFallback className="bg-blue-500 text-white text-sm">JS</AvatarFallback>
                </Avatar>
                
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  John Smith
                </h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Full-stack developer sharing my journey
                </p>
                
              </div>

              {/* Mobile Widgets Section */}
              <div className="px-4 flex-1">
                <div className="flex flex-wrap justify-center gap-2">
                  {/* Twitter Widget */}
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex flex-col justify-end p-2 shadow-sm relative">
                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Twitter className="w-3 h-3 text-blue-500" />
                    </div>
                    <div className="text-white text-xs font-medium">@johnsmith</div>
                  </div>
                  
                  {/* Instagram Widget */}
                  <div className="w-32 h-32 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex flex-col justify-end p-2 shadow-sm relative">
                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Instagram className="w-3 h-3 text-pink-500" />
                    </div>
                    <div className="text-white text-xs font-medium">Instagram</div>
                  </div>
                  
                  {/* Portfolio Link */}
                  <div className="w-full h-10 bg-gray-100 rounded-lg flex items-center px-3 justify-between shadow-sm mt-2">
                    <span className="text-gray-900 text-sm font-medium">My Portfolio</span>
                    <ExternalLink className="w-4 h-4 text-gray-600" />
                  </div>
                  
                  {/* GitHub Widget */}
                  <div className="w-32 h-32 bg-gradient-to-br from-gray-800 to-black rounded-lg flex flex-col justify-end p-2 shadow-sm relative">
                    <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                      <Github className="w-3 h-3 text-gray-800" />
                    </div>
                    <div className="text-white text-xs font-medium">GitHub</div>
                  </div>
                  
                  {/* Branded QR Code Widget */}
                  <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center shadow-sm p-2">
                    <BrandedQRCode 
                      url="https://danblock.dev" 
                      size={112}
                      logoSize={28}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Curately Footer */}
              <div className="px-6 py-4 text-center">
                <p className="text-xs text-gray-600">
                  Created with{' '}
                  <span className="font-medium text-gray-800">Curately</span>
                </p>
              </div>
              
              {/* iPhone Home Indicator */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-36 h-1 bg-gray-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}