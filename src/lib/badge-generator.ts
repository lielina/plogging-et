import jsPDF from "jspdf"
import QRCode from 'qrcode'
import { FRONTEND_URL, Image_Base_URL } from './api'

export interface VolunteerBadgeData {
  volunteerName: string
  totalHours: number
  profileImageUrl?: string
  volunteerId: number
  achievementDate: string
  badgeId: string
  qrCode?: string
}

export class VolunteerBadgeGenerator {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  // Fixed badge design colors and dimensions
  private backgroundColor = "#ffffff"
  private primaryColor = "#16a34a"
  private secondaryColor = "#15803d"
  private accentColor = "#fbbf24"
  private size = { width: 320, height: 500 }

  constructor() {
    this.canvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d')!
    this.setupCanvas()
  }

  private setupCanvas() {
    this.canvas.width = this.size.width
    this.canvas.height = this.size.height
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'
  }

  private drawBackground() {
    const { width, height } = this.size

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height)

    // Draw white background with rounded corners
    this.ctx.fillStyle = this.backgroundColor
    this.ctx.beginPath()
    this.ctx.roundRect(0, 0, width, height, 12)
    this.ctx.fill()

    // Draw header bar
    this.drawHeaderBar(width, height)
    
    // Draw footer bar
    this.drawFooterBar(width, height)
  }

  private drawHeaderBar(width: number, height: number) {
    const headerHeight = 65
    const centerX = width / 2

    // Header bar using primary color
    this.ctx.fillStyle = this.primaryColor
    this.ctx.beginPath()
    this.ctx.roundRect(0, 0, width, headerHeight, 15)
    this.ctx.fill()

    // Left teardrop icon using accent color
    this.ctx.fillStyle = this.accentColor
    this.drawTeardrop(22, headerHeight /2, 50, 'down')

    // Center PE logo using secondary color
    this.ctx.fillStyle = this.secondaryColor
    this.ctx.beginPath()
    this.ctx.arc(centerX, headerHeight / 2, 18, 0, 2 * Math.PI)
    this.ctx.fill()
    
    // PE text in logo
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = 'bold 14px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText('PE', centerX, headerHeight / 2)

    // Right striped pattern circle using accent color
    this.drawStripedCircle(width - 30, headerHeight / 2, 14, this.accentColor, 0.25)

    // Organization name below header
    this.ctx.fillStyle = '#000000'
    this.ctx.font = '14px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText('Plogging Ethiopia', centerX, headerHeight + 8)
  }

  private drawFooterBar(width: number, height: number) {
    const footerHeight = 45

    // Draw footer bar using primary color
    this.ctx.fillStyle = this.primaryColor
    this.ctx.beginPath()
    this.ctx.roundRect(0, height - footerHeight, width, footerHeight, 15)
    this.ctx.fill()

    // Left watermark striped circle using accent color
    this.drawStripedCircle(28, height - footerHeight / 2, 14, this.accentColor, 0.25)

    // Right teardrop icon using accent color
    this.ctx.fillStyle = this.accentColor
    this.drawTeardrop(width - 22, height - footerHeight / 2, 50, 'up')
  }

  private drawTeardrop(x: number, y: number, size: number, direction: 'up' | 'down') {
    this.ctx.beginPath()
    if (direction === 'down') {
      this.ctx.moveTo(x, y - size / 2)
      this.ctx.quadraticCurveTo(x + size / 2, y, x, y + size / 2)
      this.ctx.quadraticCurveTo(x - size / 2, y, x, y - size / 2)
    } else {
      this.ctx.moveTo(x, y + size / 2)
      this.ctx.quadraticCurveTo(x - size / 2, y, x, y - size / 2)
      this.ctx.quadraticCurveTo(x + size / 2, y, x, y + size / 2)
    }
    this.ctx.closePath()
    this.ctx.fill()
  }

  private drawStripedCircle(x: number, y: number, r: number, color: string, alpha: number) {
    // Soft circle
    this.ctx.save()
    this.ctx.globalAlpha = alpha
    this.ctx.fillStyle = color
    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, 2 * Math.PI)
    this.ctx.fill()
    // Diagonal stripes
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 2
    for (let i = -r; i <= r; i += 4) {
      this.ctx.beginPath()
      this.ctx.moveTo(x - r + i, y - r)
      this.ctx.lineTo(x - r + i + r, y)
      this.ctx.stroke()
    }
    this.ctx.restore()
  }

  private drawStripedPattern(x: number, y: number, width: number, height: number) {
    this.ctx.strokeStyle = '#22c55e'
    this.ctx.lineWidth = 2
    
    for (let i = 0; i < 5; i++) {
      this.ctx.beginPath()
      this.ctx.moveTo(x - width / 2 + i * 4, y - height / 2)
      this.ctx.lineTo(x - width / 2 + i * 4 + 2, y + height / 2)
      this.ctx.stroke()
    }
  }

  private normalizeImageUrl(url: string): string {
    try {
      // Ensure we have a valid URL - return as-is if it's already a full URL
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url
      }
      // If it's a relative path starting with /uploads, construct full URL
      if (url.startsWith('/uploads') || url.startsWith('uploads')) {
        return `${Image_Base_URL}${url.startsWith('/') ? '' : '/'}${url}`
      }
      return url
    } catch {
      return url
    }
  }


  private async loadImageWithCORS(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'))
      }, 10000)

      img.onload = () => {
        clearTimeout(timeout)
        resolve(img)
      }
      
      img.onerror = async (error) => {
        clearTimeout(timeout)
        console.warn('Direct CORS load failed, trying authenticated fetch as blob:', url)
        
        // If CORS fails, try fetching through API with authentication
        // This creates a blob URL which should not have CORS restrictions
        try {
          const token = localStorage.getItem('token')
          
          // Try fetching with default mode first (browser will handle CORS)
          // If that fails due to CORS, the server needs proper CORS headers
          const fetchOptions: RequestInit = {
            method: 'GET',
            credentials: 'omit',
          }
          
          if (token) {
            fetchOptions.headers = {
              'Authorization': `Bearer ${token}`
            }
          }
          
          const response = await fetch(url, fetchOptions)
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          
          const blob = await response.blob()
          const blobUrl = URL.createObjectURL(blob)
          
          // Load the blob URL into a new image element
          // Blob URLs are same-origin so they won't taint the canvas
          const img2 = new Image()
          
          const blobTimeout = setTimeout(() => {
            URL.revokeObjectURL(blobUrl)
            reject(new Error('Blob image load timeout'))
          }, 10000)
          
          img2.onload = () => {
            clearTimeout(blobTimeout)
            console.log('Profile image loaded successfully via blob URL')
            URL.revokeObjectURL(blobUrl) // Clean up after loading
            resolve(img2)
          }
          
          img2.onerror = (blobError) => {
            clearTimeout(blobTimeout)
            URL.revokeObjectURL(blobUrl)
            console.warn('Failed to load blob URL, will use default avatar:', blobError)
            reject(blobError)
          }
          
          img2.src = blobUrl
        } catch (fetchError: any) {
          // CORS errors are expected if server doesn't support it
          // This is handled gracefully by falling back to default avatar
          if (fetchError.message && (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch'))) {
            console.warn('CORS or network error loading image, using default avatar:', url)
          } else {
            console.warn('Error fetching image, using default avatar:', fetchError.message || fetchError)
          }
          reject(fetchError)
        }
      }
      
      img.src = url
    })
  }

  private async drawProfileImage(data: VolunteerBadgeData, centerX: number, centerY: number, radius: number) {
    // Position profile image below organization name
    const profileImageY = 150// precise vertical position to match design
    const profileImageRadius = 50

    if (!data.profileImageUrl) {
      // Draw default avatar with initials
      this.drawDefaultAvatar(centerX, profileImageY, profileImageRadius, data.volunteerName)
      return
    }

    try {
      const imageUrl = this.normalizeImageUrl(data.profileImageUrl!)
      console.log('Loading profile image from URL:', imageUrl)
      
      // Load image with CORS handling
      const img = await this.loadImageWithCORS(imageUrl)
      console.log('Profile image loaded successfully')

      // White background circle
      this.ctx.fillStyle = '#ffffff'
      this.ctx.beginPath()
      this.ctx.arc(centerX, profileImageY, profileImageRadius, 0, 2 * Math.PI)
      this.ctx.fill()

      // Ring: outer using secondary color and inner subtle gray
      this.ctx.strokeStyle = this.secondaryColor
      this.ctx.lineWidth = 6
      this.ctx.beginPath()
      this.ctx.arc(centerX, profileImageY, profileImageRadius, 0, 2 * Math.PI)
      this.ctx.stroke()
      this.ctx.strokeStyle = '#e5e7eb'
      this.ctx.lineWidth = 6
      this.ctx.beginPath()
      this.ctx.arc(centerX, profileImageY, profileImageRadius - 8, 0, 2 * Math.PI)
      this.ctx.stroke()

      // Create circular clipping path
      this.ctx.save()
      this.ctx.beginPath()
      this.ctx.arc(centerX, profileImageY, profileImageRadius - 10, 0, 2 * Math.PI)
      this.ctx.clip()

      // Draw image
      const imgSize = (profileImageRadius - 10) * 2
      this.ctx.drawImage(img, centerX - imgSize / 2, profileImageY - imgSize / 2, imgSize, imgSize)
      this.ctx.restore()
    } catch (error: any) {
      // Error is expected when CORS is not properly configured on server
      // We gracefully fall back to default avatar with initials
      if (error?.message?.includes('CORS') || error?.message?.includes('Failed to fetch')) {
        console.debug('Profile image unavailable (CORS), using default avatar')
      } else {
        console.warn('Error loading profile image, using default avatar:', error?.message || error)
      }
      this.drawDefaultAvatar(centerX, profileImageY, profileImageRadius, data.volunteerName)
    }
  }

  private drawDefaultAvatar(centerX: number, centerY: number, radius: number, volunteerName?: string) {
    // Draw white background circle
    this.ctx.fillStyle = 'white'
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    this.ctx.fill()

    // Thick border using secondary color
    this.ctx.strokeStyle = this.secondaryColor
    this.ctx.lineWidth = 6
    this.ctx.beginPath()
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    this.ctx.stroke()

    // Draw initials if volunteer name is provided
    if (volunteerName) {
      const initials = this.getInitials(volunteerName)
      this.ctx.fillStyle = this.secondaryColor
      this.ctx.font = `bold ${radius * 0.55}px Arial`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      // Add slight rotation to match the design
      this.ctx.save()
      this.ctx.translate(centerX, centerY)
      this.ctx.rotate(0.15) // Slight rotation to the right
      this.ctx.fillText(initials, 0, 0)
      this.ctx.restore()
    } else {
      // Draw user icon as fallback
      this.ctx.fillStyle = this.secondaryColor
      this.ctx.font = `${radius * 0.55}px Arial`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText('👤', centerX, centerY)
    }
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2)
  }

  private drawBadgeContent(data: VolunteerBadgeData, centerX: number, centerY: number, radius: number) {
    const { width, height } = this.size

    // Position elements relative to profile image (must match drawProfileImage)
    const profileImageY = 150
    const profileImageRadius = 50

    // Draw volunteer name below profile image using secondary color
    this.ctx.fillStyle = this.secondaryColor
    this.ctx.font = 'bold 18px Arial py-10'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    
    const nameY = profileImageY + profileImageRadius + 45
    this.ctx.fillText(data.volunteerName.toUpperCase(), centerX, nameY)

    // Draw volunteer role
    this.ctx.fillStyle = '#666666'
    this.ctx.font = 'italic 16px Arial'
    this.ctx.fillText('Volunteer', centerX, nameY + 25)
  }

  private wrapText(text: string, x: number, y: number, maxWidth: number, fontSize: number) {
    const words = text.split(' ')
    let line = ''
    let lineY = y

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' '
      const metrics = this.ctx.measureText(testLine)
      const testWidth = metrics.width

      if (testWidth > maxWidth && n > 0) {
        this.ctx.fillText(line, x, lineY)
        line = words[n] + ' '
        lineY += fontSize + 5
      } else {
        line = testLine
      }
    }
    this.ctx.fillText(line, x, lineY)
  }

  private async drawQRCode(data: VolunteerBadgeData, centerX: number, centerY: number, radius: number) {
    try {
      // Generate QR code data URL
      const qrData = `${FRONTEND_URL}/badge/${data.badgeId}`
      const qrDataURL = await QRCode.toDataURL(qrData, {
        width: 60,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })

      // Draw QR code below volunteer information inside white rounded container
      const qrSize = 100
      const padding = 10
      const containerW = qrSize + padding * 2
      const containerH = qrSize + padding * 2
      const qrY = 395// Fixed position above footer
      const containerX = centerX - containerW / 2
      const containerY = qrY - containerH / 2

      // Container
      this.ctx.save()
      this.ctx.shadowColor = 'rgba(0,0,0,0.15)'
      this.ctx.shadowBlur = 6
      this.ctx.fillStyle = '#ffffff'
      this.ctx.strokeStyle = '#e5e7eb'
      this.ctx.lineWidth = 3
      this.ctx.beginPath()
      this.ctx.roundRect(containerX, containerY, containerW, containerH, 10)
      this.ctx.fill()
      this.ctx.stroke()
      this.ctx.restore()
      
      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = qrDataURL
      })

      this.ctx.drawImage(img, centerX - qrSize / 2, qrY - qrSize / 2, qrSize, qrSize)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }


  public async generateBadge(data: VolunteerBadgeData): Promise<HTMLCanvasElement> {
    this.setupCanvas()
    
    const { width, height } = this.size
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 2 - 20

    // Draw all badge elements
    this.drawBackground()
    await this.drawProfileImage(data, centerX, centerY, radius)
    this.drawBadgeContent(data, centerX, centerY, radius)
    await this.drawQRCode(data, centerX, centerY, radius)

    return this.canvas
  }

  public async getBadgeBlob(data: VolunteerBadgeData): Promise<Blob> {
    const canvas = await this.generateBadge(data)
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!)
      }, 'image/png', 1.0)
    })
  }

  public async getBadgeDataURL(data: VolunteerBadgeData): Promise<string> {
    const canvas = await this.generateBadge(data)
    return canvas.toDataURL('image/png', 1.0)
  }

  public downloadBadge(data: VolunteerBadgeData, filename?: string): void {
    this.generateBadge(data).then(canvas => {
      const link = document.createElement('a')
      link.download = filename || `badge-${data.volunteerName.replace(/\s+/g, '-')}.png`
      link.href = canvas.toDataURL()
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }
}

export function generateBadgeId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `BADGE-${timestamp}-${randomStr}`.toUpperCase()
}

export function formatBadgeDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
