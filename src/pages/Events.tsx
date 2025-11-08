import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient, Event } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Share2, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getEventStatus, generateEventShareLink, copyToClipboard } from '../utils/eventUtils';

export default function Events() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrollingEvents, setEnrollingEvents] = useState<Set<number>>(new Set())
  const [confirmEnrollEvent, setConfirmEnrollEvent] = useState<number | null>(null)
  const [enrolledEventIds, setEnrolledEventIds] = useState<Set<number>>(new Set())
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEvents: 0,
    perPage: 9
  })
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const fetchEvents = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError('')
      
      console.log('Fetching events for page:', page);
      
      // Fetch both available events and enrolled events in parallel
      const [eventsResponse, enrolledResponse] = await Promise.allSettled([
        apiClient.getAvailableEvents(page, pagination.perPage),
        apiClient.getEnrolledEvents().catch(() => ({ data: [] })) // Don't fail if this endpoint doesn't exist
      ])
      
      const eventsData = eventsResponse.status === 'fulfilled' ? eventsResponse.value.data : []
      const enrolledEvents = enrolledResponse.status === 'fulfilled' ? enrolledResponse.value.data : []
      
      console.log('Events data:', eventsData);
      console.log('Enrolled events:', enrolledEvents);
      console.log('Pagination data:', eventsResponse.status === 'fulfilled' ? eventsResponse.value.pagination : null);
      
      // Get current user's volunteer_id
      const currentVolunteerId = user && 'volunteer_id' in user ? Number(user.volunteer_id) : null
      console.log('Current volunteer ID:', currentVolunteerId);
      
      // Create a map of enrolled events for quick lookup with their full data
      const enrolledEventsMap = new Map<number, any>()
      const enrolledIdsSet = new Set<number>()
      
      // First, process enrolled events from getEnrolledEvents API
      enrolledEvents.forEach((e: any) => {
        // Handle different response structures - getEnrolledEvents returns Event objects with event_id
        // But also handle raw enrollment objects that might have event nested
        let eventId: number | null = null
        
        // Try multiple ways to get event_id
        if (e.event_id) {
          eventId = Number(e.event_id)
        } else if (e.event?.event_id) {
          eventId = Number(e.event.event_id)
        } else if (e.id) {
          eventId = Number(e.id)
        }
        
        if (eventId) {
          // Store with number key to handle type mismatches
          enrolledEventsMap.set(eventId, e);
          enrolledIdsSet.add(eventId);
        }
      })
      
      // Now process events from getAvailableEvents and check enrollments array
      const updatedEvents = eventsData.map(event => {
        const eventIdNum = Number(event.event_id)
        let isEnrolled = enrolledIdsSet.has(eventIdNum)
        let enrollmentStatus = event.enrollment_status
        let enrollmentData = null
        
        // Check if current user is in the enrollments array of this event
        if (currentVolunteerId && event.enrollments && Array.isArray(event.enrollments)) {
          const userEnrollment = event.enrollments.find((enrollment: any) => 
            Number(enrollment.volunteer_id) === currentVolunteerId
          )
          
          if (userEnrollment) {
            isEnrolled = true
            enrollmentStatus = userEnrollment.status || 'Enrolled'
            enrollmentData = userEnrollment
            enrolledIdsSet.add(eventIdNum)
            enrolledEventsMap.set(eventIdNum, userEnrollment)
          }
        }
        
        const canEnroll = event.can_enroll !== false && !isEnrolled
        
        console.log(`Processing event ${event.event_id}:`, {
          eventIdNum,
          currentVolunteerId,
          isEnrolled,
          enrollmentStatus,
          hasEnrollments: !!event.enrollments,
          enrollmentsCount: event.enrollments?.length || 0,
          enrollmentData
        })
        
        return {
          ...event,
          is_enrolled: isEnrolled,
          can_enroll: canEnroll,
          enrollment_status: enrollmentStatus
        }
      })
      
      console.log('Processing enrolled events:', enrolledEvents);
      console.log('Enrolled events map:', Array.from(enrolledEventsMap.entries()));
      console.log('Enrolled event IDs set:', Array.from(enrolledIdsSet));
      
      // Update state with enrolled event IDs
      setEnrolledEventIds(enrolledIdsSet)
      
      console.log('Setting events with updated enrollment status:', updatedEvents);
      setEvents(updatedEvents)
      
      // Handle pagination data if available
      if (eventsResponse.status === 'fulfilled' && eventsResponse.value.pagination) {
        const newPagination = {
          currentPage: eventsResponse.value.pagination.current_page,
          totalPages: eventsResponse.value.pagination.last_page,
          totalEvents: eventsResponse.value.pagination.total,
          perPage: eventsResponse.value.pagination.per_page
        };
        
        console.log('Setting pagination:', newPagination);
        setPagination(newPagination);
      } else {
        // If no pagination data, assume all events are loaded
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalEvents: eventsData.length,
          perPage: pagination.perPage
        })
      }
    } catch (err: any) {
      console.error('Error fetching events:', err)
      setError('Events are temporarily unavailable. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents(1)
  }, [user]) // Re-fetch when user changes

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchEvents(newPage)
    }
  }

  const handleEnrollClick = (eventId: number) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Redirect to login page with return URL
      navigate('/login', { state: { from: `/events/${eventId}` } })
      return
    }
    
    // If authenticated, proceed with enrollment confirmation
    setConfirmEnrollEvent(eventId)
  }

  const handleEnroll = async (eventId: number) => {
    // Prevent multiple enrollment attempts for the same event
    if (enrollingEvents.has(eventId)) {
      return
    }

    setEnrollingEvents(prev => new Set(prev).add(eventId))

    try {
      // Extract volunteer_id from user context if available
      const volunteerId = user && 'volunteer_id' in user ? user.volunteer_id : undefined;
      const response = await apiClient.enrollInEvent(eventId, volunteerId)
      
          // Update enrolled event IDs immediately
      setEnrolledEventIds(prev => {
        const newSet = new Set(prev);
        newSet.add(eventId);
        console.log('Updating enrolled event IDs:', Array.from(newSet));
        return newSet;
      })
      
      // Update local event status immediately (no localStorage needed)
      setEvents(prev => {
        const updatedEvents = prev.map(e => 
          e.event_id === eventId 
            ? { 
                ...e, 
                is_enrolled: true, 
                can_enroll: false,
                enrollment_status: response.data.status || 'Signed Up'
              }
            : e
        );
        console.log('Updated events after enrollment:', updatedEvents);
        return updatedEvents;
      })
      
      // Show success toast
      toast({
        title: "Enrollment Successful",
        description: response.message || "You have been successfully enrolled in this event.",
      })
    } catch (error: any) {
      console.error('Error enrolling in event:', error)
      
      // Handle specific error cases with more context
      let errorMessage = 'Unable to enroll in event. Please try again later.'
      let errorTitle = 'Enrollment Failed'
      
      if (error.message?.includes('non-upcoming events')) {
        errorTitle = 'Event Not Available'
        errorMessage = 'You can only enroll in upcoming events. This event may have already started or ended.'
      } else if (error.message?.includes('Already enrolled') || error.message?.includes('already enrolled')) {
        errorTitle = 'Already Enrolled'
        errorMessage = 'You are already enrolled in this event. Check your dashboard for enrollment details.'
        
        // Update enrolled event IDs immediately
        setEnrolledEventIds(prev => {
          const newSet = new Set(prev);
          newSet.add(eventId);
          console.log('Updating enrolled event IDs for already enrolled event:', Array.from(newSet));
          return newSet;
        })
        
        // Update the event to reflect enrollment status
        setEvents(prev => {
          const updatedEvents = prev.map(e => 
            e.event_id === eventId 
              ? { 
                  ...e, 
                  is_enrolled: true, 
                  can_enroll: false,
                  enrollment_status: 'Enrolled'
                }
              : e
          );
          console.log('Updated events for already enrolled event:', updatedEvents);
          return updatedEvents;
        })
        
        // Also refresh the events list to ensure consistency
        setTimeout(() => {
          fetchEvents(pagination.currentPage)
        }, 1000)
      } else if (error.message?.includes('event is full') || error.message?.includes('capacity')) {
        errorTitle = 'Event Full'
        errorMessage = 'This event has reached its maximum capacity. Try enrolling in other available events.'
        // Update the event to reflect unavailability
        setEvents(prev => prev.map(e => 
          e.event_id === eventId 
            ? { ...e, can_enroll: false }
            : e
        ))
      } else if (error.message?.includes('not available') || error.message?.includes('not open')) {
        errorTitle = 'Enrollment Closed'
        errorMessage = 'Enrollment for this event is currently closed.'
        setEvents(prev => prev.map(e => 
          e.event_id === eventId 
            ? { ...e, can_enroll: false }
            : e
        ))
      } else if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        errorTitle = 'Server Error'
        errorMessage = 'There was a server error while processing your enrollment. Please try again later.'
      } else if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        errorTitle = 'Authentication Required'
        errorMessage = 'Your session has expired. Please log in again.'
        // Redirect to login page
        navigate('/login')
        return
      } else if (!error.message) {
        // Handle network errors or other issues with no message
        errorTitle = 'Connection Error'
        errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.'
      }
      
      // Show error toast for errors that need notification
      if (!error.message?.includes('Already enrolled')) {
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setEnrollingEvents(prev => {
        const newSet = new Set(prev)
        newSet.delete(eventId)
        return newSet
      })
      // Close the confirmation dialog
      setConfirmEnrollEvent(null)
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
    // Handle case where timeString might already be in a readable format
    if (!timeString) return 'Invalid Time';
    
    try {
      // Handle the specific datetime format: 2025-09-29T07:00:00.000000Z
      if (timeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/)) {
        // Parse the datetime string directly
        const date = new Date(timeString);
        
        // Check if date is valid
        if (!isNaN(date.getTime())) {
          // Format only the time portion in HH:MM AM/PM format
          let hours = date.getUTCHours();
          const minutes = date.getUTCMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12; // the hour '0' should be '12'
          const minutesStr = minutes < 10 ? '0' + minutes : minutes;
          const formattedTime = `${hours}:${minutesStr} ${ampm}`;
          
          return formattedTime;
        }
      }
      
      // If it's already in HH:MM format, format it as HH:MM AM/PM
      if (/^\d{1,2}:\d{2}$/.test(timeString)) {
        // Ensure it's in the correct format with leading zeros
        const parts = timeString.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Format as HH:MM AM/PM
        let hoursNum = date.getHours();
        const minutesNum = date.getMinutes();
        const ampm = hoursNum >= 12 ? 'PM' : 'AM';
        hoursNum = hoursNum % 12;
        hoursNum = hoursNum ? hoursNum : 12; // the hour '0' should be '12'
        const minutesStr = minutesNum < 10 ? '0' + minutesNum : minutesNum;
        return `${hoursNum}:${minutesStr} ${ampm}`;
      }
      
      // If it's in HH:MM:SS format, extract HH:MM and format
      if (/^\d{1,2}:\d{2}:\d{2}$/.test(timeString)) {
        const parts = timeString.split(':');
        const hours = parts[0].padStart(2, '0');
        const minutes = parts[1].padStart(2, '0');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // Format as HH:MM AM/PM
        let hoursNum = date.getHours();
        const minutesNum = date.getMinutes();
        const ampm = hoursNum >= 12 ? 'PM' : 'AM';
        hoursNum = hoursNum % 12;
        hoursNum = hoursNum ? hoursNum : 12; // the hour '0' should be '12'
        const minutesStr = minutesNum < 10 ? '0' + minutesNum : minutesNum;
        return `${hoursNum}:${minutesStr} ${ampm}`;
      }
      
      // Try to parse as date string
      const date = new Date(`2000-01-01T${timeString}`);
      if (isNaN(date.getTime())) {
        return timeString; // Return as is if parsing fails
      }
      
      // Format as HH:MM AM/PM
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      return `${hours}:${minutesStr} ${ampm}`;
    } catch (error) {
      return timeString; // Return as is if any error occurs
    }
  }

  // Helper function to determine button state and text based on backend data
  const getButtonState = (event: Event) => {
    const isEnrolling = enrollingEvents.has(event.event_id)
    
    if (isEnrolling) {
      return {
        disabled: true,
        text: 'Enrolling...',
        variant: 'default' as const,
        icon: null,
        showDetails: false
      }
    }
    
    // Use API status, fallback to calculated status if not available (same logic as admin side)
    const backendStatus = event.status?.toLowerCase();
    const calculatedStatusInfo = getEventStatus(
      event.event_date,
      event.start_time,
      event.end_time
    );
    
    // Use backend status if available, otherwise use calculated status
    const eventStatus = backendStatus || calculatedStatusInfo.status;
    const eventStatusInfo = {
      ...calculatedStatusInfo,
      status: eventStatus as 'upcoming' | 'active' | 'completed' | 'unknown'
    };
    
    console.log('Event status info for event', event.event_id, ':', {
      backendStatus,
      calculatedStatus: calculatedStatusInfo.status,
      finalStatus: eventStatus,
      eventStatusInfo
    });
    console.log('Event data:', {
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time,
      backend_status: event.status
    });
    
    // Check if user is enrolled (use both event property and enrolledEventIds as fallback)
    const isEnrolled = event.is_enrolled === true || enrolledEventIds.has(event.event_id);
    
    console.log(`Checking enrollment for event ${event.event_id}:`, {
      eventIsEnrolled: event.is_enrolled,
      enrolledEventIdsHas: enrolledEventIds.has(event.event_id),
      finalIsEnrolled: isEnrolled,
      enrollmentStatus: event.enrollment_status,
      enrolledEventIds: Array.from(enrolledEventIds)
    });
    
    // If enrolled, show enrolled status
    if (isEnrolled) {
      return {
        disabled: true,
        text: 'Enrolled',
        variant: 'secondary' as const,
        icon: <CheckCircle className="h-4 w-4 ml-2 flex-shrink-0 text-green-600" />,
        showDetails: true
      }
    }
    
    // If event is active (in progress), show appropriate status
    if (eventStatus === 'active') {
      return {
        disabled: true,
        text: 'Event In Progress',
        variant: 'secondary' as const,
        icon: null,
        showDetails: false
      }
    }
    
    // If event is completed, show appropriate status
    if (eventStatus === 'completed') {
      return {
        disabled: true,
        text: 'Event Ended',
        variant: 'secondary' as const,
        icon: null,
        showDetails: false
      }
    }
    
    // If event is upcoming and can be enrolled (and user is NOT enrolled), show enroll button
    if (eventStatus === 'upcoming' && eventStatusInfo.canEnroll && !isEnrolled) {
      return {
        disabled: false,
        text: 'Enroll Now',
        variant: 'default' as const,
        icon: <ArrowRight className="h-4 w-4 ml-2 flex-shrink-0" />,
        showDetails: false
      }
    }
    
    // Default case - not available for enrollment
    return {
      disabled: true,
      text: 'Not Available',
      variant: 'secondary' as const,
      icon: null,
      showDetails: false
    }
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
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Events</h1>
        <p className="text-gray-600">Join upcoming plogging events in your community</p>
      </div>


      {/* Events Grid */}
      {events.length > 0 ? (
        <>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <Link to={`/events/${event.event_id}`} key={event.event_id} className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg mb-2 leading-tight">{event.event_name}</CardTitle>
                        <CardDescription className="line-clamp-2 text-sm">
                          {event.description}
                        </CardDescription>
                      </div>
                      {(() => {
                        // Use API status, fallback to calculated status if not available (same logic as admin side)
                        const backendStatus = event.status?.toLowerCase();
                        const calculatedStatus = getEventStatus(
                          event.event_date,
                          event.start_time,
                          event.end_time
                        ).status;
                        
                        // Use backend status if available, otherwise use calculated status
                        const status = backendStatus || calculatedStatus;
                        const statusLower = status?.toLowerCase() || '';
                        
                        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = 'secondary';
                        if (statusLower === 'upcoming') {
                          badgeVariant = 'default';
                        } else if (statusLower === 'active') {
                          badgeVariant = 'destructive';
                        } else if (statusLower === 'completed') {
                          badgeVariant = 'secondary';
                        } else if (statusLower === 'cancelled') {
                          badgeVariant = 'destructive';
                        }
                        
                        return (
                          <Badge 
                            variant={badgeVariant}
                            className="ml-2 flex-shrink-0 text-xs px-2 py-0.5"
                          >
                            {status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown'}
                          </Badge>
                        );
                      })()}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Event Image Preview */}
                      {event.image_path && (
                        <div className="rounded-md overflow-hidden border h-32 flex items-center justify-center bg-gray-50">
                          <img 
                            src={event.image_path.startsWith('http') ? event.image_path : `https://ploggingapi.pixeladdis.com/${event.image_path.startsWith('/') ? event.image_path.slice(1) : event.image_path}`}
                            alt={`${event.event_name} preview`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Handle image loading errors
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

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
                        {event.waste_collected_kg !== undefined && event.waste_collected_kg !== null && (
                          <div className="flex items-center gap-2 text-gray-600 min-w-0">
                            <Trash2 className="h-4 w-4 flex-shrink-0 text-orange-600" />
                            <span className="truncate">{event.waste_collected_kg} kg</span>
                          </div>
                        )}
                      </div>

                      

                      {/* Action Button */}
                      {(() => {
                        const buttonState = getButtonState(event)
                        return (
                          <div className="flex gap-2">
                            <Button 
                              className="flex-1 text-sm sm:text-base" 
                              variant={buttonState.variant}
                              disabled={buttonState.disabled}
                              onClick={(e) => {
                                e.preventDefault();
                                if (!buttonState.disabled) {
                                  // If it's an enroll button, check authentication and show confirmation dialog
                                  if (buttonState.text === 'Enroll Now') {
                                    handleEnrollClick(event.event_id);
                                  }
                                  // If already enrolled, do nothing
                                  // For other actions, just handle enrollment directly (if user is authenticated)
                                }
                              }}
                            >
                              <span>{buttonState.text}</span>
                              {buttonState.icon}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={async (e) => {
                                e.preventDefault();
                                // Copy event link to clipboard
                                const eventUrl = generateEventShareLink(event.event_id);
                                const success = await copyToClipboard(eventUrl);
                                if (success) {
                                  toast({
                                    title: "Link Copied",
                                    description: "Event link has been copied to clipboard. Share it with volunteers for self-enrollment.",
                                  });
                                } else {
                                  toast({
                                    title: "Copy Failed",
                                    description: "Failed to copy link. Please try again.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="shrink-0"
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-8">
              <div className="flex flex-1 justify-between sm:hidden">
                <Button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                <Button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.perPage + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.currentPage * pagination.perPage, pagination.totalEvents)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.totalEvents}</span> events
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      variant="outline"
                      size="sm"
                      className="rounded-l-md"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          variant={pageNum === pagination.currentPage ? "default" : "outline"}
                          size="sm"
                          className={pageNum === pagination.currentPage ? "z-10" : ""}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage === pagination.totalPages}
                      variant="outline"
                      size="sm"
                      className="rounded-r-md"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
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

      {/* Enrollment Confirmation Dialog */}
      <AlertDialog open={confirmEnrollEvent !== null} onOpenChange={(open) => !open && setConfirmEnrollEvent(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Enrollment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to enroll in this event? Once enrolled, you'll be able to participate in the plogging activity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmEnrollEvent && handleEnroll(confirmEnrollEvent)}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Enrollment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}