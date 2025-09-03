import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Trophy, Award, FileText, Crown, Medal, Star, LogOut, LayoutDashboard, User, List, BarChart3, Home, Settings, RefreshCw } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"

interface DashboardStats {
  total_events_attended: number;
  total_hours_contributed: number;
  total_waste_collected: number;
  badges_earned: number;
  certificates_earned: number;
}

interface TopVolunteer {
  volunteer_id: number;
  name: string;
  email: string;
  total_hours: string;
  events_attended: number;
  badges_earned: number;
  rank_value: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEvents, setRecentEvents] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [topVolunteers, setTopVolunteers] = useState<TopVolunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch volunteer statistics
        const statsResponse = await apiClient.getVolunteerStatistics()
        setStats(statsResponse.data)
        
        // Fetch recent events
        const eventsResponse = await apiClient.getAvailableEvents()
        setRecentEvents(eventsResponse.data.slice(0, 3)) // Show only 3 recent events
        
        // Fetch badges
        const badgesResponse = await apiClient.getVolunteerBadges()
        setBadges(badgesResponse.data)
        
        // Fetch top volunteers
        const topVolunteersResponse = await apiClient.getTopVolunteersReport()
        setTopVolunteers(topVolunteersResponse.data.volunteers || [])
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error)
        setError(error.message || 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const refreshDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch all dashboard data again
      const [statsResponse, eventsResponse, badgesResponse, topVolunteersResponse] = await Promise.all([
        apiClient.getVolunteerStatistics(),
        apiClient.getAvailableEvents(),
        apiClient.getVolunteerBadges(),
        apiClient.getTopVolunteersReport()
      ])
      
      setStats(statsResponse.data)
      setRecentEvents(eventsResponse.data.slice(0, 3))
      setBadges(badgesResponse.data)
      setTopVolunteers(topVolunteersResponse.data.volunteers || [])
    } catch (error: any) {
      console.error('Error refreshing dashboard data:', error)
      setError(error.message || 'Failed to refresh dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Star className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
    }
  }

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
    <SidebarProvider defaultOpen={false}>
      <Sidebar className="border-r-2 border-green-100">
        <SidebarHeader className="border-b border-green-100 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3 p-2 sm:p-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
              <img
                src="/logo.png"
                alt="PE"
                className="h-4 w-4 sm:h-6 sm:w-6 text-white font-bold"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                  if (nextSibling) {
                    nextSibling.style.display = 'block';
                  }
                }}
              />
              <span className="text-white font-bold text-xs sm:text-sm hidden">PE</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-green-800 truncate">Plogging Ethiopia</h2>
              <p className="text-xs text-green-600">Volunteer Portal</p>
            </div>
          </div>
          
          {/* User Profile Section */}
          <div className="px-2 sm:px-4 pb-2 sm:pb-4">
            <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-white rounded-lg shadow-sm border border-green-200">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs sm:text-sm font-semibold">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <p className="text-xs text-green-600">Volunteer</p>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2">
          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Main Menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="w-full hover:bg-green-50 hover:text-green-700 data-[active=true]:bg-green-100 data-[active=true]:text-green-800 data-[active=true]:font-semibold"
                    isActive={location.pathname === '/dashboard'}
                  >
                    <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="w-full hover:bg-green-50 hover:text-green-700 data-[active=true]:bg-green-100 data-[active=true]:text-green-800 data-[active=true]:font-semibold"
                    isActive={location.pathname === '/profile'}
                  >
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5">
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {/* Activities */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Activities
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="w-full hover:bg-blue-50 hover:text-blue-700 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-800 data-[active=true]:font-semibold"
                    isActive={location.pathname === '/events'}
                  >
                    <Link to="/events" className="flex items-center gap-3 px-3 py-2.5">
                      <Calendar className="h-4 w-4" />
                      <span>Events</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="w-full hover:bg-purple-50 hover:text-purple-700 data-[active=true]:bg-purple-100 data-[active=true]:text-purple-800 data-[active=true]:font-semibold"
                    isActive={location.pathname === '/leaderboard'}
                  >
                    <Link to="/leaderboard" className="flex items-center gap-3 px-3 py-2.5">
                      <BarChart3 className="h-4 w-4" />
                      <span>Leaderboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          
          {/* Achievements */}
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Achievements
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="w-full hover:bg-amber-50 hover:text-amber-700 data-[active=true]:bg-amber-100 data-[active=true]:text-amber-800 data-[active=true]:font-semibold"
                    isActive={location.pathname === '/certificates'}
                  >
                    <Link to="/certificates" className="flex items-center gap-3 px-3 py-2.5">
                      <FileText className="h-4 w-4" />
                      <span>Certificates</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <SidebarSeparator className="mb-4" />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={logout} 
                className="w-full hover:bg-red-50 hover:text-red-700 text-gray-600 justify-start"
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400">© 2024 Plogging Ethiopia</p>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col flex-1">
        {/* Enhanced Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-green-100" />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-800">Volunteer Dashboard</h1>
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
            
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {/* Welcome Header */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow-md border-l-4 border-green-500">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 animate-fade-in-down">
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

          {/* Recent Events and Badges */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Events */}
            <Card className="hover:shadow-lg transition-shadow duration-300 ease-in-out">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Calendar className="h-6 w-6 text-green-700" />
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
                      <div key={event.event_id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
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
                        <Badge variant="secondary" className="px-3 py-1 text-sm">
                          {event.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No recent events</p>
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
                      <div key={badge.badge_id} className="text-center p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                          <Award className="h-8 w-8 text-green-700" />
                        </div>
                        <h4 className="font-semibold text-base text-gray-800">{badge.badge_name}</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {badge.description}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No badges earned yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Participate in events to earn badges!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Volunteers */}
          <Card className="mt-8 hover:shadow-lg transition-shadow duration-300 ease-in-out">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="h-6 w-6 text-green-700" />
                Top Volunteers
              </CardTitle>
              <CardDescription>
                Community leaders ranked by volunteer hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topVolunteers.length > 0 ? (
                <div className="overflow-x-auto rounded-lg shadow-sm border">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-green-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          Rank
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          Volunteer
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          Hours
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          Events
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          Badges
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {topVolunteers.map((volunteer, index) => (
                        <tr key={volunteer.volunteer_id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              {getRankIcon(index)}
                              <span className="text-gray-700">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                              <div className="text-xs text-gray-500">{volunteer.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-green-500" />
                              {volunteer.total_hours} hrs
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-green-500" />
                              {volunteer.events_attended}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-green-500" />
                              {volunteer.badges_earned}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">No top volunteers data available.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 