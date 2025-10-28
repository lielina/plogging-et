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
    // Set background color
    this.pdf.setFillColor(this.template.backgroundColor)
    this.pdf.rect(0, 0, 297, 210, "F")

    // Add decorative border
    this.pdf.setDrawColor(this.template.primaryColor)
    this.pdf.setLineWidth(2)
    this.pdf.rect(10, 10, 277, 190)

    // Add inner decorative elements
    this.pdf.setDrawColor(this.template.secondaryColor)
    this.pdf.setLineWidth(0.5)
    this.pdf.rect(15, 15, 267, 180)

    // Add corner decorations
    this.drawCornerDecorations()
  }

  private drawCornerDecorations() {
    const cornerSize = 15
    this.pdf.setFillColor(this.template.primaryColor)

    // Top-left corner
    this.pdf.circle(25, 25, cornerSize, "F")
    // Top-right corner
    this.pdf.circle(272, 25, cornerSize, "F")
    // Bottom-left corner
    this.pdf.circle(25, 185, cornerSize, "F")
    // Bottom-right corner
    this.pdf.circle(272, 185, cornerSize, "F")

    // Add leaf symbols in corners
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(12)
    this.pdf.text("🌱", 22, 28)
    this.pdf.text("🌱", 269, 28)
    this.pdf.text("🌱", 22, 188)
    this.pdf.text("🌱", 269, 188)
  }

  private drawLogo() {
    // Draw circular logo background
    this.pdf.setFillColor(this.template.primaryColor)
    this.pdf.circle(this.template.logoPosition.x, this.template.logoPosition.y, 12, "F")

    // Add logo text (in real implementation, you'd use an actual logo image)
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(16)
    this.pdf.text("🌿", this.template.logoPosition.x - 3, this.template.logoPosition.y + 2)

    // Organization name
    this.pdf.setTextColor(this.template.primaryColor)
    this.pdf.setFontSize(14)
    this.pdf.text("PLOGGING ETHIOPIA", this.template.logoPosition.x, this.template.logoPosition.y + 20, {
      align: "center",
    })
    this.pdf.setFontSize(10)
    this.pdf.text(
      "Environmental Care + Community Wellness",
      this.template.logoPosition.x,
      this.template.logoPosition.y + 27,
      { align: "center" },
    )
  }

  private drawTitle(certificateType: string) {
    this.pdf.setTextColor(this.template.primaryColor)
    this.pdf.setFontSize(24)
    this.pdf.text(
      "CERTIFICATE OF " + certificateType.toUpperCase(),
      this.template.titlePosition.x,
      this.template.titlePosition.y,
      { align: "center" },
    )

    // Decorative line under title
    this.pdf.setDrawColor(this.template.secondaryColor)
    this.pdf.setLineWidth(1)
    this.pdf.line(80, this.template.titlePosition.y + 5, 217, this.template.titlePosition.y + 5)
  }

  private drawContent(data: CertificateData) {
    const startY = this.template.titlePosition.y + 25

    // Main content
    this.pdf.setTextColor(51, 51, 51)
    this.pdf.setFontSize(14)

    const presentedText = "This certificate is proudly presented to"
    this.pdf.text(presentedText, 148.5, startY, { align: "center" })

    // Volunteer name (highlighted)
    this.pdf.setTextColor(this.template.primaryColor)
    this.pdf.setFontSize(20)
    this.pdf.text(data.volunteerName.toUpperCase(), 148.5, startY + 15, { align: "center" })

    // Achievement description
    this.pdf.setTextColor(51, 51, 51)
    this.pdf.setFontSize(12)

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

    this.pdf.text(achievementText, 148.5, startY + 30, { align: "center" })

    // Event details
    this.pdf.setFontSize(11)
    this.pdf.text(`Event: ${data.eventName}`, 148.5, startY + 45, { align: "center" })
    this.pdf.text(`Date: ${data.eventDate} | Location: ${data.location}`, 148.5, startY + 52, { align: "center" })
    this.pdf.text(`Hours Contributed: ${data.hoursContributed}`, 148.5, startY + 59, { align: "center" })

    // Recognition message
    this.pdf.setFontSize(10)
    this.pdf.setTextColor(this.template.secondaryColor)
    const recognitionText = "In recognition of your commitment to environmental stewardship and community wellness"
    this.pdf.text(recognitionText, 148.5, startY + 75, { align: "center" })
  }

  private drawSignatures(data: CertificateData) {
    const signatureY = 160

    // Left signature (Organizer)
    this.pdf.setDrawColor(this.template.primaryColor)
    this.pdf.setLineWidth(0.5)
    this.pdf.line(50, signatureY, 120, signatureY)

    this.pdf.setTextColor(51, 51, 51)
    this.pdf.setFontSize(10)
    this.pdf.text(data.organizerName, 85, signatureY + 8, { align: "center" })
    this.pdf.text("Event Organizer", 85, signatureY + 15, { align: "center" })

    // Right signature (Plogging Ethiopia)
    this.pdf.line(177, signatureY, 247, signatureY)
    this.pdf.text("Plogging Ethiopia Team", 212, signatureY + 8, { align: "center" })
    this.pdf.text("Program Director", 212, signatureY + 15, { align: "center" })
  }

  private drawFooter(data: CertificateData) {
    const footerY = 185

    // Certificate ID and issue date
    this.pdf.setTextColor(this.template.secondaryColor)
    this.pdf.setFontSize(8)
    this.pdf.text(`Certificate ID: ${data.certificateId}`, 20, footerY)
    this.pdf.text(`Issued on: ${data.issueDate}`, 20, footerY + 5)

    // Verification URL
    this.pdf.text(`Verify at: ${FRONTEND_URL}/verify`, 20, footerY + 10)

    // Powered by
    this.pdf.text("Powered by Pixel Addis Solutions PLC", 277, footerY + 10, { align: "right" })

    // QR Code placeholder (in real implementation, you'd generate an actual QR code)
    this.pdf.setDrawColor(this.template.primaryColor)
    this.pdf.rect(250, footerY - 15, 20, 20)
    this.pdf.setFontSize(6)
    this.pdf.text("QR", 260, footerY - 5, { align: "center" })
    this.pdf.text("VERIFY", 260, footerY - 1, { align: "center" })
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
    this.generateCertificate(data)
    const fileName =
      filename || `certificate-${data.volunteerName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`
    this.pdf.save(fileName)
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
