'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users, ShoppingCart, AlertCircle, ArrowRight } from 'lucide-react';
import api from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Stats {
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  totalOrders: number;
  lowStockItems: number;
}

const statLinks = {
  totalProducts: '/dashboard/products',
  totalCustomers: '/dashboard/customers',
  totalOrders: '/dashboard/sales',
  totalRevenue: '/dashboard/reports',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('Failed to load stats', err))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const cards = [
    {
      title: 'Revenue',
      value: `RWF ${stats?.totalRevenue.toLocaleString() || '0'}`,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      link: '/dashboard/reports',
      subtitle: 'Total revenue',
    },
    {
      title: 'Orders',
      value: stats?.totalOrders || '0',
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-600',
      link: '/dashboard/sales',
      subtitle: 'Total orders',
    },
    {
      title: 'Products',
      value: stats?.totalProducts || '0',
      icon: Package,
      gradient: 'from-amber-500 to-orange-600',
      link: '/dashboard/products',
      subtitle: `${stats?.lowStockItems || 0} low in stock`,
    },
    {
      title: 'Customers',
      value: stats?.totalCustomers || '0',
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      link: '/dashboard/customers',
      subtitle: 'Total customers',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {cards.map((stat, idx) => (
          <Link key={idx} href={stat.link} className="block group">
            <Card className="glass-deep border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      {stat.subtitle}
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Low Stock Alert */}
      {stats && stats.lowStockItems > 0 && (
        <div className="glass-deep border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            {stats.lowStockItems} product{stats.lowStockItems > 1 ? 's' : ''} are low on stock.
          </span>
          <Link href="/dashboard/products" className="ml-auto text-sm underline hover:no-underline">
            View products
          </Link>
        </div>
      )}

      {/* Placeholder Chart */}
      <Card className="glass-deep border border-white/5">
        <CardHeader>
          <CardTitle>Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
          📊 Chart will be displayed here (Recharts)
        </CardContent>
      </Card>
    </div>
  );
}
// 'use client';

// import { useAuth } from '@/contexts/auth-context';
// import { motion } from 'framer-motion';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { DollarSign, Package, Users, TrendingUp } from 'lucide-react';
// import { cn } from '@/lib/utils';

// const stats = [
//   {
//     title: 'Revenue',
//     value: 'RWF 0',
//     icon: <DollarSign className="h-5 w-5" />,
//     change: '+0%',
//     changeLabel: 'vs last month',
//     gradient: 'from-green-500 to-emerald-600',
//   },
//   {
//     title: 'Sales',
//     value: '0',
//     icon: <TrendingUp className="h-5 w-5" />,
//     change: '+0%',
//     changeLabel: 'vs last month',
//     gradient: 'from-blue-500 to-cyan-600',
//   },
//   {
//     title: 'Products',
//     value: '0',
//     icon: <Package className="h-5 w-5" />,
//     change: '+0%',
//     changeLabel: 'this month',
//     gradient: 'from-amber-500 to-orange-600',
//   },
//   {
//     title: 'Customers',
//     value: '0',
//     icon: <Users className="h-5 w-5" />,
//     change: '+0%',
//     changeLabel: 'this month',
//     gradient: 'from-purple-500 to-pink-600',
//   },
// ];

// const recentActivity = [
//   { id: 'INV-001', amount: 'RWF 45,000', status: 'Paid', time: '2 hours ago' },
//   { id: 'INV-002', amount: 'RWF 12,500', status: 'Pending', time: '5 hours ago' },
//   { id: 'INV-003', amount: 'RWF 89,000', status: 'Paid', time: '1 day ago' },
//   { id: 'INV-004', amount: 'RWF 32,000', status: 'Overdue', time: '2 days ago' },
// ];

// export default function DashboardPage() {
//   return (
//     <div className="space-y-6">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//         {stats.map((stat, index) => (
//           <motion.div
//             key={stat.title}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: index * 0.1 }}
//           >
//             <Card className="glass-deep border border-white/5 dark:border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
//               <CardContent className="p-4 md:p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
//                     <p className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{stat.value}</p>
//                   </div>
//                   <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
//                     <span className="text-white">{stat.icon}</span>
//                   </div>
//                 </div>
//                 <div className="mt-3 flex items-center gap-2">
//                   <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
//                     {stat.change}
//                   </span>
//                   <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
//                 </div>
//               </CardContent>
//             </Card>
//           </motion.div>
//         ))}
//       </div>

//       {/* Chart & Recent Activity */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <Card className="glass-deep border border-white/5 dark:border-white/5 lg:col-span-2">
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
//             <p className="text-sm text-muted-foreground">Monthly revenue for the current year</p>
//           </CardHeader>
//           <CardContent className="h-64 md:h-80 flex items-center justify-center">
//             <div className="w-full h-full flex flex-col items-center justify-center gap-4">
//               <div className="w-full h-12 glass-deep rounded-lg animate-pulse" />
//               <div className="w-3/4 h-12 glass-deep rounded-lg animate-pulse" />
//               <div className="w-1/2 h-12 glass-deep rounded-lg animate-pulse" />
//               <p className="text-sm text-muted-foreground mt-4">
//                 📊 Chart will be displayed here using Recharts
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         <Card className="glass-deep border border-white/5 dark:border-white/5">
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-3">
//             {recentActivity.map((item) => (
//               <div
//                 key={item.id}
//                 className="flex items-center justify-between p-3 rounded-xl glass-modern border border-white/5 hover:border-white/10 transition-all duration-200"
//               >
//                 <div>
//                   <p className="text-sm font-medium">{item.id}</p>
//                   <p className="text-xs text-muted-foreground">{item.time}</p>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm font-semibold">{item.amount}</p>
//                   <span
//                     className={cn(
//                       'text-xs px-2 py-0.5 rounded-full',
//                       item.status === 'Paid'
//                         ? 'bg-green-500/10 text-green-500'
//                         : item.status === 'Pending'
//                           ? 'bg-amber-500/10 text-amber-500'
//                           : 'bg-red-500/10 text-red-500'
//                     )}
//                   >
//                     {item.status}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }