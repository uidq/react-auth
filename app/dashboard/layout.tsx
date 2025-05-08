'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { initializeUser, incrementLoginCount } from '@/lib/db'

const sidebarLinks = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
      </svg>
    ),
    activeClass: 'bg-blue-600'
  },
  { 
    name: 'Security', 
    href: '/dashboard/security', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
      </svg>
    ),
    activeClass: 'bg-primary'
  },
  { 
    name: 'Subscriptions', 
    href: '/dashboard/subscriptions', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
      </svg>
    ),
    activeClass: 'bg-primary'
  },
  { 
    name: 'Public Profile', 
    href: '/dashboard/public-profile', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
      </svg>
    ),
    activeClass: 'bg-primary'
  },
  { 
    name: 'Profile', 
    href: '/dashboard/profile', 
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
      </svg>
    ),
    activeClass: 'bg-primary'
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/login')
        return
      }
      
      setUser(session.user)
      
      // Initialize user data in database if needed and update login count
      if (session.user) {
        try {
          await initializeUser(session.user.id)
          await incrementLoginCount(session.user.id)
        } catch (error) {
          console.error('Error initializing user data:', error)
        }
      }
      
      setLoading(false)
    }
    
    checkUser()
  }, [router])

  // Toggle sidebar on larger screens
  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-transparent overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-30 p-2 rounded-md text-gray-400 hover:text-white lg:hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 transform bg-transparent border-r border-zinc-900 overflow-y-auto transition-all duration-300 ease-in-out lg:static lg:inset-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${
          collapsed ? 'w-[50px]' : 'w-[170px]'
        }`}
      >
        <div className={`py-4 ${collapsed ? 'px-2' : 'px-3'}`}>
          <div className={`flex items-center gap-2 mb-6 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            {!collapsed && <span className="font-bold text-sm text-blue-600">Auth<span className="text-white">Base</span></span>}
          </div>
          
          <nav className="space-y-1">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`)
              
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-2 py-2 rounded-md transition-colors ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive 
                      ? `${link.activeClass} text-white` 
                      : 'text-gray-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  {link.icon}
                  {!collapsed && <span className="text-xs">{link.name}</span>}
                </Link>
              )
            })}
            
            {/* Sign Out Button */}
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/auth/login')
              }}
              className={`flex items-center gap-2 px-2 py-2 w-full text-left rounded-md text-gray-400 hover:bg-zinc-900 hover:text-white transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              {!collapsed && <span className="text-xs">Sign Out</span>}
            </button>
          </nav>
        </div>

        <div className={`absolute bottom-0 w-full p-2 border-t border-zinc-900 flex ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-8 h-8 mr-2 rounded-md bg-zinc-900 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
              </svg>
            </button>
          )}
          {collapsed && (
            <button
              onClick={toggleSidebar}
              className="flex items-center justify-center w-8 h-8 rounded-md bg-zinc-900 text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path>
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main content - full screen with no header */}
      <div className="flex-1 w-full">
        <main className="h-screen overflow-y-auto bg-transparent">
          {children}
        </main>
      </div>
    </div>
  )
} 