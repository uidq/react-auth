'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const fileInputRef = useRef<HTMLInputElement>(null)

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
          const { username, bio, website, location, avatar_url } = session.user.user_metadata
          if (username) setUsername(username)
          if (bio) setBio(bio)
          if (website) setWebsite(website)
          if (location) setLocation(location)
          if (avatar_url) setAvatarUrl(avatar_url)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return
      }
      
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`
      
      // Upload the file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)
        
      if (uploadError) {
        throw uploadError
      }
      
      // Get the public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
      
      if (data) {
        // Update avatar URL
        setAvatarUrl(data.publicUrl)
      }
    } catch (error) {
      console.error('Error uploading avatar:', error)
      setMessage({ type: 'error', text: 'Error uploading avatar. Please try again.' })
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      
      const updates = {
        username,
        bio,
        website,
        location,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: updates
      })
      
      if (error) {
        throw error
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Error updating profile. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
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
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
      
      {message.text && (
        <motion.div 
          className={`p-4 mb-6 rounded-lg ${
            message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message.text}
        </motion.div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-effect p-6">
          <div className="flex flex-col items-center">
            <div 
              className="w-32 h-32 rounded-full border-4 border-primary relative overflow-hidden cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-4xl">
                  {username ? username[0].toUpperCase() : user?.email[0].toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
            </div>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-text-secondary text-sm mt-3">
              Click to upload a new avatar
            </p>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <h3 className="font-medium mb-1">User ID</h3>
              <p className="text-sm text-text-secondary break-all">{user?.id}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Email</h3>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Last Sign In</h3>
              <p className="text-sm text-text-secondary">{new Date(user?.last_sign_in_at || Date.now()).toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="card-effect p-6 md:col-span-2 space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
              placeholder="Enter a username"
              radius="md"
              className="w-full"
            />
            <p className="text-xs text-text-secondary mt-1">
              This will be displayed on your profile and in your public URL
            </p>
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio about yourself"
              className="w-full px-3 py-2 bg-card-background border border-subtle-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              rows={4}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="website" className="block text-sm font-medium mb-1">
                Website
              </label>
              <Input
                id="website"
                type="text"
                value={website}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                radius="md"
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocation(e.target.value)}
                placeholder="City, Country"
                radius="md"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-subtle-border">
            <Button
              color="primary"
              className="w-full md:w-auto btn-hover"
              onClick={handleSaveProfile}
              isLoading={saving}
              disabled={saving}
            >
              Save Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 