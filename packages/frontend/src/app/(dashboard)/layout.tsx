'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  Truck,
  FileText,
  Receipt,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/dashboard/quotations', label: 'Quotations', icon: FileText },
  { href: '/dashboard/invoices', label: 'Invoices', icon: Receipt },
  { href: '/dashboard/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="glass-deep rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grid-pattern flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 glass-deep border-r border-white/5 dark:border-white/5 p-4 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
              U
            </div>
            <span className="text-lg font-bold gradient-text">Ubucuruzi ERP</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'gradient-primary text-white shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl glass-modern">
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary/20">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">Owner</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-white/10"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 overflow-auto relative">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden glass-modern border-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
              <p className="text-sm text-muted-foreground hidden sm:block">
                Welcome back, {user?.firstName}!
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {/* Page content */}
        <div className="relative z-10">{children}</div>

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/10 dark:bg-blue-500/5 rounded-full blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-300/10 dark:bg-amber-500/5 rounded-full blur-3xl animate-float delay-1000 pointer-events-none" />
      </main>
    </div>
  );
}

// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter, usePathname } from 'next/navigation';
// import Link from 'next/link';
// import { ThemeToggle } from '@/components/theme-toggle';
// import { Button } from '@/components/ui/button';
// import { LogOut, LayoutDashboard, Package, Users, ShoppingCart, Settings } from 'lucide-react';

// const navItems = [
//   { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
//   { href: '/dashboard/products', label: 'Products', icon: Package },
//   { href: '/dashboard/customers', label: 'Customers', icon: Users },
//   { href: '/dashboard/sales', label: 'Sales', icon: ShoppingCart },
//   { href: '/dashboard/settings', label: 'Settings', icon: Settings },
// ];

// export default function DashboardLayout({ children }: { children: React.ReactNode }) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (!token) {
//       router.push('/login');
//     } else {
//       setLoading(false);
//     }
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     router.push('/login');
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen bg-background">
//       {/* Sidebar */}
//       <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm p-4 hidden md:block">
//         <div className="flex items-center gap-2 mb-8">
//           <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold">U</div>
//           <span className="text-lg font-bold gradient-text">Ubucuruzi ERP</span>
//         </div>
//         <nav className="space-y-1">
//           {navItems.map((item) => (
//             <Link
//               key={item.href}
//               href={item.href}
//               className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
//                 pathname === item.href
//                   ? 'bg-primary/10 text-primary'
//                   : 'hover:bg-muted'
//               }`}
//             >
//               <item.icon className="h-4 w-4" />
//               {item.label}
//             </Link>
//           ))}
//         </nav>
//         <div className="absolute bottom-4 left-4 right-4">
//           <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
//             <LogOut className="h-4 w-4 mr-2" /> Logout
//           </Button>
//         </div>
//       </aside>

//       {/* Main content */}
//       <main className="flex-1 overflow-auto">
//         <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 flex justify-between items-center">
//           <h1 className="text-xl font-semibold">Dashboard</h1>
//           <ThemeToggle />
//         </header>
//         <div className="p-6">{children}</div>
//       </main>
//     </div>
//   );
// }