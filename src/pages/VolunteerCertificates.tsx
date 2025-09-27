import { useState, useEffect, useMemo } from 'react'
import { apiClient, VolunteerCertificate } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { FileText, Download, Calendar, Award, RefreshCw, Search } from 'lucide-react'

export default function VolunteerCertificates() {
  const [certificates, setCertificates] = useState<VolunteerCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getVolunteerCertificates()
      setCertificates(response.data)
    } catch (error: any) {
      console.error('Error fetching certificates:', error)
      setError(error.message || 'Failed to load certificates')
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

  const handleDownload = async (certificate: VolunteerCertificate) => {
    try {
      // Create download link
      const downloadUrl = `${apiClient['baseURL']}${certificate.file_path}`
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `Certificate_${certificate.certificate_id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download Started",
        description: "Your certificate download has started.",
      })
    } catch (error: any) {
      console.error('Error downloading certificate:', error)
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive"
      })
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Certificates</h1>
        <p className="text-sm sm:text-base text-gray-600">View and download your earned certificates and achievements</p>
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
                      disabled={certificate.status.toLowerCase() !== 'active' && certificate.status.toLowerCase() !== 'issued'}
                    >
                      <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      Download
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