import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { User, Plus, AlertCircle, CheckCircle, Search, Mail, Phone } from 'lucide-react'
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
      
      await onEnroll(id)
      setSuccess(`Volunteer ${id} enrolled successfully!`)
      
      // Clear form and close after success
      setTimeout(() => {
        setVolunteerId('')
        setSuccess('')
        onClose()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to enroll volunteer')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    try {
      setIsSearching(true)
      setSearchError('')
      
      const response = await apiClient.getAllVolunteers(1, 15, query)
      setSearchResults(response.data)
    } catch (err: any) {
      setSearchError(err.message || 'Failed to search volunteers')
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
          {/* Search Section */}
          <div className="space-y-2">
            <Label htmlFor="search-volunteer">Search Volunteers</Label>
            <Input
              id="search-volunteer"
              placeholder="Search by name or email..."
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



          {/* Search Error Message */}
          {searchError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{searchError}</span>
            </div>
          )}

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
            <p>• Search for volunteers by name or email</p>
            <p>• Click on a search result to select the volunteer</p>
            <p>• The volunteer will be enrolled in this event</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
                      <Button onClick={handleEnroll} disabled={isLoading || !volunteerId}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enrolling...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Enroll Volunteer
                </>
              )}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 