'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ExternalLink, Instagram, Twitter, Github, Linkedin, Youtube } from 'lucide-react'

export function MockPhonePreview() {
  return (
    <div className="relative mx-auto max-w-sm">
      {/* Phone Frame */}
      <div className="relative bg-gray-300 rounded-[3rem] p-3 shadow-2xl">
        <div className="bg-black rounded-[2.5rem] overflow-hidden">
          {/* Screen Content - Dark Theme */}
          <div className="relative h-[640px] bg-black p-8">
            {/* Profile Section */}
            <div className="text-center mb-8">
              <Avatar className="w-20 h-20 mx-auto mb-4">
                <AvatarImage src="/api/placeholder/80/80" />
                <AvatarFallback className="bg-blue-500 text-white">JS</AvatarFallback>
              </Avatar>
              
              <h2 className="text-xl font-bold text-white mb-2">
                John Smith
              </h2>
              <p className="text-sm text-gray-400 mb-4">
                Full-stack developer sharing my journey and latest projects
              </p>
            </div>

            {/* Links - Based on your actual app */}
            <div className="space-y-4 mb-8">
              <Button
                variant="outline"
                className="w-full py-6 bg-gray-800/90 hover:bg-gray-700 text-white border-gray-600 rounded-xl justify-between shadow-sm hover:shadow-md transition-all"
              >
                <span className="font-semibold">My Portfolio</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full py-6 bg-gray-800/90 hover:bg-gray-700 text-white border-gray-600 rounded-xl justify-between shadow-sm hover:shadow-md transition-all"
              >
                <span className="font-semibold">Latest Blog Post</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full py-6 bg-gray-800/90 hover:bg-gray-700 text-white border-gray-600 rounded-xl justify-between shadow-sm hover:shadow-md transition-all"
              >
                <span className="font-semibold">GitHub Projects</span>
                <ExternalLink className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                className="w-full py-6 bg-gray-800/90 hover:bg-gray-700 text-white border-gray-600 rounded-xl justify-between shadow-sm hover:shadow-md transition-all"
              >
                <span className="font-semibold">Contact Me</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

            {/* Social Icons - Based on your actual app */}
            <div className="flex justify-center space-x-6">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                <Twitter className="w-5 h-5 text-gray-300" />
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                <Instagram className="w-5 h-5 text-gray-300" />
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                <Github className="w-5 h-5 text-gray-300" />
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                <Linkedin className="w-5 h-5 text-gray-300" />
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
                <Youtube className="w-5 h-5 text-gray-300" />
              </div>
            </div>

            {/* Curately Footer */}
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-xs text-gray-400">
                Created with{' '}
                <span className="font-medium text-gray-200 underline">Curately</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}