"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  CertificateGenerator,
  type CertificateData,
  type CertificateTemplate,
  defaultTemplates,
  generateCertificateId,
  formatDate,
} from "@/lib/certificate-generator"
import { Download, Eye, Share2, Palette, FileText } from "lucide-react"

interface CertificatePreviewProps {
  initialData?: Partial<CertificateData>
  onGenerate?: (certificate: Blob, data: CertificateData) => void
}

export function CertificatePreview({ initialData, onGenerate }: CertificatePreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(defaultTemplates[0])
  const [certificateData, setCertificateData] = useState<CertificateData>({
    volunteerName: initialData?.volunteerName || "Sarah Alemayehu",
    eventName: initialData?.eventName || "Meskel Square Cleanup Drive",
    eventDate: initialData?.eventDate || "2024-01-15",
    hoursContributed: initialData?.hoursContributed || 4,
    location: initialData?.location || "Meskel Square, Addis Ababa",
    organizerName: initialData?.organizerName || "Plogging Ethiopia Team",
    certificateId: generateCertificateId(),
    issueDate: formatDate(new Date()),
    badgeType: initialData?.badgeType || "Environmental Champion",
    totalHours: initialData?.totalHours || 24,
    rank: initialData?.rank || 5,
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleInputChange = (field: keyof CertificateData, value: string | number) => {
    setCertificateData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTemplateChange = (templateId: string) => {
    const template = defaultTemplates.find((t) => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
    }
  }

  const generatePreview = () => {
    const generator = new CertificateGenerator(selectedTemplate)
    const dataURL = generator.getCertificateDataURL(certificateData)
    return dataURL
  }

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      const generator = new CertificateGenerator(selectedTemplate)
      generator.downloadCertificate(certificateData)

      if (onGenerate) {
        const blob = generator.getCertificateBlob(certificateData)
        onGenerate(blob, certificateData)
      }
    } catch (error) {
      console.error("Error generating certificate:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      const generator = new CertificateGenerator(selectedTemplate)
      const blob = generator.getCertificateBlob(certificateData)
      const file = new File([blob], `certificate-${certificateData.volunteerName}.pdf`, { type: "application/pdf" })

      try {
        await navigator.share({
          title: "Plogging Ethiopia Certificate",
          text: `${certificateData.volunteerName}'s certificate for ${certificateData.eventName}`,
          files: [file],
        })
      } catch (error) {
        console.error("Error sharing certificate:", error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Certificate Template
          </CardTitle>
          <CardDescription>Choose a template design for your certificate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {defaultTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedTemplate.id === template.id
                    ? "border-green-600 bg-green-50"
                    : "border-gray-200 hover:border-green-300"
                }`}
                onClick={() => handleTemplateChange(template.id)}
              >
                <div className="w-full h-20 rounded mb-2" style={{ backgroundColor: template.backgroundColor }}>
                  <div className="flex items-center justify-center h-full">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: template.primaryColor }}
                    >
                      🌿
                    </div>
                  </div>
                </div>
                <h3 className="font-medium text-sm text-green-800">{template.name}</h3>
                <Badge className="text-xs mt-1" style={{ backgroundColor: template.primaryColor, color: "white" }}>
                  {template.type}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Certificate Data Form */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Certificate Information
          </CardTitle>
          <CardDescription>Fill in the details for the certificate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volunteerName" className="text-green-700">
                Volunteer Name
              </Label>
              <Input
                id="volunteerName"
                value={certificateData.volunteerName}
                onChange={(e) => handleInputChange("volunteerName", e.target.value)}
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventName" className="text-green-700">
                Event Name
              </Label>
              <Input
                id="eventName"
                value={certificateData.eventName}
                onChange={(e) => handleInputChange("eventName", e.target.value)}
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="text-green-700">
                Event Date
              </Label>
              <Input
                id="eventDate"
                type="date"
                value={certificateData.eventDate}
                onChange={(e) => handleInputChange("eventDate", e.target.value)}
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hoursContributed" className="text-green-700">
                Hours Contributed
              </Label>
              <Input
                id="hoursContributed"
                type="number"
                value={certificateData.hoursContributed}
                onChange={(e) => handleInputChange("hoursContributed", Number.parseInt(e.target.value))}
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-green-700">
                Location
              </Label>
              <Input
                id="location"
                value={certificateData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="border-green-200 focus:border-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organizerName" className="text-green-700">
                Organizer Name
              </Label>
              <Input
                id="organizerName"
                value={certificateData.organizerName}
                onChange={(e) => handleInputChange("organizerName", e.target.value)}
                className="border-green-200 focus:border-green-500"
              />
            </div>
          </div>

          {selectedTemplate.type === "achievement" && (
            <div className="space-y-2">
              <Label htmlFor="badgeType" className="text-green-700">
                Badge Type
              </Label>
              <Input
                id="badgeType"
                value={certificateData.badgeType || ""}
                onChange={(e) => handleInputChange("badgeType", e.target.value)}
                className="border-green-200 focus:border-green-500"
              />
            </div>
          )}

          {selectedTemplate.type === "milestone" && (
            <div className="space-y-2">
              <Label htmlFor="totalHours" className="text-green-700">
                Total Hours
              </Label>
              <Input
                id="totalHours"
                type="number"
                value={certificateData.totalHours || 0}
                onChange={(e) => handleInputChange("totalHours", Number.parseInt(e.target.value))}
                className="border-green-200 focus:border-green-500"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview and Actions */}
      <Card className="border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Certificate Preview
          </CardTitle>
          <CardDescription>Preview your certificate before generating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview placeholder */}
            <div className="w-full h-64 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-300 flex items-center justify-center">
              <div className="text-center text-green-600">
                <FileText className="w-12 h-12 mx-auto mb-2" />
                <p className="font-medium">Certificate Preview</p>
                <p className="text-sm">Click "Generate Preview" to see your certificate</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={generatePreview}
                variant="outline"
                className="border-green-600 text-green-600 bg-transparent hover:bg-green-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Generate Preview
              </Button>
              <Button onClick={handleDownload} disabled={isGenerating} className="bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                onClick={handleShare}
                variant="outline"
                className="border-green-600 text-green-600 bg-transparent hover:bg-green-50"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Certificate Info */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Certificate Details</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                <div>Certificate ID: {certificateData.certificateId}</div>
                <div>Issue Date: {certificateData.issueDate}</div>
                <div>Template: {selectedTemplate.name}</div>
                <div>Type: {selectedTemplate.type}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
