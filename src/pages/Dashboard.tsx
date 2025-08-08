import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Trophy, Award, FileText } from 'lucide-react'

interface DashboardStats {
  total_events_attended: number;
  total_hours_contributed: number;
  total_waste_collected: number;
  badges_earned: number;
  certificates_earned: number;
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch volunteer statistics
        const statsResponse = await apiClient.getVolunteerStatistics()
        setStats(statsResponse.data)
        
        // Fetch recent events
        const eventsResponse = await apiClient.getAvailableEvents()
        setRecentEvents(eventsResponse.data.slice(0, 3)) // Show only 3 recent events
        
        // Fetch badges
        const badgesResponse = await apiClient.getVolunteerBadges()
        setBadges(badgesResponse.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

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
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-gray-600">
          Keep up the great work in making Ethiopia cleaner and greener.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Attended</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_events_attended || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total plogging events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Contributed</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_hours_contributed || 0}</div>
            <p className="text-xs text-muted-foreground">
              Volunteer hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste Collected</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_waste_collected || 0} kg</div>
            <p className="text-xs text-muted-foreground">
              Total waste collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.badges_earned || 0}</div>
            <p className="text-xs text-muted-foreground">
              Achievement badges
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events and Badges */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Events
            </CardTitle>
            <CardDescription>
              Your upcoming and recent plogging events
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-4">
                {recentEvents.map((event) => (
                  <div key={event.event_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{event.event_name}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.event_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No recent events</p>
                <Button className="mt-4" variant="outline">
                  Browse Events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Badges
            </CardTitle>
            <CardDescription>
              Achievement badges you've earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {badges.map((badge) => (
                  <div key={badge.badge_id} className="text-center p-4 border rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-medium text-sm">{badge.badge_name}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {badge.description}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No badges earned yet</p>
                <p className="text-xs text-gray-500 mt-2">
                  Participate in events to earn badges!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Button className="h-16 flex flex-col items-center justify-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>Browse Events</span>
          </Button>
          <Button className="h-16 flex flex-col items-center justify-center gap-2" variant="outline">
            <FileText className="h-5 w-5" />
            <span>View Certificates</span>
          </Button>
          <Button className="h-16 flex flex-col items-center justify-center gap-2" variant="outline">
            <Users className="h-5 w-5" />
            <span>Leaderboard</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 