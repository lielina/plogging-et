import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { User, AlertCircle, CheckCircle, Search, Mail, Phone, Info } from 'lucide-react'
import { apiClient, Volunteer } from '@/lib/api'

interface ManualEnrollmentDialogProps {
  isOpen: boolean
  onClose: () => void
  onEnroll: (volunteerId: number) => Promise<void>
  eventName: string
}

export default function ManualEnrollmentDialog({ 
  isOpen, 
  onClose, 
  onEnroll, 
  eventName 
}: ManualEnrollmentDialogProps) {
  const [volunteerId, setVolunteerId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Volunteer[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchError, setSearchError] = useState('')

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          if (query.trim()) {
            handleSearch(query.trim())
          } else {
            setSearchResults([])
          }
        }, 300) // 300ms delay
      }
    })(),
    []
  )

  const handleEnroll = async () => {
    if (!volunteerId.trim()) {
      setError('Please enter a volunteer ID')
      return
    }

    const id = parseInt(volunteerId.trim())
    if (isNaN(id)) {
      setError('Please enter a valid volunteer ID (number)')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      setSuccess('')
      
      // Instead of enrolling directly, we'll show instructions
      setSuccess('Please share the event link with the selected volunteer so they can enroll through their dashboard.')
      setTimeout(() => {
        setVolunteerId('')
        setSuccess('')
        onClose()
      }, 3000)
    } catch (err: any) {
      // Handle specific error messages without exposing volunteer IDs
      let errorMessage = err.message || 'Failed to enroll volunteer';
      
      // Check if it's an "already enrolled" error and clean it up
      if (errorMessage.includes('already enrolled')) {
        // Remove any volunteer ID patterns from the message
        errorMessage = errorMessage.replace(/volunteer \d+ is already enrolled/i, 'This volunteer is already enrolled');
        errorMessage = errorMessage.replace(/volunteer \d+/i, 'volunteer');
        // Fallback if the pattern is different
        if (errorMessage.toLowerCase().includes('already enrolled')) {
          errorMessage = 'This volunteer is already enrolled in the event';
        }
      }
      
      // Handle system limitation error
      if (err.message && (err.message.includes('404') || err.message.includes('500') || err.message.includes('system limitation'))) {
        errorMessage = 'System limitation: Only volunteers can enroll themselves in events. Please share the event link with the volunteer so they can enroll through their dashboard.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    try {
      setIsSearching(true)
      setSearchError('')
      
      // Note: This will only work if the user has admin privileges
      // The volunteer API doesn't have access to search volunteers
      const response = await apiClient.getAllVolunteers(1, 15, query)
      // Handle the nested data structure: response.data.data contains the volunteers array
      const volunteersData = (response.data as any)?.data || response.data;
      setSearchResults(Array.isArray(volunteersData) ? volunteersData : [])
    } catch (err: any) {
      // Provide a clearer error message
      if (err.message && (err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized'))) {
        setSearchError('Volunteer search is only available to administrators. Please use the admin dashboard to search for volunteers.')
      } else {
        setSearchError(err.message || 'Failed to search volunteers. Please try again.')
      }
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectVolunteer = (volunteer: Volunteer) => {
    setVolunteerId(volunteer.volunteer_id.toString())
    setSearchQuery(`${volunteer.first_name} ${volunteer.last_name}`)
    setSearchResults([])
  }

  const handleClose = () => {
    setVolunteerId('')
    setSearchQuery('')
    setSearchResults([])
    setError('')
    setSuccess('')
    setSearchError('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Manual Enrollment
          </DialogTitle>
          <DialogDescription>
            Manually enroll a volunteer in "{eventName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* System Limitation Notice */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 font-medium">System Limitation</p>
              <p className="text-xs text-blue-700 mt-1">
                Volunteers must enroll themselves through their dashboard. You can only provide instructions here.
              </p>
            </div>
          </div>

          {/* Search Section */}
          <div className="space-y-2">
            <Label htmlFor="search-volunteer">Search Volunteers</Label>
            <Input
              id="search-volunteer"
              placeholder="Search by name, email, or phone number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                debouncedSearch(e.target.value)
              }}
            />
            {isSearching && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Searching...
              </div>
            )}
            
            {/* Search Error Message */}
            {searchError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{searchError}</span>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Search Results</Label>
              <div className="max-h-40 overflow-y-auto border rounded-lg">
                {searchResults.map((volunteer) => (
                  <div
                    key={volunteer.volunteer_id}
                    onClick={() => handleSelectVolunteer(volunteer)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">
                          {volunteer.first_name} {volunteer.last_name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {volunteer.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {volunteer.phone_number}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-gray-600">ID: {volunteer.volunteer_id}</p>
                        <p className="text-xs text-gray-500">{volunteer.total_hours_contributed}h</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteer ID Input */}
          <div className="space-y-2">
            <Label htmlFor="volunteer-id">Volunteer ID</Label>
            <Input
              id="volunteer-id"
              type="number"
              placeholder="Enter volunteer ID"
              value={volunteerId}
              onChange={(e) => setVolunteerId(e.target.value)}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{success}</span>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>• Search for volunteers by name, email, or phone number</p>
            <p>• Click on a search result to select the volunteer</p>
            <p>• Enter the volunteer's ID to generate enrollment instructions</p>
            <p>• The volunteer must enroll themselves through their dashboard</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleEnroll}
            disabled={isLoading || !volunteerId}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Info className="h-4 w-4 mr-2" />
                Share Event Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}