'use client'

import { useState, useEffect } from 'react'
import { Button } from '@heroui/button'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  createSubscription, 
  getUserActiveSubscription, 
  getUserVisibleSubscription,
  cancelSubscription,
  getUserSubscriptionHistory
} from '@/lib/db';
import { SubscriptionDuration } from '@/lib/schema';

// Subscription plan data
const plans = [
  {
    id: 'basic',
    name: 'Basic Gaming Access',
    price: '$9.99',
    period: 'month',
    duration: 'month' as SubscriptionDuration,
    color: 'blue',
    game: 'Apex Legends',
    features: [
      'Standard game access',
      'Basic character skins',
      '5 loot boxes per month',
      'Standard matchmaking',
      'Basic customer support',
    ],
    popular: false
  },
  {
    id: 'basic',
    name: 'Basic Gaming Access',
    price: '$2.99',
    period: 'week',
    duration: 'week' as SubscriptionDuration,
    color: 'blue',
    game: 'Apex Legends',
    features: [
      'Standard game access',
      'Basic character skins',
      '1 loot box per week',
      'Standard matchmaking',
      'Basic customer support',
    ],
    popular: false
  },
  {
    id: 'basic',
    name: 'Basic Gaming Access',
    price: '$0.99',
    period: 'day',
    duration: 'day' as SubscriptionDuration,
    color: 'blue',
    game: 'Apex Legends',
    features: [
      'Standard game access',
      'Basic character skins',
      'Standard matchmaking',
      'Basic customer support',
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro Gamer',
    price: '$19.99',
    period: 'month',
    duration: 'month' as SubscriptionDuration,
    color: 'purple',
    game: 'Escape from Tarkov',
    features: [
      'Everything in Basic',
      'Premium character skins',
      'Priority matchmaking',
      'Exclusive weapon skins',
      '24/7 priority support',
    ],
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro Gamer',
    price: '$5.99',
    period: 'week',
    duration: 'week' as SubscriptionDuration,
    color: 'purple',
    game: 'Escape from Tarkov',
    features: [
      'Everything in Basic',
      'Premium character skins',
      'Priority matchmaking',
      'Exclusive weapon skins',
      '24/7 priority support',
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro Gamer',
    price: '$1.99',
    period: 'day',
    duration: 'day' as SubscriptionDuration,
    color: 'purple',
    game: 'Escape from Tarkov',
    features: [
      'Everything in Basic',
      'Premium character skins',
      'Priority matchmaking',
      '24/7 priority support',
    ],
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Ultimate Gaming',
    price: '$49.99',
    period: 'month',
    duration: 'month' as SubscriptionDuration,
    color: 'green',
    game: 'Rust',
    features: [
      'Everything in Pro',
      'Exclusive server access',
      'Private game servers',
      'Monthly bonus content',
      'Developer chat access',
    ],
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Ultimate Gaming',
    price: '$14.99',
    period: 'week',
    duration: 'week' as SubscriptionDuration,
    color: 'green',
    game: 'Rust',
    features: [
      'Everything in Pro',
      'Exclusive server access',
      'Private game servers',
      'Weekly bonus content',
      'Developer chat access',
    ],
    popular: false
  },
  {
    id: 'enterprise',
    name: 'Ultimate Gaming',
    price: '$4.99',
    period: 'day',
    duration: 'day' as SubscriptionDuration,
    color: 'green',
    game: 'Rust',
    features: [
      'Everything in Pro',
      'Exclusive server access',
      'Private game servers',
      'Developer chat access',
    ],
    popular: false
  }
]

// Group plans by game for easier display
const groupedPlans = {
  'Apex Legends': plans.filter(plan => plan.game === 'Apex Legends'),
  'Escape from Tarkov': plans.filter(plan => plan.game === 'Escape from Tarkov'),
  'Rust': plans.filter(plan => plan.game === 'Rust')
};

export default function SubscriptionsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<string | null>(null)
  const [currentDuration, setCurrentDuration] = useState<SubscriptionDuration | null>(null)
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('active')
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVC, setCardCVC] = useState('')
  const [nameOnCard, setNameOnCard] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          throw new Error('User not found')
        }
        
        setUser(user)
        
        // Get the user's visible subscription (active or canceled but not expired)
        const visibleSubscription = await getUserVisibleSubscription(user.id);
        
        if (visibleSubscription) {
          setCurrentPlan(visibleSubscription.plan_id);
          setCurrentDuration(visibleSubscription.duration as SubscriptionDuration || 'month');
          setSelectedGame(visibleSubscription.game);
          setSubscriptionStatus(visibleSubscription.status);
        } else {
          // Get the user's subscription data from metadata as fallback
          if (user.user_metadata?.subscription_plan) {
            setCurrentPlan(user.user_metadata.subscription_plan);
            setCurrentDuration(user.user_metadata.subscription_duration || 'month');
            setSelectedGame(user.user_metadata.subscription_game);
            setSubscriptionStatus(user.user_metadata.subscription_status || 'active');
          }
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error loading user data:', error)
        setLoading(false)
      }
    }
    
    loadUserData()
  }, [])

  // Calculate days remaining for subscription
  const getDaysRemaining = (renewalDate: string | undefined): number => {
    if (!renewalDate) return 0
    
    const renewal = new Date(renewalDate)
    const now = new Date()
    
    // Return difference in days, rounded down
    const diffTime = renewal.getTime() - now.getTime()
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)))
  }
  
  // Calculate hours remaining for subscription
  const getHoursRemaining = (renewalDate: string | undefined): number => {
    if (!renewalDate) return 0
    
    const renewal = new Date(renewalDate)
    const now = new Date()
    
    // Return difference in hours, rounded down
    const diffTime = renewal.getTime() - now.getTime()
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60)))
  }

  // Calculate percentage of subscription time remaining
  const getTimeRemainingPercentage = (startDate: string | undefined, renewalDate: string | undefined): number => {
    if (!startDate || !renewalDate) return 0
    
    const start = new Date(startDate)
    const renewal = new Date(renewalDate)
    const now = new Date()
    
    const totalDuration = renewal.getTime() - start.getTime()
    const elapsed = now.getTime() - start.getTime()
    
    // Calculate percentage remaining
    return Math.max(0, Math.min(100, ((totalDuration - elapsed) / totalDuration) * 100))
  }

  const handleOpenPaymentModal = (plan: any) => {
    setSelectedPlan(plan)
    setShowPaymentModal(true)
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedPlan(null)
    
    // Reset form fields
    setCardNumber('')
    setCardExpiry('')
    setCardCVC('')
    setNameOnCard('')
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card number with spaces every 4 digits
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const formattedValue = value.replace(/\B(?=(\d{4})+(?!\d))/g, ' ')
    setCardNumber(formattedValue)
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format expiry as MM/YY
    const value = e.target.value.replace(/\D/g, '')
    
    if (value.length <= 2) {
      setCardExpiry(value)
    } else {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2, 4)}`)
    }
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setPaymentProcessing(true)
      setMessage({ type: '', text: '' })
      
      // Validate form
      if (!cardNumber || !cardExpiry || !cardCVC || !nameOnCard) {
        throw new Error('Please fill out all payment fields')
      }
      
      // This is where you would integrate with a payment processor like Stripe
      // For demo purposes, we'll simulate a successful payment
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Get the last 4 digits of the card number
      const lastFour = cardNumber.replace(/\s/g, '').slice(-4)
      
      // Parse the plan price to a number
      const price = parseFloat(selectedPlan.price.replace('$', ''))
      
      // Create the subscription in the database with the selected duration
      const subscription = await createSubscription(
        user.id,
        selectedPlan.id,
        selectedPlan.game,
        price,
        lastFour,
        selectedPlan.duration
      )
      
      if (!subscription) {
        throw new Error('Failed to create subscription record')
      }
      
      // Also update user metadata for compatibility with existing code
      const { error } = await supabase.auth.updateUser({
        data: {
          subscription_plan: selectedPlan.id,
          subscription_game: selectedPlan.game,
          subscription_status: 'active',
          subscription_start_date: subscription.subscription_start,
          subscription_renewal_date: subscription.renewal_date,
          subscription_duration: selectedPlan.duration,
          last_four: lastFour
        }
      })
      
      if (error) {
        throw error
      }
      
      // Update local state
      setCurrentPlan(selectedPlan.id)
      setCurrentDuration(selectedPlan.duration)
      setSelectedGame(selectedPlan.game)
      setMessage({ type: 'success', text: `Successfully subscribed to ${selectedPlan.name} plan for ${selectedPlan.game}!` })
      
      // Close modal
      handleClosePaymentModal()
    } catch (error: any) {
      console.error('Error processing subscription:', error)
      setMessage({ type: 'error', text: error.message || 'Error processing payment. Please try again.' })
    } finally {
      setPaymentProcessing(false)
    }
  }

  const handleCancelSubscription = async () => {
    try {
      setLoading(true)
      
      // Get active subscription from database
      const activeSubscription = await getUserActiveSubscription(user.id)
      
      if (!activeSubscription) {
        throw new Error('No active subscription found')
      }
      
      // Cancel the subscription in the database
      const cancelled = await cancelSubscription(activeSubscription.id)
      
      if (!cancelled) {
        throw new Error('Failed to cancel subscription')
      }
      
      // Update local state to show canceled status
      setSubscriptionStatus('cancelled')
      
      // Also update user metadata for compatibility with existing code
      const { error } = await supabase.auth.updateUser({
        data: {
          subscription_status: 'cancelled'
        }
      })
      
      if (error) {
        throw error
      }
      
      setMessage({ type: 'success', text: 'Your subscription has been cancelled. You will still have access until it expires.' })
    } catch (error: any) {
      console.error('Error cancelling subscription:', error)
      setMessage({ type: 'error', text: error.message || 'Error cancelling subscription. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
      </div>
    )
  }

  const getDurationText = (duration: SubscriptionDuration) => {
    switch (duration) {
      case 'day': return 'day';
      case 'week': return 'week';
      case 'month': return 'month';
      default: return 'period';
    }
  };

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen">
      <h1 className="text-2xl font-bold">Game Subscription Management</h1>
      
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
      
      {currentPlan && (
        <div className="card-effect p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Current Subscription</h2>
              <p className="text-text-secondary">
                You are currently on the{' '}
                <span className={`text-${plans.find(p => p.id === currentPlan && p.duration === currentDuration)?.color}-600 font-medium`}>
                  {plans.find(p => p.id === currentPlan && p.duration === currentDuration)?.name || 'Unknown Plan'}
                </span> plan
              </p>
              <p className="text-sm mt-1">
                Game: <span className="font-medium">{selectedGame || user?.user_metadata?.subscription_game || 'Unknown'}</span>
              </p>
              <p className="text-sm">
                Duration: <span className="font-medium">{getDurationText(currentDuration || 'month')}</span>
              </p>
            </div>
            
            {subscriptionStatus === 'active' && (
              <Button
                color="danger"
                variant="flat"
                className="w-full md:w-auto"
                onClick={handleCancelSubscription}
                disabled={loading}
              >
                Cancel Subscription
              </Button>
            )}
          </div>
          
          {(user?.user_metadata?.subscription_renewal_date || user?.user_metadata?.subscription_end_date) && (
            <div className="mt-4">
              <div className="bg-card-hover rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-text-secondary text-sm">Subscription Status</span>
                  <span className={`${
                    subscriptionStatus === 'cancelled' 
                      ? 'bg-yellow-600/20 text-yellow-600' 
                      : 'bg-green-600/20 text-green-600'
                  } text-xs font-medium px-2 py-1 rounded-full`}>
                    {subscriptionStatus === 'cancelled' ? 'Canceled - Access Until Expiry' : 'Active'}
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">Time Remaining</span>
                    <span className="text-sm font-medium">
                      {currentDuration === 'day' ? 
                        `${getHoursRemaining(user.user_metadata.subscription_renewal_date)} hours` : 
                        `${getDaysRemaining(user.user_metadata.subscription_renewal_date)} days`}
                    </span>
                  </div>
                  <div className="h-2 bg-card-background rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        subscriptionStatus === 'cancelled'
                          ? 'bg-yellow-600'
                          : `bg-${plans.find(p => p.id === currentPlan && p.duration === currentDuration)?.color}-600`
                      }`}
                      style={{ 
                        width: `${getTimeRemainingPercentage(
                          user.user_metadata.subscription_start_date, 
                          user.user_metadata.subscription_renewal_date
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                {subscriptionStatus === 'cancelled' && (
                  <div className="mt-4 text-sm text-yellow-600 bg-yellow-600/10 p-3 rounded-md">
                    Your subscription has been canceled. You will still have access until {new Date(user.user_metadata.subscription_renewal_date).toLocaleDateString()} {currentDuration === 'day' ? `at ${new Date(user.user_metadata.subscription_renewal_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : ''}.
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="pt-4 border-t border-subtle-border">
            <h3 className="font-medium mb-2">Billing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-text-secondary">{subscriptionStatus === 'cancelled' ? 'Access ends on' : 'Next billing date'}</p>
                <p className="font-medium">
                  {user?.user_metadata?.subscription_renewal_date
                    ? new Date(user.user_metadata.subscription_renewal_date).toLocaleDateString()
                    : 'N/A'
                  }
                </p>
              </div>
              
              <div>
                <p className="text-sm text-text-secondary">Payment method</p>
                <p className="font-medium">•••• •••• •••• {user?.user_metadata?.last_four || '1234'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{currentPlan ? 'Change Game Plan' : 'Available Game Plans'}</h2>
        
        {/* Game selection tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(groupedPlans).map((game) => (
            <button
              key={game}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedGame || selectedGame === game
                  ? 'bg-primary text-white'
                  : 'bg-card-hover text-text-secondary hover:bg-card-background'
              }`}
              onClick={() => setSelectedGame(game)}
            >
              {game}
            </button>
          ))}
          {selectedGame && (
            <button
              className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-card-hover text-text-secondary hover:bg-card-background"
              onClick={() => setSelectedGame(null)}
            >
              View All
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans
            .filter(plan => !selectedGame || plan.game === selectedGame)
            .map((plan) => (
              <motion.div
                key={`${plan.id}-${plan.game}-${plan.duration}`}
                className={`card-effect p-6 border-card relative ${
                  plan.popular ? `border-${plan.color}-600/50` : ''
                } ${
                  currentPlan === plan.id && currentDuration === plan.duration ? `bg-${plan.color}-600/10 border-${plan.color}-600/50` : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {plan.popular && (
                  <div className={`absolute top-3 right-3 bg-${plan.color}-600 text-white text-xs py-1 px-2 rounded-full`}>
                    Popular
                  </div>
                )}
                
                <div className={`text-${plan.color}-600 font-bold text-xl mb-1`}>{plan.name}</div>
                <div className="text-sm text-text-secondary mb-2">Game: {plan.game}</div>
                <div className="text-sm text-text-secondary mb-2">Duration: {getDurationText(plan.duration)}</div>
                
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-text-secondary ml-1">/{plan.period}</span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className={`w-5 h-5 text-${plan.color}-600 mr-2 flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className={currentPlan === plan.id && currentDuration === plan.duration ? 'text-white' : ''}>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  color={plan.color === 'blue' ? 'primary' : (plan.color === 'purple' ? 'secondary' : 'success')}
                  className="w-full btn-hover"
                  onClick={() => handleOpenPaymentModal(plan)}
                  disabled={currentPlan === plan.id && currentDuration === plan.duration}
                >
                  {currentPlan === plan.id && currentDuration === plan.duration ? 'Current Plan' : (currentPlan ? 'Switch Plan' : 'Choose Plan')}
                </Button>
              </motion.div>
            ))}
        </div>
      </div>
      
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-card max-w-md w-full rounded-lg p-6 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button 
              className="absolute top-4 right-4 text-text-secondary hover:text-white"
              onClick={handleClosePaymentModal}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            
            <h2 className="text-xl font-semibold mb-4">Subscribe to {selectedPlan?.name}</h2>
            
            <div className="mb-6 space-y-2">
              <p className="text-text-secondary">
                You will be charged {selectedPlan?.price} for {selectedPlan?.game}.
              </p>
              <p className="text-sm flex items-center text-text-secondary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {selectedPlan?.duration === 'day' ? '1-day access' : 
                 selectedPlan?.duration === 'week' ? '7-day access' : 
                 '30-day access'}
              </p>
              <p className="text-sm flex items-center text-text-secondary">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                Subscription will automatically renew every {selectedPlan?.period}
              </p>
            </div>
            
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div>
                <label htmlFor="name-on-card" className="block text-sm font-medium mb-1">
                  Name on Card
                </label>
                <input
                  id="name-on-card"
                  type="text"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-card-background border border-subtle-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium mb-1">
                  Card Number
                </label>
                <input
                  id="card-number"
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-card-background border border-subtle-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={19}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium mb-1">
                    Expiry Date
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-card-background border border-subtle-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={5}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="cvc" className="block text-sm font-medium mb-1">
                    CVC
                  </label>
                  <input
                    id="cvc"
                    type="text"
                    value={cardCVC}
                    onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').substring(0, 3))}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-card-background border border-subtle-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  color="primary"
                  className="w-full btn-hover"
                  disabled={paymentProcessing}
                  isLoading={paymentProcessing}
                >
                  {paymentProcessing ? 'Processing...' : `Pay ${selectedPlan?.price} for ${selectedPlan?.duration === 'day' ? '1 day' : selectedPlan?.duration === 'week' ? '1 week' : '1 month'}`}
                </Button>
                
                <p className="text-center text-xs text-text-secondary mt-4">
                  This is a demo. No real payment will be processed.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
} 