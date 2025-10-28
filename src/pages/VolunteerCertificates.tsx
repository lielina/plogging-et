import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { apiClient, VolunteerCertificate } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Calendar, Award, RefreshCw, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { downloadCertificate, CertificateGenerator, defaultTemplates } from '@/lib/certificate-generator'

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

  const handleDownload = async (certificate: ExtendedVolunteerCertificate) => {
    try {
      // Set loading state for this specific certificate
      setCertificates(prev => prev.map(cert => 
        cert.certificate_id === certificate.certificate_id 
          ? { ...cert, isDownloading: true } 
          : cert
      ));
      
      // First try to download from the server
      try {
        const blob = await apiClient.downloadCertificate(certificate.certificate_id);
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Certificate_${certificate.certificate_id}_${certificate.certificate_type}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (serverError: any) {
        // If server download fails, generate locally
        console.log('Server download failed, generating locally:', serverError);
        
        // Create certificate data for local generation
        const certificateData = {
          volunteerName: `${user?.first_name || 'Volunteer'} ${user?.last_name || ''}`,
          eventName: certificate.event_id ? `Event #${certificate.event_id}` : 'Community Service',
          eventDate: certificate.generation_date ? new Date(certificate.generation_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          hoursContributed: parseInt(certificate.hours_on_certificate) || 0,
          location: 'Addis Ababa, Ethiopia',
          organizerName: 'Plogging Ethiopia',
          certificateId: `PE-${certificate.certificate_id}`,
          issueDate: certificate.generation_date ? new Date(certificate.generation_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          badgeType: 'Volunteer',
          totalHours: parseInt(certificate.hours_on_certificate) || 0,
          rank: 1
        };
        
        // Generate and download locally using the new utility function
        try {
          // Use the appreciation certificate template
          const template = defaultTemplates.find(t => t.id === 'appreciation-certificate') || defaultTemplates[0];
          const generator = new CertificateGenerator(template);
          generator.downloadCertificate(certificateData, `Certificate_${certificate.certificate_id}_${certificate.certificate_type}.pdf`);
        } catch (localError) {
          console.error('Error generating local certificate with utility function:', localError);
          throw localError;
        }

      }

      toast({
        title: "Download Complete",
        description: "Your certificate has been downloaded successfully.",
      });
    } catch (error: any) {
      console.error('Error downloading certificate:', error);
      // Check if it's the specific error about missing file path
      if (error.message && error.message.includes('regenerate')) {
        toast({
          title: "Certificate Not Available",
          description: "This certificate is not available for download and may need to be regenerated. Please contact an administrator.",
          variant: "destructive"
        });
      } else if (error.message && (error.message.includes('500') || error.message.includes('Internal Server Error'))) {
        toast({
          title: "Server Error",
          description: "There was a server error while trying to download your certificate. Please try again later.",
          variant: "destructive"
        });
      } else if (error.message && error.message.includes('404')) {
        toast({
          title: "Certificate Not Found",
          description: "The certificate file could not be found. Please contact an administrator to regenerate it.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Download Failed",
          description: error.message || "Failed to download certificate. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      // Reset loading state for this specific certificate
      setCertificates(prev => prev.map(cert => 
        cert.certificate_id === certificate.certificate_id 
          ? { ...cert, isDownloading: false } 
          : cert
      ));
    }
  }

  const formatDate = (dateString: string) => {
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
                      <span className="truncate">{certificate.certificate_type.charAt(0).toUpperCase() + certificate.certificate_type.slice(1)} Certificate</span>
                    </CardTitle>
                    <CardDescription className="mt-1 text-sm">
                      Certificate ID: {certificate.certificate_id}
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
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Generated Date</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                      <p className="text-xs sm:text-sm">{formatDate(certificate.generation_date)}</p>
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
                  
                  <div className="flex items-end sm:col-span-1 lg:col-span-1">
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