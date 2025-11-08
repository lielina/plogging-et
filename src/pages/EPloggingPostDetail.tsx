import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { apiClient, EPloggingPost } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar,
  Share2,
  Heart
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'

type EPPost = EPloggingPost & { hours_spent?: number }

export default function EPloggingPostDetail() {
  const { postId } = useParams<{ postId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { isAuthenticated } = useAuth()
  const [post, setPost] = useState<EPPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return
      
      try {
        setIsLoading(true)
        setError(null)
        
        // Try to get the post - use volunteer endpoint (works for public too)
        const response = await apiClient.getEPloggingPost(parseInt(postId))
        
        // Handle different response structures
        let postData: EPPost | null = null
        if (response.data) {
          postData = response.data
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          postData = response.data[0]
        } else if (response) {
          postData = response as EPPost
        }
        
        if (postData) {
          setPost(postData)
          // Initialize likes count (could come from API in the future)
          setLikes(0)
        } else {
          setError('Post not found')
        }
      } catch (err: any) {
        console.error('Error fetching ePlogging post:', err)
        // Check if it's an authentication error
        if (err.status === 401 || err.status === 403) {
          setError('This post is not publicly available. Please log in to view it.')
        } else {
          setError(err.message || 'Failed to load post')
        }
        toast({
          title: "Error",
          description: err.status === 401 || err.status === 403 
            ? "This post requires authentication. Please log in to view it."
            : "Failed to load post. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [postId, toast, isAuthenticated])

  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => Math.max(prev - 1, 0))
      setIsLiked(false)
    } else {
      setLikes(prev => prev + 1)
      setIsLiked(true)
    }
  }

  const handleShare = async () => {
    try {
      const shareData = {
        text: `Check out this ePlogging post: "${post?.quote}"`,
        url: window.location.href
      }

      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link Copied",
          description: "Post link has been copied to clipboard.",
        })
      }
    } catch (error) {
      console.error('Error sharing post:', error)
    }
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading post...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowLeft className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Post Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The post you are looking for does not exist.'}</p>
            <Button onClick={() => navigate('/eplogging')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to ePlogging
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/eplogging')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to ePlogging
      </Button>

      {/* Post Card */}
      <Card className="overflow-hidden">
        {/* Header */}
        <CardContent className="p-4 sm:p-6 border-b">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
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
              <div className="font-semibold text-gray-900">
                {getVolunteerName(post.volunteer)}
              </div>
              <div className="text-sm text-gray-500">
                {formatDateTime(post.created_at)}
              </div>
            </div>
          </div>
        </CardContent>

        {/* Image */}
        <div className="relative w-full bg-gray-50">
          <img
            src={post.image_url || post.image_path}
            className="w-full h-auto object-contain"
            style={{ maxHeight: '600px', maxWidth: '100%', display: 'block' }}
            alt={post.quote || 'ePlogging post'}
          />
        </div>

        {/* Content */}
        <CardContent className="p-4 sm:p-6">
          {/* Quote - Full text */}
          <div className="mb-4">
            <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
              {post.quote}
            </p>
          </div>
          
          {/* Location */}
          {post.location && (
            <div className="flex items-center gap-2 text-gray-600 mb-6">
              <MapPin className="w-5 h-5" />
              <span className="text-base">{post.location}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className={`transition-colors ${
                isLiked 
                  ? 'text-red-500 hover:text-red-600' 
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart 
                className={`w-5 h-5 mr-2 ${
                  isLiked ? 'fill-current' : ''
                }`} 
              />
              <span className="font-medium">{likes}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-500 hover:text-gray-700"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

