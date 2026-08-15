'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api-client';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      const res = await api.post('/auth/register', data);
      const { accessToken } = res.data;
      localStorage.setItem('accessToken', accessToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid-pattern p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-300/20 dark:bg-amber-500/10 rounded-full blur-3xl animate-float delay-1000 pointer-events-none" />

      {/* Top navigation */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
        <Link
          href="/"
          className="pointer-events-auto flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors glass-modern px-4 py-2 rounded-full border border-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Register card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10 mt-12"
      >
        <div className="glass-deep rounded-3xl p-6 md:p-8 border border-white/5 dark:border-white/5 shadow-2xl shadow-primary/5">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full gradient-primary shadow-lg shadow-primary/20 mb-4">
              <span className="text-2xl font-bold text-white">U</span>
            </div>
            <h1 className="text-3xl font-bold gradient-text">Create Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">Start managing your business with Ubucuruzi ERP</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium text-foreground/80">First Name</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  placeholder="John"
                  className="w-full px-4 py-3 rounded-xl glass-modern border border-white/10 dark:border-white/5 bg-transparent placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium text-foreground/80">Last Name</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  placeholder="Doe"
                  className="w-full px-4 py-3 rounded-xl glass-modern border border-white/10 dark:border-white/5 bg-transparent placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl glass-modern border border-white/10 dark:border-white/5 bg-transparent placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Password (min 6 chars)</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl glass-modern border border-white/10 dark:border-white/5 bg-transparent placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-xl border border-destructive/20">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full gradient-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow py-6 text-base font-medium rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10 dark:border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background/50 backdrop-blur-sm px-3 text-muted-foreground/70">Or sign up with</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full glass-modern border border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-white/5 rounded-xl py-6 text-foreground transition-all duration-300"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// 'use client';

// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';
// import { useAuth } from '@/contexts/auth-context';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import Link from 'next/link';

// const registerSchema = z.object({
//   firstName: z.string().min(1, 'First name is required'),
//   lastName: z.string().min(1, 'Last name is required'),
//   email: z.string().email('Invalid email'),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
// });

// type RegisterForm = z.infer<typeof registerSchema>;

// export default function RegisterPage() {
//   const { register: registerUser, googleLogin } = useAuth();
//   const [error, setError] = useState<string | null>(null);
//   const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<RegisterForm>({
//     resolver: zodResolver(registerSchema),
//   });

//   const onSubmit = async (data: RegisterForm) => {
//     try {
//       await registerUser(data);
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Registration failed');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl">Create Account</CardTitle>
//           <CardDescription>Start managing your business with Ubucuruzi ERP</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="firstName">First Name</Label>
//                 <Input id="firstName" {...register('firstName')} placeholder="John" />
//                 {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="lastName">Last Name</Label>
//                 <Input id="lastName" {...register('lastName')} placeholder="Doe" />
//                 {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
//               </div>
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input id="email" type="email" {...register('email')} placeholder="you@example.com" />
//               {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password (min 6 chars)</Label>
//               <Input id="password" type="password" {...register('password')} placeholder="••••••••" />
//               {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
//             </div>
//             {error && <p className="text-sm text-red-500">{error}</p>}
//             <Button type="submit" className="w-full" disabled={isSubmitting}>
//               {isSubmitting ? 'Creating...' : 'Create Account'}
//             </Button>
//           </form>

//           <div className="relative my-4">
//             <div className="absolute inset-0 flex items-center">
//               <span className="w-full border-t" />
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
//             </div>
//           </div>

//           <Button variant="outline" className="w-full" onClick={googleLogin}>
//             <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
//               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
//               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
//               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//             </svg>
//             Sign up with Google
//           </Button>

//           <p className="mt-4 text-center text-sm text-muted-foreground">
//             Already have an account?{' '}
//             <Link href="/login" className="text-primary hover:underline">Sign in</Link>
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }