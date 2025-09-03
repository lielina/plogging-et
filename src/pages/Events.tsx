import { useState, useEffect } from 'react'
import { apiClient, Event } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react'

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        const response = await apiClient.getAvailableEvents()
        setEvents(response.data)
      } catch (err: any) {
        console.error('Error fetching events:', err)
        setError('Events are temporarily unavailable. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleEnroll = async (eventId: number) => {
    try {
      await apiClient.enrollInEvent(eventId)
      // Refresh events to update enrollment status
      const response = await apiClient.getAvailableEvents()
      setEvents(response.data)
    } catch (error: any) {
      console.error('Error enrolling in event:', error)
      // Show user-friendly error message
      setError('Unable to enroll in event. Please try again later.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading events...</p>
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
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Events Temporarily Unavailable</h2>
            <p className="text-gray-600 mb-4 max-w-md">{error}</p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">You can try:</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={() => {
                    setError('')
                    setIsLoading(true)
                    window.location.reload()
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.history.back()}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Go Back
                </Button>
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          Plogging Events
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Join upcoming plogging events and make a difference in your community.
        </p>
      </div>

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event) => (
            <Card key={event.event_id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base sm:text-lg mb-2 leading-tight">{event.event_name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {event.description}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={event.status === 'Active' ? 'default' : 'secondary'}
                    className="ml-2 flex-shrink-0"
                  >
                    {event.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Date and Time */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{formatDate(event.event_date)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {formatTime(event.start_time)} - {formatTime(event.end_time)}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{event.location_name}</span>
                  </div>

                  {/* Duration and Capacity */}
                  <div className="flex items-center justify-between text-sm gap-4">
                    <div className="flex items-center gap-2 text-gray-600 min-w-0">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{event.estimated_duration_hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 min-w-0">
                      <Users className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Max {event.max_volunteers}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="w-full mt-4 text-sm sm:text-base" 
                    onClick={() => handleEnroll(event.event_id)}
                  >
                    <span>Enroll Now</span>
                    <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 sm:py-12">
          <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">
            No Events Available
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6 max-w-md mx-auto">
            There are currently no upcoming plogging events. Check back later for new opportunities!
          </p>
          <Button 
            variant="outline" 
            className="text-sm sm:text-base"
            onClick={() => {
              setIsLoading(true)
              setError('')
              window.location.reload()
            }}
          >
            Refresh Events
          </Button>
        </div>
      )}

      {/* Event Information */}
      <div className="mt-8 sm:mt-12 bg-green-50 rounded-lg p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-green-800 mb-4">
          About Plogging Events
        </h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <h3 className="font-medium text-green-700 mb-2 text-sm sm:text-base">What to Bring</h3>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Comfortable walking/running shoes</li>
              <li>• Water bottle</li>
              <li>• Weather-appropriate clothing</li>
              <li>• Enthusiasm and energy!</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-green-700 mb-2 text-sm sm:text-base">What We Provide</h3>
            <ul className="text-sm text-green-600 space-y-1">
              <li>• Gloves and safety equipment</li>
              <li>• Collection bags and tools</li>
              <li>• Refreshments and snacks</li>
              <li>• Certificate of participation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 