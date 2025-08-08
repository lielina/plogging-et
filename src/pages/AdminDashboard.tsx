import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Award, FileText, TrendingUp, MapPin, Clock } from 'lucide-react'

interface DashboardStats {
  total_events: number;
  total_volunteers: number;
  total_hours_contributed: number;
  total_waste_collected: number;
  active_events: number;
  pending_certificates: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [topVolunteers, setTopVolunteers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch platform statistics
        const statsResponse = await apiClient.getPlatformStats()
        setStats(statsResponse.data)
        
        // Fetch recent events
        const eventsResponse = await apiClient.getAllEvents()
        setRecentEvents(eventsResponse.data.slice(0, 5)) // Show only 5 recent events
        
        // Fetch top volunteers
        const volunteersResponse = await apiClient.getTopVolunteersReport()
        setTopVolunteers(volunteersResponse.data.slice(0, 5)) // Show only 5 top volunteers
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Overview of Plogging Ethiopia platform statistics and activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_volunteers || 0}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> from last month
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
              <span className="text-green-600">+15%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waste Collected</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_waste_collected || 0} kg</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+20%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events and Top Volunteers */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Events */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/admin/events')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Events
            </CardTitle>
            <CardDescription>
              Latest plogging events created
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Volunteers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Top Volunteers
            </CardTitle>
            <CardDescription>
              Most active volunteers this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topVolunteers.length > 0 ? (
              <div className="space-y-4">
                {topVolunteers.map((volunteer, index) => (
                  <div key={volunteer.volunteer_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {volunteer.first_name} {volunteer.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {volunteer.total_hours_contributed || 0} hours
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {volunteer.total_events_attended || 0} events
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No volunteer data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Button 
            className="h-16 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate('/admin/events')}
          >
            <Calendar className="h-5 w-5" />
            <span>Manage Events</span>
          </Button>
          <Button 
            className="h-16 flex flex-col items-center justify-center gap-2" 
            variant="outline"
            onClick={() => navigate('/admin/volunteers')}
          >
            <Users className="h-5 w-5" />
            <span>Manage Volunteers</span>
          </Button>
          <Button 
            className="h-16 flex flex-col items-center justify-center gap-2" 
            variant="outline"
            onClick={() => navigate('/admin/certificates')}
          >
            <FileText className="h-5 w-5" />
            <span>Generate Certificates</span>
          </Button>
          <Button className="h-16 flex flex-col items-center justify-center gap-2" variant="outline">
            <TrendingUp className="h-5 w-5" />
            <span>View Reports</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 