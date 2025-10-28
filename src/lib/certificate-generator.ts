import jsPDF from "jspdf"
import { FRONTEND_URL } from './api'

export interface CertificateData {
  volunteerName: string
  eventName: string
  eventDate: string
  hoursContributed: number
  location: string
  organizerName: string
  certificateId: string
  issueDate: string
  badgeType?: string
  totalHours?: number
  rank?: number
}

export interface CertificateTemplate {
  id: string
  name: string
  type: "participation" | "achievement" | "leadership" | "milestone"
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  logoPosition: { x: number; y: number }
  titlePosition: { x: number; y: number }
  contentLayout: "standard" | "modern" | "elegant"
}

export const defaultTemplates: CertificateTemplate[] = [
  {
    id: "standard-participation",
    name: "Standard Participation",
    type: "participation",
    backgroundColor: "#f0fdf4",
    primaryColor: "#16a34a",
    secondaryColor: "#15803d",
    logoPosition: { x: 105, y: 20 },
    titlePosition: { x: 105, y: 60 },
    contentLayout: "standard",
  },
  {
    id: "achievement-badge",
    name: "Achievement Badge",
    type: "achievement",
    backgroundColor: "#fef3c7",
    primaryColor: "#d97706",
    secondaryColor: "#92400e",
    logoPosition: { x: 105, y: 20 },
    titlePosition: { x: 105, y: 60 },
    contentLayout: "modern",
  },
  {
    id: "leadership-recognition",
    name: "Leadership Recognition",
    type: "leadership",
    backgroundColor: "#ede9fe",
    primaryColor: "#7c3aed",
    secondaryColor: "#5b21b6",
    logoPosition: { x: 105, y: 20 },
    titlePosition: { x: 105, y: 60 },
    contentLayout: "elegant",
  },
  {
    id: "milestone-celebration",
    name: "Milestone Celebration",
    type: "milestone",
    backgroundColor: "#ecfdf5",
    primaryColor: "#059669",
    secondaryColor: "#047857",
    logoPosition: { x: 105, y: 20 },
    titlePosition: { x: 105, y: 60 },
    contentLayout: "modern",
  },
  {
    id: "premium-gold",
    name: "Premium Gold",
    type: "achievement",
    backgroundColor: "#fefce8",
    primaryColor: "#ca8a04",
    secondaryColor: "#a16207",
    logoPosition: { x: 105, y: 20 },
    titlePosition: { x: 105, y: 60 },
    contentLayout: "elegant",
  },
  {
    id: "nature-inspired",
    name: "Nature Inspired",
    type: "participation",
    backgroundColor: "#f0f9ff",
    primaryColor: "#0ea5e9",
    secondaryColor: "#0284c7",
    logoPosition: { x: 105, y: 20 },
    titlePosition: { x: 105, y: 60 },
    contentLayout: "modern",
  },
  {
    id: "classic-elegant",
    name: "Classic Elegant",
    type: "leadership",
    backgroundColor: "#fafafa",
    primaryColor: "#374151",
    secondaryColor: "#1f2937",
    logoPosition: { x: 105, y: 20 },
    titlePosition: { x: 105, y: 60 },
    contentLayout: "elegant",
  },
  {
    id: "vibrant-community",
    name: "Vibrant Community",
    type: "milestone",
    backgroundColor: "#fdf2f8",
    primaryColor: "#ec4899",
    secondaryColor: "#be185d",
    logoPosition: { x: 105, y: 20 },
    titlePosition: { x: 105, y: 60 },
    contentLayout: "modern",
  },
]

export class CertificateGenerator {
  private pdf: jsPDF
  private template: CertificateTemplate

