import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Crown, Medal, Star, Clock, Calendar, Award, Users } from 'lucide-react'

interface TopVolunteer {
  volunteer_id: number;
  name: string;
  email: string;
  total_hours: string;
  events_attended: number;
  badges_earned: number;
  rank_value: string;
}

export default function Leaderboard() {
  const location = useLocation()
  const [topVolunteers, setTopVolunteers] = useState<TopVolunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [criteria, setCriteria] = useState<string>('hours')

  useEffect(() => {
    const fetchTopVolunteers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Use the existing method but with better error handling
        const response = await apiClient.getTopVolunteersReport();
        
        setTopVolunteers(response.data.volunteers || [])
        setCriteria(response.data.criteria || 'hours')
      } catch (error: any) {
        console.error('Error fetching top volunteers:', error)
        // Provide a more user-friendly error message
        if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
          setError('Leaderboard access requires admin privileges. This feature is currently unavailable for volunteers.')
        } else if (error.message && (error.message.includes('500') || error.message.includes('Internal Server Error'))) {
          setError('Leaderboard service is temporarily unavailable. Please try again later.')
        } else {
          setError('Leaderboard is temporarily unavailable. Please try again later.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopVolunteers()
    
    // Also fetch when the component becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchTopVolunteers()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [location.pathname]) // Run when the pathname changes

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Star className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{index + 1}</span>
    }
  }

  const getRankBadgeVariant = (index: number) => {
    switch (index) {
      case 0:
        return "default"
      case 1:
        return "secondary"
      case 2:
        return "outline"
      default:
        return "outline"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Leaderboard Unavailable</h2>
            <p className="text-gray-600 mb-4 max-w-md">{error}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">You can still:</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button 
                  onClick={() => window.location.reload()} 
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
                <a 
                  href="/events" 
                  className="px-4 py-2 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-colors"
                >
                  Browse Events
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          Community Leaderboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Top volunteers ranked by {criteria === 'hours' ? 'volunteer hours' : criteria}
        </p>
      </div>

      {/* Top 3 Podium */}
      {topVolunteers.length >= 3 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Top 3 Champions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* 2nd Place */}
            {topVolunteers[1] && (
              <Card className="relative order-2 sm:order-2 lg:order-1">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <Medal className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">2nd Place</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-700 mb-2 truncate">{topVolunteers[1].name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-3 truncate">{topVolunteers[1].email}</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">{topVolunteers[1].total_hours} hrs</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm">{topVolunteers[1].events_attended} events</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm">{topVolunteers[1].badges_earned} badges</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 1st Place */}
            {topVolunteers[0] && (
              <Card className="relative order-1 sm:order-1 lg:order-2 border-2 border-yellow-400 bg-gradient-to-b from-yellow-50 to-white">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">🏆 1st Place</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 truncate">{topVolunteers[0].name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-3 truncate">{topVolunteers[0].email}</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="font-semibold text-base sm:text-lg">{topVolunteers[0].total_hours} hrs</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm">{topVolunteers[0].events_attended} events</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm">{topVolunteers[0].badges_earned} badges</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3rd Place */}
            {topVolunteers[2] && (
              <Card className="relative order-3 sm:col-span-2 lg:col-span-1 lg:order-3">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <Star className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg">3rd Place</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-gray-700 mb-2 truncate">{topVolunteers[2].name}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-3 truncate">{topVolunteers[2].email}</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">{topVolunteers[2].total_hours} hrs</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm">{topVolunteers[2].events_attended} events</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="text-sm">{topVolunteers[2].badges_earned} badges</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Complete Leaderboard
          </CardTitle>
          <CardDescription>
            All volunteers ranked by their contributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topVolunteers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volunteer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Events
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Badges
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topVolunteers.map((volunteer, index) => (
                    <tr key={volunteer.volunteer_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(index)}
                          <span className="text-gray-600">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{volunteer.name}</div>
                          <div className="text-sm text-gray-500">{volunteer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {volunteer.total_hours} hrs
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {volunteer.events_attended}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
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
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No leaderboard data available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}