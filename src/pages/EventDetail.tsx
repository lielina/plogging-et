import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient, Event, Section, FRONTEND_URL } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Calendar, Clock, MapPin, Users, CheckCircle, Scan, Plus, User, Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy, Check, Edit, QrCode, X, Clock as ClockIcon } from 'lucide-react'
import QRCode from 'qrcode'
import QRScanner from '@/components/ui/qr-scanner'
import ManualEnrollmentDialog from '@/components/ui/manual-enrollment-dialog'
import Map from '@/components/ui/map'
import { toast } from '@/hooks/use-toast'
import { getEventStatus, generateEventShareLink, copyToClipboard as copyToClipboardUtil } from '../utils/eventUtils';

interface Enrollment {
  enrollment_id: number;
  volunteer_id: string;
  event_id: string;
  signup_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  volunteer: {
    volunteer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    qr_code_path: string;
    registration_date: string;
    last_login: string;
    is_active: boolean;
    total_hours_contributed: string;
    created_at: string;
    updated_at: string;
  };
}

interface AttendanceRecord {
  attendance_id: number;
  volunteer_id: string;
  event_id: string;
  check_in_time: string;
  check_out_time: string | null;
  hours_contributed: number | null;
  recorded_by_admin_id: string;
  created_at: string;
  updated_at: string;
  volunteer: {
    volunteer_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    qr_code_path: string;
    registration_date: string;
    last_login: string;
    is_active: boolean;
    total_hours_contributed: string;
    created_at: string;
    updated_at: string;
  };
}

