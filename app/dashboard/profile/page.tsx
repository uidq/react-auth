'use client'

import { useState, useEffect } from 'react'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Profile data
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          return
        }
        
        setUser(session.user)
        
        // Get user metadata
        if (session.user.user_metadata) {
          const { 
            username, 
            bio, 
            website, 
            location
          } = session.user.user_metadata
          
          if (username) setUsername(username)
          if (bio) setBio(bio)
          if (website) setWebsite(website)
          if (location) setLocation(location)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          username,
          bio,
          website,
          location
        }
      })
      
      if (error) {
        throw error
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: error.message || 'Error updating profile. Please try again.' })
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

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <Button
          color="primary"
          variant="flat"
          as="a"
          href="/dashboard/public-profile"
          className="btn-hover"
        >
          View Public Profile
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
      
      <div className="card-effect p-6 space-y-6">
        {/* Profile form */}
        <div className="space-y-4 w-full">
          <div>
            <label htmlFor="username" className="text-sm font-medium block mb-1">
              Username
            </label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              fullWidth
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="text-sm font-medium block mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={3}
              className="w-full px-3 py-2 bg-card rounded-md border border-subtle-border focus:border-primary focus:outline-none"
            />
          </div>
          
          <div>
            <label htmlFor="website" className="text-sm font-medium block mb-1">
              Website
            </label>
            <Input
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
              fullWidth
            />
          </div>
          
          <div>
            <label htmlFor="location" className="text-sm font-medium block mb-1">
              Location
            </label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, Country"
              fullWidth
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-subtle-border">
          <Button
            color="primary"
            onClick={handleSaveProfile}
            isLoading={saving}
            isDisabled={saving}
          >
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="card-effect p-6 space-y-4">
        <h2 className="text-xl font-semibold">Public Profile</h2>
        <p className="text-text-secondary">
          To manage your public profile visibility, go to the <a href="/dashboard/public-profile" className="text-primary hover:underline">Public Profile</a> page.
        </p>
      </div>
    </div>
  )
} 