import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSurvey } from '@/contexts/SurveyContext'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, MapPin, Users, Trophy, Award, FileText, RefreshCw, BarChart3 } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import SurveyModal from '@/components/SurveyModal'

interface DashboardStats {
  total_events_attended: number;
  total_hours_contributed: number;
  total_waste_collected: number;
  badges_earned: number;
  certificates_earned: number;
}

interface ProgressData {
  monthlyGoal: number;
  currentProgress: number;
  weeklyProgress: number[];
  activityData: { month: string; events: number; hours: number; waste: number }[];
}

export default function Dashboard() {
  const { user } = useAuth()
  const { isSurveyOpen, closeSurvey, openSurvey } = useSurvey()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()
  const hasCheckedSurvey = useRef(false)
  
  // Progress tracking data
  const [progressData, setProgressData] = useState<ProgressData>({
    monthlyGoal: 20, // 20 hours per month goal
    currentProgress: 0,
    weeklyProgress: [2, 4, 3, 6, 5, 4, 3], // Last 7 days
    activityData: [
      { month: 'Jan', events: 2, hours: 8, waste: 15 },
      { month: 'Feb', events: 3, hours: 12, waste: 22 },
      { month: 'Mar', events: 1, hours: 4, waste: 8 },
      { month: 'Apr', events: 4, hours: 16, waste: 28 },
      { month: 'May', events: 2, hours: 8, waste: 18 },
      { month: 'Jun', events: 3, hours: 12, waste: 25 },
    ]
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Check if user has completed survey (only once)
        if (user && !hasCheckedSurvey.current) {
          const userId = 'volunteer_id' in user ? user.volunteer_id : 'unknown';
          const hasCompletedSurvey = localStorage.getItem(`surveyCompleted_${userId}`);
          if (!hasCompletedSurvey && !isSurveyOpen) {
            // Show survey modal if not completed
            openSurvey()
          }
          hasCheckedSurvey.current = true
        }
        
        // Fetch data individually with error handling for each endpoint
        const promises = [
          // Fetch volunteer statistics
          apiClient.getVolunteerStatistics()
            .then(response => setStats(response.data))
            .catch(error => {
              console.error('Error fetching volunteer statistics:', error)
              setStats({
                total_events_attended: 0,
                total_hours_contributed: 0,
                total_waste_collected: 0,
                badges_earned: 0,
                certificates_earned: 0
              })
            }),
          
          // Fetch events and check for local enrollment tracking
          apiClient.getAvailableEvents()
            .then(response => {
              console.log('All events:', response.data)
              
              // Get locally stored enrollments from localStorage
              const storedEnrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]')
              console.log('Stored enrollments:', storedEnrollments)
              
              // Filter events based on stored enrollments or backend enrollment fields
              const enrolledEvents = response.data.filter(event => {
                const isStoredEnrolled = storedEnrollments.includes(event.event_id)
                const isBackendEnrolled = event.is_enrolled === true
                
                console.log(`Event ${event.event_name}: stored=${isStoredEnrolled}, backend=${isBackendEnrolled}, is_enrolled=${event.is_enrolled}, can_enroll=${event.can_enroll}`)
                
                return isStoredEnrolled || isBackendEnrolled
              });
              
              console.log('Enrolled events:', enrolledEvents)
              setRecentEvents(enrolledEvents.slice(0, 3));
            })
            .catch(error => {
              console.error('Error fetching events:', error)
              setRecentEvents([])
            }),
          
          // Fetch badges with proper error handling
          apiClient.getVolunteerBadges()
            .then(response => {
              console.log('Badges response:', response.data)
              // Ensure badges is an array
              const badgesData = Array.isArray(response.data) ? response.data : []
              setBadges(badgesData)
            })
            .catch(error => {
              console.error('Error fetching badges:', error)
              setBadges([])
            })
        ]
        
        // Wait for all promises to complete (either resolve or reject)
        await Promise.allSettled(promises)
        
        // Update progress data based on stats
        if (stats) {
          setProgressData(prev => ({
            ...prev,
            currentProgress: Math.min((stats.total_hours_contributed / prev.monthlyGoal) * 100, 100)
          }))
        }
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        setError(error.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [location.pathname, user, isSurveyOpen, openSurvey])

  const refreshDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Refresh data individually with error handling for each endpoint
      const promises = [
        // Refresh volunteer statistics
        apiClient.getVolunteerStatistics()
          .then(response => setStats(response.data))
          .catch(error => {
            console.error('Error refreshing volunteer statistics:', error)
            setStats({
              total_events_attended: 0,
              total_hours_contributed: 0,
              total_waste_collected: 0,
              badges_earned: 0,
              certificates_earned: 0
            })
          }),
        
        // Refresh events and filter for enrolled events
        apiClient.getAvailableEvents()
          .then(response => {
            console.log('Refreshing - All events:', response.data)
            
            // Get locally stored enrollments from localStorage
            const storedEnrollments = JSON.parse(localStorage.getItem('userEnrollments') || '[]')
            console.log('Refreshing - Stored enrollments:', storedEnrollments)
            
            // Filter events based on stored enrollments or backend enrollment fields
            const enrolledEvents = response.data.filter(event => {
              const isStoredEnrolled = storedEnrollments.includes(event.event_id)
              const isBackendEnrolled = event.is_enrolled === true
              
              console.log(`Refresh - Event ${event.event_name}: stored=${isStoredEnrolled}, backend=${isBackendEnrolled}, is_enrolled=${event.is_enrolled}, can_enroll=${event.can_enroll}`)
              
              return isStoredEnrolled || isBackendEnrolled
            });
            
            console.log('Refreshing - Enrolled events:', enrolledEvents)
            setRecentEvents(enrolledEvents.slice(0, 3));
          })
          .catch(error => {
            console.error('Error refreshing events:', error)
            setRecentEvents([])
          }),
        
        // Refresh badges with proper error handling
        apiClient.getVolunteerBadges()
          .then(response => {
            console.log('Refreshing badges response:', response.data)
            // Ensure badges is an array
            const badgesData = Array.isArray(response.data) ? response.data : []
            setBadges(badgesData)
          })
          .catch(error => {
            console.error('Error refreshing badges:', error)
            setBadges([])
          })
      ]
      
      // Wait for all promises to complete (either resolve or reject)
      await Promise.allSettled(promises)
    } catch (error: any) {
      console.error('Error refreshing dashboard data:', error)
      setError(error.message || 'Failed to refresh dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSurveyComplete = () => {
    // Mark survey as completed for this user
    if (user && 'volunteer_id' in user) {
      const userId = user.volunteer_id;
      localStorage.setItem(`surveyCompleted_${userId}`, 'true');
    }
    closeSurvey();
  };

  const handleSurveySkip = () => {
    // User can skip for now, but we'll still show the option in quick actions
    closeSurvey();
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Dashboard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-gray-50">
      {/* Survey Modal */}
      <SurveyModal 
        open={isSurveyOpen} 
        onClose={closeSurvey} 
        onSurveyComplete={handleSurveyComplete} 
        onSkip={handleSurveySkip}
      />
      
      {/* Enhanced Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100 rounded-lg mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Volunteer Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.first_name}!</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-700 font-medium">Active</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDashboard}
            disabled={isLoading}
            className="hidden sm:flex border-green-200 hover:bg-green-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Welcome Header */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-green-500">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 animate-fade-in-down">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-lg text-gray-700">
            Keep up the great work in making Ethiopia cleaner and greener.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 md:mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
              <Calendar className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.total_events_attended || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total plogging events
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Contributed</CardTitle>
              <Clock className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.total_hours_contributed || 0}</div>
              <p className="text-xs text-muted-foreground">
                Volunteer hours
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waste Collected</CardTitle>
              <Trophy className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.total_waste_collected || 0} kg</div>
              <p className="text-xs text-muted-foreground">
                Total waste collected
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Award className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats?.badges_earned || 0}</div>
              <p className="text-xs text-muted-foreground">
                Achievement badges
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracking Section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* Monthly Goal Progress */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-green-600" />
                Monthly Goal
              </CardTitle>
              <CardDescription>
                Your progress towards {progressData.monthlyGoal} hours this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{stats?.total_hours_contributed || 0}</span>
                  <span className="text-sm text-gray-500">/ {progressData.monthlyGoal} hours</span>
                </div>
                <Progress 
                  value={Math.min(((stats?.total_hours_contributed || 0) / progressData.monthlyGoal) * 100, 100)} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{Math.round(((stats?.total_hours_contributed || 0) / progressData.monthlyGoal) * 100)}% complete</span>
                  <span>{Math.max(progressData.monthlyGoal - (stats?.total_hours_contributed || 0), 0)} hours remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Activity Chart */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Weekly Activity
              </CardTitle>
              <CardDescription>
                Hours volunteered in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={progressData.weeklyProgress.map((hours, index) => ({ 
                  day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][index], 
                  hours 
                }))}>
                  <Bar dataKey="hours" fill="#10b981" radius={[2, 2, 0, 0]} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '6px',
                      fontSize: '12px'
                    }} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Impact Summary */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-purple-600" />
                Impact Summary
              </CardTitle>
              <CardDescription>
                Your environmental contribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Events</span>
                  </div>
                  <span className="font-semibold">{stats?.total_events_attended || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Hours</span>
                  </div>
                  <span className="font-semibold">{stats?.total_hours_contributed || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Waste (kg)</span>
                  </div>
                  <span className="font-semibold">{stats?.total_waste_collected || 0}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Badges</span>
                  </div>
                  <span className="font-semibold">{stats?.badges_earned || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Trends Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-6 w-6 text-green-700" />
              Activity Trends
            </CardTitle>
            <CardDescription>
              Your volunteering activity over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData.activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px' 
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  name="Events Attended"
                />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Hours Volunteered"
                />
                <Line 
                  type="monotone" 
                  dataKey="waste" 
                  stroke="#f59e0b" 
                  strokeWidth={3} 
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  name="Waste Collected (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Events and Badges */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Events */}
          <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="h-6 w-6 text-green-700" />
                My Enrolled Events
              </CardTitle>
              <CardDescription>
                Events you've enrolled in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {recentEvents.map((event) => {
                    return (
                      <Link 
                        to={`/events/${event.event_id}`} 
                        key={event.event_id} 
                        className="block"
                      >
                        <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                          <div>
                            <h4 className="font-semibold text-lg text-gray-800">{event.event_name}</h4>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <MapPin className="h-4 w-4 text-green-500" />
                              {event.location_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(event.event_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant="secondary" className="px-2 py-0.5 text-xs">
                              {event.status}
                            </Badge>
                            <Badge variant="outline" className="px-2 py-0.5 text-xs text-green-700 border-green-300">
                              {event.enrollment_status || 'Enrolled'}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No enrolled events</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Browse available events and enroll to get started!
                  </p>
                  <Button className="mt-6 px-6 py-3 text-base" variant="outline" asChild>
                    <Link to="/events">Browse Events</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Award className="h-6 w-6 text-green-700" />
                Your Badges
              </CardTitle>
              <CardDescription>
                Achievement badges you've earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {badges.map((badge) => (
                    <div key={badge.badge_id || badge.id || badge.name} className="text-center p-4 border rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-colors duration-200 flex flex-col items-center justify-center border-yellow-200">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                        {badge.image_url ? (
                          <img 
                            src={badge.image_url} 
                            alt={badge.badge_name || badge.name || 'Badge'}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                const fallback = parent.querySelector('.fallback-icon') as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                              }
                            }}
                          />
                        ) : null}
                        <Award className="h-8 w-8 text-white fallback-icon" style={{ display: badge.image_url ? 'none' : 'block' }} />
                      </div>
                      <h4 className="font-semibold text-base text-gray-800">{badge.badge_name || badge.name || 'Unknown Badge'}</h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {badge.description || 'No description available'}
                      </p>
                      {(badge.criteria_type || badge.criteria_value) && (
                        <div className="mt-2 px-2 py-1 bg-yellow-100 rounded-full">
                          <span className="text-xs text-yellow-800 font-medium">
                            {badge.criteria_type || 'Criteria'}: {badge.criteria_value || 'N/A'}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No badges earned yet</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Participate in events and achieve milestones to earn badges!
                  </p>
                  <Button 
                    onClick={refreshDashboard} 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 border-green-500 text-green-700 hover:bg-green-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Again
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Button className="h-20 flex flex-col items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md" asChild>
              <Link to="/events">
                <Calendar className="h-7 w-7" />
                <span className="text-base">Browse Events</span>
              </Link>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 border-green-500 text-green-700 hover:bg-green-50 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md" variant="outline" asChild>
              <Link to="/certificates">
                <FileText className="h-7 w-7" />
                <span className="text-base">View Certificates</span>
              </Link>
            </Button>
            <Button className="h-20 flex flex-col items-center justify-center gap-2 border-green-500 text-green-700 hover:bg-green-50 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md" variant="outline" asChild>
              <Link to="/leaderboard">
                <Users className="h-7 w-7" />
                <span className="text-base">Leaderboard</span>
              </Link>
            </Button>
            <Button 
              className="h-20 flex flex-col items-center justify-center gap-2 border-green-500 text-green-700 hover:bg-green-50 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md" 
              variant="outline"
              onClick={() => {
                // Open survey modal
                const event = new Event('surveyOpen');
                window.dispatchEvent(event);
              }}
            >
              <FileText className="h-7 w-7" />
              <span className="text-base">Take Survey</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}