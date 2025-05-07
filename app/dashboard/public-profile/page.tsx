'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/button'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

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
      <div className={`w-11 h-6 bg-card-hover rounded-full peer peer-focus:ring-2 peer-focus:ring-${color}/50 
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
        after:bg-white after:border-subtle-border after:border after:rounded-full 
        after:h-5 after:w-5 after:transition-all 
        peer-checked:bg-${color}`}></div>
    </label>
  )
}

export default function PublicProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [publicProfile, setPublicProfile] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [copied, setCopied] = useState(false)
  
  // Profile data
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileUrl, setProfileUrl] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          return
        }
        
        setUser(session.user)
        
        // Set profile URL
        const uid = session.user.id
        setProfileUrl(`${window.location.origin}/profile/${uid}`)
        
        // Get user metadata
        if (session.user.user_metadata) {
          const { 
            username, 
            bio, 
            website, 
            location, 
            avatar_url,
            public_profile = true
          } = session.user.user_metadata
          
          if (username) setUsername(username)
          if (bio) setBio(bio)
          if (website) setWebsite(website)
          if (location) setLocation(location)
          if (avatar_url) setAvatarUrl(avatar_url)
          setPublicProfile(public_profile)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching profile:', error)
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])

  const handleSaveVisibility = async () => {
    try {
      setSaving(true)
      setMessage({ type: '', text: '' })
      
      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          public_profile: publicProfile
        }
      })
      
      if (error) {
        throw error
      }
      
      setMessage({ type: 'success', text: 'Profile visibility updated successfully!' })
    } catch (error: any) {
      console.error('Error updating profile visibility:', error)
      setMessage({ type: 'error', text: error.message || 'Error updating profile visibility. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const copyProfileUrl = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Public Profile</h1>
      
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
      
      <div className="card-effect p-6 space-y-4">
        <h2 className="text-xl font-semibold">Profile Visibility</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <label htmlFor="public-profile" className="font-medium">
              Public Profile
            </label>
            <p className="text-sm text-text-secondary">
              When enabled, your profile will be visible to anyone with the link
            </p>
          </div>
          <Switch
            id="public-profile"
            isSelected={publicProfile}
            onValueChange={setPublicProfile}
            color="primary"
          />
        </div>
        
        <div className="pt-4">
          <Button
            color="primary"
            className="w-full md:w-auto btn-hover"
            onClick={handleSaveVisibility}
            isLoading={saving}
            disabled={saving}
          >
            Save Visibility Settings
          </Button>
        </div>
      </div>
      
      <div className="card-effect p-6 space-y-6">
        <h2 className="text-xl font-semibold">Your Public Profile</h2>
        <p className="text-text-secondary">
          This is how others will see your profile{publicProfile ? '' : ' (currently private)'}
        </p>
        
        <div className="flex items-center justify-between p-3 bg-card-hover rounded-lg">
          <p className="text-sm truncate">{profileUrl}</p>
          <Button
            color="primary"
            variant="flat"
            size="sm"
            onClick={copyProfileUrl}
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
        
        {/* Profile preview */}
        <div className="border border-subtle-border rounded-lg overflow-hidden">
          <div className="bg-card-hover p-4 border-b border-subtle-border">
            <h3 className="font-medium">Profile Preview</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-2xl">
                    {username ? username[0].toUpperCase() : user?.email[0].toUpperCase()}
                  </div>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-bold">{username || 'Username not set'}</h2>
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                    {website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                {location && (
                  <p className="text-sm text-text-secondary mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    {location}
                  </p>
                )}
                <p className="text-sm mt-4">{bio || 'No bio provided yet.'}</p>
              </div>
            </div>
            
            <div className="border-t border-subtle-border pt-4">
              <h3 className="font-medium mb-2">User Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex gap-2">
                  <span className="text-text-secondary">User ID:</span>
                  <span className="truncate">{user?.id}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-secondary">Joined:</span>
                  <span>{new Date(user?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-effect p-6 space-y-4">
        <h2 className="text-xl font-semibold">Profile Details</h2>
        <p className="text-text-secondary">
          To update your profile information, go to the <a href="/dashboard/profile" className="text-primary hover:underline">Profile</a> page.
        </p>
      </div>
    </div>
  )
} 