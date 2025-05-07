'use client'

import { useEffect, useState } from 'react';
import { Button } from '@heroui/button';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
      }
      
      setLoading(false);
    };
    
    checkUser();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.user_metadata?.username || user?.email}</h1>
        <p className="text-text-secondary">Here's what's happening with your account today.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div 
          className="card-effect p-6 flex items-center gap-4"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeIn}
        >
          <div className="p-3 rounded-full bg-primary/20">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Balance</p>
            <p className="text-xl font-semibold">$2,454</p>
          </div>
        </motion.div>

        <motion.div 
          className="card-effect p-6 flex items-center gap-4"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeIn}
        >
          <div className="p-3 rounded-full bg-green-500/20">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
            </svg>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Projects</p>
            <p className="text-xl font-semibold">12</p>
          </div>
        </motion.div>

        <motion.div 
          className="card-effect p-6 flex items-center gap-4"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeIn}
        >
          <div className="p-3 rounded-full bg-amber-500/20">
            <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Hours</p>
            <p className="text-xl font-semibold">256</p>
          </div>
        </motion.div>

        <motion.div 
          className="card-effect p-6 flex items-center gap-4"
          initial="hidden"
          animate="visible"
          custom={3}
          variants={fadeIn}
        >
          <div className="p-3 rounded-full bg-sky-500/20">
            <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div>
            <p className="text-text-secondary text-sm">Clients</p>
            <p className="text-xl font-semibold">8</p>
          </div>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="md:col-span-2 card-effect p-6"
          initial="hidden"
          animate="visible"
          custom={4}
          variants={fadeIn}
        >
          <h2 className="text-xl font-semibold mb-4">Activity Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card-hover">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium">Logged in from new device</p>
                <p className="text-text-secondary text-sm">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card-hover">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium">Profile was updated</p>
                <p className="text-text-secondary text-sm">Yesterday</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card-hover">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </div>
              <div>
                <p className="font-medium">Notification settings updated</p>
                <p className="text-text-secondary text-sm">3 days ago</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="card-effect p-6"
          initial="hidden"
          animate="visible"
          custom={5}
          variants={fadeIn}
        >
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Button 
              color="primary" 
              className="w-full justify-start gap-2" 
              variant="flat"
              radius="md"
              href="/dashboard/profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Update Profile
            </Button>
            <Button 
              color="primary" 
              className="w-full justify-start gap-2" 
              variant="flat"
              radius="md"
              href="/dashboard/security"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Change Password
            </Button>
            <Button 
              color="primary" 
              className="w-full justify-start gap-2" 
              variant="flat"
              radius="md"
              href="/dashboard/public-profile"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
              </svg>
              View Public Profile
            </Button>
          </div>
          
          <hr className="my-5 border-subtle-border" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">System Status</h3>
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
        </motion.div>
      </div>
    </div>
  );
} 