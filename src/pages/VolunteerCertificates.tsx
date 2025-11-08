import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiClient, VolunteerCertificate } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Calendar, Award, RefreshCw, Search, Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { defaultTemplates, formatDate, generateCertificateId } from '@/lib/certificate-generator'
import type { CertificateData } from '@/lib/certificate-generator'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import CertificatePreview, { getCertificateStyles } from '@/components/ui/CertificatePreview'
import { createRoot } from 'react-dom/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Extend the VolunteerCertificate interface to include download state
interface ExtendedVolunteerCertificate extends VolunteerCertificate {
  isDownloading?: boolean;
}

export default function VolunteerCertificates() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [certificates, setCertificates] = useState<ExtendedVolunteerCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [previewCertificate, setPreviewCertificate] = useState<ExtendedVolunteerCertificate | null>(null)
  const [previewData, setPreviewData] = useState<CertificateData | null>(null)
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    
    fetchCertificates()
    
    // Also fetch when the component becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCertificates()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [location.pathname, isAuthenticated, navigate]) // Run when the pathname changes

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Check if token exists before making request
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }
      
      const response = await apiClient.getVolunteerCertificates()
      console.log('Certificates response:', response)
      setCertificates(response.data)
    } catch (error: any) {
      console.error('Error fetching certificates:', error)
      // Handle authentication errors specifically
      if (error.message && (error.message.includes('401') || error.message.includes('Unauthorized'))) {
        setError('Your session has expired. Please log in again.')
        navigate('/login')
      } 
      // Provide a more user-friendly error message
      else if (error.message && (error.message.includes('500') || error.message.includes('Internal Server Error'))) {
        setError('Certificate service is temporarily unavailable. Please try again later.')
      } else {
        setError(error.message || 'Failed to load certificates. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Filter certificates based on search term
  const filteredCertificates = useMemo(() => {
    if (!searchTerm) return certificates
    
    const term = searchTerm.toLowerCase().trim()
    return certificates.filter(cert => 
      cert.certificate_type.toLowerCase().includes(term) ||
      cert.status.toLowerCase().includes(term) ||
      (cert.event_id && cert.event_id.toString().includes(term)) ||
      cert.certificate_id.toString().includes(term)
    )
  }, [certificates, searchTerm])

  const handlePreview = async (certificate: ExtendedVolunteerCertificate) => {
    try {
      setIsGeneratingPreview(true)
      setPreviewCertificate(certificate)
      
      // Create certificate data for preview
      const certificateData: CertificateData = {
        volunteerName: `${user?.first_name || 'Volunteer'} ${user?.last_name || ''}`,
        eventName: certificate.event_id ? `Event #${certificate.event_id}` : `${certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1)} Certificate`,
        eventDate: certificate.generation_date ? formatDate(new Date(certificate.generation_date)) : formatDate(new Date()),
        hoursContributed: parseInt(certificate.hours_on_certificate) || 0,
        location: 'Addis Ababa, Ethiopia',
        organizerName: 'Plogging Ethiopia Team',
        certificateId: `PE-${certificate.certificate_id}`,
        issueDate: certificate.generation_date ? formatDate(new Date(certificate.generation_date)) : formatDate(new Date()),
        badgeType: certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1),
        totalHours: parseInt(certificate.hours_on_certificate) || 0,
        rank: 1
      };
      
      setPreviewData(certificateData);
    } catch (error: any) {
      console.error('Error generating preview:', error);
      toast({
        title: "Preview Failed",
        description: error.message || "Failed to generate certificate preview. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPreview(false);
    }
  }

  const handleDownload = async (certificate: ExtendedVolunteerCertificate) => {
    try {
      // Set loading state for this specific certificate
      setCertificates(prev => prev.map(cert => 
        cert.certificate_id === certificate.certificate_id 
          ? { ...cert, isDownloading: true } 
          : cert
      ));
      
      setDownloading(true);
      
      // Create certificate data
      const certificateData: CertificateData = {
          volunteerName: `${user?.first_name || 'Volunteer'} ${user?.last_name || ''}`,
          eventName: certificate.event_id ? `Event #${certificate.event_id}` : `${certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1)} Certificate`,
        eventDate: certificate.generation_date ? formatDate(new Date(certificate.generation_date)) : formatDate(new Date()),
          hoursContributed: parseInt(certificate.hours_on_certificate) || 0,
          location: 'Addis Ababa, Ethiopia',
        organizerName: 'Plogging Ethiopia Team',
          certificateId: `PE-${certificate.certificate_id}`,
        issueDate: certificate.generation_date ? formatDate(new Date(certificate.generation_date)) : formatDate(new Date()),
          badgeType: certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1),
          totalHours: parseInt(certificate.hours_on_certificate) || 0,
          rank: 1
        };
        
      // Create temporary certificate element with styles
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '1200px';
      tempDiv.style.height = '800px';
      
      // Create style element with certificate styles
      const styleElement = document.createElement('style');
      styleElement.textContent = getCertificateStyles();
      tempDiv.appendChild(styleElement);
      
      // Render CertificatePreview component in temporary div
      const certificateContainer = document.createElement('div');
      certificateContainer.style.width = '1200px';
      certificateContainer.style.height = '800px';
      tempDiv.appendChild(certificateContainer);
      
      // Render React component
      const root = createRoot(certificateContainer);
      root.render(
        <div style={{ width: '1200px', height: '800px' }}>
          <CertificatePreview data={certificateData} borderVariant="green" />
        </div>
      );
      
      document.body.appendChild(tempDiv);

      // Wait for React to render and images to load
      await new Promise(resolve => setTimeout(resolve, 800));

      // Capture with html2canvas - target the certificate element
      const certificateElement = certificateContainer.querySelector('.certificate') as HTMLElement;
      if (!certificateElement) {
        throw new Error('Certificate element not found');
      }

      const canvas = await html2canvas(certificateElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Convert to PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgWidthInMM = imgWidth * ratio;
      const imgHeightInMM = imgHeight * ratio;
      const xOffset = (pdfWidth - imgWidthInMM) / 2;
      const yOffset = (pdfHeight - imgHeightInMM) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthInMM, imgHeightInMM);
      
      // Download
      pdf.save(`Certificate_${certificate.certificate_id}_${certificate.certificate_type}.pdf`);

      // Cleanup
      root.unmount();
      document.body.removeChild(tempDiv);

      toast({
        title: "Download Complete",
        description: "Your certificate has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
        toast({
          title: "Download Failed",
          description: error.message || "Failed to download certificate. Please try again.",
          variant: "destructive"
        });
    } finally {
      setDownloading(false);
      // Reset loading state for this specific certificate
      setCertificates(prev => prev.map(cert => 
        cert.certificate_id === certificate.certificate_id 
          ? { ...cert, isDownloading: false } 
          : cert
      ));
    }
  }


  const formatDateString = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCertificateTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'event':
        return 'bg-blue-100 text-blue-800'
      case 'milestone':
        return 'bg-green-100 text-green-800'
      case 'achievement':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'issued':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading certificates...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Certificates</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={fetchCertificates} 
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Certificates</h1>
            <p className="text-sm sm:text-base text-gray-600">View and download your earned certificates and achievements</p>
          </div>
          <Button 
            onClick={fetchCertificates} 
            variant="outline"
            className="border-green-500 text-green-700 hover:bg-green-50 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search certificates by type, status, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 py-2"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchTerm('')}
            >
              ×
            </Button>
          )}
        </div>
      </div>

      {/* Certificates Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{certificates.length}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Award className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {certificates.filter(cert => cert.certificate_type.toLowerCase() === 'event').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Event Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {certificates.filter(cert => cert.certificate_type.toLowerCase() === 'milestone').length}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Milestone Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates List */}
      {filteredCertificates.length > 0 ? (
        <div className="grid gap-6">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.certificate_id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                      <span className="truncate">
                        {certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1)} Certificate
                      </span>
                    </CardTitle>
                    <div className="mt-2">
                      <Badge className={`${getCertificateTypeColor(certificate.certificate_type)} text-xs sm:text-sm`}>
                        {certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1 text-sm">
                      Certificate Type: <span className="font-semibold text-gray-700">{certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1)}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${getCertificateTypeColor(certificate.certificate_type)} text-xs sm:text-sm`}>
                      {certificate.certificate_type}
                    </Badge>
                    <Badge className={`${getStatusColor(certificate.status)} text-xs sm:text-sm`}>
                      {certificate.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Certificate Type</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Award className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm font-semibold">
                        {certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1)}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Generated Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">{formatDateString(certificate.generation_date)}</p>
                    </div>
                  </div>
                  
                  {certificate.hours_on_certificate && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Hours Contributed</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Award className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                        <p className="text-xs sm:text-sm font-semibold">{certificate.hours_on_certificate} hours</p>
                      </div>
                    </div>
                  )}
                  
                  {certificate.event_id && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Event ID</p>
                      <p className="text-xs sm:text-sm mt-1">#{certificate.event_id}</p>
                    </div>
                  )}
                  
                  <div className="flex items-end gap-2 sm:col-span-1 lg:col-span-1">
                    <Button 
                      onClick={() => handlePreview(certificate)}
                      size="sm"
                      variant="outline"
                      className="w-full text-xs sm:text-sm border-green-500 text-green-700 hover:bg-green-50"
                      disabled={isGeneratingPreview}
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => handleDownload(certificate)}
                      size="sm"
                      className="w-full text-xs sm:text-sm"
                      disabled={certificate.isDownloading}
                    >
                      {certificate.isDownloading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-green-700" />
              Your Certificates
            </CardTitle>
            <CardDescription>
              View and download your earned certificates.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No certificates match your search' : 'No certificates available yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Participate in events and achieve milestones to earn certificates!'}
              </p>
              {searchTerm ? (
                <Button onClick={() => setSearchTerm('')} variant="outline">
                  Clear Search
                </Button>
              ) : (
                <Button variant="outline" onClick={fetchCertificates}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewCertificate} onOpenChange={(open) => {
        if (!open) {
          setPreviewCertificate(null)
          setPreviewData(null)
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
            <DialogDescription>
              {previewCertificate && `Preview of ${previewCertificate.certificate_type.charAt(0).toUpperCase() + previewCertificate.certificate_type.slice(1)} Certificate #${previewCertificate.certificate_id}`}
            </DialogDescription>
          </DialogHeader>
          {previewData && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{previewData.volunteerName}</h3>
                  <p className="text-gray-600">{previewData.eventName}</p>
                  <p className="text-gray-600">
                    <span className="font-medium">Type:</span> {previewCertificate && previewCertificate.certificate_type ? previewCertificate.certificate_type.charAt(0).toUpperCase() + previewCertificate.certificate_type.slice(1) : ''}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={async () => {
                      try {
                        setDownloading(true);
                        
                        if (!certificateRef.current) {
                          toast({
                            title: "Error",
                            description: "Certificate preview not available",
                            variant: "destructive"
                          });
                          return;
                        }

                        const certificateElement = certificateRef.current.querySelector('.certificate') as HTMLElement;
                        if (!certificateElement) {
                          toast({
                            title: "Error",
                            description: "Certificate element not found",
                            variant: "destructive"
                          });
                          return;
                        }

                        // Clone the certificate element to capture at full size
                        const clonedElement = certificateElement.cloneNode(true) as HTMLElement;
                        clonedElement.style.position = 'absolute';
                        clonedElement.style.left = '-9999px';
                        clonedElement.style.top = '-9999px';
                        clonedElement.style.transform = 'none';
                        clonedElement.style.width = '1200px';
                        clonedElement.style.height = '800px';
                        document.body.appendChild(clonedElement);

                        // Wait for layout
                        await new Promise(resolve => setTimeout(resolve, 100));

                        try {
                          // Capture with html2canvas
                          const canvas = await html2canvas(clonedElement, {
                            scale: 2,
                            useCORS: true,
                            logging: false,
                            backgroundColor: '#ffffff',
                          });

                          // Convert to PDF
                          const imgData = canvas.toDataURL('image/png');
                          const pdf = new jsPDF({
                            orientation: 'landscape',
                            unit: 'mm',
                            format: 'a4'
                          });

                          const pdfWidth = pdf.internal.pageSize.getWidth();
                          const pdfHeight = pdf.internal.pageSize.getHeight();
                          const imgWidth = canvas.width;
                          const imgHeight = canvas.height;
                          const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                          const imgWidthInMM = imgWidth * ratio;
                          const imgHeightInMM = imgHeight * ratio;
                          const xOffset = (pdfWidth - imgWidthInMM) / 2;
                          const yOffset = (pdfHeight - imgHeightInMM) / 2;

                          pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthInMM, imgHeightInMM);
                          pdf.save(`certificate-${previewData.volunteerName.replace(/\s+/g, '-')}.pdf`);
                        } finally {
                          // Cleanup
                          document.body.removeChild(clonedElement);
                        }
                        
                        toast({
                          title: "Download Complete",
                          description: "Certificate downloaded successfully.",
                        });
                      } catch (err) {
                        console.error('Error downloading certificate:', err);
                        toast({
                          title: "Download Failed",
                          description: "Failed to download certificate.",
                          variant: "destructive"
                        });
                      } finally {
                        setDownloading(false);
                      }
                    }}
                    disabled={downloading}
                  >
                    {downloading ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              {/* Certificate Preview */}
              <div className="flex justify-center overflow-auto">
                <div ref={certificateRef} className="transform scale-75 origin-center">
                  <div style={{ width: '800px' }}>
                    <CertificatePreview data={previewData} borderVariant="green" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {!previewData && (
            <div className="text-center py-12 text-gray-500">
            {isGeneratingPreview ? (
                <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating preview...</p>
                </div>
              </div>
              ) : (
                "No preview available"
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Information Card */}
      <Card className="mt-8 bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">About Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-green-700 mb-2">Event Certificates</h3>
              <p className="text-sm text-green-600">
                Earned by participating in specific plogging events. These certificates recognize your contribution to environmental cleanup activities.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-green-700 mb-2">Milestone Certificates</h3>
              <p className="text-sm text-green-600">
                Awarded when you reach significant volunteer hour milestones. These celebrate your ongoing commitment to environmental activism.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}