import { useState, useEffect } from 'react'
import { apiClient, Event } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Eye } from 'lucide-react'
import Map from '@/components/ui/map'

interface EventFormData {
  event_name: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  latitude: number;
  longitude: number;
  estimated_duration_hours: number;
  max_volunteers: number;
}

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<any>(null)
  const [formData, setFormData] = useState<EventFormData>({
    event_name: '',
    description: '',
    event_date: '',
    start_time: '',
    end_time: '',
    location_name: '',
    latitude: 0,
    longitude: 0,
    estimated_duration_hours: 0,
    max_volunteers: 0,
  })

  useEffect(() => {
    fetchEvents()
  }, [currentPage])

  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await apiClient.getAllEvents(currentPage, 10)
      setEvents(response.data)
      setPagination(response.pagination)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await apiClient.createEvent(formData)
      setIsCreateDialogOpen(false)
      resetForm()
      fetchEvents()
    } catch (error: any) {
      setError(error.message || 'Failed to create event')
    }
  }

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) return

    try {
      await apiClient.updateEvent(selectedEvent.event_id, formData)
      setIsEditDialogOpen(false)
      resetForm()
      fetchEvents()
    } catch (error: any) {
      setError(error.message || 'Failed to update event')
    }
  }

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await apiClient.deleteEvent(eventId)
      fetchEvents()
    } catch (error: any) {
      setError(error.message || 'Failed to delete event')
    }
  }

  const openEditDialog = (event: Event) => {
    setSelectedEvent(event)
    setFormData({
      event_name: event.event_name,
      description: event.description,
      event_date: event.event_date,
      start_time: event.start_time,
      end_time: event.end_time,
      location_name: event.location_name,
      latitude: event.latitude,
      longitude: event.longitude,
      estimated_duration_hours: event.estimated_duration_hours,
      max_volunteers: event.max_volunteers,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (event: Event) => {
    setSelectedEvent(event)
    setIsViewDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      event_name: '',
      description: '',
      event_date: '',
      start_time: '',
      end_time: '',
      location_name: '',
      latitude: 0,
      longitude: 0,
      estimated_duration_hours: 0,
      max_volunteers: 0,
    })
    setSelectedEvent(null)
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Events</h2>
          <p className="text-gray-600">Create and manage plogging events</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
              <DialogDescription>
                Fill in the details for the new plogging event.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="event_name">Event Name</Label>
                  <Input
                    id="event_name"
                    value={formData.event_name}
                    onChange={(e) => setFormData({...formData, event_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event_date">Event Date</Label>
                  <Input
                    id="event_date"
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_name">Location Name</Label>
                <Input
                  id="location_name"
                  value={formData.location_name}
                  onChange={(e) => setFormData({...formData, location_name: e.target.value})}
                  placeholder="Enter location name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Pick Location on Map</Label>
                <div className="text-sm text-gray-600 mb-2">
                  Click on the map to select the event location
                </div>
                <Map
                  height="300px"
                  isLocationPicker={true}
                  onLocationSelect={(lat, lng) => {
                    setFormData({
                      ...formData,
                      latitude: lat,
                      longitude: lng
                    });
                  }}
                  selectedLocation={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
                />
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                      placeholder="Latitude"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                      placeholder="Longitude"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_volunteers">Max Volunteers</Label>
                <Input
                  id="max_volunteers"
                  type="number"
                  value={formData.max_volunteers}
                  onChange={(e) => setFormData({...formData, max_volunteers: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_duration_hours">Duration (hours)</Label>
                <Input
                  id="estimated_duration_hours"
                  type="number"
                  step="0.5"
                  value={formData.estimated_duration_hours}
                  onChange={(e) => setFormData({...formData, estimated_duration_hours: parseFloat(e.target.value)})}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Event</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.event_id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{event.event_name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {event.description}
                  </CardDescription>
                </div>
                <Badge 
                  variant={event.status === 'Active' ? 'default' : 'secondary'}
                  className="ml-2"
                >
                  {event.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Date and Time */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(event.event_date)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatTime(event.start_time)} - {formatTime(event.end_time)}
                  </span>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.location_name}</span>
                  </div>
                  
                  {/* Small map showing event location */}
                  <div className="rounded-md overflow-hidden border h-24">
                    <Map
                      height="100%"
                      center={[event.latitude, event.longitude]}
                      zoom={13}
                      selectedLocation={[event.latitude, event.longitude]}
                      isLocationPicker={false}
                    />
                  </div>
                </div>

                {/* Duration and Capacity */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{event.estimated_duration_hours} hours</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Max {event.max_volunteers}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openViewDialog(event)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => openEditDialog(event)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteEvent(event.event_id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {/* Page Numbers */}
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
                  className={currentPage === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          {/* Pagination Info */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Showing {pagination.from} to {pagination.to} of {pagination.total} events
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update the event details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditEvent} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_event_name">Event Name</Label>
                <Input
                  id="edit_event_name"
                  value={formData.event_name}
                  onChange={(e) => setFormData({...formData, event_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_event_date">Event Date</Label>
                <Input
                  id="edit_event_date"
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_start_time">Start Time</Label>
                <Input
                  id="edit_start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_end_time">End Time</Label>
                <Input
                  id="edit_end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_location_name">Location Name</Label>
              <Input
                id="edit_location_name"
                value={formData.location_name}
                onChange={(e) => setFormData({...formData, location_name: e.target.value})}
                placeholder="Enter location name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Pick Location on Map</Label>
              <div className="text-sm text-gray-600 mb-2">
                Click on the map to select the event location
              </div>
              <Map
                height="300px"
                isLocationPicker={true}
                onLocationSelect={(lat, lng) => {
                  setFormData({
                    ...formData,
                    latitude: lat,
                    longitude: lng
                  });
                }}
                selectedLocation={formData.latitude && formData.longitude ? [formData.latitude, formData.longitude] : null}
              />
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-1">
                  <Label htmlFor="edit_latitude" className="text-sm">Latitude</Label>
                  <Input
                    id="edit_latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                    placeholder="Latitude"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="edit_longitude" className="text-sm">Longitude</Label>
                  <Input
                    id="edit_longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                    placeholder="Longitude"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_max_volunteers">Max Volunteers</Label>
              <Input
                id="edit_max_volunteers"
                type="number"
                value={formData.max_volunteers}
                onChange={(e) => setFormData({...formData, max_volunteers: parseInt(e.target.value)})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_estimated_duration_hours">Duration (hours)</Label>
              <Input
                id="edit_estimated_duration_hours"
                type="number"
                step="0.5"
                value={formData.estimated_duration_hours}
                onChange={(e) => setFormData({...formData, estimated_duration_hours: parseFloat(e.target.value)})}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              View detailed information about the event.
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.event_name}</h3>
                  <Badge 
                    variant={selectedEvent.status === 'Active' ? 'default' : 'secondary'}
                    className="mt-2"
                  >
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Date & Time</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(selectedEvent.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Duration & Capacity</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{selectedEvent.estimated_duration_hours} hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Max {selectedEvent.max_volunteers} volunteers</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedEvent.location_name}</span>
                  </div>
                  
                  {/* Map showing event location */}
                  <div className="rounded-lg overflow-hidden border">
                    <Map
                      height="250px"
                      center={[selectedEvent.latitude, selectedEvent.longitude]}
                      zoom={15}
                      selectedLocation={[selectedEvent.latitude, selectedEvent.longitude]}
                      isLocationPicker={false}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-medium">Latitude:</span> {selectedEvent.latitude}
                    </div>
                    <div>
                      <span className="font-medium">Longitude:</span> {selectedEvent.longitude}
                    </div>
                  </div>
                </div>
              </div>

              {/* Event ID */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Event Information</h4>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Event ID:</span> {selectedEvent.event_id}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            {selectedEvent && (
              <Button 
                onClick={() => {
                  setIsViewDialogOpen(false)
                  openEditDialog(selectedEvent)
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 