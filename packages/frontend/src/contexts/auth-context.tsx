'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  googleLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      api
        .get('/users/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('accessToken');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    // Set cookie for middleware
    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400`;
    setUser(user);
    router.push('/dashboard');
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { accessToken, refreshToken, user } = res.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400`;
    setUser(user);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'accessToken=; path=/; max-age=0';
    setUser(null);
    router.push('/login');
  };

  const googleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// 'use client';

// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import api from '@/lib/api-client';
// import { useRouter } from 'next/navigation';

// interface User {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
// }

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   register: (data: any) => Promise<void>;
//   logout: () => void;
//   googleLogin: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       api
//         .get('/users/me')
//         .then((res) => setUser(res.data))
//         .catch(() => {
//           localStorage.removeItem('accessToken');
//           setUser(null);
//         })
//         .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const login = async (email: string, password: string) => {
//     const res = await api.post('/auth/login', { email, password });
//     const { accessToken, user } = res.data;
//     localStorage.setItem('accessToken', accessToken);
//     setUser(user);
//     router.push('/dashboard');
//   };

//   const register = async (data: any) => {
//     const res = await api.post('/auth/register', data);
//     const { accessToken, user } = res.data;
//     localStorage.setItem('accessToken', accessToken);
//     setUser(user);
//     router.push('/dashboard');
//   };

//   const logout = () => {
//     localStorage.removeItem('accessToken');
//     setUser(null);
//     router.push('/login');
//   };

//   const googleLogin = () => {
//     window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout, googleLogin }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) throw new Error('useAuth must be used within AuthProvider');
//   return context;
// };