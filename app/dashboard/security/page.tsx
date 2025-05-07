'use client'

import { useState } from 'react'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'

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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Security Settings</h1>
      
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        
        <div className="card-effect p-6 space-y-6">
          <h2 className="text-xl font-semibold">Two-Factor Authentication</h2>
          
          <div className="space-y-2">
            <div className="flex items-start mb-4">
              <Checkbox
                id="two-factor"
                isSelected={twoFactorEnabled}
                onValueChange={setTwoFactorEnabled}
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
                  Two-factor authentication is currently a simulated feature in this demo.
                </p>
                {/* QR code and setup would be implemented here in a real app */}
                <div className="w-32 h-32 bg-white p-2 mb-4 mx-auto">
                  <div className="w-full h-full bg-black p-4 flex items-center justify-center">
                    <span className="text-white text-xs">QR Code Placeholder</span>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">
                  Scan this QR code with an authenticator app
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="card-effect p-6 space-y-6">
        <h2 className="text-xl font-semibold">Advanced Security Settings</h2>
        
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
              // In a real app, this would trigger a confirmation modal
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
              // In a real app, this would trigger a confirmation modal
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