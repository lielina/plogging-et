import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useBadge } from '@/contexts/BadgeContext'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Award, Clock, Trophy, Target, Star, Zap, RefreshCw } from 'lucide-react'
import VolunteerBadge from '@/components/VolunteerBadge'
import { VolunteerBadgeData } from '@/lib/badge-generator'

export default function VolunteerBadges() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const { badge, loading, error, refreshBadge } = useBadge()
  const [badgeData, setBadgeData] = useState<VolunteerBadgeData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [totalEvents, setTotalEvents] = useState<number | undefined>(undefined)
  const [totalDistance, setTotalDistance] = useState<number | undefined>(undefined)
  const { toast } = useToast()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchVolunteerData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate])

  // Update badge data when badge object changes
  useEffect(() => {
    if (user && 'volunteer_id' in user && badge) {
      setBadgeData({
        volunteerName: `${user.first_name} ${user.last_name}`,
        totalHours: user.total_hours_contributed,
        profileImageUrl: user.profile_image_url || user.profile_image,
        volunteerId: user.volunteer_id,
        achievementDate: new Date().toISOString(),
        badgeId: `BADGE-${user.volunteer_id}-${Date.now()}`
      })
    } else {
      setBadgeData(null)
    }
  }, [badge, user])

  const fetchVolunteerData = async () => {
    try {
      setIsLoading(true)
      setLocalError(null)

      const [badgeResult, statsResult] = await Promise.allSettled([
        refreshBadge(),
        apiClient.getVolunteerStatistics().catch(() => null)
      ])

      // Set total events and distance
      if (statsResult.status === 'fulfilled' && statsResult.value?.data) {
        setTotalEvents(statsResult.value.data.total_events_attended)
        const distance = statsResult.value.data.total_distance_covered ||
                         statsResult.value.data.total_distance ||
                         statsResult.value.data.distance_km ||
                         statsResult.value.data.distance
        setTotalDistance(distance ? parseFloat(String(distance)) : undefined)
      }

      // Fallback: use user profile distance
      if (!totalDistance && user && 'total_kilometers' in user) {
        const profileDistance = (user as any).total_kilometers
        if (profileDistance !== null && profileDistance !== undefined && profileDistance !== '') {
          setTotalDistance(parseFloat(String(profileDistance)))
        }
      }

    } catch (err: any) {
      console.error(err)
      setLocalError(err.message || 'Failed to load volunteer data')
    } finally {
      setIsLoading(false)
    }
  }

  const getNextMilestone = (currentHours: number) => {
    const nextTarget = Math.ceil(currentHours / 10) * 10 + 10
    return { target: nextTarget, remaining: nextTarget - currentHours, level: `${nextTarget} Hours` }
  }

  const getAchievementStats = (totalHours: number) => {
    const stats = []
    if (totalHours >= 1) stats.push({ icon: Star, text: 'First Hour', achieved: true })
    if (totalHours >= 10) stats.push({ icon: Target, text: '10 Hours', achieved: true })
    if (totalHours >= 25) stats.push({ icon: Award, text: '25 Hours', achieved: true })
    if (totalHours >= 50) stats.push({ icon: Trophy, text: '50 Hours', achieved: true })
    if (totalHours >= 100) stats.push({ icon: Zap, text: '100 Hours', achieved: true })
    return stats
  }

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your volunteer badge...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || localError) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Badge</h2>
            <p className="text-gray-600 mb-4">{error || localError}</p>
            <Button 
              onClick={fetchVolunteerData} 
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Badge Data Available</h2>
          <p className="text-gray-600">Unable to generate your volunteer badge. Please try again later.</p>
        </div>
      </div>
    )
  }

  const nextMilestone = badgeData ? getNextMilestone(badgeData.totalHours) : null
  const achievements = badgeData ? getAchievementStats(badgeData.totalHours) : []

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Volunteer Badge</h1>
          <p className="text-sm sm:text-base text-gray-600">Your personalized volunteer achievement badge and sharing options</p>
        </div>
        <Button 
          onClick={fetchVolunteerData} 
          variant="outline"
          className="border-green-500 text-green-700 hover:bg-green-50 w-full sm:w-auto"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Badge Section */}
      {user && 'volunteer_id' in user ? (
        <>
          {badge ? (
            <VolunteerBadge
              volunteerData={user}
              onBadgeGenerated={(data) => setBadgeData(data)}
              hideRegenerate={true}
              totalEvents={totalEvents}
              badgeName={badge.badge_name || 'Badge'}
              totalDistance={badge.min_kilometers ? parseFloat(String(badge.min_kilometers)) : totalDistance}
              hasBadges={true}
            />
          ) : (
            <Card className="border-white-200">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Badge Not Received Yet</h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  You haven't received your volunteer badge yet. Start participating in events and contributing hours to earn your first badge!
                </p>
                  <div className="mt-6 space-y-2 text-sm text-gray-500">
                      <p>To earn your badge, you need to:</p>
                      <ul className="list-disc list-inside space-y-1 max-w-sm mx-auto text-left">
                        <li>Participate in plogging events</li>
                        <li>Complete event surveys</li>
                        <li>Accumulate volunteer hours</li>
                      </ul>
                    </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Badge Not Available</h3>
            <p className="text-gray-500">Volunteer badge is only available for volunteer accounts.</p>
          </CardContent>
        </Card>
      )}

      {/* Stats Section */}
      {badge && badgeData && nextMilestone && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 flex items-center gap-3">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{badgeData.totalHours}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total Hours</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 flex items-center gap-3">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{nextMilestone.remaining}</p>
                <p className="text-xs sm:text-sm text-gray-600">Hours to Next Level</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 sm:p-6 flex items-center gap-3">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{achievements.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Achievements</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
        {/* Achievement Progress - Only show if user has badges */}
      {badge && user && 'volunteer_id' in user && badgeData && nextMilestone && (
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Next Milestone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Next Milestone
            </CardTitle>
            <CardDescription>
              Keep volunteering to reach your next achievement level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Progress to {nextMilestone.level}</span>
                <span className="text-sm text-gray-500">{badgeData.totalHours}/{nextMilestone.target} hours</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((badgeData.totalHours / nextMilestone.target) * 100, 100)}%` }}
                ></div>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">
                  {nextMilestone.remaining} hours remaining
                </p>
                <p className="text-sm text-gray-600">
                  to become a {nextMilestone.level}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Achievements
            </CardTitle>
            <CardDescription>
              Your volunteer journey milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${achievement.achieved ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    <achievement.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-sm ${achievement.achieved ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                    {achievement.text}
                  </span>
                  {achievement.achieved && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Information Card */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">About Volunteer Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-green-700 mb-2">About Your Badge</h3>
              <p className="text-sm text-green-600">
                Your volunteer badge showcases your commitment to environmental action and community service. 
                The badge includes your total service hours and can be shared on social media to inspire others.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-700 mb-2">Sharing Your Badge</h3>
              <p className="text-sm text-green-600">
                Share your volunteer badge on social media to inspire others and showcase your environmental commitment. 
                Your badge includes your total service hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
