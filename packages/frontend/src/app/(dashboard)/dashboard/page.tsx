'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Users, ShoppingCart, AlertCircle, ArrowRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '@/lib/api-client';

const COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

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
  totalOrders: '/dashboard/invoices',
  totalRevenue: '/dashboard/reports',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesStatus, setSalesStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      try {
        const [statsRes, revenueRes, topRes, statusRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/revenue-trend'),
          api.get('/dashboard/top-products?limit=5'),
          api.get('/dashboard/sales-status'),
        ]);
        setStats(statsRes.data);
        setRevenueData(revenueRes.data);
        setTopProducts(topRes.data);
        setSalesStatus(statusRes.data);
        setError(null);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-deep rounded-xl p-6 text-center text-muted-foreground">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-primary hover:underline">
          Retry
        </button>
      </div>
    );
  }

  // ─── Stat Cards ──────────────────────────────────────────
  const cards = [
    {
      title: 'Revenue',
      value: `RWF ${stats?.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      link: statLinks.totalRevenue,
      subtitle: 'Total revenue',
    },
    {
      title: 'Orders',
      value: stats?.totalOrders?.toString() || '0',
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-600',
      link: statLinks.totalOrders,
      subtitle: 'Total orders',
    },
    {
      title: 'Products',
      value: stats?.totalProducts?.toString() || '0',
      icon: Package,
      gradient: 'from-amber-500 to-orange-600',
      link: statLinks.totalProducts,
      subtitle: `${stats?.lowStockItems ?? 0} low in stock`,
    },
    {
      title: 'Customers',
      value: stats?.totalCustomers?.toString() || '0',
      icon: Users,
      gradient: 'from-purple-500 to-pink-600',
      link: statLinks.totalCustomers,
      subtitle: 'Total customers',
    },
  ];
  const lowStockItems = stats?.lowStockItems ?? 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
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
      {lowStockItems > 0 && (
        <div className="glass-deep border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm font-medium">
            {lowStockItems} product{lowStockItems > 1 ? 's' : ''} are low on stock.
          </span>
          <Link href="/dashboard/products" className="ml-auto text-sm underline hover:no-underline">
            View products
          </Link>
        </div>
      )}

      {/* Revenue Trend Chart */}
      <Card className="glass-deep border border-white/5">
        <CardHeader>
          <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          {revenueData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#2563eb" fill="#2563eb33" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Products & Sales Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-deep border border-white/5">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {topProducts.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="productName" width={80} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-deep border border-white/5">
          <CardHeader>
            <CardTitle>Sales by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {salesStatus.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {salesStatus.map((entry, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 'use client';

// import { useEffect, useState } from 'react';
// import Link from 'next/link';
// import { useAuth } from '@/contexts/auth-context';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { DollarSign, Package, Users, ShoppingCart, AlertCircle, ArrowRight } from 'lucide-react';
// import api from '@/lib/api-client';
// import { cn } from '@/lib/utils';

// interface Stats {
//   totalProducts: number;
//   totalCustomers: number;
//   totalRevenue: number;
//   totalOrders: number;
//   lowStockItems: number;
// }

// const statLinks = {
//   totalProducts: '/dashboard/products',
//   totalCustomers: '/dashboard/customers',
//   totalOrders: '/dashboard/sales',
//   totalRevenue: '/dashboard/reports',
// };

// export default function DashboardPage() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState<Stats | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user) return;
//     api.get('/dashboard/stats')
//       .then(res => setStats(res.data))
//       .catch(err => console.error('Failed to load stats', err))
//       .finally(() => setLoading(false));
//   }, [user]);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
//       </div>
//     );
//   }

//   const cards = [
//     {
//       title: 'Revenue',
//       value: `RWF ${stats?.totalRevenue.toLocaleString() || '0'}`,
//       icon: DollarSign,
//       gradient: 'from-green-500 to-emerald-600',
//       link: '/dashboard/reports',
//       subtitle: 'Total revenue',
//     },
//     {
//       title: 'Orders',
//       value: stats?.totalOrders || '0',
//       icon: ShoppingCart,
//       gradient: 'from-blue-500 to-cyan-600',
//       link: '/dashboard/sales',
//       subtitle: 'Total orders',
//     },
//     {
//       title: 'Products',
//       value: stats?.totalProducts || '0',
//       icon: Package,
//       gradient: 'from-amber-500 to-orange-600',
//       link: '/dashboard/products',
//       subtitle: `${stats?.lowStockItems || 0} low in stock`,
//     },
//     {
//       title: 'Customers',
//       value: stats?.totalCustomers || '0',
//       icon: Users,
//       gradient: 'from-purple-500 to-pink-600',
//       link: '/dashboard/customers',
//       subtitle: 'Total customers',
//     },
//   ];

//   return (
//     <div className="space-y-6">
//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
//         {cards.map((stat, idx) => (
//           <Link key={idx} href={stat.link} className="block group">
//             <Card className="glass-deep border border-white/5 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer">
//               <CardContent className="p-4 md:p-6">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
//                     <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
//                     <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
//                       {stat.subtitle}
//                       <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
//                     </p>
//                   </div>
//                   <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
//                     <stat.icon className="h-5 w-5 text-white" />
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//           </Link>
//         ))}
//       </div>

//       {/* Low Stock Alert */}
//       {stats && stats.lowStockItems > 0 && (
//         <div className="glass-deep border border-amber-500/20 rounded-xl p-4 flex items-center gap-3 text-amber-600 dark:text-amber-400">
//           <AlertCircle className="h-5 w-5" />
//           <span className="text-sm font-medium">
//             {stats.lowStockItems} product{stats.lowStockItems > 1 ? 's' : ''} are low on stock.
//           </span>
//           <Link href="/dashboard/products" className="ml-auto text-sm underline hover:no-underline">
//             View products
//           </Link>
//         </div>
//       )}

//       {/* Placeholder Chart */}
//       <Card className="glass-deep border border-white/5">
//         <CardHeader>
//           <CardTitle>Revenue Overview</CardTitle>
//         </CardHeader>
//         <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
//           📊 Chart will be displayed here (Recharts)
//         </CardContent>
//       </Card>
//     </div>
//   );
// }