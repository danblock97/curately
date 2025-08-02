
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-900 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Logo and Language */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="Curately Logo"
                width={32}
                height={32}
                className="w-6 sm:w-8 h-6 sm:h-8"
              />
              <span className="text-lg sm:text-xl font-bold">Curately</span>
            </Link>
            <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:text-gray-900">
              <Globe className="w-3 sm:w-4 h-3 sm:h-4 mr-2" />
              <span className="text-sm sm:text-base">English</span>
            </Button>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">About</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 text-sm sm:text-base">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 border-t border-gray-300 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-gray-600 text-xs sm:text-sm">&copy; {new Date().getFullYear()} Curately. All rights reserved.</p>
          {/* Social Icons can be added here */}
        </div>
      </div>
    </footer>
  );
}
