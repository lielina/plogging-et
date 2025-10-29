import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, Crown, Medal, Star, Clock, Calendar, Award, Users } from 'lucide-react'

interface TopVolunteer {
  volunteer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  total_hours_contributed: string;
  events_attended: number;
  badges_earned: number;
  rank_value: string;
}

export default function PublicLeaderboard() {
  const [topVolunteers, setTopVolunteers] = useState<TopVolunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [criteria, setCriteria] = useState<string>('hours')

  useEffect(() => {
    const fetchTopVolunteers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Public users use the public endpoint
        const response = await apiClient.getPublicTopVolunteersReport()
        
        console.log('Leaderboard API Response:', response)
        console.log('Response data type:', typeof response.data)
        console.log('Response data keys:', Object.keys(response.data || {}))
        console.log('Is array:', Array.isArray(response.data))
        
        // Handle different response structures
        if (response.data.volunteers) {
          console.log('Using volunteers property')
          setTopVolunteers(response.data.volunteers)
          setCriteria(response.data.criteria || 'hours')
        } else if (Array.isArray(response.data)) {
          console.log('Using direct array')
          // If response is directly an array of volunteers
          setTopVolunteers(response.data)
          setCriteria('hours')
        } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
          console.log('Using object structure')
          // If response is an object with volunteer data
          // Check if it has a data property that is an array
          if (Array.isArray(response.data.data)) {
            setTopVolunteers(response.data.data)
            setCriteria(response.data.criteria || 'hours')
          } else {
            setTopVolunteers([response.data])
            setCriteria('hours')
          }
        } else {
          console.log('Using fallback empty array')
          // Fallback to empty array
          setTopVolunteers([])
        }
      } catch (error: any) {
        console.error('Error fetching top volunteers:', error)
        setError('Failed to load leaderboard data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopVolunteers()
  }, [])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading leaderboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
        <div className="container mx-auto px-4">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Combine first and last names for display
  const processedVolunteers = topVolunteers.map(volunteer => ({
    ...volunteer,
    name: `${volunteer.first_name} ${volunteer.last_name}`
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
            Community Leaderboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Top volunteers ranked by {criteria === 'hours' ? 'volunteer hours' : criteria}
          </p>
        </div>

        {/* Top 3 Podium */}
        {processedVolunteers.length >= 3 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">Top 3 Champions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* 2nd Place */}
              {processedVolunteers[1] && (
                <Card className="relative order-2 sm:order-2 lg:order-1">
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      <Medal className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">2nd Place</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-gray-700 mb-2 truncate">{processedVolunteers[1].name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-3 truncate">{processedVolunteers[1].email}</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="font-semibold text-sm sm:text-base">{processedVolunteers[1].total_hours_contributed} hrs</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-sm">{processedVolunteers[1].events_attended} events</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-sm">{processedVolunteers[1].badges_earned} badges</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 1st Place */}
              {processedVolunteers[0] && (
                <Card className="relative order-1 sm:order-1 lg:order-2 border-2 border-yellow-400 bg-gradient-to-b from-yellow-50 to-white">
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      <Crown className="h-8 w-8 sm:h-10 sm:w-10 text-yellow-500" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl">🏆 1st Place</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 truncate">{processedVolunteers[0].name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-3 truncate">{processedVolunteers[0].email}</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="font-semibold text-base sm:text-lg">{processedVolunteers[0].total_hours_contributed} hrs</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-sm">{processedVolunteers[0].events_attended} events</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-sm">{processedVolunteers[0].badges_earned} badges</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 3rd Place */}
              {processedVolunteers[2] && (
                <Card className="relative order-3 sm:col-span-2 lg:col-span-1 lg:order-3">
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-2">
                      <Star className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">3rd Place</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-gray-700 mb-2 truncate">{processedVolunteers[2].name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 mb-3 truncate">{processedVolunteers[2].email}</div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="font-semibold text-sm sm:text-base">{processedVolunteers[2].total_hours_contributed} hrs</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-sm">{processedVolunteers[2].events_attended} events</span>
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="text-sm">{processedVolunteers[2].badges_earned} badges</span>
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
            {processedVolunteers.length > 0 ? (
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
                    {processedVolunteers.map((volunteer, index) => (
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
                            {volunteer.total_hours_contributed} hrs
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
    </div>
  )
}