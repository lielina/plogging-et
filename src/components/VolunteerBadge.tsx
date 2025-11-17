import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { 
  Download, 
  Share2, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Instagram, 
  Copy,
  RefreshCw,
  Award,
  Clock,
  User,
  Calendar
} from 'lucide-react'
import { VolunteerBadgeGenerator, VolunteerBadgeData, generateBadgeId } from '@/lib/badge-generator'
import { SocialSharing } from '@/lib/social-sharing'

interface VolunteerBadgeProps {
  volunteerData: {
    volunteer_id: number
    first_name: string
    last_name: string
    total_hours_contributed: number
    profile_image?: string
    profile_image_url?: string
  }
  onBadgeGenerated?: (badgeData: VolunteerBadgeData) => void
  hideSocialSharing?: boolean
  hideRegenerate?: boolean
  totalEvents?: number
  badgeName?: string
  totalDistance?: number
  hasBadges?: boolean
}

export default function VolunteerBadge({ volunteerData, onBadgeGenerated, hideSocialSharing = false, hideRegenerate = false, totalEvents, badgeName, totalDistance, hasBadges = false }: VolunteerBadgeProps) {
  const [badgeData, setBadgeData] = useState<VolunteerBadgeData | null>(null)
  const [badgeImageUrl, setBadgeImageUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const { toast } = useToast()

  const volunteerName = `${volunteerData.first_name} ${volunteerData.last_name}`

  useEffect(() => {
    // Only generate badge if user has badges (hasBadges prop)
    if (hasBadges) {
      generateBadge()
    } else {
      // Clear badge data if no badges (user hasn't earned badges)
      setBadgeData(null)
      setBadgeImageUrl('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volunteerData, totalEvents, badgeName, totalDistance, hasBadges])

  const generateBadge = async () => {
    // Don't generate badge if user has no badges
    if (!hasBadges) {
      setBadgeData(null)
      setBadgeImageUrl('')
      return
    }

    try {
      setIsGenerating(true)
      
      // Only include profile image URL if it exists and is not empty
      const profileImageUrl = volunteerData.profile_image_url || volunteerData.profile_image
      const validProfileImageUrl = profileImageUrl && profileImageUrl.trim() !== '' ? profileImageUrl : undefined
      
      const badgeData: VolunteerBadgeData = {
        volunteerName,
        totalHours: volunteerData.total_hours_contributed,
        profileImageUrl: validProfileImageUrl,
        volunteerId: volunteerData.volunteer_id,
        achievementDate: new Date().toISOString(),
        badgeId: generateBadgeId(),
        totalEvents: totalEvents,
        badgeName: badgeName,
        totalDistance: totalDistance
      }

      const generator = new VolunteerBadgeGenerator()
      const imageUrl = await generator.getBadgeDataURL(badgeData)
      
      setBadgeData(badgeData)
      setBadgeImageUrl(imageUrl)
      
      if (onBadgeGenerated) {
        onBadgeGenerated(badgeData)
      }
    } catch (error) {
      console.error('Error generating badge:', error)
      toast({
        title: "Generation Failed",
        description: "Failed to generate volunteer badge. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!badgeData) return

    try {
      const generator = new VolunteerBadgeGenerator()
      generator.downloadBadge(badgeData)
      
      toast({
        title: "Download Complete",
        description: "Your volunteer badge has been downloaded successfully.",
        variant: "success"
      })
    } catch (error) {
      console.error('Error downloading badge:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download badge. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleShare = async (platform: string) => {
    if (!badgeData) return

    try {
      setIsSharing(true)
      
      switch (platform) {
        case 'facebook':
          await SocialSharing.shareToFacebook(badgeData)
          break
        case 'twitter':
          await SocialSharing.shareToTwitter(badgeData)
          break
        case 'linkedin':
          await SocialSharing.shareToLinkedIn(badgeData)
          break
        case 'whatsapp':
          await SocialSharing.shareToWhatsApp(badgeData)
          break
        case 'telegram':
          await SocialSharing.shareToTelegram(badgeData)
          break
        case 'instagram':
          await SocialSharing.shareToInstagram(badgeData)
          break
        case 'native':
          await SocialSharing.shareViaNative(badgeData)
          break
        case 'copy':
          const success = await SocialSharing.copyToClipboard(badgeData)
          if (success) {
            toast({
              title: "Copied to Clipboard",
              description: "Badge information has been copied to your clipboard.",
            })
          } else {
            throw new Error('Failed to copy to clipboard')
          }
          break
        default:
          throw new Error('Unknown sharing platform')
      }

      if (platform !== 'copy' && platform !== 'instagram') {
        toast({
          title: "Share Opened",
          description: `Opening ${platform} share dialog...`,
        })
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error)
      toast({
        title: "Share Failed",
        description: `Failed to share to ${platform}. Please try again.`,
        variant: "destructive"
      })
    } finally {
      setIsSharing(false)
    }
  }

  // Only show badge card if volunteer has earned badges
  // Use hasBadges prop as the primary check - this comes from badges.length > 0
  // hasBadges is passed from parent: badges.length > 0
  if (!hasBadges) {
    return null
  }
  
  // Volunteer has earned a badge - show the badge card
  return (
    <div className="space-y-6" onClick={(e) => e.stopPropagation()}>
      {/* Badge Preview */}
      <Card className="border-green-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            {!hideRegenerate && (
              <Button
                onClick={generateBadge}
                disabled={isGenerating}
                variant="outline"
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Badge Display */}
          <div className="flex flex-col items-center space-y-4">
            {badgeImageUrl ? (
              <div className="relative">
                <img
                  src={badgeImageUrl}
                  alt={`${volunteerName}'s volunteer badge`}
                  className="w-64 h-64 object-contain rounded-lg shadow-lg"
                />
                {isGenerating && (
                  <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Generating badge...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Award className="w-12 h-12 mx-auto mb-2" />
                  <p className="text-sm">Badge will appear here</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!hideSocialSharing && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={!badgeData || isGenerating}
            className="w-full"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Badge
          </Button>

          {/* Share Button */}
          <Button
            onClick={() => handleShare('native')}
            disabled={!badgeData || isSharing}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share Badge
          </Button>
        </div>
      )}

      {/* Social Media Sharing */}
      {!hideSocialSharing && (
        <Card>
        <CardHeader>
          <CardTitle className="text-lg">Share on Social Media</CardTitle>
          <CardDescription>
            Share your volunteer achievement with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Button
              onClick={() => handleShare('facebook')}
              disabled={!badgeData || isSharing}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Facebook className="w-4 h-4 mr-2" />
              Facebook
            </Button>
            
            <Button
              onClick={() => handleShare('twitter')}
              disabled={!badgeData || isSharing}
              className="bg-sky-500 hover:bg-sky-600 text-white"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Twitter
            </Button>
            
            <Button
              onClick={() => handleShare('linkedin')}
              disabled={!badgeData || isSharing}
              className="bg-blue-700 hover:bg-blue-800 text-white"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              LinkedIn
            </Button>
            
            <Button
              onClick={() => handleShare('whatsapp')}
              disabled={!badgeData || isSharing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            
            <Button
              onClick={() => handleShare('telegram')}
              disabled={!badgeData || isSharing}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Telegram
            </Button>
            
            <Button
              onClick={() => handleShare('instagram')}
              disabled={!badgeData || isSharing}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Instagram className="w-4 h-4 mr-2" />
              Instagram
            </Button>
          </div>

          {/* Copy Link */}
          <div className="mt-4 pt-4 border-t">
            <Button
              onClick={() => handleShare('copy')}
              disabled={!badgeData || isSharing}
              variant="outline"
              className="w-full"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Share Link
            </Button>
          </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
}

