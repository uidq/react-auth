'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { getUserSettings, saveUserSettings, getRecentVisitors, getVisitHistory } from '@/lib/db'

// Custom Switch component
const Switch = ({ 
  id, 
  isSelected, 
  onValueChange, 
  color = "primary" 
}: { 
  id: string, 
  isSelected: boolean, 
  onValueChange: (checked: boolean) => void,
  color?: string 
}) => {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input 
        id={id}
        type="checkbox" 
        checked={isSelected}
        onChange={(e) => onValueChange(e.target.checked)}
        className="sr-only peer" 
      />
      <div className={`w-12 h-6 bg-card-hover rounded-full peer 
        peer-focus:ring-2 peer-focus:ring-${color}/20 
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
        after:bg-white after:border-subtle-border after:border after:rounded-full 
        after:h-5 after:w-5 after:transition-all 
        peer-checked:bg-${color}`}></div>
    </label>
  )
}

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Account settings
  const [darkMode, setDarkMode] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(true)
  const [timezone, setTimezone] = useState('UTC')
  const [language, setLanguage] = useState('en')
  
  // Visit stats
  const [lastVisit, setLastVisit] = useState<string | null>(null)
  const [profileVisits, setProfileVisits] = useState<number>(0)
  const [visitHistory, setVisitHistory] = useState<any[]>([])
  const [recentVisitors, setRecentVisitors] = useState<any[]>([])
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          return
        }
        
        setUser(session.user)
        
        // Get user settings from database
        const userSettings = await getUserSettings(session.user.id)
        
        if (userSettings) {
          setDarkMode(userSettings.dark_mode)
          setEmailUpdates(userSettings.email_updates)
          setTimezone(userSettings.timezone)
          setLanguage(userSettings.language)
        } else {
          // Fallback to metadata if database records don't exist yet
          const { 
            dark_mode, 
            email_updates, 
            timezone, 
            language,
            last_visit,
            profile_visits = 0
          } = session.user.user_metadata || {}
          
          if (dark_mode !== undefined) setDarkMode(dark_mode)
          if (email_updates !== undefined) setEmailUpdates(email_updates)
          if (timezone) setTimezone(timezone)
          if (language) setLanguage(language)
          if (last_visit) setLastVisit(last_visit)
          setProfileVisits(profile_visits)
        }
        
        // Update last visit time
        const now = new Date().toISOString()
        await supabase.auth.updateUser({
          data: {
            last_visit: now
          }
        })
        
        // Fetch visit history from database
        const historyData = await getVisitHistory(session.user.id)
        setVisitHistory(historyData)
        
        // Fetch recent visitors from database
        const visitors = await getRecentVisitors(session.user.id)
        if (visitors.length > 0) {
          setRecentVisitors(visitors.map(visitor => ({
            id: visitor.id,
            name: visitor.visitor_name || 'Anonymous',
            time: visitor.visited_at
          })))
        } else {
          // Fallback to mock data if no real data exists yet
          setRecentVisitors(generateMockVisitors())
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setLoading(false)
      }
    }
    
    fetchUserData()
  }, [])

  const generateMockVisitors = () => {
    return [
      { id: '1', name: 'Anonymous', time: new Date().toISOString() },
      { id: '2', name: 'Anonymous', time: new Date(Date.now() - 86400000).toISOString() },
      { id: '3', name: 'Anonymous', time: new Date(Date.now() - 86400000 * 2).toISOString() },
    ]
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      
      if (!user) {
        throw new Error('User not found')
      }
      
      // Update user settings in database
      const success = await saveUserSettings({
        user_id: user.id,
        dark_mode: darkMode,
        email_updates: emailUpdates,
        timezone,
        language
      })
      
      if (!success) {
        throw new Error('Failed to save settings to database')
      }
      
      // Also update user metadata for backward compatibility
      const { error } = await supabase.auth.updateUser({
        data: {
          dark_mode: darkMode,
          email_updates: emailUpdates,
          timezone,
          language
        }
      })
      
      if (error) {
        throw error
      }
      
      setMessage({ type: 'success', text: 'Account settings updated successfully!' })
    } catch (error: any) {
      console.error('Error updating account settings:', error)
      setMessage({ type: 'error', text: error.message || 'Error updating settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
          <p className="text-text-secondary">Manage your preferences and profile information</p>
        </div>
        
        <Button
          color="primary"
          className="btn-hover"
          onClick={handleSaveSettings}
          isLoading={saving}
          disabled={saving}
          size="lg"
          radius="lg"
        >
          Save Changes
        </Button>
      </div>
      
      {message.text && (
        <motion.div 
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message.text}
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          className="md:col-span-2 space-y-8"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeIn}
        >
          <div className="rounded-xl border border-subtle-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-6">Preferences</h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-lg">Dark Mode</h3>
                  <p className="text-text-secondary">
                    Use dark theme for the application
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  isSelected={darkMode}
                  onValueChange={setDarkMode}
                  color="primary"
                />
              </div>
              
              <div className="border-t border-subtle-border pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">Email Updates</h3>
                    <p className="text-text-secondary">
                      Receive updates about product news and features
                    </p>
                  </div>
                  <Switch
                    id="email-updates"
                    isSelected={emailUpdates}
                    onValueChange={setEmailUpdates}
                    color="primary"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <motion.div 
            className="rounded-xl border border-subtle-border bg-card p-6 shadow-sm"
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeIn}
          >
            <h2 className="text-xl font-semibold mb-6">Regional Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium mb-2">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 bg-card-background border border-subtle-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="language" className="block text-sm font-medium mb-2">
                  Language
                </label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-card-background border border-subtle-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                </select>
              </div>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="space-y-8">
          <motion.div 
            className="rounded-xl border border-subtle-border bg-card p-6 shadow-sm"
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeIn}
          >
            <h2 className="text-xl font-semibold mb-6">Activity Overview</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-text-secondary font-medium">Last Visit</h3>
                <p className="font-medium text-lg">
                  {lastVisit ? new Date(lastVisit).toLocaleString() : 'First visit'}
                </p>
              </div>
              
              <div className="border-t border-subtle-border pt-6">
                <h3 className="text-sm text-text-secondary font-medium mb-2">Profile Visits</h3>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-primary">{profileVisits}</p>
                  <p className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">+12% this month</p>
                </div>
              </div>
              
              <div className="border-t border-subtle-border pt-6">
                <h3 className="text-sm font-medium mb-4">Recent Visitors</h3>
                <div className="space-y-3">
                  {recentVisitors.map((visitor) => (
                    <div key={visitor.id} className="flex items-center p-3 rounded-lg bg-card-hover transition-colors hover:bg-card-hover/80">
                      <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center mr-3">
                        {visitor.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{visitor.name}</p>
                        <p className="text-xs text-text-secondary">{new Date(visitor.time).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="rounded-xl border border-subtle-border bg-card p-6 shadow-sm"
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeIn}
          >
            <h2 className="text-xl font-semibold mb-4">Visit Activity</h2>
            
            <div className="h-40 flex items-end gap-1">
              {visitHistory.slice(-14).map((day, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  <div 
                    className="w-full bg-primary/30 hover:bg-primary/50 transition-colors rounded-sm cursor-help group-hover:bg-primary/50"
                    style={{ height: `${Math.max(5, day.visits * 10)}%` }}
                  ></div>
                  <span className="text-[10px] text-text-secondary mt-1">
                    {index % 2 === 0 ? day.date.slice(-2) : ''}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 bg-card-background border border-subtle-border rounded-md px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-max">
                    {day.date}: {day.visits} visits
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-xs text-text-secondary text-center mt-4">
              Last 14 days of profile visits
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 