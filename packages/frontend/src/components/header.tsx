'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full glass-deep border-b border-white/5 dark:border-white/5 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-lg">U</span>
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:inline">Ubucuruzi ERP</span>
          <span className="text-xl font-bold gradient-text sm:hidden">U ERP</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/login" className="hidden sm:inline-block">
            <Button variant="ghost" size="sm" className="glass-modern border-none hover:bg-white/10 dark:hover:bg-white/5">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="gradient-primary text-white shadow-lg shadow-primary/25">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}