  constructor(template: CertificateTemplate = defaultTemplates[0]) {
    this.pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    })
    this.template = template
  }

  private drawBackground() {
    // Set background color with gradient effect
    this.pdf.setFillColor(this.template.backgroundColor)
    this.pdf.rect(0, 0, 297, 210, "F")

    // Add gradient overlay
    this.pdf.setFillColor(255, 255, 255, 0.1)
    this.pdf.rect(0, 0, 297, 210, "F")

    // Add decorative border with enhanced design
    this.pdf.setDrawColor(this.template.primaryColor)
    this.pdf.setLineWidth(3)
    this.pdf.rect(10, 10, 277, 190)

    // Add inner decorative elements with pattern
    this.pdf.setDrawColor(this.template.secondaryColor)
    this.pdf.setLineWidth(0.5)
    this.pdf.rect(15, 15, 267, 180)

    // Add decorative pattern elements
    this.drawDecorativePattern()

    // Add corner decorations
    this.drawCornerDecorations()
  }

  private drawDecorativePattern() {
    // Draw sophisticated pattern elements based on template type
    this.pdf.setDrawColor(this.template.secondaryColor)
    this.pdf.setLineWidth(0.3)

    switch (this.template.id) {
      case "premium-gold":
        this.drawPremiumGoldPattern()
        break
      case "nature-inspired":
        this.drawNaturePattern()
        break
      case "classic-elegant":
        this.drawClassicPattern()
        break
      case "vibrant-community":
        this.drawVibrantPattern()
        break
      default:
        this.drawStandardPattern()
    }
  }

  private drawStandardPattern() {
    // Top pattern
    for (let i = 0; i < 8; i++) {
      const x = 25 + (i * 35)
      this.pdf.line(x, 20, x + 15, 20)
      this.pdf.line(x + 7.5, 20, x + 7.5, 25)
    }

    // Bottom pattern
    for (let i = 0; i < 8; i++) {
      const x = 25 + (i * 35)
      this.pdf.line(x, 190, x + 15, 190)
      this.pdf.line(x + 7.5, 190, x + 7.5, 185)
    }

    // Left pattern
    for (let i = 0; i < 6; i++) {
      const y = 35 + (i * 25)
      this.pdf.line(20, y, 20, y + 15)
      this.pdf.line(20, y + 7.5, 25, y + 7.5)
    }

    // Right pattern
    for (let i = 0; i < 6; i++) {
      const y = 35 + (i * 25)
      this.pdf.line(277, y, 277, y + 15)
      this.pdf.line(277, y + 7.5, 272, y + 7.5)
    }
  }

  private drawPremiumGoldPattern() {
    // Elegant gold pattern with stars and circles
    this.pdf.setFillColor(this.template.secondaryColor)

    // Top decorative elements
    for (let i = 0; i < 10; i++) {
      const x = 20 + (i * 28)
      this.pdf.circle(x, 18, 2, "F")
      this.pdf.text("★", x - 1, 20)
    }

    // Bottom decorative elements
    for (let i = 0; i < 10; i++) {
      const x = 20 + (i * 28)
      this.pdf.circle(x, 192, 2, "F")
      this.pdf.text("★", x - 1, 194)
    }

    // Side decorative elements
    for (let i = 0; i < 8; i++) {
      const y = 30 + (i * 20)
      this.pdf.circle(18, y, 2, "F")
      this.pdf.circle(279, y, 2, "F")
    }
  }

  private drawNaturePattern() {
    // Nature-inspired pattern with leaves and waves
    this.pdf.setFillColor(this.template.secondaryColor)

    // Top wave pattern
    for (let i = 0; i < 12; i++) {
      const x = 20 + (i * 23)
      this.pdf.text("🌿", x, 20)
      this.pdf.text("🍃", x + 11, 22)
    }

    // Bottom wave pattern
    for (let i = 0; i < 12; i++) {
      const x = 20 + (i * 23)
      this.pdf.text("🍃", x, 190)
      this.pdf.text("🌿", x + 11, 192)
    }

    // Side nature elements
    for (let i = 0; i < 6; i++) {
      const y = 35 + (i * 25)
      this.pdf.text("🌸", 15, y)
      this.pdf.text("🌱", 282, y)
    }
  }

  private drawClassicPattern() {
    // Classic elegant pattern with geometric shapes
    this.pdf.setDrawColor(this.template.secondaryColor)
    this.pdf.setLineWidth(0.5)

    // Top geometric pattern
    for (let i = 0; i < 8; i++) {
      const x = 25 + (i * 35)
      this.pdf.line(x, 20, x + 10, 20)
      this.pdf.line(x + 5, 20, x + 5, 25)
      this.pdf.circle(x + 5, 27, 2, "F")
    }

    // Bottom geometric pattern
    for (let i = 0; i < 8; i++) {
      const x = 25 + (i * 35)
      this.pdf.line(x, 190, x + 10, 190)
      this.pdf.line(x + 5, 190, x + 5, 185)
      this.pdf.circle(x + 5, 183, 2, "F")
    }
  }

  private drawVibrantPattern() {
    // Vibrant community pattern with hearts and stars
    this.pdf.setFillColor(this.template.secondaryColor)

    // Top vibrant elements
    for (let i = 0; i < 10; i++) {
      const x = 20 + (i * 28)
      this.pdf.text("❤️", x, 20)
      this.pdf.text("⭐", x + 14, 22)
    }

    // Bottom vibrant elements
    for (let i = 0; i < 10; i++) {
      const x = 20 + (i * 28)
      this.pdf.text("⭐", x, 190)
      this.pdf.text("❤️", x + 14, 192)
    }

    // Side community elements
    for (let i = 0; i < 6; i++) {
      const y = 35 + (i * 25)
      this.pdf.text("🤝", 15, y)
      this.pdf.text("🌟", 282, y)
    }
  }

  private drawCornerDecorations() {
    const cornerSize = 18
    this.pdf.setFillColor(this.template.primaryColor)

    // Enhanced corner decorations with multiple elements
    const corners = [
      { x: 25, y: 25 },    // Top-left
      { x: 272, y: 25 },   // Top-right
      { x: 25, y: 185 },   // Bottom-left
      { x: 272, y: 185 }   // Bottom-right
    ]

    corners.forEach(corner => {
      // Main corner circle
      this.pdf.circle(corner.x, corner.y, cornerSize, "F")

      // Inner decorative circle
      this.pdf.setFillColor(255, 255, 255, 0.3)
      this.pdf.circle(corner.x, corner.y, cornerSize - 5, "F")

      // Reset to primary color
      this.pdf.setFillColor(this.template.primaryColor)
      this.pdf.circle(corner.x, corner.y, cornerSize - 8, "F")
    })

    // Add environmental symbols in corners
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(14)

    // Top-left: Tree
    this.pdf.text("🌳", 22, 28)
    // Top-right: Leaf
    this.pdf.text("🍃", 269, 28)
    // Bottom-left: Flower
    this.pdf.text("🌸", 22, 188)
    // Bottom-right: Plant
    this.pdf.text("🌱", 269, 188)

    // Add small decorative elements around corners
    this.pdf.setFillColor(this.template.secondaryColor)
    this.pdf.setFontSize(8)

    // Small decorative dots
    const decorativeDots = [
      { x: 15, y: 15 }, { x: 35, y: 15 }, { x: 15, y: 35 }, { x: 35, y: 35 },
      { x: 262, y: 15 }, { x: 282, y: 15 }, { x: 262, y: 35 }, { x: 282, y: 35 },
      { x: 15, y: 175 }, { x: 35, y: 175 }, { x: 15, y: 195 }, { x: 35, y: 195 },
      { x: 262, y: 175 }, { x: 282, y: 175 }, { x: 262, y: 195 }, { x: 282, y: 195 }
    ]

    decorativeDots.forEach(dot => {
      this.pdf.circle(dot.x, dot.y, 1, "F")
    })
  }

  private drawLogo() {
    const logoX = this.template.logoPosition.x
    const logoY = this.template.logoPosition.y

    // Enhanced logo design with multiple layers
    // Outer ring
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.circle(logoX, logoY, 20, "F")

    // Middle ring
    this.pdf.setFillColor(255, 255, 255, 0.2)
    this.pdf.circle(logoX, logoY, 16, "F")

    // Inner circle
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.circle(logoX, logoY, 12, "F")

    // Center logo symbol
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(18)
    this.pdf.text("🌿", logoX - 4, logoY + 3)

    // Add decorative elements around logo
    this.pdf.setFillColor(this.template.secondaryColor)
    this.pdf.setFontSize(8)

    // Small decorative circles around logo
    const logoDecorations = [
      { x: logoX - 25, y: logoY - 25 }, { x: logoX + 25, y: logoY - 25 },
      { x: logoX - 25, y: logoY + 25 }, { x: logoX + 25, y: logoY + 25 }
    ]

    logoDecorations.forEach(dec => {
      this.pdf.circle(dec.x, dec.y, 2, "F")
    })

    // Organization name with enhanced styling
    this.pdf.setTextColor(this.template.primaryColor)
    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text("PLOGGING ETHIOPIA", logoX, logoY + 35, {
      align: "center",
    })

    // Subtitle with decorative lines
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(
      "Environmental Care + Community Wellness",
      logoX,
      logoY + 42,
      { align: "center" },
    )

    // Add decorative lines above and below organization name
    this.pdf.setDrawColor(this.template.secondaryColor)
    this.pdf.setLineWidth(0.5)
    this.pdf.line(logoX - 40, logoY + 32, logoX + 40, logoY + 32)
    this.pdf.line(logoX - 40, logoY + 45, logoX + 40, logoY + 45)
  }

  private drawTitle(certificateType: string) {
    const titleX = this.template.titlePosition.x
    const titleY = this.template.titlePosition.y

    // Enhanced title with decorative elements
    this.pdf.setTextColor(this.template.primaryColor)
    this.pdf.setFontSize(28)
    this.pdf.setFont('helvetica', 'bold')

    // Main title
    this.pdf.text(
      "CERTIFICATE OF " + certificateType.toUpperCase(),
      titleX,
      titleY,
      { align: "center" },
    )

    // Add decorative elements around title
    this.pdf.setDrawColor(this.template.secondaryColor)
    this.pdf.setLineWidth(2)

    // Top decorative line with ornaments
    this.pdf.line(70, titleY - 8, 227, titleY - 8)

    // Bottom decorative line with ornaments
    this.pdf.line(70, titleY + 8, 227, titleY + 8)

    // Add decorative ornaments at line ends
    this.pdf.setFillColor(this.template.secondaryColor)
    this.pdf.circle(70, titleY - 8, 3, "F")
    this.pdf.circle(227, titleY - 8, 3, "F")
    this.pdf.circle(70, titleY + 8, 3, "F")
    this.pdf.circle(227, titleY + 8, 3, "F")

    // Add small decorative elements
    this.pdf.setFontSize(12)
    this.pdf.text("★", 65, titleY - 8)
    this.pdf.text("★", 232, titleY - 8)
    this.pdf.text("★", 65, titleY + 8)
    this.pdf.text("★", 232, titleY + 8)
  }

  private drawContent(data: CertificateData) {
    const startY = this.template.titlePosition.y + 35
    const centerX = 148.5

    // Add decorative background for content area
    this.pdf.setFillColor(255, 255, 255, 0.3)
    this.pdf.roundedRect(30, startY - 10, 237, 90, 5, 5, "F")

    // Main content with enhanced styling
    this.pdf.setTextColor(51, 51, 51)
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'normal')

    const presentedText = "This certificate is proudly presented to"
    this.pdf.text(presentedText, centerX, startY, { align: "center" })

    // Add decorative elements around presented text
    this.pdf.setDrawColor(this.template.secondaryColor)
    this.pdf.setLineWidth(0.5)
    this.pdf.line(centerX - 60, startY - 3, centerX - 20, startY - 3)
    this.pdf.line(centerX + 20, startY - 3, centerX + 60, startY - 3)

    // Volunteer name (highlighted with decorative background)
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.roundedRect(centerX - 80, startY + 5, 160, 25, 3, 3, "F")

    this.pdf.setTextColor(this.template.primaryColor)
    this.pdf.setFontSize(22)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(data.volunteerName.toUpperCase(), centerX, startY + 20, { align: "center" })

    // Achievement description with enhanced styling
    this.pdf.setTextColor(51, 51, 51)
    this.pdf.setFontSize(13)
    this.pdf.setFont('helvetica', 'normal')

    let achievementText = ""
    switch (this.template.type) {
      case "participation":
        achievementText = `for outstanding participation in "${data.eventName}"`
        break
      case "achievement":
        achievementText = `for achieving the "${data.badgeType}" badge`
        break
      case "leadership":
        achievementText = `for exceptional leadership in environmental conservation`
        break
      case "milestone":
        achievementText = `for reaching ${data.totalHours} hours of community service`
        break
    }

    this.pdf.text(achievementText, centerX, startY + 40, { align: "center" })

    // Event details in a structured layout
    this.pdf.setFontSize(11)

    // Left column
    this.pdf.text(`Event: ${data.eventName}`, 60, startY + 55)
    this.pdf.text(`Date: ${data.eventDate}`, 60, startY + 62)

    // Right column
    this.pdf.text(`Location: ${data.location}`, 200, startY + 55)
    this.pdf.text(`Hours: ${data.hoursContributed}`, 200, startY + 62)

    // Add decorative separator
    this.pdf.setDrawColor(this.template.secondaryColor)
    this.pdf.setLineWidth(1)
    this.pdf.line(centerX - 30, startY + 50, centerX + 30, startY + 50)

    // Recognition message with enhanced styling
    this.pdf.setFontSize(11)
    this.pdf.setTextColor(this.template.secondaryColor)
    this.pdf.setFont('helvetica', 'italic')
    const recognitionText = "In recognition of your commitment to environmental stewardship and community wellness"
    this.pdf.text(recognitionText, centerX, startY + 75, { align: "center" })

    // Add decorative elements at the bottom of content
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.circle(centerX - 40, startY + 85, 2, "F")
    this.pdf.circle(centerX + 40, startY + 85, 2, "F")
    this.pdf.setFontSize(10)
    this.pdf.text("★", centerX - 40, startY + 85)
    this.pdf.text("★", centerX + 40, startY + 85)
  }

  private drawSignatures(data: CertificateData) {
    const signatureY = 160
    const centerX = 148.5

    // Add decorative background for signatures
    this.pdf.setFillColor(255, 255, 255, 0.2)
    this.pdf.roundedRect(40, signatureY - 15, 217, 40, 3, 3, "F")

    // Left signature (Organizer)
    this.pdf.setDrawColor(this.template.primaryColor)
    this.pdf.setLineWidth(1.5)
    this.pdf.line(60, signatureY, 120, signatureY)

    // Add decorative elements around signature line
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.circle(60, signatureY, 2, "F")
    this.pdf.circle(120, signatureY, 2, "F")

    this.pdf.setTextColor(51, 51, 51)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(data.organizerName, 90, signatureY + 8, { align: "center" })
    this.pdf.setFontSize(9)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text("Event Organizer", 90, signatureY + 15, { align: "center" })

    // Center seal/emblem
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.circle(centerX, signatureY - 5, 15, "F")
    this.pdf.setFillColor(255, 255, 255)
    this.pdf.circle(centerX, signatureY - 5, 12, "F")
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.circle(centerX, signatureY - 5, 8, "F")
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(12)
    this.pdf.text("PE", centerX - 3, signatureY - 2, { align: "center" })

    // Right signature (Plogging Ethiopia)
    this.pdf.setDrawColor(this.template.primaryColor)
    this.pdf.setLineWidth(1.5)
    this.pdf.line(177, signatureY, 237, signatureY)

    // Add decorative elements around signature line
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.circle(177, signatureY, 2, "F")
    this.pdf.circle(237, signatureY, 2, "F")

    this.pdf.setTextColor(51, 51, 51)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text("Plogging Ethiopia Team", 207, signatureY + 8, { align: "center" })
    this.pdf.setFontSize(9)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text("Program Director", 207, signatureY + 15, { align: "center" })

    // Add decorative elements between signatures
    this.pdf.setFillColor(this.template.secondaryColor)
    this.pdf.setFontSize(8)
    this.pdf.text("★", centerX - 25, signatureY + 5)
    this.pdf.text("★", centerX + 25, signatureY + 5)
  }

  private drawFooter(data: CertificateData) {
    const footerY = 185

    // Add decorative background for footer
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.rect(0, footerY - 5, 297, 25, "F")

    // Certificate ID and issue date with enhanced styling
    this.pdf.setTextColor(this.template.secondaryColor)
    this.pdf.setFontSize(9)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(`Certificate ID: ${data.certificateId}`, 20, footerY)
    this.pdf.setFontSize(8)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(`Issued on: ${data.issueDate}`, 20, footerY + 5)

    // Verification URL with icon
    this.pdf.setFontSize(8)
    this.pdf.text(`🔗 Verify at: ${FRONTEND_URL}/verify`, 20, footerY + 10)

    // Powered by with enhanced styling
    this.pdf.setFontSize(8)
    this.pdf.setFont('helvetica', 'italic')
    this.pdf.text("Powered by Pixel Addis Solutions PLC", 277, footerY + 5, { align: "right" })

    // Enhanced QR Code placeholder with decorative border
    this.pdf.setDrawColor(this.template.primaryColor)
    this.pdf.setLineWidth(2)
    this.pdf.rect(250, footerY - 15, 25, 25)

    // Inner QR code design
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.rect(252, footerY - 13, 21, 21, "F")
    this.pdf.setFillColor(255, 255, 255)
    this.pdf.rect(254, footerY - 11, 17, 17, "F")

    // QR code pattern (simplified)
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.rect(256, footerY - 9, 3, 3, "F")
    this.pdf.rect(260, footerY - 9, 3, 3, "F")
    this.pdf.rect(264, footerY - 9, 3, 3, "F")
    this.pdf.rect(256, footerY - 5, 3, 3, "F")
    this.pdf.rect(264, footerY - 5, 3, 3, "F")
    this.pdf.rect(256, footerY - 1, 3, 3, "F")
    this.pdf.rect(260, footerY - 1, 3, 3, "F")
    this.pdf.rect(264, footerY - 1, 3, 3, "F")

    // Add decorative elements around QR code
    this.pdf.setFillColor(this.template.secondaryColor)
    this.pdf.circle(250, footerY - 15, 3, "F")
    this.pdf.circle(275, footerY - 15, 3, "F")
    this.pdf.circle(250, footerY + 10, 3, "F")
    this.pdf.circle(275, footerY + 10, 3, "F")

    // Add small decorative elements
    this.pdf.setFontSize(6)
    this.pdf.text("★", 248, footerY - 15)
    this.pdf.text("★", 277, footerY - 15)
    this.pdf.text("★", 248, footerY + 10)
    this.pdf.text("★", 277, footerY + 10)
  }

  public generateCertificate(data: CertificateData): jsPDF {
    // Draw all certificate elements
    this.drawBackground()
    this.drawLogo()
    this.drawTitle(this.template.type)
    this.drawContent(data)
    this.drawSignatures(data)
    this.drawFooter(data)

    return this.pdf
  }

  public downloadCertificate(data: CertificateData, filename?: string): void {
    try {
      const blob = this.getCertificateBlob(data);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `certificate-${data.volunteerName.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading certificate:', error);
      throw new Error('Failed to download certificate');
    }
  }

  public getCertificateBlob(data: CertificateData): Blob {
    this.generateCertificate(data)
    return this.pdf.output("blob")
  }

  public getCertificateDataURL(data: CertificateData): string {
    this.generateCertificate(data)
    return this.pdf.output("dataurlstring")
  }
}

// Utility functions
export function generateCertificateId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8)
  return `PE-${timestamp}-${randomStr}`.toUpperCase()
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function downloadCertificate(data: CertificateData, filename?: string, template: CertificateTemplate = defaultTemplates[0]): void {
  const generator = new CertificateGenerator(template);
  generator.downloadCertificate(data, filename);
}

// Batch certificate generation
export async function generateBatchCertificates(
  volunteers: Array<Omit<CertificateData, "certificateId" | "issueDate">>,
  template: CertificateTemplate = defaultTemplates[0],
): Promise<Blob[]> {
  const certificates: Blob[] = []
  const generator = new CertificateGenerator(template)

  for (const volunteer of volunteers) {
    const certificateData: CertificateData = {
      ...volunteer,
      certificateId: generateCertificateId(),
      issueDate: formatDate(new Date()),
    }

    const blob = generator.getCertificateBlob(certificateData)
    certificates.push(blob)
  }

  return certificates
}
