import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
import { Calendar, Clock, MapPin, Users, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
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
  const location = useLocation()
  const isInitialMount = useRef(true)

  const fetchEvents = async (page: number = 1) => {
    try {
      setIsLoading(true)
      setError('')
      
      console.log('Fetching events for page:', page);
      
      // Fetch both events and enrollments in parallel
      const [eventsResponse, enrollmentsResponse] = await Promise.allSettled([
        apiClient.getAvailableEvents(page, pagination.perPage),
        apiClient.getVolunteerEnrollments().catch(() => ({ data: [] })) // Silently fail if not authenticated
      ])
      
      // Extract events data
      const eventsData = eventsResponse.status === 'fulfilled' 
        ? eventsResponse.value.data 
        : []
      
      // Extract enrolled event IDs
      const enrollments = enrollmentsResponse.status === 'fulfilled' && enrollmentsResponse.value.data
        ? enrollmentsResponse.value.data
        : []
      
      // Extract enrolled event IDs from enrollment data
      // Handle different possible structures: e.event_id, e.event?.event_id (string or number)
      const enrolledIds = new Set(
        enrollments
          .map((e: any) => {
            const eventId = e.event_id || e.event?.event_id;
            // Convert to number if it's a string
            const id = typeof eventId === 'string' ? parseInt(eventId) : eventId;
            return id;
          })
          .filter(id => !isNaN(id) && id > 0) // Filter out invalid IDs
      );
      setEnrolledEventIds(enrolledIds)
      
      console.log('Events data:', eventsData);
      console.log('Enrollments:', enrollments);
      console.log('Enrolled event IDs:', enrolledIds);
      console.log('Pagination data:', eventsResponse.status === 'fulfilled' ? eventsResponse.value.pagination : null);
      
      // Map enrollment status - match EventDetail logic
      const updatedEvents = eventsData.map(event => {
        // Check enrollment the same way EventDetail does:
        // Look for user's volunteer_id in event.enrollments array
        let isEnrolled = false;
        let enrollmentStatus: string | undefined = undefined;
        let enrollment: any = undefined;
        
        // First, check if event has enrollments array (like EventDetail does)
        // Cast to any to access enrollments property which may exist in some responses
        const eventWithEnrollments = event as any;
        if (eventWithEnrollments.enrollments && Array.isArray(eventWithEnrollments.enrollments) && user && 'volunteer_id' in user) {
          enrollment = eventWithEnrollments.enrollments.find((e: any) => 
            e.volunteer?.volunteer_id === (user as any).volunteer_id ||
            parseInt(e.volunteer_id) === (user as any).volunteer_id
          );
          if (enrollment) {
            isEnrolled = true;
            enrollmentStatus = enrollment.status;
          }
        }
        
        // If not found in event.enrollments, check enrollments list (from getVolunteerEnrollments)
        if (!isEnrolled) {
          const isEnrolledFromList = enrolledIds.has(event.event_id);
          enrollment = enrollments.find((e: any) => {
            const eid = e.event_id || e.event?.event_id;
            const id = typeof eid === 'string' ? parseInt(eid) : eid;
            return id === event.event_id;
          });
          
          if (isEnrolledFromList || enrollment) {
            isEnrolled = true;
            enrollmentStatus = enrollment?.status || enrollment?.enrollment_status || 'Signed Up';
          }
        }
        
        // Fallback: Check backend enrollment status flags
        if (!isEnrolled) {
          const isEnrolledFromBackend = event.is_enrolled === true || 
                            event.enrollment_status === 'Enrolled' || 
                            event.enrollment_status === 'Signed Up' ||
                            event.enrollment_status === 'confirmed' ||
                            event.enrollment_status === 'attended' ||
                            event.can_enroll === false;
          if (isEnrolledFromBackend) {
            isEnrolled = true;
            enrollmentStatus = event.enrollment_status || 'Signed Up';
          }
        }
        
        // Set default status if enrolled but no status
        if (isEnrolled && !enrollmentStatus) {
          enrollmentStatus = 'Signed Up';
        }
        
        const canEnroll = event.can_enroll !== false && !isEnrolled;
        
        return {
          ...event,
          is_enrolled: isEnrolled,
          enrollment_status: enrollmentStatus,
          can_enroll: canEnroll
        }
      })
      
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
    isInitialMount.current = false
  }, [])

  // Refresh events when navigating back to this page (to get updated enrollment status)
  useEffect(() => {
    if (location.pathname === '/events' && !isInitialMount.current) {
      // Small delay to ensure we're fully navigated before refreshing
      const timeoutId = setTimeout(() => {
        fetchEvents(pagination.currentPage)
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [location.pathname])

  // Listen for enrollment updates from other pages
  useEffect(() => {
    const handleEnrollmentUpdate = (event: CustomEvent) => {
      // Refresh events list to get updated enrollment status
      fetchEvents(pagination.currentPage)
    }
    
    window.addEventListener('enrollmentUpdated', handleEnrollmentUpdate as EventListener)
    
    return () => {
      window.removeEventListener('enrollmentUpdated', handleEnrollmentUpdate as EventListener)
    }
  }, [pagination.currentPage])

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
      
      // Immediately update the event status using the enrollment response
      // The response includes enrollment data with event_id and status
      const enrollmentData = response.data.data || response.data;
      const enrollmentStatus = enrollmentData?.status || 'Signed Up';
      
      // Add this event to enrolled event IDs immediately
      setEnrolledEventIds(prev => new Set([...prev, eventId]))
      
      // Immediately update the event in the list to show "Enrolled"
      setEvents(prev => prev.map(e => 
        e.event_id === eventId 
          ? { 
              ...e, 
              is_enrolled: true, 
              can_enroll: false,
              enrollment_status: enrollmentStatus
            }
          : e
      ))
      
      // Also refresh enrollments list to get updated enrollment status (for future refreshes)
      try {
        const enrollmentsResponse = await apiClient.getVolunteerEnrollments()
        // Extract enrolled event IDs with improved logic
        const enrolledIds = new Set(
          enrollmentsResponse.data
            .map((e: any) => {
              const eventId = e.event_id || e.event?.event_id;
              const id = typeof eventId === 'string' ? parseInt(eventId) : eventId;
              return id;
            })
            .filter(id => !isNaN(id) && id > 0)
        );
        // Add the current event ID to ensure it's included
        enrolledIds.add(eventId);
        setEnrolledEventIds(enrolledIds)
      } catch (error) {
        console.error('Error fetching enrollments after enrollment:', error)
      }
      
      // Refresh events list to get updated enrollment status from backend
      // This ensures the status is persisted even after navigation
      await fetchEvents(pagination.currentPage)
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('enrollmentUpdated', { detail: { eventId } }))
      
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
      } else if (error.message?.includes('Already enrolled')) {
        errorTitle = 'Already Enrolled'
        errorMessage = 'You are already enrolled in this event. Check your dashboard for enrollment details.'
        
        // Update the event to reflect enrollment status
        setEvents(prev => prev.map(e => 
          e.event_id === eventId 
            ? { 
                ...e, 
                is_enrolled: true, 
                can_enroll: false,
                enrollment_status: 'Enrolled'
              }
            : e
        ))
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
    
    // Use our utility function to determine event status
    const eventStatusInfo = getEventStatus(
      event.event_date,
      event.start_time,
      event.end_time
    );
    
    console.log('Event status info for event', event.event_id, ':', eventStatusInfo);
    console.log('Event data:', {
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time
    });
    
    // Check if user is enrolled - prioritize is_enrolled flag set in fetchEvents
    // This is set based on comprehensive enrollment check in fetchEvents
    let isEnrolled = event.is_enrolled === true;
    
    // If not set, check if event has enrollments array (like EventDetail does for detail page)
    if (!isEnrolled) {
      const eventWithEnrollments = event as any;
      if (eventWithEnrollments.enrollments && Array.isArray(eventWithEnrollments.enrollments) && user && 'volunteer_id' in user) {
        isEnrolled = eventWithEnrollments.enrollments.some((enrollment: any) => 
          enrollment.volunteer?.volunteer_id === (user as any).volunteer_id ||
          parseInt(enrollment.volunteer_id) === (user as any).volunteer_id
        );
      }
    }
    
    // Fallback: Check other enrollment status flags
    if (!isEnrolled) {
      isEnrolled = event.enrollment_status === 'Enrolled' || 
                    event.enrollment_status === 'Signed Up' ||
                    event.enrollment_status === 'confirmed' ||
                    event.enrollment_status === 'attended' ||
                    event.can_enroll === false;
    }
    
    // If enrolled, show enrolled status
    if (isEnrolled) {
      return {
        disabled: true,
        text: 'Enrolled',
        variant: 'secondary' as const,
        icon: <CheckCircle className="h-4 w-4 ml-2 flex-shrink-0 text-green-600" />,
        showDetails: true,
        status: event.enrollment_status || 'Enrolled'
      }
    }
    
    // If event is active (in progress), show appropriate status
    if (eventStatusInfo.status === 'active') {
      return {
        disabled: true,
        text: 'Event In Progress',
        variant: 'secondary' as const,
        icon: null,
        showDetails: false
      }
    }
    
    // If event is completed, show appropriate status
    if (eventStatusInfo.status === 'completed') {
      return {
        disabled: true,
        text: 'Event Ended',
        variant: 'secondary' as const,
        icon: null,
        showDetails: false
      }
    }
    
    // If event is upcoming and can be enrolled, show enroll button
    if (eventStatusInfo.status === 'upcoming' && eventStatusInfo.canEnroll) {
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
                        // Use our utility function to determine event status for the badge
                        const eventStatusInfo = getEventStatus(
                          event.event_date,
                          event.start_time,
                          event.end_time
                        );
                        
                        return (
                          <Badge 
                            variant={eventStatusInfo.status === 'upcoming' ? 'default' : 
                                    eventStatusInfo.status === 'active' ? 'destructive' : 
                                    'secondary'}
                            className="ml-2 flex-shrink-0 text-xs px-2 py-0.5"
                          >
                            {eventStatusInfo.status === 'upcoming' ? 'Upcoming' : 
                             eventStatusInfo.status === 'active' ? 'Active' : 
                             'Completed'}
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
                        <div className="flex items-center gap-2 text-gray-600 min-w-0">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">Max {event.max_volunteers}</span>
                        </div>
                      </div>

                      {/* Event Status Indicator */}
                      <div className="flex items-center justify-between pt-2">
                        {(() => {
                          // Use our utility function to determine event status
                          const eventStatusInfo = getEventStatus(
                            event.event_date,
                            event.start_time,
                            event.end_time
                          );
                          
                          console.log('Event badge status for event', event.event_id, ':', eventStatusInfo);
                          
                          return (
                            <Badge 
                              variant={
                                eventStatusInfo.status === 'upcoming' ? 'default' : 
                                eventStatusInfo.status === 'active' ? 'destructive' : 
                                'secondary'
                              }
                              className="text-xs px-2 py-1"
                            >
                              {eventStatusInfo.status === 'upcoming' ? 'Upcoming' : 
                               eventStatusInfo.status === 'active' ? 'In Progress' : 
                               eventStatusInfo.status === 'completed' ? 'Completed' : 
                               'Not Available'}
                            </Badge>
                          );
                        })()}
                        
                        {/* Enrollment Status */}
                        {(() => {
                          const buttonState = getButtonState(event);
                          // Show enrolled badge if button shows "Enrolled" (getButtonState already checks comprehensively)
                          if (buttonState.text === 'Enrolled' && buttonState.showDetails === true) {
                            return (
                              <Badge variant="outline" className="text-xs px-2 py-1 text-green-700 border-green-300">
                                Enrolled
                              </Badge>
                            );
                          }
                          return null;
                        })()}
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
                                  } else {
                                    // For other actions, just handle enrollment directly (if user is authenticated)
                                    if (isAuthenticated) {
                                      handleEnroll(event.event_id);
                                    } else {
                                      navigate('/login', { state: { from: `/events/${event.event_id}` } });
                                    }
                                  }
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