
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-900 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Language */}
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo.png"
                alt="Curately Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold">Curately</span>
            </Link>
            <Button variant="ghost" size="sm" className="p-2 text-gray-600 hover:text-gray-900">
              <Globe className="w-4 h-4 mr-2" />
              <span>English</span>
            </Button>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link href="#deeplink" className="text-gray-600 hover:text-gray-900">Deeplink</Link></li>
              <li><Link href="#link-in-bio" className="text-gray-600 hover:text-gray-900">Link in bio</Link></li>
              <li><Link href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link href="#affiliation" className="text-gray-600 hover:text-gray-900">Affiliation</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-300 pt-8 flex justify-between items-center">
          <p className="text-gray-600">&copy; {new Date().getFullYear()} Curately. All rights reserved.</p>
          {/* Social Icons can be added here */}
        </div>
      </div>
    </footer>
  );
}
