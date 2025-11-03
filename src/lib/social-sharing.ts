import { VolunteerBadgeData } from './badge-generator'

export interface ShareOptions {
  title?: string
  text?: string
  url?: string
  hashtags?: string[]
}

export class SocialSharing {
  private static readonly BASE_URL = 'https://plogging-ethiopia.vercel.app'
  private static readonly DEFAULT_HASHTAGS = ['PloggingEthiopia', 'EnvironmentalAction', 'CommunityService', 'VolunteerBadge']

  static generateShareText(data: VolunteerBadgeData): string {
    return `I'm proud to be a volunteer with ${data.totalHours} hours of community service! 🌱 Join me in making a difference with Plogging Ethiopia. #PloggingEthiopia #EnvironmentalAction #CommunityService`
  }

  static generateShareUrl(badgeId: string): string {
    return `${this.BASE_URL}/badge/${badgeId}`
  }

  static async shareToFacebook(data: VolunteerBadgeData, options: ShareOptions = {}): Promise<void> {
    const shareUrl = options.url || this.generateShareUrl(data.badgeId)
    const shareText = options.text || this.generateShareText(data)
    const hashtags = options.hashtags || this.DEFAULT_HASHTAGS

    const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php')
    facebookUrl.searchParams.set('u', shareUrl)
    facebookUrl.searchParams.set('quote', shareText)
    facebookUrl.searchParams.set('hashtag', hashtags.join(','))
    
    this.openShareWindow(facebookUrl.toString(), 'Facebook Share')
  }

  static async shareToTwitter(data: VolunteerBadgeData, options: ShareOptions = {}): Promise<void> {
    const shareUrl = options.url || this.generateShareUrl(data.badgeId)
    const shareText = options.text || this.generateShareText(data)
    const hashtags = options.hashtags || this.DEFAULT_HASHTAGS

    const twitterUrl = new URL('https://twitter.com/intent/tweet')
    twitterUrl.searchParams.set('text', `${shareText} ${shareUrl}`)
    twitterUrl.searchParams.set('hashtags', hashtags.join(','))
    
    this.openShareWindow(twitterUrl.toString(), 'Twitter Share')
  }

  static async shareToLinkedIn(data: VolunteerBadgeData, options: ShareOptions = {}): Promise<void> {
    const shareUrl = options.url || this.generateShareUrl(data.badgeId)
    const shareText = options.text || this.generateShareText(data)

    const linkedinUrl = new URL('https://www.linkedin.com/sharing/share-offsite/')
    linkedinUrl.searchParams.set('url', shareUrl)
    linkedinUrl.searchParams.set('title', options.title || `${data.volunteerName}'s Volunteer Badge`)
    linkedinUrl.searchParams.set('summary', shareText)
    
    this.openShareWindow(linkedinUrl.toString(), 'LinkedIn Share')
  }

  static async shareToWhatsApp(data: VolunteerBadgeData, options: ShareOptions = {}): Promise<void> {
    const shareUrl = options.url || this.generateShareUrl(data.badgeId)
    const shareText = options.text || this.generateShareText(data)

    const whatsappUrl = new URL('https://wa.me/')
    whatsappUrl.searchParams.set('text', `${shareText} ${shareUrl}`)
    
    this.openShareWindow(whatsappUrl.toString(), 'WhatsApp Share')
  }

  static async shareToTelegram(data: VolunteerBadgeData, options: ShareOptions = {}): Promise<void> {
    const shareUrl = options.url || this.generateShareUrl(data.badgeId)
    const shareText = options.text || this.generateShareText(data)

    const telegramUrl = new URL('https://t.me/share/url')
    telegramUrl.searchParams.set('url', shareUrl)
    telegramUrl.searchParams.set('text', shareText)
    
    this.openShareWindow(telegramUrl.toString(), 'Telegram Share')
  }

  static async shareToInstagram(data: VolunteerBadgeData, options: ShareOptions = {}): Promise<void> {
    // Instagram doesn't support direct URL sharing, so we'll copy text to clipboard
    const shareText = options.text || this.generateShareText(data)
    const shareUrl = options.url || this.generateShareUrl(data.badgeId)
    
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      
      // Show a message to the user
      const message = document.createElement('div')
      message.textContent = 'Share text copied to clipboard! You can now paste it in your Instagram story or post.'
      message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #25D366;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      `
      document.body.appendChild(message)
      
      setTimeout(() => {
        document.body.removeChild(message)
      }, 3000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      throw new Error('Failed to copy share text to clipboard')
    }
  }

  static async copyToClipboard(data: VolunteerBadgeData, options: ShareOptions = {}): Promise<boolean> {
    try {
      const shareText = options.text || this.generateShareText(data)
      const shareUrl = options.url || this.generateShareUrl(data.badgeId)
      
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      return false
    }
  }

  static async shareViaNative(data: VolunteerBadgeData, options: ShareOptions = {}): Promise<void> {
    if (!navigator.share) {
      throw new Error('Native sharing is not supported on this device')
    }

    const shareData = {
      title: options.title || `${data.volunteerName}'s Volunteer Badge`,
      text: options.text || this.generateShareText(data),
      url: options.url || this.generateShareUrl(data.badgeId)
    }

    try {
      await navigator.share(shareData)
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error)
        throw error
      }
    }
  }

  private static openShareWindow(url: string, title: string): void {
    const width = 600
    const height = 400
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    const shareWindow = window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    )

    if (!shareWindow) {
      throw new Error('Failed to open share window. Please check your popup blocker settings.')
    }
  }

}