interface EventDetailData extends Event {
  enrollments: Enrollment[];
  attendance_records: AttendanceRecord[];
  sections?: Section[]; // Add sections property
}

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [event, setEvent] = useState<EventDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isVolunteerScannerOpen, setIsVolunteerScannerOpen] = useState(false)
  const [isAdminScannerOpen, setIsAdminScannerOpen] = useState(false)
  const [isManualEnrollmentOpen, setIsManualEnrollmentOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isCheckInScannerOpen, setIsCheckInScannerOpen] = useState(false)
  // const [isCheckOutScannerOpen, setIsCheckOutScannerOpen] = useState(false) // Removed as per requirement - only check-in is needed
  const [scanResult, setScanResult] = useState('')
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [isSectionCheckInDialogOpen, setIsSectionCheckInDialogOpen] = useState(false)

  // Check if current user is enrolled in this event
  const isUserEnrolled = () => {
    if (!user || !event) return false
    return event.enrollments.some(enrollment => 
      enrollment.volunteer.volunteer_id === (user as any).volunteer_id
    )
  }

  // Handle enrollment button click
  const handleEnrollClick = () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to login page with return URL
      navigate('/login', { state: { from: `/events/${eventId}` } })
      return
    }
    
    // If already enrolled, show message
    if (isUserEnrolled()) {
      toast({
        title: "Already Enrolled",
        description: "You are already enrolled in this event.",
      })
      return
    }
    
    // Show confirmation dialog
    setIsEnrollDialogOpen(true)
  }

  // Handle actual enrollment
  const handleEnroll = async () => {
    try {
      await apiClient.enrollInEvent(parseInt(eventId!))
      
      // Refresh event data to show updated enrollment
      const response = await apiClient.getEventDetails(parseInt(eventId!))
      setEvent(response.data as EventDetailData)
      
      toast({
        title: "Enrollment Successful",
        description: "You have been successfully enrolled in this event.",
      })
    } catch (error: any) {
      // Check if it's a timing issue with event status
      if (error.message && error.message.includes('Cannot enroll in non-upcoming events')) {
        // Use our utility to check if event should be upcoming
        if (event) {
          const eventStatusInfo = getEventStatus(
            event.event_date,
            event.start_time,
            event.end_time
          );
          
          if (eventStatusInfo.canEnroll) {
            toast({
              title: "Timing Issue",
              description: "This event should be available for enrollment. There might be a synchronization issue. Please try again in a few minutes.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Enrollment Not Available",
              description: eventStatusInfo.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Enrollment Failed",
            description: "Cannot enroll in non-upcoming events. Please check if the event date is in the future.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Enrollment Failed",
          description: error.message || "Failed to enroll in event. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsEnrollDialogOpen(false)
    }
  }

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return
      
      try {
        setIsLoading(true)
        setError('')
        
        const response = await apiClient.getEventDetails(parseInt(eventId))
        setEvent(response.data as EventDetailData)
        
        // Log the event data for debugging
        console.log('Event data:', response.data);
        if (response.data.image_path) {
          console.log('Image path:', response.data.image_path);
          console.log('Image path starts with http:', response.data.image_path.startsWith('http'));
        }
        
        // Generate QR code for the event using the same URL format as the share link
        const qrData = `${FRONTEND_URL}/events/${eventId}`
        const qrCodeUrl = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeDataUrl(qrCodeUrl)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch event details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventDetails()
  }, [eventId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    // Handle case where timeString might be null or undefined
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
      
      // If it's in HH:MM:SS format, extract HH:MM and format as HH:MM AM/PM
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

  const formatDateTime = (dateTimeString: string) => {
    // Handle case where dateTimeString might be null or undefined
    if (!dateTimeString) return 'Not available';
    
    try {
      // Handle the specific format you're seeing: 2025-09-29T17:07:00.000000Z
      if (dateTimeString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z$/)) {
        // Parse the datetime string directly
        const date = new Date(dateTimeString);
        
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
      
      // Try multiple parsing approaches
      let date: Date | null = null;
      
      // Approach 1: Handle ISO format with microseconds and timezone (2025-09-29T17:07:00.000000Z)
      if (dateTimeString.includes('.')) {
        // Remove microseconds but keep timezone
        const cleanDateString = dateTimeString.replace(/\.\d+Z$/, 'Z');
        date = new Date(cleanDateString);
      } 
      // Approach 2: Standard ISO format
      else {
        date = new Date(dateTimeString);
      }
      
      // Check if date is valid
      if (!date || isNaN(date.getTime())) {
        return dateTimeString; // Return original if parsing fails
      }
      
      // Format only the time portion in HH:MM AM/PM format
      let hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const minutesStr = minutes < 10 ? '0' + minutes : minutes;
      const formattedTime = `${hours}:${minutesStr} ${ampm}`;
      
      return formattedTime;
    } catch (error) {
      return dateTimeString; // Return original if any error occurs
    }
  }

  // Social Media Sharing Functions
  const getShareUrl = () => {
    // Use the public/user-side URL
    return `${FRONTEND_URL}/events/${eventId}`;
  }

  const getShareText = () => {
    if (!event) return ''
    return `Join us for ${event.event_name} on ${formatDate(event.event_date)} at ${event.location_name}! 🌱 #PloggingEthiopia #CleanEnvironment`
  }

  const getFacebookShareText = () => {
    if (!event) return ''
    const description = event.description.length > 200 
      ? event.description.substring(0, 200) + '...' 
      : event.description
    return `Join us for ${event.event_name} on ${formatDate(event.event_date)} at ${event.location_name}!

${description}

🌱 #PloggingEthiopia #CleanEnvironment #Volunteer`
  }

  const shareToFacebook = () => {
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(getFacebookShareText())
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank')
  }

  const shareToTwitter = () => {
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(getShareText())
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank')
  }

  const shareToLinkedIn = () => {
    const url = encodeURIComponent(getShareUrl())
    const text = encodeURIComponent(getShareText())
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank')
  }

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(getShareText() + ' ' + getShareUrl())
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const copyShareLinkToClipboard = async () => {
    try {
      const success = await copyToClipboardUtil(getShareUrl())
      if (success) {
        setCopied(true)
        toast({
          title: "Link copied!",
          description: "Event link has been copied to clipboard.",
        })
        setTimeout(() => setCopied(false), 2000)
      } else {
        throw new Error('Failed to copy')
      }
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      })
    }
  }

  const handleVolunteerScan = async (qrData: string) => {
    try {
      // Parse QR data (format: https://plogging-user-wyci.vercel.app/events/eventId)
      if (qrData.startsWith(`${FRONTEND_URL}/events/`)) {
        const urlParts = qrData.split('/')
        const scannedEventId = parseInt(urlParts[urlParts.length - 1])
        
        if (scannedEventId === parseInt(eventId!)) {
          setScanResult(`Event QR code scanned successfully! Event ID: ${scannedEventId}`)
          // Here you could add logic to show a form for volunteer to enter their details
          // or scan their volunteer badge
        } else {
          setScanResult('Invalid event QR code')
        }
      } else {
        // Handle old format for backward compatibility
        const parts = qrData.split(':')
        if (parts.length === 2 && parts[0] === 'event') {
          const scannedEventId = parseInt(parts[1])
          
          if (scannedEventId === parseInt(eventId!)) {
            setScanResult(`Event QR code scanned successfully! Event ID: ${scannedEventId}`)
            // Here you could add logic to show a form for volunteer to enter their details
            // or scan their volunteer badge
          } else {
            setScanResult('Invalid event QR code')
          }
        } else {
          setScanResult('Invalid QR code format')
        }
      }
    } catch (err: any) {
      setScanResult(err.message || 'Scan failed')
    }
  }

  const handleAdminScan = async (qrData: string) => {
    try {
      // Parse QR data (format: volunteer:volunteerId)
      const parts = qrData.split(':')
      if (parts.length === 2 && parts[0] === 'volunteer') {
        const volunteerId = parseInt(parts[1])
        
        // Check if volunteer is already enrolled
        const isEnrolled = event?.enrollments.some(enrollment => 
          enrollment.volunteer.volunteer_id === volunteerId
        )
        
        if (isEnrolled) {
          setScanResult('This volunteer is already enrolled in the event')
        } else {
          // Enroll the volunteer
          await apiClient.enrollVolunteerInEvent(parseInt(eventId!), volunteerId)
          setScanResult('Volunteer enrolled successfully!')
          
          // Refresh event data
          const response = await apiClient.getEventDetails(parseInt(eventId!))
          setEvent(response.data as EventDetailData)
        }
      } else {
        setScanResult('Invalid volunteer badge QR code')
      }
    } catch (err: any) {
      setScanResult(err.message || 'Enrollment failed')
    }
  }

  // Manual Enrollment Handler
  const handleManualEnrollment = async (volunteerId: number) => {
    try {
      // Check if user is admin
      if (isAdmin) {
        // For admins, we still can't directly enroll volunteers due to system limitations
        // But admins can search for volunteers, so we provide different instructions
        throw new Error('System limitation: Only volunteers can enroll themselves in events. Please share the event link with the volunteer so they can enroll through their dashboard.');
      } else {
        // For regular users, provide standard instructions
        throw new Error('System limitation: Only volunteers can enroll themselves in events. Please share the event link with the volunteer so they can enroll through their dashboard.');
      }
    } catch (err: any) {
      console.error('Manual enrollment error:', err);
      throw err;
    }
  }

  // User Check-in Function
  const handleUserCheckIn = async (qrData: string) => {
    try {
      // Parse QR data (format: https://plogging-user-wyci.vercel.app/events/eventId)
      let scannedEventId: number | null = null;
      
      if (qrData.startsWith(`${FRONTEND_URL}/events/`)) {
        const urlParts = qrData.split('/')
        scannedEventId = parseInt(urlParts[urlParts.length - 1])
      } else {
        // Handle old format for backward compatibility
        const parts = qrData.split(':')
        if (parts.length === 2 && parts[0] === 'event') {
          scannedEventId = parseInt(parts[1])
        }
      }
      
      if (scannedEventId && scannedEventId === parseInt(eventId!)) {
        // Get user ID based on user type
        let userId = ''
        if (user && 'volunteer_id' in user) {
          userId = `volunteer:${user.volunteer_id}`
        } else if (user && 'admin_id' in user) {
          userId = `admin:${user.admin_id}`
        }
        
        if (!userId) {
          throw new Error('User not authenticated')
        }
        
        // If event has sections, open section selection dialog
        if (event?.sections && event.sections.length > 0) {
          setIsSectionCheckInDialogOpen(true)
          return
        }
        
        // Perform check-in for the current user
        await apiClient.checkIn(scannedEventId, userId)
        setScanResult('Check-in successful!')
        
        // Refresh event data to show updated attendance
        const response = await apiClient.getEventDetails(parseInt(eventId!))
        setEvent(response.data as EventDetailData)
        
        toast({
          title: "Check-in Successful",
          description: "You have been successfully checked in to this event.",
        })
      } else {
        setScanResult('Invalid event QR code')
      }
    } catch (err: any) {
      setScanResult(err.message || 'Check-in failed')
      toast({
        title: "Check-in Failed",
        description: err.message || "Failed to check in to the event.",
        variant: "destructive",
      })
    }
  }

  // New section-based check-in handler
  const handleSectionCheckIn = async (sectionId: number) => {
    if (!user || !('volunteer_id' in user)) return
    
    try {
      // Call the section-based check-in API
      await apiClient.checkInSection(user.volunteer_id, parseInt(eventId!), sectionId)
      setScanResult('Check-in to section successful!')
      setIsSectionCheckInDialogOpen(false)
      
      // Refresh event data to show updated attendance
      const response = await apiClient.getEventDetails(parseInt(eventId!))
      setEvent(response.data as EventDetailData)
      
      toast({
        title: "Check-in Successful",
        description: "You have been successfully checked in to the section.",
      })
    } catch (err: any) {
      setScanResult(err.message || 'Section check-in failed')
      toast({
        title: "Check-in Failed",
        description: err.message || "Failed to check in to the section.",
        variant: "destructive",
      })
    }
  }

  // User Check-out Function removed as per requirement - only check-in is needed

  // Admin Check-in Function
  const handleAdminCheckIn = async (qrData: string) => {
    try {
      // Parse QR data (format: volunteer:volunteerId)
      const parts = qrData.split(':')
      if (parts.length === 2 && parts[0] === 'volunteer') {
        const volunteerId = parseInt(parts[1])
        
        // Check if volunteer is enrolled in the event
        const isEnrolled = event?.enrollments.some(enrollment => 
          enrollment.volunteer.volunteer_id === volunteerId
        )
        
        if (isEnrolled) {
          // Perform check-in for the volunteer
          await apiClient.checkIn(parseInt(eventId!), qrData)
          setScanResult(`Volunteer ${volunteerId} checked in successfully!`)
          
          // Refresh event data to show updated attendance
          const response = await apiClient.getEventDetails(parseInt(eventId!))
          setEvent(response.data as EventDetailData)
          
          toast({
            title: "Check-in Successful",
            description: `Volunteer has been successfully checked in to this event.`,
          })
        } else {
          setScanResult(`Volunteer ${volunteerId} is not enrolled in this event`)
        }
      } else {
        setScanResult('Invalid volunteer badge QR code')
      }
    } catch (err: any) {
      setScanResult(err.message || 'Check-in failed')
      toast({
        title: "Check-in Failed",
        description: err.message || "Failed to check in the volunteer.",
        variant: "destructive",
      })
    }
  }

  // Admin Check-out Function removed as per requirement - only check-in is needed

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Event not found</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const latitude = typeof event.latitude === 'string' ? parseFloat(event.latitude) : event.latitude
  const longitude = typeof event.longitude === 'string' ? parseFloat(event.longitude) : event.longitude

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{event.event_name}</h1>
                  <Badge 
                    variant={event.status === 'Active' ? 'default' : 'secondary'}
                    className="text-sm px-3 py-1 w-fit"
                  >
                    {event.status}
                  </Badge>
                </div>
                <p className="text-gray-600 text-base sm:text-lg">{event.location_name}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {!isAdmin ? (
                  <>
                    {/* Enrollment button for regular users */}
                    <Button 
                      variant="default"
                      onClick={handleEnrollClick}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      disabled={isUserEnrolled()}
                    >
                      {isUserEnrolled() ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Enrolled
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => setIsCheckInScannerOpen(true)}
                      className="bg-white hover:bg-gray-50 w-full sm:w-auto"
                      disabled={!isUserEnrolled()}
                    >
                      <Scan className="h-4 w-4 mr-2" />
                      <span className="whitespace-nowrap">Check In</span>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => setIsAdminScannerOpen(true)}
                      className="bg-white hover:bg-gray-50 w-full sm:w-auto"
                    >
                      <Scan className="h-4 w-4 mr-2" />
                      <span className="whitespace-nowrap">Scan Badge</span>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setIsManualEnrollmentOpen(true)}
                      className="bg-white hover:bg-gray-50 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="whitespace-nowrap">Manual Enroll</span>
                    </Button>
                  </>
                )}
                <Button 
                  variant="outline"
                  onClick={() => setIsShareDialogOpen(true)}
                  className="bg-white hover:bg-gray-50 w-full sm:w-auto"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">Share</span>
                </Button>
                {isAdmin && (
                  <Button 
                    onClick={() => navigate(`/admin/events/${eventId}/edit`)}
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    <span className="whitespace-nowrap">Edit Event</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            {event.image_path && (
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">Event Image</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <img 
                      src={event.image_path.startsWith('http') ? event.image_path : `https://ploggingapi.pixeladdis.com/${event.image_path.startsWith('/') ? event.image_path.slice(1) : event.image_path}`}
                      alt={`${event.event_name} - Event Image`}
                      className="max-w-full h-auto rounded-lg shadow-md object-cover"
                      style={{ maxHeight: '400px' }}
                      onError={(e) => {
                        // Handle image loading errors
                        console.log('Image failed to load:', event.image_path);
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>

            {/* Event QR Code */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <QrCode className="h-6 w-6 text-green-600" />
                  Event QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 inline-block">
                    {qrCodeDataUrl ? (
                      <div className="w-32 h-32 sm:w-48 sm:h-48 bg-white border-2 border-green-200 rounded-xl flex items-center justify-center p-2 sm:p-4 shadow-sm mx-auto">
                        <img 
                          src={qrCodeDataUrl}
                          alt="Event QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 sm:w-48 sm:h-48 bg-white border-2 border-green-200 rounded-xl flex items-center justify-center shadow-sm mx-auto">
                        <div className="text-center">
                          <QrCode className="h-8 w-8 sm:h-16 sm:w-16 text-green-400 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm font-mono text-gray-600">Event ID: {event.event_id}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Generating QR code...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">
                      Volunteers can scan this QR code to check in to the event
                    </p>
                    <div className="inline-block px-2 py-1 sm:px-3 sm:py-1 bg-gray-100 rounded-full">
                      <p className="text-[10px] sm:text-xs text-gray-600 font-mono">
                        QR Data: {FRONTEND_URL}/events/{event.event_id}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date and Time */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900">Date & Time</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(event.event_date)}</p>
                    <p className="text-sm text-gray-500">Event Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{formatTime(event.start_time)} - {formatTime(event.end_time)}</p>
                    <p className="text-sm text-gray-500">Event Time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Sections */}
            {event.sections && event.sections.length > 0 && (
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">Event Sections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {event.sections.map((section, index) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <h3 className="font-semibold text-gray-900">{section.section_name}</h3>
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            Section {index + 1}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 p-2 bg-white rounded">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-xs text-gray-500">Time</p>
                              <p className="text-sm font-medium">{formatTime(section.start_time)} - {formatTime(section.end_time)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-white rounded">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <div>
                              <p className="text-xs text-gray-500">Distance</p>
                              <p className="text-sm font-medium">{section.distance_km} km</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Duration & Capacity */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">{event.estimated_duration_hours}</p>
                    <p className="text-xs sm:text-sm text-green-600">Hours</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-blue-700">{event.max_volunteers}</p>
                    <p className="text-xs sm:text-sm text-blue-600">Max Volunteers</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-purple-700">#{event.event_id}</p>
                    <p className="text-xs sm:text-sm text-purple-600">Event ID</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{event.location_name}</p>
                    <p className="text-sm text-gray-500">Event Location</p>
                  </div>
                </div>
              
              {/* Map showing event location */}
              <div className="rounded-xl overflow-hidden border shadow-sm">
                <Map
                  height="300px"
                  center={[latitude, longitude]}
                  zoom={15}
                  selectedLocation={[latitude, longitude]}
                  isLocationPicker={false}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Latitude</p>
                  <p className="text-lg font-mono text-gray-900 break-all">{latitude}</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Longitude</p>
                  <p className="text-lg font-mono text-gray-900 break-all">{longitude}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollments */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-6 w-6 text-green-600" />
                Enrollments
                <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5">
                  {event.enrollments.length}/{event.max_volunteers}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {event.enrollments.map((enrollment) => (
                  <div key={enrollment.enrollment_id} className="relative p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <Badge 
                      variant="default" 
                      className={`absolute top-2 right-2 text-xs whitespace-nowrap px-2 py-0.5 ${
                        enrollment.status === 'Signed Up' ? 'bg-green-800 hover:bg-green-900' :
                        enrollment.status === 'Attended' ? 'bg-blue-800 hover:bg-blue-900' :
                        enrollment.status === 'Missed' ? 'bg-red-800 hover:bg-red-900' :
                        'bg-gray-800 hover:bg-gray-900'
                      }`}
                    >
                      {enrollment.status}
                    </Badge>
                    <div className="flex items-center gap-3 pr-16">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {enrollment.volunteer.first_name} {enrollment.volunteer.last_name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">{enrollment.volunteer.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                Attendance
                <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5">
                  {event.attendance_records.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {event.attendance_records.map((record) => (
                  <div key={record.attendance_id} className="relative p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="absolute top-2 right-2">
                      {record.hours_contributed ? (
                        <Badge variant="default" className="text-xs bg-green-800 hover:bg-green-900 whitespace-nowrap px-2 py-0.5">
                          Completed
                        </Badge>
                      ) : record.check_out_time ? (
                        <Badge variant="default" className="text-xs bg-blue-800 hover:bg-blue-900 whitespace-nowrap px-2 py-0.5">
                          Checked Out
                        </Badge>
                      ) : (
                        <Badge variant="default" className="text-xs bg-yellow-800 hover:bg-yellow-900 whitespace-nowrap px-2 py-0.5">
                          Checked In
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 pr-16">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">
                          {record.volunteer.first_name} {record.volunteer.last_name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          Check-in: {formatDateTime(record.check_in_time)}
                        </p>
                        {record.check_out_time && (
                          <p className="text-xs text-gray-600 truncate">
                            Check-out: {formatDateTime(record.check_out_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {event.attendance_records.length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No attendance records yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scan Result Toast */}
      {scanResult && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm">{scanResult}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setScanResult('')}
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* User Check-in QR Scanner */}
      <QRScanner
        isOpen={isCheckInScannerOpen}
        onClose={() => setIsCheckInScannerOpen(false)}
        onScan={handleUserCheckIn}
        title="Event Check-in"
        description="Scan the event QR code to check in"
      />

      {/* User Check-out QR Scanner removed as per requirement - only check-in is needed */}

      {/* Volunteer QR Scanner */}
      <QRScanner
        isOpen={isVolunteerScannerOpen}
        onClose={() => setIsVolunteerScannerOpen(false)}
        onScan={handleVolunteerScan}
        title="Event QR Code"
        description="Scan the event QR code to check in volunteers"
      />

      {/* Admin Badge Scanner */}
      <QRScanner
        isOpen={isAdminScannerOpen}
        onClose={() => setIsAdminScannerOpen(false)}
        onScan={handleAdminScan}
        title="Volunteer Badge Scanner"
        description="Scan volunteer badges to enroll them"
      />

      {/* Manual Enrollment Dialog */}
      <ManualEnrollmentDialog
        isOpen={isManualEnrollmentOpen}
        onClose={() => setIsManualEnrollmentOpen(false)}
        onEnroll={handleManualEnrollment}
        eventName={event?.event_name || ''}
      />

      {/* Share Event Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Event
            </DialogTitle>
            <DialogDescription>
              Share this event with your friends and community
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Event Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{event?.event_name}</h3>
              <p className="text-sm text-gray-600 mb-2">{event?.location_name}</p>
              <p className="text-sm text-gray-600">
                {event && formatDate(event.event_date)} • {event && formatTime(event.start_time)}
              </p>
            </div>

            {/* Social Media Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={shareToFacebook}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              
              <Button 
                onClick={shareToTwitter}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                <Twitter className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              
              <Button 
                onClick={shareToLinkedIn}
                className="bg-blue-700 hover:bg-blue-800 text-white"
              >
                <Linkedin className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              
              <Button 
                onClick={shareToWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>

            {/* Copy Link */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Or copy the link</Label>
              <div className="flex gap-2">
                <Input 
                  value={getShareUrl()} 
                  readOnly 
                  className="text-sm"
                />
                <Button 
                  onClick={copyShareLinkToClipboard}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Enrollment Confirmation Dialog */}
      <Dialog open={isEnrollDialogOpen} onOpenChange={setIsEnrollDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to enroll in this event? Once enrolled, you'll be able to participate in the plogging activity.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEnrollDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnroll} className="bg-green-600 hover:bg-green-700">
              Confirm Enrollment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Section Check-in Dialog */}
      <Dialog open={isSectionCheckInDialogOpen} onOpenChange={setIsSectionCheckInDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Section</DialogTitle>
            <DialogDescription>
              Select which section you want to check into.
            </DialogDescription>
          </DialogHeader>
          
          {event?.sections && event.sections.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {event.sections.map((section, index) => (
                <div 
                  key={index}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSectionCheckIn(index + 1)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{section.section_name}</h3>
                      <p className="text-sm text-gray-500">
                        {formatTime(section.start_time)} - {formatTime(section.end_time)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {section.distance_km} km
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsSectionCheckInDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </div>
)

}