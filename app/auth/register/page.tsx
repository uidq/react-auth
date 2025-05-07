'use client'

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@heroui/link';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      
      router.push('/auth/verify-email');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-8 border-1 border-zinc-700 rounded-xl shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Register</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Create a new account
          </p>
        </div>

        {error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full mt-1"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full mt-1"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full mt-1"
            />
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full"
            isLoading={loading}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <div className="mt-4 text-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
          </span>
          <Link href="/auth/login" className="font-semibold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
} 