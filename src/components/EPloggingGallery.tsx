import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  MapPin, 
  Calendar,
  Search,
  Share2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2
} from 'lucide-react'
import { apiClient, EPloggingPost } from '@/lib/api'
import { SocialSharing } from '@/lib/social-sharing'
import { useAuth } from '@/contexts/AuthContext'

interface EPloggingGalleryProps {
  showMyPosts?: boolean
  isPublic?: boolean
  className?: string
}

type EPPost = EPloggingPost & { hours_spent?: number }

export default function EPloggingGallery({ showMyPosts = false, isPublic = false, className }: EPloggingGalleryProps) {
  const { isAuthenticated } = useAuth()
  const [posts, setPosts] = useState<EPPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  // Edit modal state
  const [editingPost, setEditingPost] = useState<EPloggingPost | null>(null)
  const [editQuote, setEditQuote] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editImage, setEditImage] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)

  // Delete action handler
  const handleDeletePost = async (postId: number) => {
    try {
      await apiClient.deleteEPloggingPost(postId)
      setPosts(prev => prev.filter(p => p.post_id !== postId))
      toast({ 
        title: 'Post Deleted Successfully', 
        description: 'Your ePlogging post has been permanently deleted.',
        variant: 'success'
      })
    } catch (error: any) {
      toast({ title: 'Delete failed', description: error.message || 'Could not delete post.', variant: 'destructive' })
    }
  }

  useEffect(() => {
    // Reset to first page when switching between my posts and gallery
    setCurrentPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMyPosts])

  useEffect(() => {
    fetchPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, showMyPosts, isPublic])

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = isPublic
        ? await apiClient.getPublicEPloggingPosts(currentPage, 15, undefined) 
        : showMyPosts 
          ? await apiClient.getMyEPloggingPosts(currentPage, 22)
          : await apiClient.getEPloggingPosts(currentPage, 22)
      console.log("ePlogging posts response:", response)
      
      // Handle both paginated and non-paginated responses
      let postsData: EPPost[] = []
      let lastPage = 1
      
      if (Array.isArray(response.data)) {
        // Non-paginated response
        postsData = response.data
        lastPage = 1
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Paginated response with nested data structure
        postsData = response.data.data
        lastPage = response.data.last_page || 
                   (response.data.total && response.data.per_page 
                     ? Math.ceil(response.data.total / response.data.per_page) 
                     : 1)
      } else if (response.data) {
        // Try to extract posts and pagination from response.data
        postsData = response.data.data || response.data.posts || (Array.isArray(response.data) ? response.data : [])
        lastPage = response.data.last_page || 
                   response.pagination?.last_page ||
                   (response.data.total && response.data.per_page 
                     ? Math.ceil(response.data.total / response.data.per_page) 
                     : 1)
      }
      
      setPosts(postsData)
      setTotalPages(lastPage)
      
      console.log("Extracted pagination info:", { postsCount: postsData.length, totalPages: lastPage, currentPage })
    } catch (error: any) {
      console.error("Error fetching ePlogging posts:", error)
      setError(error.message || "Failed to load posts")
    } finally {
      setIsLoading(false)
    }
  }


  const handleShare = async (post: EPPost) => {
    try {
      const shareData = {
        text: `Check out this ePlogging post: "${post.quote}"`,
        url: `${window.location.origin}/eplogging/${post.post_id}`
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await SocialSharing.copyToClipboard({
          volunteerName: `${post.volunteer.first_name} ${post.volunteer.last_name}`,
          totalHours: post.hours_spent ?? 0,
          volunteerId: post.volunteer.volunteer_id,
          achievementDate: post.created_at,
          badgeId: `EPLOGGING-${post.post_id}`
        })
        toast({
          title: "Link Copied",
          description: "Post link has been copied to clipboard.",
        })
      }
    } catch (error) {
      console.error('Error sharing post:', error)
      // Fallback: try to copy URL directly
      try {
        const shareUrl = `${window.location.origin}/eplogging/${post.post_id}`
        await navigator.clipboard.writeText(shareUrl)
        toast({
          title: "Link Copied",
          description: "Post link has been copied to clipboard.",
        })
      } catch (clipboardError) {
        toast({
          title: "Share Failed",
          description: "Could not copy link. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const openEdit = (post: EPPost) => {
    setEditingPost(post)
    setEditQuote(post.quote || '')
    setEditLocation(post.location || '')
    setEditImage(null)
    setEditPreview('')
  }

  const onEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image.', variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 5MB.', variant: 'destructive' })
      return
    }
    setEditImage(file)
    const reader = new FileReader()
    reader.onload = (ev) => setEditPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSaveEdit = async () => {
    if (!editingPost) return
    if (!editQuote.trim() || !editLocation.trim()) {
      toast({ title: 'Required fields', description: 'Quote and location are required.', variant: 'destructive' })
      return
    }
    try {
      setIsSaving(true)
      const payload: any = { quote: editQuote, location: editLocation }
      if (editImage) payload.image = editImage
      const res = await apiClient.updateEPloggingPost(editingPost.post_id, payload)
      setPosts(prev => prev.map(p => 
        p.post_id === editingPost.post_id 
          ? { ...p, quote: res.data?.quote ?? editQuote, location: res.data?.location ?? editLocation, image_url: res.data?.image_url ?? p.image_url, image_path: res.data?.image_path ?? p.image_path } 
          : p
      ))
      toast({ 
        title: 'Post Updated Successfully', 
        description: 'Your ePlogging post has been saved with the new changes.',
        variant: 'success'
      })
      setEditingPost(null)
    } catch (error: any) {
      toast({ title: 'Update failed', description: error.message || 'Could not update post.', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  // Only filter posts when not showing my posts and not public (gallery view with search)
  const filteredPosts = showMyPosts || isPublic
    ? posts
    : posts.filter(post => 
        post.quote.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.location.toLowerCase().includes(searchTerm.toLowerCase())
      )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getVolunteerName = (volunteer: EPPost['volunteer']) => {
    if (volunteer.first_name && volunteer.last_name) {
      return `${volunteer.first_name} ${volunteer.last_name}`
    }
    return volunteer.first_name || volunteer.last_name || 'Volunteer'
  }

  const getInitials = (volunteer: EPPost['volunteer']) => {
    const firstName = volunteer.first_name || ''
    const lastName = volunteer.last_name || ''
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase()
    }
    if (firstName) {
      return firstName[0].toUpperCase()
    }
    if (lastName) {
      return lastName[0].toUpperCase()
    }
    return 'V'
  }

  const getProfileImageUrl = (volunteer: EPPost['volunteer']) => {
    return volunteer.profile_image_url || volunteer.profile_image || null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to Load Posts</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchPosts} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Search */}
      {!isPublic && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {showMyPosts ? 'My ePlogging Posts' : 'ePlogging Gallery'}
            </h2>
            <p className="text-gray-600">
              {showMyPosts 
                ? 'Your submitted ePlogging posts' 
                : 'Community plogging activities from around the world'
              }
            </p>
          </div>
          
          {!showMyPosts && (
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {filteredPosts.length > 0 ? (
        <>
          <div className={`grid gap-6 ${isPublic ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredPosts.map((post) => (
              <Card key={post.post_id} className={`overflow-hidden hover:shadow-lg transition-shadow ${isPublic ? 'shadow-md' : ''}`}>
                {/* Facebook-like Header - Only show for public posts */}
                {isPublic && (
                  <CardContent className="p-4 pb-3 border-b">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {getProfileImageUrl(post.volunteer) ? (
                          <AvatarImage 
                            src={getProfileImageUrl(post.volunteer)!} 
                            alt={getVolunteerName(post.volunteer)}
                            className="object-cover"
                          />
                        ) : null}
                        <AvatarFallback className="bg-green-100 text-green-700 font-semibold">
                          {getInitials(post.volunteer)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm">
                          {getVolunteerName(post.volunteer)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(post.created_at)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}

                {/* Image */}
                <div className="relative">
                  <img
                    src={post.image_url || post.image_path}
                    className={`w-full ${isPublic ? 'h-64 object-cover bg-gray-50' : 'h-48 object-cover'}`}
                    alt={post.quote || 'ePlogging post'}
                  />
                  {!isPublic && (
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className={`p-4 ${isPublic ? 'pt-3' : ''}`}>
                  {/* Quote */}
                  <div className={`${isPublic ? 'mb-3' : 'mb-3'}`}>
                    <p className={`text-gray-800 ${isPublic ? 'text-base' : 'text-sm italic'} ${!isPublic ? 'p-2 bg-gray-50 rounded' : ''}`}>
                      {isPublic ? post.quote : `"${post.quote}"`}
                    </p>
                  </div>
                  
                  {/* Location and Date - Only show for non-public posts or show location for public */}
                  {!isPublic ? (
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      {post.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-32">{post.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                  ) : post.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{post.location}</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    {!showMyPosts && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(post)}
                          className="text-gray-500"
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                    {showMyPosts && !isPublic && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(post)}
                          className="h-8 px-2 text-gray-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this post?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your ePlogging post.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePost(post.post_id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination - Show for My Posts, Public posts, or gallery if multiple pages */}
          {filteredPosts.length > 0 && (showMyPosts || isPublic || totalPages > 1 || currentPage > 1 || filteredPosts.length === 22) && (
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="group border-green-300 text-green-700 bg-white hover:bg-green-600 hover:text-white hover:border-green-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-green-700 disabled:hover:border-green-300 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 font-medium"
              >
                <ChevronLeft className="w-4 h-4 mr-1 transition-transform duration-300 group-hover:-translate-x-0.5" />
                Previous
              </Button>
              
              <span className="text-sm text-gray-600 font-medium px-3 py-1 bg-gray-50 rounded-md border border-gray-200">
                Page {currentPage} {totalPages > 1 && `of ${totalPages}`}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => {
                  if (totalPages > 1) {
                    return Math.min(prev + 1, totalPages)
                  }
                  // If we don't know total pages but have full page of results, try next page
                  return filteredPosts.length === 22 ? prev + 1 : prev
                })}
                disabled={totalPages > 1 ? currentPage === totalPages : (filteredPosts.length < 22 && currentPage === 1)}
                className="group border-green-300 text-green-700 bg-white hover:bg-green-600 hover:text-white hover:border-green-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-green-700 disabled:hover:border-green-300 transition-all duration-300 ease-in-out shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 font-medium"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {showMyPosts 
              ? 'No posts available'
              : isPublic
                ? 'No posts available'
                : (searchTerm ? 'No posts match your search' : 'No posts available')
            }
          </h3>
          <p className="text-gray-500">
            {showMyPosts
              ? 'You haven\'t created any ePlogging posts yet. Share your first post!'
              : isPublic
                ? 'Be the first to share your ePlogging experience!'
                : (searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Be the first to share your ePlogging experience!'
                  )
            }
          </p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit ePlogging Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-quote">Quote</Label>
              <Textarea id="edit-quote" value={editQuote} onChange={(e) => setEditQuote(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input id="edit-location" value={editLocation} onChange={(e) => setEditLocation(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Photo (optional)</Label>
              <Input id="edit-image" type="file" accept="image/*" onChange={onEditImageChange} />
              {(editPreview || editingPost?.image_url || editingPost?.image_path) && (
                <img
                  src={editPreview || editingPost?.image_url || editingPost?.image_path}
                  className="w-full h-48 object-cover rounded"
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
