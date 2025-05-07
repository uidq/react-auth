'use client'

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@heroui/link';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="border-card p-8 space-y-6 border-1 border-zinc-700 rounded-xl shadow-xl bg-transparent">
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-primary"
            >
              Welcome Back
            </motion.h1>
            <p className="mt-2 text-text-secondary">
              Sign in to your account
            </p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 mb-4 text-sm text-red-700 bg-red-100/10 border border-red-500/20 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 ">
            <div>
              <label htmlFor="email" className="block text-sm text-text-secondary mb-1">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border-subtle-border focus:border-primary/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-text-secondary mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-subtle-border focus:border-primary/50"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-subtle-border rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="#" className="text-primary hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full btn-hover"
              radius="full"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-text-secondary">
              Don't have an account?{' '}
            </span>
            <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">
              Register
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 