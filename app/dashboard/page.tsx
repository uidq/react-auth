'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/button';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/auth/login');
        return;
      }
      
      setUser(session.user);
      setLoading(false);
    };
    
    checkUser();
  }, [router]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      }
    })
  };
  
  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div 
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
        <Button 
          color="primary" 
          className="btn-hover"
          radius="full"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div 
          className="md:col-span-3"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeIn}
        >
          <div className="border-card p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Welcome back!</h2>
            <div className="space-y-2">
              <p><span className="text-text-secondary">Email:</span> <span className="text-white">{user?.email}</span></p>
              <p><span className="text-text-secondary">User ID:</span> <span className="text-muted truncate block md:inline-block">{user?.id}</span></p>
              <p><span className="text-text-secondary">Last Sign In:</span> <span className="text-white">{new Date(user?.last_sign_in_at || Date.now()).toLocaleString()}</span></p>
            </div>
          </div>
          
          <motion.div 
            className="card-effect p-6 mb-6"
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeIn}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-full bg-primary/10">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 14V17M12 10V17M16 7V17M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Activity Overview</h3>
                <p className="text-text-secondary mb-4">
                  Track your recent activity and analytics
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-card-background p-3 rounded-md text-center">
                    <p className="text-2xl font-bold text-primary">3</p>
                    <p className="text-xs text-text-secondary">Logins</p>
                  </div>
                  <div className="bg-card-background p-3 rounded-md text-center">
                    <p className="text-2xl font-bold text-primary">12</p>
                    <p className="text-xs text-text-secondary">Actions</p>
                  </div>
                  <div className="bg-card-background p-3 rounded-md text-center">
                    <p className="text-2xl font-bold text-primary">85%</p>
                    <p className="text-xs text-text-secondary">Completion</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="card-effect p-6"
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeIn}
          >
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-full bg-primary/10">
                <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 8V16M8 12H16M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create New Project</h3>
                <p className="text-text-secondary mb-4">
                  Start working on a new project
                </p>
                <Button color="primary" variant="flat" className="mt-2">
                  New Project
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="md:col-span-1 space-y-6"
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeIn}
        >
          <div className="card-effect p-4">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full bg-card-hover hover:bg-card-hover/70 transition-colors duration-200 text-left px-4 py-2 rounded-md">
                Edit Profile
              </button>
              <button className="w-full bg-card-hover hover:bg-card-hover/70 transition-colors duration-200 text-left px-4 py-2 rounded-md">
                Security Settings
              </button>
              <button className="w-full bg-card-hover hover:bg-card-hover/70 transition-colors duration-200 text-left px-4 py-2 rounded-md">
                Notifications
              </button>
              <button className="w-full bg-card-hover hover:bg-card-hover/70 transition-colors duration-200 text-left px-4 py-2 rounded-md">
                Billing
              </button>
            </div>
          </div>
          
          <div className="card-effect p-4">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Database</span>
                  <span className="text-xs text-green-500">Online</span>
                </div>
                <div className="w-full bg-card-hover h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Storage</span>
                  <span className="text-xs text-primary">45%</span>
                </div>
                <div className="w-full bg-card-hover h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm">Authentication</span>
                  <span className="text-xs text-green-500">Active</span>
                </div>
                <div className="w-full bg-card-hover h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 