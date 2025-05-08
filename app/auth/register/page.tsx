'use client'

import { FormEvent, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@heroui/link';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

// Plans data (simplified version of what's in subscription page)
const planInfo = {
  basic: { name: 'Basic Gaming Access', price: '$9.99', game: 'Apex Legends', color: 'blue' },
  pro: { name: 'Pro Gamer', price: '$19.99', game: 'Escape from Tarkov', color: 'purple' },
  enterprise: { name: 'Ultimate Gaming', price: '$49.99', game: 'Rust', color: 'green' }
};

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if a plan was selected from the pricing page
    const plan = searchParams.get('plan');
    if (plan && planInfo[plan as keyof typeof planInfo]) {
      setSelectedPlan(plan);
    }
  }, [searchParams]);

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            // Add selected plan to user metadata if available
            ...(selectedPlan && { 
              subscription_plan: selectedPlan,
              subscription_game: planInfo[selectedPlan as keyof typeof planInfo].game,
              subscription_status: 'pending' // Will be activated after payment
            })
          }
        },
      });

      if (error) throw error;
      
      // If plan is selected, after registration we redirect to subscription page
      // Otherwise go to email verification page
      if (selectedPlan && data.user) {
        router.push(`/dashboard/subscriptions`);
      } else {
        router.push('/auth/verify-email');
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="border-card p-8 space-y-6 rounded-xl shadow-xl bg-transparent">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Create Account</h1>
            <p className="mt-2 text-text-secondary">
              Join thousands of users
            </p>
          </div>

          {selectedPlan && (
            <div className={`p-4 rounded-lg bg-${planInfo[selectedPlan as keyof typeof planInfo].color}-600/10 border border-${planInfo[selectedPlan as keyof typeof planInfo].color}-600/30`}>
              <p className="text-sm font-medium">
                You selected the <span className={`text-${planInfo[selectedPlan as keyof typeof planInfo].color}-600 font-bold`}>
                  {planInfo[selectedPlan as keyof typeof planInfo].name}
                </span> plan ({planInfo[selectedPlan as keyof typeof planInfo].price}/month)
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Game: <span className="font-medium">{planInfo[selectedPlan as keyof typeof planInfo].game}</span>
              </p>
              <p className="text-xs text-text-secondary mt-1">
                You'll be able to complete your subscription after registration
              </p>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
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
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">
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
              <p className="mt-1 text-xs text-text-secondary">
                Password must be at least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-subtle-border focus:border-primary/50"
              />
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full btn-hover"
              radius="full"
              isLoading={loading}
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-text-secondary">
              Already have an account?{' '}
            </span>
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium">
              Login
            </Link>
          </div>
          
          {!selectedPlan && (
            <div className="text-center text-xs text-text-secondary pt-4 border-t border-subtle-border">
              Want to explore our subscription plans?{' '}
              <Link href="/pricing" className="text-primary hover:text-primary/80">
                View pricing
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
} 