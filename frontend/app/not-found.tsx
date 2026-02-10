import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-foreground/70 mb-8">
          The page you're looking for doesn't exist. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              Go Home
            </Button>
          </Link>
          <Link href="/events">
            <Button variant="outline">
              Browse Events
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-12 border-t border-border">
          <p className="text-foreground/60 text-sm mb-4">Quick Links:</p>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/events" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Events
            </Link>
            <Link href="/locations" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Locations
            </Link>
            <Link href="/about" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              About
            </Link>
            <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
