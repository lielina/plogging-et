import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Crown, Medal, Award } from 'lucide-react'
import { Link } from 'react-router-dom'

interface TopVolunteer {
  volunteer_id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  total_hours: string;
  events_attended?: number;
  badges_earned?: number;
  rank_value?: string;
}

export default function TopVolunteers() {
  const [topVolunteers, setTopVolunteers] = useState<TopVolunteer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTopVolunteers = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.getPublicTopVolunteersReport()
        
        // Handle different response structures
        let volunteers: TopVolunteer[] = []
        if (response.data?.volunteers && Array.isArray(response.data.volunteers)) {
          volunteers = response.data.volunteers
        } else if (Array.isArray(response.data)) {
          volunteers = response.data
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          volunteers = response.data.data
        }
        
        // Normalize volunteer names - combine first_name and last_name if name is not present
        const normalizedVolunteers = volunteers.map(volunteer => ({
          ...volunteer,
          name: volunteer.name || 
                (volunteer.first_name && volunteer.last_name 
                  ? `${volunteer.first_name} ${volunteer.last_name}`.trim()
                  : volunteer.first_name || volunteer.last_name || 'Volunteer')
        }))
        
        // Get only top 3
        setTopVolunteers(normalizedVolunteers.slice(0, 3))
      } catch (error) {
        console.error('Error fetching top volunteers:', error)
        // Silently fail - don't show error on public page
        setTopVolunteers([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTopVolunteers()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (topVolunteers.length === 0) {
    return null // Don't show anything if no volunteers
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="h-8 w-8 text-yellow-500" />
      case 1:
        return <Medal className="h-8 w-8 text-gray-400" />
      case 2:
        return <Award className="h-8 w-8 text-amber-600" />
      default:
        return <Trophy className="h-8 w-8 text-gray-400" />
    }
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500 text-white'
      case 1:
        return 'bg-gray-400 text-white'
      case 2:
        return 'bg-amber-600 text-white'
      default:
        return 'bg-gray-300 text-gray-700'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {topVolunteers.map((volunteer, index) => (
        <Card 
          key={volunteer.volunteer_id} 
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
            index === 0 ? 'md:scale-105 border-yellow-400 border-2' : ''
          }`}
        >
          {/* Rank Badge */}
          <div className={`absolute top-0 right-0 ${getRankBadge(index)} px-3 py-1 rounded-bl-lg font-bold text-sm`}>
            #{index + 1}
          </div>
          
          <CardContent className="p-6 text-center">
            {/* Rank Icon */}
            <div className="flex justify-center mb-4">
              {getRankIcon(index)}
            </div>
            
            {/* Volunteer Name */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {volunteer.name || 'Volunteer'}
            </h3>
            
            {/* Stats */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <Trophy className="h-4 w-4 text-green-600" />
                <span className="font-semibold">{volunteer.total_hours || 0} hours</span>
              </div>
              {volunteer.events_attended !== undefined && (
                <div className="text-sm text-gray-500">
                  {volunteer.events_attended} events
                </div>
              )}
              {volunteer.badges_earned !== undefined && (
                <div className="text-sm text-gray-500">
                  {volunteer.badges_earned} badges
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

