import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Award, FileText, TrendingUp, MapPin, Clock, CheckCircle, XCircle, AlertCircle, UserCheck, UserX } from 'lucide-react'

interface PlatformStats {
  total_volunteers: number;
  total_events: number;
  total_hours_contributed: string;
  total_enrollments: number;
  total_attendance_records: number;
  total_badges_awarded: number;
  total_certificates_generated: number;
  events_by_status: {
    upcoming: number;
    active: number;
    completed: number;
    cancelled: number;
  };
  enrollments_by_status: {
    signed_up: number;
    attended: number;
    missed: number;
    cancelled: number;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<PlatformStats | null>(null)
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
        setTopVolunteers(volunteersResponse.data.volunteers?.slice(0, 5) || []) // Show only 5 top volunteers
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
      case 'signed_up':
        return 'text-blue-600 bg-blue-100'
      case 'active':
      case 'attended':
        return 'text-green-600 bg-green-100'
      case 'completed':
        return 'text-purple-600 bg-purple-100'
      case 'missed':
        return 'text-orange-600 bg-orange-100'
      case 'cancelled':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
      case 'signed_up':
        return <Calendar className="h-4 w-4" />
      case 'active':
      case 'attended':
        return <CheckCircle className="h-4 w-4" />
      case 'completed':
        return <Award className="h-4 w-4" />
      case 'missed':
        return <AlertCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

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

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_events || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.events_by_status?.upcoming || 0} upcoming
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
              {stats?.total_enrollments || 0} enrollments
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
              {stats?.total_attendance_records || 0} attendance records
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Badges Awarded</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_badges_awarded || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.total_certificates_generated || 0} certificates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Events by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Events by Status
            </CardTitle>
            <CardDescription>
              Breakdown of events by their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.events_by_status && Object.entries(stats.events_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>
                    <div>
                      <h4 className="font-medium capitalize">{status}</h4>
                      <p className="text-sm text-gray-600">
                        {status === 'upcoming' ? 'Scheduled' : 
                         status === 'active' ? 'Currently running' :
                         status === 'completed' ? 'Successfully finished' :
                         status === 'cancelled' ? 'Cancelled events' : status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-gray-500">
                      {stats.total_events > 0 ? Math.round((count / stats.total_events) * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Enrollments by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Enrollments by Status
            </CardTitle>
            <CardDescription>
              Volunteer enrollment and attendance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.enrollments_by_status && Object.entries(stats.enrollments_by_status).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
                      {getStatusIcon(status)}
                    </div>
                    <div>
                      <h4 className="font-medium capitalize">{status.replace('_', ' ')}</h4>
                      <p className="text-sm text-gray-600">
                        {status === 'signed_up' ? 'Registered for events' :
                         status === 'attended' ? 'Successfully participated' :
                         status === 'missed' ? 'Did not attend' :
                         status === 'cancelled' ? 'Cancelled enrollment' : status}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-gray-500">
                      {stats.total_enrollments > 0 ? Math.round((count / stats.total_enrollments) * 100) : 0}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
              Most active volunteers by hours contributed
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
                          {volunteer.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {volunteer.total_hours} hours
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {volunteer.events_attended} events
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {volunteer.badges_earned} badges
                      </div>
                    </div>
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