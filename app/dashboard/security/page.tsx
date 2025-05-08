'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

// Custom Checkbox component
const Checkbox = ({ 
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
    <div className="relative flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onValueChange(e.target.checked)}
        className="sr-only peer"
      />
      <div className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer transition-all
        ${isSelected ? `bg-${color} border-${color}` : 'bg-card-hover border-subtle-border'}
        peer-focus:ring-2 peer-focus:ring-${color}/50`}
      >
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
          </svg>
        )}
      </div>
    </div>
  )
}

export default function SecurityPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changing, setChanging] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [savingSecurity, setSavingSecurity] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSection = searchParams.get('section') || 'overview'

  // Load user settings
  useEffect(() => {
    const loadUserSettings = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user?.user_metadata) {
        setTwoFactorEnabled(user.user_metadata.two_factor_enabled || false)
        setEmailNotifications(user.user_metadata.email_notifications !== false)
        setSessionTimeout(user.user_metadata.session_timeout || '30')
      }
    }
    
    loadUserSettings()
  }, [])

  const validatePassword = () => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }
    
    return null
  }

  const handleChangePassword = async () => {
    try {
      setChanging(true)
      setMessage({ type: '', text: '' })
      
      // Validate password
      const error = validatePassword()
      if (error) {
        setMessage({ type: 'error', text: error })
        return
      }
      
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password
      })
      
      if (updateError) {
        throw updateError
      }
      
      // Clear form
      setPassword('')
      setConfirmPassword('')
      
      setMessage({ type: 'success', text: 'Password changed successfully!' })
    } catch (error: any) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: error.message || 'Error changing password. Please try again.' })
    } finally {
      setChanging(false)
    }
  }

  const handleSaveSecuritySettings = async () => {
    try {
      setSavingSecurity(true)
      
      // Update user metadata with security settings
      const { error } = await supabase.auth.updateUser({
        data: {
          two_factor_enabled: twoFactorEnabled,
          email_notifications: emailNotifications,
          session_timeout: sessionTimeout
        }
      })
      
      if (error) {
        throw error
      }
      
      setMessage({ type: 'success', text: 'Security settings updated successfully!' })
    } catch (error: any) {
      console.error('Error updating security settings:', error)
      setMessage({ type: 'error', text: error.message || 'Error updating security settings. Please try again.' })
    } finally {
      setSavingSecurity(false)
    }
  }

  const handleTwoFactorToggle = async (enabled: boolean) => {
    setTwoFactorEnabled(enabled)
    
    // If enabling, navigate to 2FA setup
    if (enabled) {
      router.push('/dashboard/security?section=two-factor')
    }
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'email':
        return (
          <div className="card-effect p-6 space-y-6">
            <h2 className="text-xl font-semibold">Email Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <Checkbox
                  id="email-notifications"
                  isSelected={emailNotifications}
                  onValueChange={setEmailNotifications}
                  color="primary"
                />
                <div className="ml-3">
                  <label htmlFor="email-notifications" className="font-medium">
                    Security Email Notifications
                  </label>
                  <p className="text-sm text-text-secondary">
                    Receive email notifications for important security events
                  </p>
                </div>
              </div>
              
              <Button
                color="primary"
                className="w-full md:w-auto btn-hover mt-4"
                onClick={handleSaveSecuritySettings}
                isLoading={savingSecurity}
                disabled={savingSecurity}
              >
                Save Email Settings
              </Button>
            </div>
          </div>
        )
      
      case 'password':
        return (
          <div className="card-effect p-6 space-y-6">
            <h2 className="text-xl font-semibold">Change Password</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  radius="md"
                  className="w-full"
                />
                <p className="text-xs text-text-secondary mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  radius="md"
                  className="w-full"
                />
              </div>
              
              <Button
                color="primary"
                className="w-full md:w-auto btn-hover"
                onClick={handleChangePassword}
                isLoading={changing}
                disabled={changing || !password || !confirmPassword}
              >
                Change Password
              </Button>
            </div>
          </div>
        )
      
      case 'two-factor':
        return (
          <div className="card-effect p-6 space-y-6">
            <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
            
            <div className="space-y-2">
              <div className="flex items-start mb-4">
                <Checkbox
                  id="two-factor"
                  isSelected={twoFactorEnabled}
                  onValueChange={handleTwoFactorToggle}
                  color="primary"
                />
                <div className="ml-3">
                  <label htmlFor="two-factor" className="font-medium">
                    Enable Two-Factor Authentication
                  </label>
                  <p className="text-sm text-text-secondary">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              
              {twoFactorEnabled && (
                <div className="p-4 bg-card-hover rounded-lg">
                  <p className="text-sm mb-4">
                    Scan this QR code with an authenticator app like Google Authenticator or Authy.
                  </p>
                  {/* QR code and setup would be implemented here in a real app */}
                  <div className="w-32 h-32 bg-white p-2 mb-4 mx-auto">
                    <div className="w-full h-full bg-black p-4 flex items-center justify-center">
                      <span className="text-white text-xs">QR Code Placeholder</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="verification-code" className="block text-sm font-medium mb-1">
                      Verification Code
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id="verification-code"
                        type="text"
                        placeholder="Enter 6-digit code"
                        radius="md"
                        className="w-full"
                      />
                      <Button
                        color="primary"
                        className="btn-hover"
                      >
                        Verify
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      
      default:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link href="/dashboard/security?section=email" className="card-effect p-6 hover:bg-card-hover transition-colors">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600/20 text-blue-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Email Settings</h3>
                <p className="text-text-secondary text-sm">
                  Manage your email preferences and notifications
                </p>
              </Link>
              
              <Link href="/dashboard/security?section=password" className="card-effect p-6 hover:bg-card-hover transition-colors">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-600/20 text-purple-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Password</h3>
                <p className="text-text-secondary text-sm">
                  Change your password and password recovery options
                </p>
              </Link>
              
              <Link href="/dashboard/security?section=two-factor" className="card-effect p-6 hover:bg-card-hover transition-colors">
                <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-green-600/20 text-green-600 mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Two-Factor Authentication</h3>
                <p className="text-text-secondary text-sm">
                  Add an extra layer of security with 2FA
                </p>
              </Link>
            </div>
            
            <div className="card-effect p-6 space-y-6">
              <h2 className="text-xl font-semibold">Advanced Security Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="session-timeout" className="block text-sm font-medium mb-1">
                    Session Timeout (minutes)
                  </label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionTimeout(e.target.value)}
                    min="5"
                    max="120"
                    radius="md"
                    className="w-full max-w-xs"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    How long before your session expires due to inactivity
                  </p>
                </div>
                
                <Button
                  color="primary"
                  className="w-full md:w-auto btn-hover"
                  onClick={handleSaveSecuritySettings}
                  isLoading={savingSecurity}
                  disabled={savingSecurity}
                >
                  Save Security Settings
                </Button>
              </div>
            </div>
            
            <div className="card-effect p-6 border-red-500/20">
              <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
              
              <div className="mt-4 space-y-4">
                <p className="text-text-secondary">
                  These actions are destructive and cannot be reversed.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    color="danger"
                    variant="flat"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      alert('This is a simulated feature in this demo')
                    }}
                  >
                    Reset Account
                  </Button>
                  
                  <Button
                    color="danger"
                    variant="bordered"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      alert('This is a simulated feature in this demo')
                    }}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-8 p-6 bg-background min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Security Settings</h1>
        
        {activeSection !== 'overview' && (
          <Button
            color="default"
            variant="flat"
            className="w-full md:w-auto"
            onClick={() => router.push('/dashboard/security')}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Security Overview
          </Button>
        )}
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
      
      {renderSection()}
    </div>
  )
} 