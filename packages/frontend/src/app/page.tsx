// 'use client';

// import { motion } from 'framer-motion';
// import Link from 'next/link';
// import { Button } from '@/components/ui/button';
// import { Header } from '@/components/header';
// import { ArrowRight, CheckCircle, Zap, Shield, BarChart, Users } from 'lucide-react';

// const features = [
//   {
//     icon: <Zap className="h-6 w-6 text-blue-500" />,
//     title: 'Lightning Fast',
//     description: 'Built on Next.js and NestJS for sub‑second response times.',
//   },
//   {
//     icon: <Shield className="h-6 w-6 text-amber-500" />,
//     title: 'Secure & Compliant',
//     description: 'Data encryption and compliance with Rwanda’s data protection laws.',
//   },
//   {
//     icon: <BarChart className="h-6 w-6 text-green-500" />,
//     title: 'Real‑time Analytics',
//     description: 'Interactive dashboards that update live as your business moves.',
//   },
//   {
//     icon: <Users className="h-6 w-6 text-purple-500" />,
//     title: 'Role‑Based Access',
//     description: 'Granular permissions for owners, managers, and cashiers.',
//   },
// ];

// export default function LandingPage() {
//   return (
//     <div className="min-h-screen bg-background text-foreground bg-grid-pattern">
//       <Header />

//       {/* Hero */}
//       <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
//         <div className="container mx-auto px-4">
//           <div className="grid lg:grid-cols-2 gap-12 items-center">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.6 }}
//             >
//               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-deep border border-white/10 text-sm font-medium text-muted-foreground mb-6">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
//                 </span>
//                 Available now in Rwanda
//               </div>
//               <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
//                 Manage Smarter. <br />
//                 <span className="gradient-text">Grow Faster.</span>
//               </h1>
//               <p className="mt-6 text-lg text-muted-foreground max-w-lg">
//                 The all‑in‑one business management platform for Rwandan enterprises.
//                 Inventory, sales, customers, and compliance – beautifully unified.
//               </p>
//               <div className="mt-10 flex flex-wrap gap-4">
//                 <Link href="/register">
//                   <Button size="lg" className="gradient-primary text-white shadow-lg shadow-primary/25 px-8">
//                     Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
//                   </Button>
//                 </Link>
//                 <Link href="#features">
//                   <Button size="lg" variant="outline" className="glass-modern border-white/30 dark:border-white/10 hover:bg-white/10">
//                     Learn More
//                   </Button>
//                 </Link>
//               </div>
//               <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
//                 <span className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1.5" /> Free forever</span>
//                 <span className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1.5" /> No credit card</span>
//                 <span className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1.5" /> Multi‑user</span>
//               </div>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ duration: 0.6, delay: 0.2 }}
//               className="relative"
//             >
//               {/* Placeholder for illustration or carousel */}
//               <div className="glass-deep rounded-2xl p-8 border border-white/5 dark:border-white/5 aspect-video flex items-center justify-center">
//                 <p className="text-muted-foreground text-center">
//                   📊 Dashboard Preview
//                   <br />
//                   <span className="text-sm">(coming soon)</span>
//                 </p>
//               </div>
//             </motion.div>
//           </div>
//         </div>

//         {/* Animated blobs */}
//         <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
//         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-float delay-1000 pointer-events-none" />
//       </section>

//       {/* Features */}
//       <section id="features" className="container mx-auto px-4 py-20">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold">Everything you need to run your business</h2>
//           <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
//             Ubucuruzi ERP combines essential business tools in one modern platform.
//           </p>
//         </div>
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="glass-deep rounded-2xl p-6 text-center border border-white/5 hover:border-white/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group"
//             >
//               <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
//                 {feature.icon}
//               </div>
//               <h3 className="text-xl font-semibold">{feature.title}</h3>
//               <p className="mt-2 text-muted-foreground text-sm">{feature.description}</p>
//             </motion.div>
//           ))}
//         </div>
//       </section>

//       {/* CTA */}
//       <section className="container mx-auto px-4 py-20">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           className="glass-deep rounded-3xl max-w-4xl mx-auto text-center p-8 md:p-12 border border-white/5 relative overflow-hidden"
//         >
//           <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-amber-500/5 pointer-events-none" />
//           <h2 className="text-3xl font-bold relative">Ready to grow your business?</h2>
//           <p className="mt-4 text-muted-foreground relative">
//             Join hundreds of Rwandan businesses already managing smarter with Ubucuruzi ERP.
//           </p>
//           <div className="mt-8 relative">
//             <Link href="/register">
//               <Button size="lg" className="gradient-primary text-white shadow-lg shadow-primary/25 px-8">
//                 Start Free <ArrowRight className="ml-2 h-4 w-4" />
//               </Button>
//             </Link>
//           </div>
//         </motion.div>
//       </section>

    //   {/* Footer */}
    //   <footer className="border-t border-border/40 py-8">
    //     <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
    //       <div className="flex items-center space-x-2">
    //         <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
    //           <span className="text-white font-bold text-xs">U</span>
    //         </div>
    //         <span>Ubucuruzi ERP</span>
    //       </div>
    //       <div className="flex gap-6">
    //         <Link href="#" className="hover:text-foreground transition-colors">About</Link>
    //         <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
    //         <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
    //       </div>
    //       <div>&copy; {new Date().getFullYear()} All rights reserved.</div>
    //     </div>
    //   </footer>
    // </div>
//   );
// }

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">
            Ubucuruzi ERP
          </span>
        </h1>
        <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
          Manage Smarter. Grow Faster.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/login" className="w-full gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow py-2 text-base font-medium rounded-xl">
            <Button size="sm">Sign In</Button>
          </Link>
          {/* <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link> */}
        </div>
      </div>
      {/* Footer */}
      <footer className="py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>&copy; {new Date().getFullYear()} All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}