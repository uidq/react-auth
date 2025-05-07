'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@heroui/button'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

export default function PublicProfileView() {
  const { uid } = useParams()
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [profile, setProfile] = useState({
    username: '',
    bio: '',
    website: '',
    location: '',
    avatar_url: null,
    created_at: '',
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!uid) {
          setNotFound(true)
          setLoading(false)
          return
        }

        // This would typically be a server function or API endpoint that fetches
        // the public profile data for a user based on their ID
        // For demo purposes, we'll simulate it with admin data access
        
        // In a real app, this would be a secure server function
        // that returns only public profile data if the profile is set to public
        const { data, error } = await supabase
          .from('users')
          .select('id, metadata, created_at')
          .eq('id', uid)
          .single()

        if (error || !data) {
          // Simulate result for demo purposes
          // Fetch user metadata directly (this wouldn't be possible in a real app this way)
          // This is just for demonstration
          
          // Check if we're viewing our own profile
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user.id === uid) {
            const userData = session.user
            
            setProfile({
              username: userData.user_metadata?.username || '',
              bio: userData.user_metadata?.bio || '',
              website: userData.user_metadata?.website || '',
              location: userData.user_metadata?.location || '',
              avatar_url: userData.user_metadata?.avatar_url || null,
              created_at: userData.created_at,
            })
            
            setLoading(false)
            return
          }
          
          // Create simulated data for the demo
          if (uid.length > 10) {
            const publicProfile = Math.random() > 0.3 // 70% chance profile is public
            
            if (!publicProfile) {
              setIsPrivate(true)
              setLoading(false)
              return
            }
            
            setProfile({
              username: 'Demo User',
              bio: 'This is a simulated user profile for demonstration purposes.',
              website: 'https://example.com',
              location: 'Internet',
              avatar_url: null,
              created_at: new Date().toISOString(),
            })
            
            setLoading(false)
            return
          }
          
          setNotFound(true)
          setLoading(false)
          return
        }

        // In a real application, we would check here if the profile is public
        const isPublicProfile = data.metadata?.public_profile !== false
        
        if (!isPublicProfile) {
          setIsPrivate(true)
          setLoading(false)
          return
        }
        
        setProfile({
          username: data.metadata?.username || '',
          bio: data.metadata?.bio || '',
          website: data.metadata?.website || '',
          location: data.metadata?.location || '',
          avatar_url: data.metadata?.avatar_url || null,
          created_at: data.created_at,
        })
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setNotFound(true)
        setLoading(false)
      }
    }
    
    fetchUserProfile()
  }, [uid])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center card-effect p-12">
          <svg className="w-20 h-20 text-primary mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h1 className="text-3xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-text-secondary mb-6">
            The user profile you're looking for doesn't exist or has been removed.
          </p>
          <Button
            color="primary"
            href="/"
            className="btn-hover"
          >
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  if (isPrivate) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="text-center card-effect p-12">
          <svg className="w-20 h-20 text-primary mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
          <h1 className="text-3xl font-bold mb-4">Private Profile</h1>
          <p className="text-text-secondary mb-6">
            This user's profile is set to private and is not visible to others.
          </p>
          <Button
            color="primary"
            href="/"
            className="btn-hover"
          >
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <motion.div
        className="card-effect p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={`${profile.username}'s avatar`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-4xl">
                  {profile.username ? profile.username[0].toUpperCase() : 'U'}
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-center">{profile.username || 'User'}</h1>
            
            {profile.location && (
              <p className="text-text-secondary flex items-center gap-1 mt-2 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                {profile.location}
              </p>
            )}
            
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline mt-2 text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            
            <div className="mt-6 w-full text-center space-y-1 border-t border-subtle-border pt-4">
              <p className="text-sm text-text-secondary">
                User ID
              </p>
              <p className="text-sm font-medium">
                {uid}
              </p>
            </div>
            
            <div className="mt-4 w-full text-center space-y-1">
              <p className="text-sm text-text-secondary">
                Joined
              </p>
              <p className="text-sm font-medium">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="md:w-2/3">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About</h2>
              <p className="text-text-secondary">
                {profile.bio || 'This user has not added a bio yet.'}
              </p>
            </div>
            
            <div className="border-t border-subtle-border pt-6">
              <h2 className="text-xl font-semibold mb-4">Activity</h2>
              
              {/* In a real app, you might display activity, posts, etc. */}
              <div className="card-effect p-4 bg-card-hover text-center">
                <p className="text-text-secondary">
                  No activity to display
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 